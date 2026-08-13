---
name: template-flow
description: Create, edit, clone templates and S3 image handling for SuperTierMaker. Use when working on templates, CreateTemplateForm, clone API, or template image uploads.
---

# Template flow

## Specs
- `.cursor/specs/domain-model.md`
- `.cursor/specs/infrastructure.md`
- `.cursor/specs/api-surface.md`

## Peças
| Peça | Path |
|------|------|
| Types | `src/types/template.types.ts` |
| Service | `src/services/template.service.ts` |
| Create UI | `src/components/templates/CreateTemplateForm.tsx` |
| Edit UI | `EditTemplateForm.tsx` |
| Create API | `src/app/api/templates/create/route.ts` |
| Clone API | `src/app/api/templates/clone/route.ts` |
| Clone S3 | `src/lib/server/cloneTemplateImages.ts` |
| Upload | `src/app/api/upload` + `lib/aws/s3.ts` |

## Regras
1. Create/clone exigem usuário autenticado — **sem** limite de quantidade.
2. Clone: URLs `cloned` passam por cópia S3 para o prefixo do user; `new` devem pertencer ao user (`assertUserOwnsUploadUrl`).
3. Soft delete respeita `deleted_at` nos services existentes.
4. Tiers default: `src/lib/constants/tiers.ts`.

## Ao alterar clone/create
Validar body → auth → service.createTemplate → JSON 201. Erros: 400/401/403/404/500 sem payload de `limitReached`.
