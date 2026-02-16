# Supabase TODO - Payrexx Payment Integration

> Only lists what still needs to be created. Existing tables are documented in `payment-architecture.md`.

## 1. Create billing.checkout_sessions

Tracks checkout initiation before Payrexx redirect. Links to the subscription after payment.

```sql
CREATE TABLE billing.checkout_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  organization_id int REFERENCES public.organizations(id),
  plan text NOT NULL CHECK (plan IN ('annual', 'org')),
  quantity int NOT NULL DEFAULT 1,
  amount_cents int NOT NULL,
  currency text NOT NULL DEFAULT 'CHF',
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed', 'failed', 'cancelled', 'expired')),
  payrexx_gateway_id int,
  payrexx_gateway_hash text,
  payrexx_gateway_link text,
  reference_id text NOT NULL UNIQUE,
  subscription_id uuid REFERENCES billing.subscriptions(id),
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz
);

ALTER TABLE billing.checkout_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own checkout sessions"
  ON billing.checkout_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access on checkout sessions"
  ON billing.checkout_sessions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can insert own checkout sessions"
  ON billing.checkout_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
```

## 2. Create billing.webhook_events

Idempotency log for Payrexx webhook processing.

```sql
CREATE TABLE billing.webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payrexx_event_id text NOT NULL UNIQUE,
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  processed boolean NOT NULL DEFAULT false,
  processing_error text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE billing.webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on webhook events"
  ON billing.webhook_events FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
```

## 3. Create billing.process_successful_payment()

Called by the webhook Edge Function after a confirmed Payrexx payment.
Creates the full billing chain using **existing** tables:
`billing.accounts` → `billing.subscriptions` → `billing.invoices` → `license.entitlements`

```sql
CREATE OR REPLACE FUNCTION billing.process_successful_payment(
  p_checkout_session_id uuid,
  p_provider_transaction_id text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_session billing.checkout_sessions%ROWTYPE;
  v_account_id uuid;
  v_subscription_id uuid;
  v_i int;
BEGIN
  -- 1. Get and validate checkout session
  SELECT * INTO v_session
  FROM billing.checkout_sessions
  WHERE id = p_checkout_session_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Checkout session not found: %', p_checkout_session_id;
  END IF;

  IF v_session.status = 'completed' THEN
    RETURN; -- idempotent
  END IF;

  -- 2. Find or create billing.accounts
  IF v_session.plan = 'annual' THEN
    SELECT id INTO v_account_id
    FROM billing.accounts
    WHERE user_id = v_session.user_id AND kind = 'individual'
    LIMIT 1;

    IF v_account_id IS NULL THEN
      INSERT INTO billing.accounts (kind, user_id)
      VALUES ('individual', v_session.user_id)
      RETURNING id INTO v_account_id;
    END IF;
  ELSE
    SELECT id INTO v_account_id
    FROM billing.accounts
    WHERE organization_id = v_session.organization_id AND kind = 'organization'
    LIMIT 1;

    IF v_account_id IS NULL THEN
      INSERT INTO billing.accounts (kind, organization_id)
      VALUES ('organization', v_session.organization_id)
      RETURNING id INTO v_account_id;
    END IF;
  END IF;

  -- 3. Create billing.subscriptions
  INSERT INTO billing.subscriptions (
    account_id, provider, provider_subscription_id, status,
    amount_cents, currency, interval, seat_count,
    started_at, current_period_start, current_period_end, metadata
  ) VALUES (
    v_account_id, 'payrexx',
    COALESCE(v_session.payrexx_gateway_id::text, v_session.reference_id),
    'active', v_session.amount_cents, v_session.currency, 'year',
    CASE WHEN v_session.plan = 'org' THEN v_session.quantity ELSE NULL END,
    now(), now(), now() + interval '1 year',
    jsonb_build_object(
      'plan', v_session.plan,
      'reference_id', v_session.reference_id,
      'checkout_session_id', v_session.id
    )
  ) RETURNING id INTO v_subscription_id;

  -- 4. Create billing.invoices
  INSERT INTO billing.invoices (
    subscription_id, amount_cents, currency, status, provider_invoice_id, paid_at
  ) VALUES (
    v_subscription_id, v_session.amount_cents, v_session.currency,
    'paid', p_provider_transaction_id, now()
  );

  -- 5. Create license.entitlements
  IF v_session.plan = 'annual' THEN
    INSERT INTO license.entitlements (
      user_id, kind, source, status, valid_from, valid_until, billing_subscription_id
    ) VALUES (
      v_session.user_id, 'personal', 'payrexx', 'active',
      now(), now() + interval '1 year', v_subscription_id
    );
  ELSE
    FOR v_i IN 1..v_session.quantity LOOP
      INSERT INTO license.entitlements (
        organization_id, kind, source, status, valid_from, valid_until, billing_subscription_id
      ) VALUES (
        v_session.organization_id, 'org_seat', 'payrexx', 'active',
        now(), now() + interval '1 year', v_subscription_id
      );
    END LOOP;

    UPDATE public.organizations
    SET seats = seats + v_session.quantity
    WHERE id = v_session.organization_id;
  END IF;

  -- 6. Mark checkout session completed
  UPDATE billing.checkout_sessions
  SET status = 'completed', subscription_id = v_subscription_id, updated_at = now()
  WHERE id = p_checkout_session_id;
END;
$$;
```

## 4. Ensure RLS and Grants

```sql
GRANT USAGE ON SCHEMA billing TO authenticated, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA billing TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA billing TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA billing TO service_role;
```

## 5. Deploy Edge Function: payrexx-webhook

```bash
supabase functions new payrexx-webhook
```

Must:

1. Validate webhook signature (HMAC-SHA256 with `PAYREXX_WEBHOOK_SECRET`)
2. Check idempotency via `billing.webhook_events`
3. Look up `billing.checkout_sessions` by `reference_id`
4. On success: call `billing.process_successful_payment(session_id, transaction_id)`
5. On failure: update checkout session status to `'failed'`

Secrets:

- `PAYREXX_WEBHOOK_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`

## 6. Deploy Edge Function: reconcile-licenses

```bash
supabase functions new reconcile-licenses
```

Must:

1. Set `license.entitlements.status = 'expired'` where `valid_until < now()` and `status = 'active'`
2. Optionally verify subscription status via Payrexx API

pg_cron setup:

```sql
SELECT cron.schedule(
  'reconcile-licenses-daily',
  '0 3 * * *',
  $$
  SELECT net.http_post(
    url := 'https://<project-ref>.supabase.co/functions/v1/reconcile-licenses',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    )
  );
  $$
);
```

## 7. Configure Payrexx Webhook URL

URL: `https://<project-ref>.supabase.co/functions/v1/payrexx-webhook`

---

## Checklist

- [ ] Create `billing.checkout_sessions` table
- [ ] Create `billing.webhook_events` table
- [ ] Create `billing.process_successful_payment()` function
- [ ] Verify RLS policies and grants
- [ ] Deploy `payrexx-webhook` Edge Function
- [ ] Deploy `reconcile-licenses` Edge Function
- [ ] Set Edge Function secrets
- [ ] Set up pg_cron for daily reconciliation
- [ ] Configure webhook URL in Payrexx Dashboard
