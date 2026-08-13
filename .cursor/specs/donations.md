# Spec: Doações (Stripe)

## Papel
Apoio voluntário para manter o SuperTierMaker. **Não** concede features.

## UX
- Botão **Apoiar** no Header (desktop e mobile) → modal
- **Principal**: doação única (`once`) — destaque visual
- **Secundário**: recorrente mensal / anual

## Intervalos e modo Checkout

| Interval | Stripe `mode` | Price env |
|----------|---------------|-----------|
| `once` | `payment` | `NEXT_PUBLIC_STRIPE_PRICE_DONATION_ONCE` |
| `month` | `subscription` | `NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY` |
| `year` | `subscription` | `NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_YEARLY` |

Metadata obrigatória: `type: 'donation'`, `interval`, opcional `user_id`.

## Arquivos
- UI: `src/components/donation/DonationModal.tsx`
- Lib: `src/lib/stripe/client.ts`, `prices.ts`
- Service: `src/services/stripe.service.ts`
- API: `create-donation-checkout`, `webhooks`

## Webhook
Apenas confirma/recebe eventos; **não** atualiza permissões de usuário.

## Envs
`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, prices públicos acima, `NEXT_PUBLIC_APP_URL`.

## Teste vs live
Chaves `sk_test_` mostram banner de teste no Checkout — comportamento normal do Stripe Test Mode.
