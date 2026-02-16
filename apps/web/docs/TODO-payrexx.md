# Payrexx Setup TODO

Steps to complete once the Payrexx account is ready.

## 1. Create Payrexx Account

- Sign up at https://signup.payrexx.com/
- Complete onboarding and KYC
- Instance name → `PAYREXX_INSTANCE` (e.g. `edutime`)

## 2. Activate Payment Methods

In Payrexx Dashboard → Payment Providers:

- TWINT (most popular in CH)
- Visa / Mastercard
- PostFinance Card / E-Finance
- Apple Pay / Google Pay

## 3. Create API Key

- Dashboard → API and Plugins → Add API Key
- Name: "EduTime Production"
- Copy secret → `PAYREXX_API_SECRET`

## 4. Configure Webhooks

- Dashboard → Webhooks → Add webhook
- URL: `https://<supabase-project-ref>.supabase.co/functions/v1/payrexx-webhook`
- Content Type: JSON
- Retry on failure: Enabled
- Signing key → `PAYREXX_WEBHOOK_SECRET`

## 5. Customize Look & Feel (optional)

- Dashboard → Look & Feel
- Logo, colors (violet primary), custom messages

## 6. Set Environment Variables

### Next.js (.env.local)

```env
PAYREXX_INSTANCE=edutime
PAYREXX_API_SECRET=<from-step-3>
NEXT_PUBLIC_APP_URL=https://edutime.ch
```

### Supabase Edge Function Secrets

```
PAYREXX_WEBHOOK_SECRET=<from-step-4>
PAYREXX_API_SECRET=<from-step-3>
PAYREXX_INSTANCE=edutime
```

## 7. Test

- [ ] Individual checkout → Gateway with 3000 cents (30 CHF)
- [ ] Org checkout → Gateway with correct tiered pricing
- [ ] User redirected to Payrexx payment page
- [ ] Success → `/checkout/success`
- [ ] Failed → `/checkout/failed`
- [ ] Cancel → `/checkout/cancel`
- [ ] Webhook → creates `billing.accounts` → `billing.subscriptions` → `billing.invoices` → `license.entitlements`
- [ ] Duplicate webhooks don't create duplicate data
- [ ] Org `public.organizations.seats` updated
- [ ] `license.entitlements.billing_subscription_id` correctly linked
- [ ] Daily reconciliation cron runs

## 8. Go Live

1. All test payments pass
2. Set env vars on production
3. Deploy Next.js app
4. Deploy Supabase Edge Functions
5. Monitor first real payments

## 9. Ongoing Monitoring

- Payrexx Dashboard → API Logs for errors
- Supabase Edge Function logs
- `billing.webhook_events` for failed processing
- `billing.checkout_sessions` for stuck pending sessions
- Daily reconciliation logs

---

## Quick Reference

|                     |                                                           |
| ------------------- | --------------------------------------------------------- |
| **Base URL**        | `https://api.payrexx.com/v1.0/`                           |
| **Auth**            | HMAC-SHA256 signature                                     |
| **Create Gateway**  | `POST /Gateway/?instance=NAME`                            |
| **Get Gateway**     | `GET /Gateway/{id}/?instance=NAME`                        |
| **Get Transaction** | `GET /Transaction/{id}/?instance=NAME`                    |
| **Docs**            | https://developers.payrexx.com/reference/create-a-gateway |

### Amounts (all in cents/Rappen)

| Plan              | CHF     | Cents  |
| ----------------- | ------- | ------ |
| Individual Annual | 30.00   | 3000   |
| Org 3 licenses    | 90.00   | 9000   |
| Org 10 licenses   | 300.00  | 30000  |
| Org 25 licenses   | 675.00  | 67500  |
| Org 50 licenses   | 1175.00 | 117500 |
| Org 100 licenses  | 1925.00 | 192500 |
