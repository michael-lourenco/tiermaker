---
name: donation-stripe
description: Stripe voluntary donations (one-time and recurring) for SuperTierMaker. Use when changing DonationModal, checkout API, webhook, or donation price envs.
---

# Donation Stripe

## Spec
`.cursor/specs/donations.md`

## Fluxo
1. Header `DonationButton` abre modal
2. Opção destacada: `once` → `POST /api/stripe/create-donation-checkout` `{ interval: 'once' }`
3. Secundárias: `month` | `year`
4. Service cria Checkout Session; redirect `session.url`
5. Webhook recebe eventos; **não** muda ACL

## Arquivos
`components/donation/DonationModal.tsx` · `lib/stripe/*` · `services/stripe.service.ts` · `app/api/stripe/*`

## Checklist
- [ ] `once` usa `mode: 'payment'`
- [ ] recorrente usa `mode: 'subscription'`
- [ ] metadata `type: 'donation'`
- [ ] copy i18n `donation.*` em pt/en
- [ ] avulsa continua visualmente principal

## Envs
`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PRICE_DONATION_ONCE`, `NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY`, `NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_YEARLY`, `NEXT_PUBLIC_APP_URL`
