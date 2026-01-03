# Variáveis de Ambiente do Stripe

## 📋 Todas as Variáveis Necessárias

Adicione ao arquivo `.env.local` na raiz do projeto:

```env
# Stripe - Chave Secreta da API
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Stripe - Webhook Secret (obtido do Stripe CLI ou Dashboard)
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Stripe - IDs dos Preços (obtidos após criar produtos/preços no Stripe Dashboard)
NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY=price_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_YEARLY=price_xxxxxxxxxxxxx
```

---

## 🔑 Como Obter Cada Variável

### 1. STRIPE_SECRET_KEY

**Onde obter:**
- Dashboard do Stripe: https://dashboard.stripe.com/test/apikeys (Test mode)
- Ou: https://dashboard.stripe.com/apikeys (Live mode)

**Passos:**
1. Faça login no Stripe Dashboard
2. Certifique-se de estar no modo correto (Test ou Live)
3. Vá em **"Developers" > "API keys"**
4. Em **"Secret key"**, clique em **"Reveal test key"** (ou "Reveal live key")
5. Copie a chave (começa com `sk_test_` ou `sk_live_`)
6. Adicione ao `.env.local`

**Exemplo:**
```env
STRIPE_SECRET_KEY=your_stripe_secret_key_here
```

---

### 2. STRIPE_WEBHOOK_SECRET

#### Para Desenvolvimento (usando Stripe CLI):

1. **Execute o Stripe CLI:**
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhooks
   ```

2. **Copie o secret que aparece:**
   ```
   > Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx (^C to quit)
   ```

3. **Adicione ao `.env.local`:**
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

#### Para Produção (Dashboard do Stripe):

1. **Acesse:** https://dashboard.stripe.com/test/webhooks
2. **Clique no webhook que você criou**
3. **Na seção "Signing secret", clique em "Reveal"**
4. **Copie o secret** (começa com `whsec_`)
5. **Adicione ao `.env.local` ou variáveis de ambiente do servidor**

**Exemplo:**
```env
STRIPE_WEBHOOK_SECRET=whsec_AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
```

---

### 3. NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY e NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_YEARLY

**Esses IDs são obtidos APÓS criar os produtos/preços no Stripe Dashboard.**

#### Passo 1: Criar Produto no Stripe

1. **Acesse:** https://dashboard.stripe.com/test/products (Test mode)
2. **Clique em "+ Add product"**
3. **Preencha:**
   - **Name:** SuperTierMaker Premium
   - **Description:** Assinatura Premium do SuperTierMaker (opcional)

#### Passo 2: Criar Preço Mensal

1. **No produto criado, clique em "+ Add another price"**
2. **Configure:**
   - **Price:** R$ 9,90
   - **Billing period:** Monthly (Mensal)
   - **Recurring:** Yes (Sim)
3. **Clique em "Add price"**
4. **Copie o "Price ID"** (começa com `price_`)
5. **Adicione ao `.env.local`:**
   ```env
   NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY=price_xxxxxxxxxxxxx
   ```

#### Passo 3: Criar Preço Anual

1. **No mesmo produto, clique em "+ Add another price"**
2. **Configure:**
   - **Price:** R$ 79,00
   - **Billing period:** Yearly (Anual)
   - **Recurring:** Yes (Sim)
3. **Clique em "Add price"**
4. **Copie o "Price ID"** (começa com `price_`)
5. **Adicione ao `.env.local`:**
   ```env
   NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_YEARLY=price_xxxxxxxxxxxxx
   ```

**Exemplo:**
```env
NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY=price_1AbCdEfGhIjKlMnOpQrStUv
NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_YEARLY=price_1XyZaBcDeFgHiJkLmNoPqRs
```

---

## 📝 Arquivo .env.local Completo

Seu `.env.local` deve ter todas as variáveis necessárias:

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

# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY=price_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_YEARLY=price_xxxxxxxxxxxxx
```

---

## ⚠️ Importante

1. **Test vs Live:**
   - Para desenvolvimento: use chaves que começam com `sk_test_` e `whsec_` (test mode)
   - Para produção: use chaves que começam com `sk_live_` e o webhook secret de produção

2. **Nunca commite o `.env.local`:**
   - Este arquivo deve estar no `.gitignore`
   - Nunca compartilhe essas chaves publicamente

3. **Reiniciar o servidor:**
   - Após adicionar/modificar variáveis de ambiente, reinicie o servidor Next.js:
   ```bash
   # Parar o servidor (Ctrl+C)
   # Iniciar novamente
   npm run dev
   ```

4. **Ordem de configuração:**
   - Primeiro: Configure `STRIPE_SECRET_KEY` (para criar produtos/preços)
   - Segundo: Crie produtos/preços no Dashboard
   - Terceiro: Obtenha os Price IDs
   - Quarto: Configure webhook (Stripe CLI para dev ou Dashboard para prod)
   - Quinto: Obtenha o `STRIPE_WEBHOOK_SECRET`

---

## ✅ Checklist

- [ ] STRIPE_SECRET_KEY configurado (sk_test_...)
- [ ] Produto "SuperTierMaker Premium" criado no Stripe
- [ ] Preço mensal (R$ 9,90) criado e Price ID copiado
- [ ] Preço anual (R$ 79,00) criado e Price ID copiado
- [ ] NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY configurado
- [ ] NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_YEARLY configurado
- [ ] Webhook configurado (Stripe CLI para dev ou Dashboard para prod)
- [ ] STRIPE_WEBHOOK_SECRET configurado (whsec_...)
- [ ] Servidor Next.js reiniciado
- [ ] Todas as variáveis testadas

---

**Data de Criação:** 2025-01-XX
