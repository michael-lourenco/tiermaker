# Bug: formulário clone (`?from=`) revertia a cada edição

## Sintoma

Em `/create-template?from=<uuid>`, ao alterar título, tiers, remover imagens, etc., os valores voltavam ao estado carregado do template original.

## Causa raiz

1. `useTranslation()` devolvia uma função `t` **nova em cada render** (função inline sem `useCallback`).
2. O `useEffect` que carrega o template para clonar tinha **`t` no array de dependências** (`[initialCloneFromId, reset, t, mapTiersFromTemplate]`).
3. Qualquer re-render do formulário (digitar, `setState` em tiers/items) alterava a referência de `t` → o efeito rodava de novo → `getTemplateById` + `reset()` + `setItems`/`setTiers`/`setCover` → **perdia as edições locais**.

## Correções

| Arquivo | Alteração |
|---------|-----------|
| `src/components/templates/CreateTemplateForm.tsx` | Dependências do efeito de clone apenas `[initialCloneFromId]`, com comentário eslint para não reintroduzir `t`. |
| `src/hooks/useTranslation.ts` | `t` implementada com `useCallback(..., [translations])` para referência estável entre renders (enquanto o idioma não muda). |

## Comportamento esperado

- O clone só é buscado de novo quando o parâmetro `from` na URL mudar.
- Trocar idioma ainda atualiza `translations` → nova `t` → sem re-fetch do clone porque o efeito não depende mais de `t`.
