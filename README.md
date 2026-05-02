# Meridian Core Banking

Internal operations platform for Meridian Financial Services.

## Stack

- Next.js 16 (App Router)
- TypeScript 5
- Stripe for billing
- NextAuth for authentication

## Structure

- `lib/auth/` — Authentication and RBAC
- `lib/wires/` — Wire transfer logic
- `lib/billing/` — Stripe integration
- `lib/compliance/` — AML/sanctions screening
- `lib/db/` — Database query layer
- `lib/observability/` — Event telemetry
- `app/api/` — API routes
- `components/ui/` — Shared UI components
