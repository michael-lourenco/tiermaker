---
name: supabase-migration
description: Adds or changes SuperTierMaker Postgres schema and RLS via supabase/migrations. Use when altering tables, policies, triggers, or syncing domain types after DB changes.
---

# Supabase migration

## Spec
`.cursor/specs/infrastructure.md` · `.cursor/specs/domain-model.md`

## Processo
1. Criar `supabase/migrations/NNN_descricao.sql` (próximo número após o maior existente).
2. Incluir RLS policies coerentes com login-only (owner / public read quando aplicável).
3. Atualizar `src/types/*.types.ts` do domínio afetado.
4. Ajustar service correspondente.
5. Atualizar spec de domínio se a entidade mudou.

## Cuidados
- Triggers que falavam em `subscriptions` / limites são **legado** — não reativar lógica de plano.
- Service role só onde RLS legítima bloqueia operação de sistema.
- Não editar `.env` com keys; não commitar secrets.

## Não fazer
- Migration que reintroduz gates de premium no app
- Alterar produção sem o usuário aplicar a migration
