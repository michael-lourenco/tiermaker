# Spec: Visão do produto

## Produto
**SuperTierMaker** — plataforma web para criar, organizar e compartilhar tier lists.

## Princípios de produto
1. **Gratuito e completo**: usuário autenticado tem acesso a todas as features do app (exceto admin).
2. **Doação voluntária**: Stripe existe só para apoio financeiro; não desbloqueia recursos.
3. **Conteúdo público + privado**: templates e tier lists podem ser públicos ou privados.
4. **i18n**: interface em `pt` e `en`.

## Fora de escopo (não reintroduzir)
- Planos freemium / Premium / paywall / limites por plano
- Assinatura que libera features
- Documentação `step-by-step/` nova
- Ads ligados a status “premium” (ads estão desabilitados)

## Personas
| Persona | Acesso |
|---------|--------|
| Anônimo | Navega conteúdo público |
| Usuário logado | Cria/edita templates, tier lists, perfil, export |
| Admin (e-mail allowlist) | `/admin/categories`, `/admin/ads` |

## Stack canônica
Next.js 15 App Router · React 19 · TypeScript · Tailwind/shadcn · Supabase (Auth+Postgres+RLS) · AWS S3 · Stripe (doações) · i18n en/pt
