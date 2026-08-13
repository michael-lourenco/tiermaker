# Público exige imagem de capa

## Objetivo
Templates e tier lists marcados como públicos **sem imagem de capa do template** não devem aparecer no site. Em criar/editar, o usuário deve ser informado de que a capa é obrigatória para publicar.

## Regra
- Capa = `templates.cover_image_url` (não vazia após trim).
- Tier list pública no site depende da capa do **template** associado.
- Helper: `src/lib/utils/publicVisibility.ts` (`hasCoverImage`, `resolveIsPublic`).

## Alterações

### Utilitário
| Arquivo | Função |
|---------|--------|
| `src/lib/utils/publicVisibility.ts` | Decide se conteúdo pode ser tratado como público |

### Banco
| Arquivo | Função |
|---------|--------|
| `supabase/migrations/016_public_requires_cover_image.sql` | Cache SQL de tier lists públicas exige capa no template |

### Listagens / services
| Arquivo | Função |
|---------|--------|
| `template.service.ts` | `getPublicTemplates` e contagens filtram sem capa; create/update usam `resolveIsPublic` |
| `tierList.service.ts` | `getPublicTierLists` + create com coerce de `is_public` |
| `tierListCache.service.ts` | Listagens/cache só com template com capa |
| `category.service.ts` | Contagem/listagem por categoria exige capa |

### Páginas públicas
| Arquivo | Função |
|---------|--------|
| `templates/[id]/page.tsx` | Não-owner → `notFound` se público sem capa |
| `tier-lists/[id]/page.tsx` | Idem via capa do template |

### API
| Arquivo | Função |
|---------|--------|
| `api/tierlists/[id]/public/route.ts` | `400` + `COVER_REQUIRED_FOR_PUBLIC` ao tornar pública sem capa |

### UI + i18n
| Arquivo | Função |
|---------|--------|
| `CreateTemplateForm.tsx` / `EditTemplateForm.tsx` | Hint + bloqueio de submit público sem capa |
| `TierListEditorClient.tsx` / `CanvasTierListEditorClient.tsx` | Toggle/aviso ao tentar público sem capa |
| `MyTierListsPageClient.tsx` | Mensagem i18n no erro da API |
| `pt.json` / `en.json` / `types.ts` | `coverRequiredForPublic`, `isPublicCoverHint`, `coverRequiredForPublicTierList` |

### Specs
| Arquivo | Função |
|---------|--------|
| `.cursor/specs/domain-model.md` | Documenta regra de capa |
| `.cursor/specs/access-control.md` | Público no site = flag + capa |

## Aplicar no Supabase
Rodar a migration `016_public_requires_cover_image.sql` (e regenerar o cache de tier lists se necessário).

## Manutenibilidade
A regra fica centralizada em `publicVisibility` + filtros de query; UI e API reforçam a mesma condição. Próximo passo opcional: ao remover a capa de um template público, forçar `is_public=false` automaticamente no update (hoje o coerce já evita manter público sem capa no save do template).
