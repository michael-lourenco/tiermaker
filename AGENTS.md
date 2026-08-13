# Agents — SuperTierMaker

Este arquivo e `.cursor/` são a **fonte de verdade** para desenvolvimento assistido por AI neste repositório.

## Ordem de consulta
1. Specs em `.cursor/specs/`
2. Rules em `.cursor/rules/` (sempre-on + por glob)
3. Agent adequado em `.cursor/agents/`
4. Skill de domínio em `.cursor/skills/*/SKILL.md`

## Princípios globais
- SOLID · Clean Architecture (camadas do projeto) · Clean Code
- Acesso = login (admin por e-mail); Stripe = doação; sem paywall
- Respostas ao usuário em pt-BR
- Sem `step-by-step/` novo; sem rodar testes a menos que pedido
- Specs devem ser atualizadas quando o comportamento de produto mudar

## Agents disponíveis
| Agent | Arquivo | Quando usar |
|-------|---------|-------------|
| Feature | `.cursor/agents/feature.md` | Nova funcionalidade ou alteração de fluxo |
| Bugfix | `.cursor/agents/bugfix.md` | Corrigir defeito com causa raiz |
| Review | `.cursor/agents/review.md` | Revisar diff quanto a arquitetura e regressões |
| Database | `.cursor/agents/database.md` | Migrations, RLS, tipos de domínio |
| Cleanup | `.cursor/agents/cleanup.md` | Remover legado (só sob pedido explícito) |

## Specs
| Spec | Conteúdo |
|------|----------|
| `product.md` | Visão, personas, fora de escopo |
| `architecture.md` | Camadas e SOLID |
| `access-control.md` | Auth / admin |
| `domain-model.md` | Entidades |
| `api-surface.md` | Rotas API |
| `donations.md` | Stripe |
| `editors.md` | Editores DOM/canvas |
| `i18n.md` | Traduções |
| `infrastructure.md` | Supabase + S3 |
