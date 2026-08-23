# Spec: Infraestrutura (Supabase + S3)

## Supabase
| Client | Arquivo | Uso |
|--------|---------|-----|
| Browser | `src/lib/supabase/client.ts` | Client components / services no browser |
| Server (cookies) | `src/lib/supabase/server.ts` → `createClient` | Pages/API com sessão do usuário |
| Service role | `createServiceRoleClient` | Bypass RLS só no server (cache, jobs, ops privilegiadas) |

Schema e RLS: `supabase/migrations/`. Novas tabelas/colunas = nova migration numerada.

## AWS S3
- Helper: `src/lib/aws/s3.ts`
- Upload/delete: `/api/upload`, `/api/upload/delete`, `/api/delete-images`
- Clone de template: `src/lib/server/cloneTemplateImages.ts` — copiar objetos para prefixo do usuário; validar ownership de URLs `new`

## Next Image
Em dev (WSL), `images.unoptimized` pode estar ativo — não “corrigir” sem contexto; ver `next.config.js`.

## Secrets
Nunca commitar `.env`. Não sobrescrever `.env` sem confirmação. Service role e Stripe secret só no server.

## Email (Resend)
- Confirmação de signup inicial: SMTP do Supabase Auth (painel).
- Botão “Reenviar email”: `POST /api/auth/resend-confirmation` → `auth.admin.generateLink` + API Resend.
- Esqueci a senha: `POST /api/auth/forgot-password` → `generateLink` recovery + Resend; `redirect_to=/reset-password`.
- Links implícitos (`#access_token&type=recovery`) são tratados por `AuthHashHandler` (layout) e pela página `/reset-password`.
- No Supabase Redirect URLs, incluir:
  - `https://www.supertiermaker.com/reset-password`
  - `https://supertiermaker.com/reset-password`
  - `https://www.supertiermaker.com/api/auth/callback`
  - `http://localhost:3000/reset-password` (dev)
