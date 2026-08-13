# Spec: Editores de tier list

## Dois editores

| Rota | Implementação | Uso |
|------|---------------|-----|
| `/editor/[templateId]` | DOM + `@dnd-kit` (`TierListEditor`) | **Padrão de produto** |
| `/editor/new/[templateId]` | Canvas (`CanvasTierListEditor`) | Experimental (link secundário na página do template) |
| `/editor/edit/[tierListId]` | DOM + `updateTierList` | Editar lista existente (owner) |

Remix: `/editor/[templateId]?from=[tierListId]` pré-carrega ranking da lista fonte.

Ambos os editores de criação exigem login.

## Responsabilidades
- **Client page**: título, público/privado, save, draft (quando aplicável)
- **Editor**: arranjo de itens nos tiers
- **Service**: `TierListService.createTierList` (persistência)
- **Export**: `useTierListImage` — qualidade alta/4K disponível para todos logados

## Draft
`useTierListDraft` / localStorage no editor DOM — draft é UX local, não fonte de verdade do servidor.

## Regras ao alterar
1. Manter checks apenas de **login**, nunca de plano.
2. Não quebrar o contrato de `onSave` (tiers + items).
3. Preferir extrair helpers se o client page passar de ~300 linhas.
4. Canvas e DOM são caminhos paralelos — mudanças de domínio (save/API) devem considerar ambos se o fluxo for compartilhado.
