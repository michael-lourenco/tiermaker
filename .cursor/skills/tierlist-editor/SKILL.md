---
name: tierlist-editor
description: DOM and canvas tier list editors, drafts, save, and image export. Use when editing TierListEditor, CanvasTierListEditor, editor pages, drafts, or useTierListImage.
---

# Tier list editor

## Spec
`.cursor/specs/editors.md`

## Rotas
- Principal (dnd-kit): `src/app/editor/[templateId]/`
- Canvas: `src/app/editor/new/[templateId]/`

## Componentes-chave
- `components/editor/TierListEditor.tsx` + rows/items
- `components/editor/canvas/*` (renderer, input handler)
- Clients: `TierListEditorClient.tsx`, `CanvasTierListEditorClient.tsx`
- Persistência: `TierListService`
- Draft: hooks de draft / localStorage
- Export: `useTierListImage` (4K liberado para todos)

## Ao salvar
1. Exigir `user` — senão login
2. Não checar planos/limites
3. Manter contrato tiers/items
4. Se mudar save compartilhado, considerar **ambos** editores

## Preferência de UI
`useUserPreferences` (`show_item_names`) — não quebrar no editor.
