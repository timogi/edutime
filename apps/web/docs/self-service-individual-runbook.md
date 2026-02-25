# Einzellizenz Self-Service Runbook (Web)

Dieses Runbook beschreibt, was du jetzt in Payrexx und Supabase tun musst, damit der Web-Self-Service fuer Einzellizenzen produktiv funktioniert.

## 1) Payrexx konfigurieren

1. In Payrexx unter **API und Integrationen** einen API-Schluessel erstellen.
2. Werte notieren:
   - `PAYREXX_INSTANCE`
   - `PAYREXX_API_SECRET`
3. Webhook einrichten:
   - URL: `https://<project-ref>.supabase.co/functions/v1/payrexx-webhook`
   - Format: JSON
   - Retry: aktiviert
   - Signatur-Secret als `PAYREXX_WEBHOOK_SECRET` hinterlegen.
4. Bei den Webhook-Events alle Zahlungs-/Transaktions-Events aktivieren, die erfolgreiche und fehlgeschlagene Zahlungen abdecken (mindestens success + failure/cancel).

Referenz: https://docs.payrexx.com/merchant/payrexx-administration/api-und-integrationen

## 2) Supabase Migration deployen

Die neue Migration liegt hier:

- `apps/web/supabase/migrations/20260225120000_payrexx_self_service.sql`

Sie erstellt:

- `billing.checkout_sessions`
- `billing.webhook_events`
- `billing.process_payrexx_payment(...)`
- `billing.fail_checkout_session(...)`
- RLS/Policies + relevante Indizes/Constraints

Deploy:

```bash
supabase db push
```

## 3) Edge Function deployen

Neue Function:

- `apps/web/supabase/functions/payrexx-webhook/index.ts`

`apps/web/supabase/config.toml` ist bereits mit `verify_jwt = false` fuer die Function vorbereitet.

Deploy:

```bash
supabase functions deploy payrexx-webhook
```

## 4) Secrets setzen

### Webapp (Deployment Environment)

- `PAYREXX_INSTANCE`
- `PAYREXX_API_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### Supabase Edge Functions

- `PAYREXX_INSTANCE`
- `PAYREXX_API_SECRET`
- `PAYREXX_WEBHOOK_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`

Beispiel:

```bash
supabase secrets set PAYREXX_INSTANCE=... PAYREXX_API_SECRET=... PAYREXX_WEBHOOK_SECRET=... SUPABASE_SERVICE_ROLE_KEY=...
```

## 5) Webapp deployen

Folgende Web-Teile wurden angepasst:

- Checkout API: `apps/web/src/pages/api/checkout/index.ts`
- Checkout-Status API: `apps/web/src/pages/api/checkout/status.ts`
- Success Polling UX: `apps/web/src/pages/checkout/success.tsx`
- No-License Pending UX: `apps/web/src/components/NoLicense/NoLicenseView.tsx`
- Payrexx Gateway Subscription-Setup: `apps/web/src/utils/payments/payrexxProvider.ts`

Nach Deployment ist der Flow:

1. User startet Checkout (`annual`)
2. Session wird in `billing.checkout_sessions` angelegt
3. Payrexx verarbeitet Zahlung
4. Webhook verifiziert Transaktion bei Payrexx API
5. DB-Funktion aktiviert/verlaengert Entitlement

## 6) Smoke Tests (verpflichtend)

### A. Happy Path

1. User ohne Lizenz -> `/app/no-license`
2. Kauf starten
3. Zahlung erfolgreich
4. In `billing.webhook_events` Event mit `processed=true`
5. In `billing.checkout_sessions` `status='completed'`
6. In `license.entitlements` aktive `kind='personal'` Zeile fuer User

### B. Idempotenz

- Dasselbe Webhook-Event erneut senden -> keine doppelten Entitlements

### C. Failure

- Fehlgeschlagene/abgebrochene Zahlung -> Sessionstatus auf `failed` oder `cancelled`

### D. UX

- Success-Seite zeigt pending Status bis Aktivierung
- No-License zeigt "Aktivierung pruefen" bis Lizenz aktiv

## 7) Monitoring nach Go-Live

- `billing.webhook_events` auf `processing_error` pruefen
- `billing.checkout_sessions` auf haengende `pending` Eintraege pruefen
- Supabase Function Logs beobachten
- Payrexx API-/Webhook-Logs im Dashboard beobachten

## 8) Wichtige Hinweise

- Die Aktivierung passiert **nur** serverseitig ueber den verifizierten Webhook.
- Redirect auf `/checkout/success` aktiviert keine Lizenz direkt.
- Der Checkout-Endpunkt ist bewusst auf `plan=annual` eingegrenzt (Einzellizenz-Scope).
