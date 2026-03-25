# Clonagem de template — regras de imagens (montagem e gravação)

Documento de especificação para implementação. Complementa o plano de clone (`clone` + cópia S3).

## Comportamento desejado

### 1. Ao acionar o clone (tela de criação baseada em template)

- O formulário exibe as imagens **já existentes** no S3 (URLs do template origem), na lista de montagem do template (items).
- O utilizador pode **adicionar** novas imagens (upload) e **remover** entradas da lista, como num create normal.

### 2. Durante a criação (antes de “Salvar template”)

- Itens vindos do template origem (`origem: clonado`) **não** disparam eliminação real no S3 ao serem removidos da lista — só saem da UI/lista em memória. Assim o template original continua intacto.
- Itens adicionados nesta sessão (`origem: novo`) **podem** ser apagados de verdade no S3 quando removidos (limpeza de órfãos), porque ainda não fazem parte de nenhum template persistido e não são partilhados com o original.

### 3. Ao clicar em “Salvar template”

- Para cada item **ainda presente** na lista final:
  - Se a imagem era **clonada** (ainda referencia URL/objeto do origem): executar **cópia no S3** para uma nova key sob o utilizador atual (mesmo padrão `uploads/{userId}/{uuid}.ext`), e gravar no novo template apenas essa **nova** URL.
  - Se a imagem era **nova** (upload nesta sessão, já em `uploads/{userId}/...`): **não** é necessário copiar de novo para proteger o original — já pertence ao fluxo do utilizador; usar a URL já obtida no upload.
- O resultado: o novo template só referencia objetos que **não** são os do template origem para imagens herdadas; edições futuras (substituir/apagar item no edit) não afetam o original.

## Modelo de dados por item no cliente (rascunho)

| Campo (exemplo)        | Uso |
|------------------------|-----|
| `source: 'cloned' \| 'new'` | Define se remoção pode apagar S3 e se no save precisa de `CopyObject`. |
| `imageUrl` / `preview` | URL atual para exibir; para clonado, ainda é URL do origem até ao save. |
| `file?`                | Presente só para `new` quando veio de upload local. |

## Fluxo no save (servidor ou orquestração)

1. Validar limites e permissões (como no plano base).
2. Montar lista final de items com `name`, `order`.
3. Para cada item `cloned`: `copyS3Object` origem → destino; persistir `image_url` = URL nova.
4. Para cada item `new`: persistir `image_url` = URL já existente do upload.
5. Criar template + items + tiers na BD (transação desejável; em falha, política de rollback/limpeza de cópias já feitas).

## Casos limite

- Utilador remove todos os items clonados e só deixa novos: só novas URLs no insert; nada a copiar.
- Utilador remove um upload novo: apagar objeto S3 (best-effort) ao remover da lista.
- URL clonada não mapeia para o bucket configurado: falhar com erro claro ou política definida no plano base (whitelist / rejeitar).

## Ficheiros previstos (quando implementar)

- `CreateTemplateForm` (ou variante): modo clone com estado por item.
- API `POST /api/templates/clone` **ou** endpoint de “finalizar rascunho clone” que recebe a lista final + metadados — a decisão exata depende se o rascunho é só cliente até ao save (recomendado: um único POST no save com payload que distingue `cloned` vs `new`).
- `copyS3Object` em `src/lib/aws/s3.ts`.
- Serviço que aplica cópias apenas para itens `cloned` na lista final.

---

*Última atualização: especificação acordada com regra de não apagar S3 para itens clonados durante o rascunho; cópia S3 apenas no save para itens clonados mantidos.*
