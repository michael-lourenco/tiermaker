# 🚀 Setup Inicial - Guia Completo

Este guia cobre todas as configurações **OBRIGATÓRIAS** para o projeto funcionar.

## ⚠️ Condições de Funcionamento

O projeto **NÃO funcionará** sem estas configurações:

1. ✅ Variáveis de ambiente configuradas
2. ✅ Supabase: Migrations executadas
3. ✅ AWS S3: CORS configurado (OBRIGATÓRIO para uploads)
4. ✅ AWS S3: Bucket Policy configurada (Recomendado)

---

## 1️⃣ Variáveis de Ambiente

Crie o arquivo `.env.local` na raiz do projeto:

```env
# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AWS S3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your_bucket_name
```

**Nota**: `AWS_S3_BUCKET_URL` não é necessária - a URL é construída automaticamente.

---

## 2️⃣ Supabase - Banco de Dados

### Passo 1: Criar Projeto
1. Acesse [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Crie um novo projeto ou selecione um existente

### Passo 2: Executar Migrations
1. No dashboard, vá para **SQL Editor**
2. Clique em **New Query**
3. Abra o arquivo `supabase/setup_complete.sql`
4. Copie TODO o conteúdo
5. Cole no SQL Editor
6. Clique em **Run** (Ctrl+Enter / Cmd+Enter)
7. Aguarde a confirmação de sucesso

### Passo 3: Verificar
1. Vá para **Table Editor**
2. Você deve ver 7 tabelas criadas:
   - `templates`
   - `template_items`
   - `tier_lists`
   - `tier_list_items`
   - `tier_list_tiers`
   - `likes`
   - `comments`

📚 **Documentação**: Veja `supabase/SETUP.md` para mais detalhes

---

## 3️⃣ AWS S3 - Configuração CORS (OBRIGATÓRIO)

⚠️ **SEM CORS CONFIGURADO, OS UPLOADS NÃO FUNCIONARÃO!**

### Passo 1: Acessar o Bucket
1. Acesse [https://console.aws.amazon.com/s3](https://console.aws.amazon.com/s3)
2. Selecione seu bucket (ex: `tiermaker-app`)

### Passo 2: Configurar CORS
1. Clique na aba **Permissions** (Permissões)
2. Role até **Cross-origin resource sharing (CORS)**
3. Clique em **Edit** (Editar)

### Passo 3: Cole a Configuração

**Opção A - Formato em uma linha (Recomendado):**

Copie o conteúdo de `supabase/CORS_CONFIG_ONELINE.txt`:

```
[{"AllowedHeaders":["*"],"AllowedMethods":["GET","PUT","POST","DELETE","HEAD"],"AllowedOrigins":["http://localhost:3000","https://localhost:3000","http://127.0.0.1:3000"],"ExposeHeaders":["ETag","x-amz-server-side-encryption","x-amz-request-id","x-amz-id-2"],"MaxAgeSeconds":3000}]
```

**Opção B - Formato formatado:**

Copie o conteúdo de `supabase/CORS_CONFIG_READY.json`:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
        "AllowedOrigins": ["http://localhost:3000", "https://localhost:3000", "http://127.0.0.1:3000"],
        "ExposeHeaders": ["ETag", "x-amz-server-side-encryption", "x-amz-request-id", "x-amz-id-2"],
        "MaxAgeSeconds": 3000
    }
]
```

### Passo 4: Salvar
1. Clique em **Save changes**
2. Aguarde alguns segundos para propagar

### ⚠️ Pontos Importantes:
- **NÃO inclua OPTIONS** na lista de métodos - o AWS trata automaticamente
- Certifique-se de que o bucket está correto
- Para produção, adicione seu domínio aos `AllowedOrigins`

📚 **Documentação completa**: Veja `supabase/AWS_S3_CORS_SETUP.md`

---

## 4️⃣ AWS S3 - Bucket Policy (Recomendado)

### Passo 1: Acessar Bucket Policy
1. No mesmo bucket, vá para **Permissions** → **Bucket policy**
2. Clique em **Edit**

### Passo 2: Configurar Política

**Para Desenvolvimento (Uploads Públicos):**

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::SEU_BUCKET_NAME/*"
        },
        {
            "Sid": "PublicPutObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:PutObject",
            "Resource": "arn:aws:s3:::SEU_BUCKET_NAME/*"
        }
    ]
}
```

**Para Produção (Apenas Leitura Pública, Uploads via Presigned URLs):**

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::SEU_BUCKET_NAME/*"
        }
    ]
}
```

**IMPORTANTE**: Substitua `SEU_BUCKET_NAME` pelo nome real do seu bucket!

### Passo 3: Salvar
1. Clique em **Save changes**

📚 **Documentação completa**: Veja `supabase/AWS_S3_BUCKET_POLICY.md`

---

## 5️⃣ Testar a Configuração

### Teste 1: Verificar Supabase
```bash
npm run dev
```
- Acesse `http://localhost:3000`
- A página deve carregar sem erros de banco de dados

### Teste 2: Verificar Upload
1. Faça login na aplicação
2. Vá para "Create Template"
3. Tente fazer upload de uma imagem
4. Se funcionar, a configuração está correta!

---

## 🐛 Troubleshooting

### Erro: "Could not find the table"
- **Solução**: Execute as migrations do Supabase (Passo 2)

### Erro: CORS Policy
- **Solução**: Configure CORS no S3 (Passo 3)
- Verifique se não incluiu OPTIONS na lista
- Aguarde alguns segundos após salvar

### Erro: "Access Denied" no upload
- **Solução**: Configure Bucket Policy (Passo 4)
- Verifique se o Resource ARN está correto

### Erro: Variáveis de ambiente
- **Solução**: Verifique se `.env.local` existe e está completo
- Reinicie o servidor após alterar variáveis

📚 **Mais ajuda**: Veja `TROUBLESHOOTING.md`

---

## ✅ Checklist Final

Antes de considerar o setup completo, verifique:

- [ ] Variáveis de ambiente configuradas (`.env.local`)
- [ ] Supabase: Migrations executadas (7 tabelas criadas)
- [ ] AWS S3: CORS configurado (sem OPTIONS)
- [ ] AWS S3: Bucket Policy configurada
- [ ] Teste de upload funcionando
- [ ] Página inicial carregando sem erros

---

## 📚 Documentação Adicional

- `supabase/SETUP.md` - Setup detalhado do Supabase
- `supabase/AWS_S3_CORS_SETUP.md` - Configuração CORS detalhada
- `supabase/AWS_S3_BUCKET_POLICY.md` - Configuração de políticas
- `TROUBLESHOOTING.md` - Resolução de problemas comuns
- `README.md` - Documentação geral do projeto

---

**Última atualização**: Configurações validadas e testadas ✅

