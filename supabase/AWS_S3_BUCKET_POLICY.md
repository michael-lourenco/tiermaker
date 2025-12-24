# Configuração de Bucket Policy para AWS S3

## 🔴 Diferença entre Bucket Policy e CORS

- **Bucket Policy**: Controla **quem pode fazer o quê** no bucket (permissões de acesso)
- **CORS Configuration**: Controla **requisições cross-origin** do navegador (política de segurança do navegador)

**Você precisa configurar AMBOS!**

## 📋 Análise da Sua Política Atual

Sua política atual permite apenas **leitura pública** (`s3:GetObject`):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::controle-eventos/*"
        }
    ]
}
```

**Problema**: Para uploads funcionarem, você precisa também permitir `s3:PutObject`.

## ✅ Política Corrigida para Uploads

### Opção 1: Permitir Uploads Públicos (Desenvolvimento)

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::tiermaker-app/*"
        },
        {
            "Sid": "PublicPutObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:PutObject",
            "Resource": "arn:aws:s3:::tiermaker-app/*"
        }
    ]
}
```

### Opção 2: Permitir Uploads Apenas via Presigned URLs (Mais Seguro)

Se você quer manter o bucket privado e permitir uploads apenas via presigned URLs (recomendado para produção):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::tiermaker-app/*"
        }
    ]
}
```

**Nota**: Com presigned URLs, você não precisa de `s3:PutObject` na política pública, pois a URL já tem as permissões necessárias. O problema então é apenas CORS.

## 🔧 Como Configurar a Bucket Policy

1. **Acesse o AWS Console**
   - Vá para [https://console.aws.amazon.com/s3](https://console.aws.amazon.com/s3)
   - Selecione seu bucket `tiermaker-app`

2. **Abra as Configurações de Bucket Policy**
   - Clique na aba **Permissions** (Permissões)
   - Role até a seção **Bucket policy**
   - Clique em **Edit** (Editar)

3. **Cole a Política**
   - Use a **Opção 1** se quiser uploads públicos (desenvolvimento)
   - Use a **Opção 2** se estiver usando presigned URLs (produção)

4. **Ajuste o Resource**
   - Substitua `tiermaker-app` pelo nome do seu bucket
   - Se quiser restringir a uma pasta específica: `arn:aws:s3:::tiermaker-app/uploads/*`

5. **Salve as Alterações**

## ⚠️ Importante

- **Bucket Policy** e **CORS** são configurações separadas
- Você precisa configurar **AMBAS**:
  1. ✅ Bucket Policy (permissões)
  2. ✅ CORS Configuration (cross-origin)

## 🔒 Segurança

### Para Desenvolvimento:
- Use a Opção 1 (permite uploads públicos)
- Configure CORS para `http://localhost:3000`

### Para Produção:
- Use a Opção 2 (apenas leitura pública)
- Uploads via presigned URLs (já implementado no código)
- Configure CORS apenas para seu domínio de produção
- Considere restringir uploads a uma pasta específica: `arn:aws:s3:::tiermaker-app/uploads/*`

## 📝 Checklist

- [ ] Bucket Policy configurada (permissões)
- [ ] CORS Configuration configurada (cross-origin)
- [ ] Resource ARN correto (nome do bucket)
- [ ] Teste de upload funcionando

## 🐛 Troubleshooting

### Erro: "Access Denied" ao fazer upload
- Verifique se a Bucket Policy permite `s3:PutObject`
- Verifique se o Resource ARN está correto
- Se usar presigned URLs, verifique se a URL não expirou

### Erro: CORS ainda bloqueando
- Bucket Policy e CORS são independentes
- Configure CORS mesmo se a Bucket Policy estiver correta
- Veja `AWS_S3_CORS_SETUP.md` para configuração de CORS

