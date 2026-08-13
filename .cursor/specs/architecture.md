# Spec: Arquitetura

## Camadas (Clean Architecture adaptada ao App Router)

```
src/app          → Interface (rotas, Server Components, API Routes)
src/components   → Interface (UI por domínio)
src/hooks        → Application helpers (estado/efeitos reutilizáveis)
src/services     → Application / domain operations (casos de uso sobre persistência)
src/types        → Contratos de domínio
src/lib          → Infrastructure (Supabase, S3, Stripe, i18n, utils)
supabase/        → Infrastructure (schema SQL + RLS)
```

## Dependências permitidas
- `app` e `components` → `hooks`, `services`, `types`, `lib`, `components/ui`
- `services` → `lib`, `types` (não importar React/components)
- `hooks` → `services`, `lib`, `types` (sem pages)
- `lib` → não depende de `components`/`app`

## Fluxo padrão de feature

1. **Page server** (`page.tsx`): auth + fetch via service com `createClient()` do server.
2. **Page client** (`*PageClient.tsx`): interatividade; recebe dados já carregados.
3. **Mutações sensíveis**: sempre via **API Route** (`src/app/api/**`) com `getUser()`.
4. **Persistência**: classes `*Service` em `src/services/*.service.ts`.
5. **Contratos**: `src/types/*.types.ts`.

## Princípios SOLID neste repo

| Princípio | Como aplicar |
|-----------|--------------|
| S | Um service/componente/hook com uma responsabilidade clara |
| O | Estender via novos services/handlers; não “if premium” espalhado |
| L | Clients Supabase injetáveis no constructor do service |
| I | Types e APIs enxutos por domínio (template ≠ tierList ≠ donation) |
| D | Page/API dependem de service; service recebe client, não cria acoplamento rígido a UI |

## Clean Code
- Funções/arquivos pequenos; preferir split acima de ~200–300 linhas
- Nomes explícitos; evitar comentários óbvios
- Sem duplicação: reutilizar service/hook/`cn`/i18n existentes
- Sem dados mock em dev/prod (só testes, quando existirem)

## O que NÃO fazer
- Não criar `src/store`/Zustand sem necessidade explícita
- Não inventar middleware global sem pedido
- Não acoplar Stripe/doação a permissões de feature
- Não sobrescrever `.env` sem confirmação do usuário
