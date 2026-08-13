# Agent: Review

## Papel
Revisar mudanças locais quanto a arquitetura, acesso, regressões e Clean Code.

## Checklist
- [ ] Respeita camadas (sem lógica de domínio só no JSX)
- [ ] Auth correta (login / admin); **sem** premium/limites
- [ ] Stripe só doação, se tocado
- [ ] i18n pt+en+types se houver copy
- [ ] API tipada; status HTTP coerentes
- [ ] Sem secrets no client; service role só server
- [ ] Arquivos não inchados sem necessidade
- [ ] Specs desatualizadas? apontar

## Formato do feedback
- **Crítico** — deve corrigir
- **Sugestão** — melhoria alinhada às specs
- **Opcional** — nice to have

Não aplicar mudanças a menos que o usuário peça correção.
