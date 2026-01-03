# Configuração do Webhook no Stripe

## 📋 Pré-requisitos

1. Conta no Stripe (pode ser em modo teste para desenvolvimento)
2. Projeto Stripe criado
3. Aplicação rodando (localhost para desenvolvimento ou URL de produção)

---

## 🚀 Passo a Passo

### 1. Acessar o Dashboard do Stripe

1. Acesse [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. Faça login na sua conta
3. Certifique-se de estar no ambiente correto (Test mode para desenvolvimento, Live mode para produção)

### 2. Navegar até Webhooks

1. No menu lateral esquerdo, clique em **"Developers"**
2. Clique em **"Webhooks"**
3. Clique no botão **"+ Add endpoint"** (no topo direito)

### 3. Configurar o Endpoint

#### Para Desenvolvimento (localhost):

**URL do Endpoint:**
```
https://seu-projeto.ngrok.io/api/stripe/webhooks
```

**Importante:** Para desenvolvimento local, você precisa usar uma ferramenta de túnel como:
- **ngrok** (recomendado)
- **Stripe CLI** (mais fácil para desenvolvimento)
- Outros serviços similares

**Usando Stripe CLI (Recomendado para desenvolvimento):**

1. Instale o Stripe CLI: [https://stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)
2. Execute:
   ```bash
   stripe login
   stripe listen --forward-to localhost:3000/api/stripe/webhooks
   ```
3. O Stripe CLI fornecerá um webhook signing secret (começa com `whsec_`)
4. Use esse secret na variável `STRIPE_WEBHOOK_SECRET` do `.env.local`

#### Para Produção:

**URL do Endpoint:**
```
https://seu-dominio.com/api/stripe/webhooks
```

Exemplo:
```
https://tiermaker.com/api/stripe/webhooks
```

### 4. Selecionar Eventos

Marque os seguintes eventos para escutar:

✅ **checkout.session.completed**
- Quando o usuário completa o checkout

✅ **customer.subscription.created**
- Quando uma assinatura é criada

✅ **customer.subscription.updated**
- Quando uma assinatura é atualizada (mudança de plano, renovação, etc)

✅ **customer.subscription.deleted**
- Quando uma assinatura é cancelada

✅ **invoice.payment_succeeded**
- Quando um pagamento é bem-sucedido (renovação mensal/anual)

✅ **invoice.payment_failed**
- Quando um pagamento falha

### 5. Salvar o Endpoint

1. Clique em **"Add endpoint"**
2. O webhook será criado e você verá a página de detalhes

### 6. Obter o Signing Secret

1. Na página de detalhes do webhook, encontre a seção **"Signing secret"**
2. Clique em **"Reveal"** para mostrar o secret
3. Copie o secret (começa com `whsec_`)
4. Adicione ao seu `.env.local`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_seu_secret_aqui
   ```

### 7. Testar o Webhook (Opcional)

1. Na página de detalhes do webhook, clique em **"Send test webhook"**
2. Selecione um evento para testar (ex: `checkout.session.completed`)
3. Clique em **"Send test webhook"**
4. Verifique os logs da sua aplicação para confirmar que o evento foi recebido

---

## 🔧 Configuração com Stripe CLI (Desenvolvimento Local)

### Opção 1: Forward Automático (Mais Fácil)

1. **Instalar Stripe CLI:**

   **Para WSL2 (Linux):**
   ```bash
   # Opção 1: Via curl (recomendado)
   curl -s https://packages.stripe.com/api/security/keypair/stripe-cli-gpg/public | gpg --dearmor | sudo tee /usr/share/keyrings/stripe.gpg
   echo "deb [signed-by=/usr/share/keyrings/stripe.gpg] https://packages.stripe.com/stripe-cli-debian-local stable main" | sudo tee -a /etc/apt/sources.list.d/stripe.list
   sudo apt update
   sudo apt install stripe
   
   # Opção 2: Download manual (se opção 1 não funcionar)
   # 1. Vá em: https://github.com/stripe/stripe-cli/releases/latest
   # 2. Baixe o arquivo: stripe_X.X.X_linux_x86_64.tar.gz
   # 3. Extraia: tar -xzf stripe_X.X.X_linux_x86_64.tar.gz
   # 4. Mova para PATH: sudo mv stripe /usr/local/bin/
   ```

   **Para Windows (PowerShell):**
   ```powershell
   # Via Scoop (se tiver instalado)
   scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
   scoop install stripe
   
   # Ou baixe manualmente de: https://github.com/stripe/stripe-cli/releases/latest
   ```

2. **Autenticar:**
   ```bash
   stripe login
   ```

3. **Iniciar forwarding:**
   
   **No WSL2:**
   ```bash
   # Certifique-se de que sua aplicação Next.js está rodando
   # Em outro terminal, execute:
   stripe listen --forward-to localhost:3000/api/stripe/webhooks
   ```
   
   **Nota para WSL2:** 
   - Se sua aplicação Next.js estiver rodando no WSL2, use `localhost:3000`
   - Se estiver rodando no Windows, use o IP do Windows (ex: `192.168.x.x:3000`)
   - Para descobrir o IP do Windows do WSL2: `ip route show | grep -i default | awk '{ print $3}'`

4. **O Stripe CLI mostrará o webhook secret:**
   ```
   > Ready! Your webhook signing secret is whsec_... (^C to quit)
   ```

5. **Copie o secret e adicione ao `.env.local`:**
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_seu_secret_do_cli
   ```

6. **Em outro terminal, execute sua aplicação:**
   ```bash
   npm run dev
   ```

### Opção 2: Trigger Manual (Para Testes)

```bash
# Trigger um evento de teste
stripe trigger checkout.session.completed
```

---

## 📝 Variáveis de Ambiente

Adicione ao seu `.env.local`:

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...  # Pode ser sk_live_... para produção
STRIPE_WEBHOOK_SECRET=whsec_...  # Obtido do dashboard ou Stripe CLI
```

**Importante:**
- Use `sk_test_` e `whsec_` para desenvolvimento/teste
- Use `sk_live_` e o webhook secret de produção para produção
- Nunca commite essas chaves no Git

---

## ✅ Verificação

### 1. Verificar Logs do Webhook

No Dashboard do Stripe:
1. Vá em **Developers > Webhooks**
2. Clique no seu webhook
3. Veja a aba **"Logs"** para eventos recebidos

### 2. Verificar na Aplicação

1. Faça uma compra de teste
2. Verifique os logs do servidor para confirmar que o webhook foi processado
3. Verifique no banco de dados se a subscription foi criada/atualizada

### 3. Testar Eventos Manualmente

No Dashboard do Stripe:
1. Vá em **Developers > Webhooks**
2. Clique no seu webhook
3. Clique em **"Send test webhook"**
4. Selecione um evento e envie
5. Verifique se sua aplicação processou corretamente

---

## 🐛 Troubleshooting

### Erro: "No signature found"
- Verifique se `STRIPE_WEBHOOK_SECRET` está configurado
- Verifique se o webhook secret está correto

### Erro: "Webhook signature verification failed"
- O webhook secret está incorreto
- Você está usando o secret errado (test vs live)
- Verifique se está usando o secret correto do endpoint correto

### Webhook não está sendo recebido
- Verifique se a URL está correta e acessível
- Para desenvolvimento local, certifique-se de que o Stripe CLI está rodando
- Verifique se o servidor está rodando e acessível
- Verifique os logs do Stripe Dashboard na aba "Logs"

### Eventos não estão sendo processados
- Verifique os logs do servidor
- Verifique se os eventos estão marcados no webhook
- Verifique se o código está processando os eventos corretamente

---

## 📚 Recursos Adicionais

- [Documentação Oficial do Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Webhook Testing Guide](https://stripe.com/docs/webhooks/test)

---

## 🎯 Checklist

- [ ] Stripe CLI instalado (para desenvolvimento)
- [ ] Webhook criado no Dashboard do Stripe
- [ ] Eventos selecionados (6 eventos)
- [ ] Webhook secret copiado
- [ ] Variável `STRIPE_WEBHOOK_SECRET` configurada no `.env.local`
- [ ] Stripe CLI rodando (para desenvolvimento local)
- [ ] Webhook testado com evento de teste
- [ ] Verificação no banco de dados após teste

---

**Data de Criação:** 2025-01-XX
