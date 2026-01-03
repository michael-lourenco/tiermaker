# Stripe: Test Mode vs Live Mode

## 🔴 Problema Comum

**Erro:** `No such price: 'price_xxx'; a similar object exists in live mode, but a test mode key was used`

**Causa:** Você criou o produto/preço no modo **Live**, mas está usando chaves do modo **Test** no código.

---

## ✅ Solução: Usar Test Mode para Desenvolvimento

### Como Verificar em Qual Modo Você Está

1. **No Dashboard do Stripe:**
   - Olhe no canto superior direito
   - Deve mostrar: **"Test mode"** (toggle desligado) ou **"Live mode"** (toggle ligado)

2. **Nas URLs:**
   - **Test mode:** `https://dashboard.stripe.com/test/products`
   - **Live mode:** `https://dashboard.stripe.com/products`

3. **Nas Chaves:**
   - **Test mode:** `sk_test_...`
   - **Live mode:** `sk_live_...`

---

## 🛠️ Passo a Passo: Criar Produto no Test Mode

### 1. Certificar-se de Estar em Test Mode

1. Acesse: https://dashboard.stripe.com/test/products
2. **Verifique no canto superior direito** - deve estar em **"Test mode"** (toggle deve estar desligado/escuro)
3. Se estiver em Live mode, **clique no toggle** para mudar para Test mode

### 2. Deletar Produto Criado no Modo Errado (se necessário)

Se você já criou o produto no modo Live:

1. Acesse: https://dashboard.stripe.com/test/products
2. Se o produto não aparecer, você precisa deletá-lo no modo Live:
   - Mude para Live mode (toggle)
   - Acesse: https://dashboard.stripe.com/products
   - Encontre o produto "SuperTierMaker Premium"
   - Clique nele
   - Clique em "Delete product" (se disponível)
   - Ou apenas ignore (não afeta o test mode)

### 3. Criar Produto no Test Mode

1. **Certifique-se de estar em Test Mode:**
   - URL deve ser: `https://dashboard.stripe.com/test/products`
   - Toggle no canto superior direito deve mostrar "Test mode"

2. **Criar Produto:**
   - Clique em **"+ Add product"**
   - **Name:** `SuperTierMaker Premium`
   - **Description:** (opcional)

3. **Adicionar Preço Mensal:**
   - **Price:** `9.90`
   - **Currency:** `BRL`
   - **Billing period:** `Monthly`
   - **Recurring:** `Yes`
   - Clique em **"Add price"**
   - **Copie o Price ID** (vai começar com `price_`)

4. **Adicionar Preço Anual:**
   - Clique em **"+ Add another price"**
   - **Price:** `79.00`
   - **Currency:** `BRL`
   - **Billing period:** `Yearly`
   - **Recurring:** `Yes`
   - Clique em **"Add price"**
   - **Copie o Price ID**

5. **Salvar:**
   - Clique em **"Save product"**

### 4. Atualizar .env.local

Use os **novos Price IDs do Test Mode**:

```env
# Certifique-se de que está usando chave de TEST
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Use os Price IDs do TEST MODE (não do Live mode)
NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY=price_xxxxxxxxxxxxx  # Do Test Mode
NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_YEARLY=price_xxxxxxxxxxxxx   # Do Test Mode
```

---

## ⚠️ Importante: Test vs Live

### Para Desenvolvimento (Agora):

- ✅ Use **Test Mode** (test mode toggle desligado)
- ✅ Use chaves `sk_test_...`
- ✅ Crie produtos/preços no Test Mode
- ✅ Use cartões de teste: `4242 4242 4242 4242`

### Para Produção (Depois):

- ✅ Use **Live Mode** (test mode toggle ligado)
- ✅ Use chaves `sk_live_...`
- ✅ Crie produtos/preços no Live Mode
- ✅ Use cartões reais

---

## 🔍 Como Identificar Qual Modo Está Usando

### No Código (.env.local):

```env
# TEST MODE
STRIPE_SECRET_KEY=your_stripe_test_secret_key_here

# LIVE MODE  
STRIPE_SECRET_KEY=your_stripe_live_secret_key_here
```

### No Dashboard:

- **Test Mode:** Toggle no canto superior direito está **desligado/escuro**
- **Live Mode:** Toggle no canto superior direito está **ligado/claro**

---

## ✅ Checklist

- [ ] Estou em **Test Mode** no Dashboard (toggle desligado)
- [ ] URL mostra `/test/products` (Test Mode)
- [ ] Criado produto no Test Mode
- [ ] Copiado Price IDs do Test Mode
- [ ] `.env.local` usa `sk_test_...` (Test Mode)
- [ ] `.env.local` usa Price IDs do Test Mode
- [ ] Servidor reiniciado após atualizar `.env.local`

---

## 🐛 Se Ainda Não Funcionar

1. **Verifique se está usando as chaves corretas:**
   ```bash
   # No seu .env.local, a chave deve começar com sk_test_
   grep STRIPE_SECRET_KEY .env.local
   ```

2. **Verifique se os Price IDs são do Test Mode:**
   - Acesse: https://dashboard.stripe.com/test/products
   - Clique no produto
   - Copie os Price IDs de lá (não do modo Live)

3. **Limpe o cache e reinicie:**
   ```bash
   # Parar servidor (Ctrl+C)
   # Limpar cache do Next.js (opcional)
   rm -rf .next
   # Reiniciar
   npm run dev
   ```

---

**Lembre-se:** Para desenvolvimento, sempre use **Test Mode**! 
