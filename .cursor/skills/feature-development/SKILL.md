---
name: feature-development
description: Implements new SuperTierMaker features following Clean Architecture layers (page server, PageClient, service, API, types, i18n). Use when adding features, endpoints, or UI flows across the app.
---

# Feature development

## Antes de codar
1. Ler specs relevantes em `.cursor/specs/` (`architecture`, `domain-model`, `access-control`, `api-surface`).
2. Confirmar se a feature exige login e/ou admin.
3. Localizar service/types/component existentes no mesmo domínio — estender antes de criar paralelo.

## Checklist de implementação
- [ ] Types em `src/types/*.types.ts` se o contrato mudou
- [ ] Lógica de domínio em `src/services/*.service.ts` (sem React)
- [ ] Page server carrega dados; `*PageClient` para UI
- [ ] Mutação sensível em `src/app/api/**` com auth
- [ ] i18n pt + en + `types.ts` se houver copy
- [ ] Spec atualizada se o comportamento de produto mudou
- [ ] Sem plan gates / sem docs step-by-step / sem testes automáticos (usuário roda manualmente)

## Estrutura sugerida para feature nova
```
src/types/<domain>.types.ts
src/services/<domain>.service.ts
src/app/<route>/page.tsx
src/components/<domain>/<Name>PageClient.tsx
src/app/api/<domain>/route.ts   # se mutação
```

## Anti-padrões
- Busines logic só no componente
- Service role no client
- Duplicar service que já existe
- Feature flag baseada em Stripe/premium
