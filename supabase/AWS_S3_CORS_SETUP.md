# Configuração CORS para AWS S3

## 🔴 Problema

Quando você tenta fazer upload direto do navegador para o S3 usando presigned URLs, o navegador bloqueia a requisição devido à política CORS (Cross-Origin Resource Sharing) do bucket.

**IMPORTANTE**: CORS é diferente de Bucket Policy:
- **Bucket Policy**: Controla permissões (quem pode fazer o quê)
- **CORS**: Controla requisições cross-origin do navegador

Você precisa configurar **AMBOS**. Veja `AWS_S3_BUCKET_POLICY.md` para configuração de permissões.

## ✅ Solução: Configurar CORS no Bucket S3

### Opção 1: Via AWS Console (Recomendado)

1. **Acesse o AWS Console**
   - Vá para [https://console.aws.amazon.com/s3](https://console.aws.amazon.com/s3)
   - Selecione seu bucket (ex: `tiermaker-app` ou `tiermaker` - verifique qual você está usando)

2. **Abra as Configurações de CORS**
   - Clique na aba **Permissions** (Permissões)
   - Role até a seção **Cross-origin resource sharing (CORS)**
   - Clique em **Edit** (Editar)

3. **Cole a Configuração CORS**

   **IMPORTANTE**: O editor do AWS S3 pode ser sensível ao formato. Tente estas opções:

   **Opção A - Formato Array (mais comum):**
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

   **Opção B - Formato em uma linha (sem quebras de linha):**
   ```
   [{"AllowedHeaders":["*"],"AllowedMethods":["GET","PUT","POST","DELETE","HEAD"],"AllowedOrigins":["http://localhost:3000","https://localhost:3000","http://127.0.0.1:3000"],"ExposeHeaders":["ETag","x-amz-server-side-encryption","x-amz-request-id","x-amz-id-2"],"MaxAgeSeconds":3000}]
   ```

   **IMPORTANTE**: O AWS S3 **NÃO permite OPTIONS** explicitamente na configuração CORS. O método OPTIONS é tratado automaticamente pelo S3 quando você configura os outros métodos. **NÃO inclua OPTIONS** na lista de AllowedMethods!

   **Opção C - Formato usando o editor visual:**
   Se o JSON não funcionar, use o editor visual do AWS:
   - Clique em "Add CORS rule" ou use o editor visual
   - Preencha manualmente:
     - **Allowed origins**: `http://localhost:3000`
     - **Allowed methods**: Selecione `GET`, `PUT`, `POST`, `DELETE`, `HEAD` (NÃO selecione OPTIONS)
     - **Allowed headers**: `*`
     - **Expose headers**: `ETag,x-amz-server-side-encryption,x-amz-request-id,x-amz-id-2`
     - **Max age**: `3000`

**IMPORTANTE**: 
- Certifique-se de que o nome do bucket corresponde ao bucket real (`tiermaker-app`)
- **NÃO inclua OPTIONS** na lista de métodos - o AWS S3 trata OPTIONS automaticamente
- Remova espaços extras e quebras de linha desnecessárias

4. **Salve as Alterações**
   - Clique em **Save changes**

### Opção 2: Via AWS CLI

Se você tem o AWS CLI instalado:

```bash
aws s3api put-bucket-cors \
  --bucket tiermaker \
  --cors-configuration file://cors-config.json
```

Onde `cors-config.json` contém:

```json
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
      "AllowedOrigins": [
        "http://localhost:3000",
        "https://localhost:3000",
        "https://*.vercel.app",
        "https://*.netlify.app"
      ],
      "ExposeHeaders": [
        "ETag",
        "x-amz-server-side-encryption",
        "x-amz-request-id",
        "x-amz-id-2"
      ],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

### Opção 3: Via Terraform (se usar IaC)

```hcl
resource "aws_s3_bucket_cors_configuration" "tiermaker" {
  bucket = aws_s3_bucket.tiermaker.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "DELETE", "HEAD"]
    allowed_origins = [
      "http://localhost:3000",
      "https://localhost:3000",
      "https://*.vercel.app",
      "https://*.netlify.app"
    ]
    expose_headers  = ["ETag", "x-amz-server-side-encryption"]
    max_age_seconds = 3000
  }
}
```

## 📝 Explicação da Configuração

- **AllowedOrigins**: Domínios permitidos para fazer requisições
  - `http://localhost:3000` - Desenvolvimento local
  - `https://*.vercel.app` - Deploy na Vercel
  - `https://*.netlify.app` - Deploy no Netlify
  - Adicione seu domínio de produção quando tiver

- **AllowedMethods**: Métodos HTTP permitidos
  - `PUT` - Necessário para upload via presigned URL
  - `GET` - Para baixar arquivos
  - `POST`, `DELETE`, `HEAD` - Para outras operações
  - **NOTA**: `OPTIONS` não deve ser incluído - o AWS S3 trata preflight requests automaticamente

- **AllowedHeaders**: Headers permitidos
  - `*` - Permite todos os headers (mais permissivo, mas funcional)

- **ExposeHeaders**: Headers que o navegador pode ler na resposta

- **MaxAgeSeconds**: Tempo em cache da configuração CORS (3000 segundos = 50 minutos)

## 🔒 Segurança em Produção

Para produção, seja mais específico com os origins:

```json
{
    "AllowedOrigins": [
        "https://seu-dominio.com",
        "https://www.seu-dominio.com"
    ]
}
```

## ✅ Verificar se Funcionou

Após configurar o CORS:

1. Recarregue a página no navegador
2. Tente fazer upload de uma imagem novamente
3. O erro CORS deve desaparecer

## 🐛 Troubleshooting

### Ainda recebendo erro CORS?

1. **Verifique se salvou as alterações** no console AWS
2. **Aguarde alguns segundos** - pode levar um momento para propagar (até 1 minuto)
3. **Limpe o cache do navegador** (Ctrl+Shift+R ou Cmd+Shift+R)
4. **Verifique o nome do bucket** - deve corresponder ao bucket que você está usando (ex: `tiermaker-app`)
5. **Verifique os origins** - devem corresponder exatamente à URL do navegador (`http://localhost:3000`)
6. **Certifique-se de que OPTIONS está nos AllowedMethods** - necessário para preflight requests
7. **Verifique se o bucket está na região correta** - deve corresponder à `AWS_REGION` no seu `.env.local`
8. **Tente fechar e reabrir o navegador** - às vezes o cache é persistente

### Erro: "CORS configuration is not valid"

- Verifique se o JSON está bem formatado
- Certifique-se de que não há vírgulas extras
- Use um validador JSON online se necessário

## 📚 Referências

- [AWS S3 CORS Documentation](https://docs.aws.amazon.com/AmazonS3/latest/userguide/cors.html)
- [MDN CORS Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

