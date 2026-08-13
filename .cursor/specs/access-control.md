# Spec: Controle de acesso

## Modelo
Barreira única de produto: **autenticado ou não**.

| Área | Anônimo | Logado | Admin |
|------|---------|--------|-------|
| Home, categories, templates públicos, tier lists públicas | ✓ | ✓ | ✓ |

**Público no site** = marcado `is_public` **e** template com `cover_image_url` válido. Sem capa: não lista, não abre para não-owner (`notFound`), create/update não persistem público.
| Criar/editar template, editores, my-*, profile | ✗ → login | ✓ | ✓ |
| `/admin/*` | ✗ | ✗ | ✓ |

## Implementação
- **Pages**: `createClient()` + `getUser()` → `redirect('/login')` se privado.
- **APIs**: `getUser()` → `401 Unauthorized` se necessário.
- **Admin**: `isAdminEmail` / `isAdmin` em `src/lib/utils/admin.ts` (allowlist por e-mail).
- **Sem** `middleware.ts` global de plano/feature hoje.

## Proibições
- Não checar `isPremium`, `subscription_limits`, `plan_type`, `LimitReached*`
- Não criar rotas `/pricing` ou `/account/subscription` (redirects permanentes já existem)
- Doação Stripe **nunca** altera permissões

## Redirects legados (`next.config.js`)
- `/pricing` → `/`
- `/account/subscription` → `/profile`
