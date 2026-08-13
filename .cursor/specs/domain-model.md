# Spec: Modelo de domínio

## Entidades principais

### Template
- Pertence a um usuário; itens com imagem; tiers opcionais; soft delete (`deleted_at`)
- Público/privado; categorias (N:N)
- Types: `src/types/template.types.ts`
- Service: `src/services/template.service.ts`
- APIs: `POST /api/templates/create`, `POST /api/templates/clone`

### Tier list
- Rankeamento sobre um template; tiers + items; pública/privada; likes
- Cache de listagens: `tier_lists_cache` + `TierListCacheService`
- Types: `src/types/tierList.types.ts`
- Services: `tierList.service.ts`, `tierListCache.service.ts`
- APIs: `/api/tierlists`, `/api/tierlists/[id]/like`, `/api/tierlists/[id]/public`

### Category
- Taxonomia de templates; admin gerencia
- Service: `category.service.ts`

### User preferences
- Ex.: `show_item_names`
- Service: `userPreferences.service.ts` + `useUserPreferences`

### Donation (não é entidade de permissão)
- Pagamento Stripe one-time ou subscription de apoio
- UI: `src/components/donation/`
- Spec detalhada: `donations.md`

### Ad space (desabilitado em runtime)
- Schema e admin existem; `AdSpace` retorna `null` até reativação explícita

## Defaults de tiers
`src/lib/constants/tiers.ts` — S–D + cores.

## Schema
Fonte SQL: `supabase/migrations/`. Preferir migrations + `src/types` a `lib/supabase/types.ts` se divergirem.
