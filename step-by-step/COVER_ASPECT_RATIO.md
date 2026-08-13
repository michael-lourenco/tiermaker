# Proporção obrigatória da imagem de capa (2560×1080)

## Objetivo
Na criação/edição de template, a capa deve ser **exibida** e **aceita** apenas na proporção 2560×1080 (tamanho livre, razão fixa).

## Implementação
| Arquivo | Função |
|---------|--------|
| `src/lib/utils/coverAspect.ts` | Constante da razão, `isCoverAspectRatio`, `assertCoverAspectRatio`, classe CSS |
| `CreateTemplateForm.tsx` | Preview/dropzone `aspect-[2560/1080]` + validação no select |
| `EditTemplateForm.tsx` | Idem |
| i18n pt/en + types | `coverImageAspectHint`, `coverImageAspectInvalid` |
| `.cursor/specs/domain-model.md` | Documenta a regra |

## Validação
Tolerância relativa de 1% na razão `width/height` vs `2560/1080` (arredondamento de pixels). Fora disso, o arquivo é rejeitado e não entra no estado.
