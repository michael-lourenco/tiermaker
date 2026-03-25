# Implementação: clonar template (com regras de imagens no S3)

## Resumo

- **Clonar** cria um template novo (novo ID, dono = utilizador atual), com cópia no S3 das imagens **herdadas** que permanecem na lista ao salvar.
- **Rascunho em modo clone**: itens `cloned` removidos da lista não apagam objetos do template original; itens `uploadedNew` removem o ficheiro em `uploads/{userId}/` via `POST /api/upload/delete`.
- **Modo clone**: novos itens e nova capa fazem **upload imediato** para o S3; no submit chama-se `POST /api/templates/clone` (sem re-upload).

## Ficheiros criados

| Ficheiro | Função |
|----------|--------|
| `src/lib/server/cloneTemplateImages.ts` | Conjunto de URLs permitidas para clone; validação de URL “new”; `copyClonedImageToUserFolder` (CopyObject + URL pública). |
| `src/app/api/templates/clone/route.ts` | Autenticação, limite de templates, validação origem (público ou dono), resolve URLs (copiar vs reutilizar), `TemplateService.createTemplate`. |
| `src/app/api/upload/delete/route.ts` | Apaga objeto S3 só se a key for `uploads/{userId}/...`. |

## Ficheiros alterados

| Ficheiro | Alteração |
|----------|-----------|
| `src/lib/aws/s3.ts` | `publicUrlForS3Key`, `copyS3Object` (CopyObjectCommand). |
| `src/services/image.service.ts` | `deleteUploadedImage` → chama `/api/upload/delete`. |
| `src/types/template.types.ts` | Tipos `CloneTemplateItemPayload`, `CloneTemplateRequestBody`. |
| `src/components/templates/CreateTemplateForm.tsx` | Modo clone (`initialCloneFromId`), tipos de item/capa, dois `useEffect` (reset sem `?from` vs carregar origem), submit para `/api/templates/clone` ou `/api/templates/create`. |
| `src/app/create-template/page.tsx` | Lê `searchParams.from`, passa para o client. |
| `src/components/templates/CreateTemplatePageClient.tsx` | Prop `cloneFromId`, subtítulo condicional. |
| `src/components/templates/TemplatePageClient.tsx` | Botão “Clonar template” (só logado) → `/create-template?from=`. |
| `src/components/templates/MyTemplatesPageClient.tsx` | Botão Clonar + tooltip; `flex-wrap` no footer do card. |
| `src/lib/i18n/types.ts`, `translations/pt.json`, `translations/en.json` | Chaves de clone e textos PT/EN. |

## Fluxo da API `POST /api/templates/clone`

1. Corpo: `source_template_id`, metadados, `cover_image` (`null` ou `{ source, image_url }`), `items[]` com `source` `cloned` | `new` e `image_url`, `tiers` opcional.
2. `source` `cloned`: `image_url` tem de estar no conjunto (capa + itens do template origem); cópia S3 para `uploads/{userId}/{uuid}.ext`.
3. `source` `new`: `image_url` tem de ser key sob `uploads/{userId}/` (upload feito antes no cliente).
4. `createTemplate` com URLs já resolvidas.

## Documentação relacionada

- `step-by-step/TEMPLATE_CLONE_REGRAS_IMAGENS.md` — regras de produto acordadas.

---

*Data da implementação: conforme conversa no repositório.*
