# URL canônica de compartilhamento

## Problema
Botões de share usavam `https://tiermaker-seven.vercel.app/...` (e o fallback no código ainda tinha typo `superiermaker.com`).

## Solução
- Constante canônica: `https://supertiermaker.com` em `src/lib/constants/site.ts`
- `getPublicAppUrl()` usa `NEXT_PUBLIC_APP_URL`, mas substitui hosts `*.vercel.app` pela URL canônica
- Share (`share.utils.ts`), OG (`meta-tags.ts`) e redirect Stripe passam por esse helper

## Arquivos
| Arquivo | Função |
|---------|--------|
| `src/lib/constants/site.ts` | `SITE_URL` + `getPublicAppUrl()` |
| `src/lib/share/share.utils.ts` | URLs dos botões de compartilhar |
| `src/lib/share/meta-tags.ts` | `metadataBase` / Open Graph |
| `src/app/api/stripe/create-donation-checkout/route.ts` | success/cancel sem domínio Vercel legado |

## Deploy
Opcional: no Vercel, definir `NEXT_PUBLIC_APP_URL=https://supertiermaker.com` (mesmo com o fallback/guard do código).
