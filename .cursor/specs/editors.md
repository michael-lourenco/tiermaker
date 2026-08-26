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

## Header do editor DOM
Barra compacta: nome do template (link discreto + tooltip da descrição) e título da lista como input estilo heading — prioriza viewport para tiers/itens.

## Adicionar imagens no editor DOM
No bloco de não atribuídos, o usuário pode escolher imagens novas. Elas ficam **só no editor** (ids `pending-*`, preview local) até o **salvar**:
- se o template é do usuário → `POST /api/templates/append-items` e depois create/update da tier list;
- se não é → **um** `POST /api/templates/fork-for-ranking` e cria uma nova tier list no template copiado.

Em modo edição (`/editor/edit/...`) com imagens novas em template alheio, confirma-se que a lista atual não será alterada (cria-se lista nova). Draft localStorage **não** persiste pending (blob).

## Regras ao alterar
1. Manter checks apenas de **login**, nunca de plano.
2. Não quebrar o contrato de `onSave` (tiers + items).
3. Preferir extrair helpers se o client page passar de ~300 linhas.
4. Canvas e DOM são caminhos paralelos — mudanças de domínio (save/API) devem considerar ambos se o fluxo for compartilhado.
