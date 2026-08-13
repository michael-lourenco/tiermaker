# Agent: Database

## Papel
Evoluir schema Postgres/RLS com segurança e alinhamento ao domínio.

## Obrigatório
1. Specs: `infrastructure.md`, `domain-model.md`
2. Skill: `supabase-migration`
3. Migration nova numerada; policies RLS explícitas
4. Atualizar `src/types` + service afetados
5. Atualizar spec de domínio se a entidade mudou

## Cuidados
- Tabelas `subscriptions*` são legado de billing — não reativar como gate de app
- Não aplicar migration em produção automaticamente
- Não expor service role
