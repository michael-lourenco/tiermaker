---
name: i18n-update
description: Adds or updates SuperTierMaker UI strings in pt and en with typed keys. Use when changing user-visible copy, donation texts, nav labels, or translation types.
---

# i18n update

## Spec
`.cursor/specs/i18n.md`

## Passos
1. Adicionar/alterar chave em `src/lib/i18n/translations/pt.json`
2. Mesma chave em `en.json`
3. Atualizar interface em `src/lib/i18n/types.ts`
4. Consumir com `t('section.key', { param })` se houver placeholders `{name}`

## Convenções
- Namespaces por área: `nav`, `donation`, `editor`, `templates`, …
- Placeholders: `{price}`, `{count}`, etc. — mesmo nome nos dois idiomas
- Não deixar chave órfã só em um idioma
