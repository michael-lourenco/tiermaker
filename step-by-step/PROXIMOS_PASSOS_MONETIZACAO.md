# Próximos Passos - Sistema de Monetização

## ✅ Concluído

- [x] Stripe CLI instalado e funcionando
- [x] Webhook testado via terminal
- [x] Sistema de código implementado (backend, frontend, serviços)

## 🎯 Próximos Passos

### 1. Executar Migration do Banco de Dados

**Arquivo:** `supabase/migrations/011_add_subscriptions.sql`

**Como executar:**
1. Acesse o Dashboard do Supabase: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor**
4. Clique em **New Query**
5. Abra o arquivo `supabase/migrations/011_add_subscriptions.sql`
6. Copie TODO o conteúdo
7. Cole no SQL Editor
8. Clique em **Run** (Ctrl+Enter)
9. Aguarde confirmação de sucesso

**Verificar:**
- Vá em **Table Editor**
- Você deve ver 3 novas tabelas:
  - `subscriptions`
  - `subscription_limits`
  - `subscription_events`

---

### 2. Criar Produtos e Preços no Stripe Dashboard

#### Passo 1: Criar Produto

1. Acesse: https://dashboard.stripe.com/test/products
2. Clique em **"+ Add product"**
3. Preencha:
   - **Name:** `SuperTierMaker Premium`
   - **Description:** `Assinatura Premium do SuperTierMaker - Acesso completo a todos os recursos` (opcional)
4. **NÃO clique em "Save product" ainda**

#### Passo 2: Adicionar Preço Mensal

1. Na mesma página do produto, em **Pricing**, clique em **"+ Add another price"** ou preencha:
   - **Price:** `9.90`
   - **Currency:** `BRL` (Real brasileiro)
   - **Billing period:** `Monthly` (Mensal)
   - **Recurring:** `Yes` (Sim)
2. Clique em **"Add price"**
3. **Copie o Price ID** que aparece (começa com `price_`)
4. Exemplo: `price_1AbCdEfGhIjKlMnOpQrStUv`

#### Passo 3: Adicionar Preço Anual

1. Ainda na página do produto, clique em **"+ Add another price"**
2. Preencha:
   - **Price:** `79.00`
   - **Currency:** `BRL` (Real brasileiro)
   - **Billing period:** `Yearly` (Anual)
   - **Recurring:** `Yes` (Sim)
3. Clique em **"Add price"**
4. **Copie o Price ID** que aparece (começa com `price_`)
5. Exemplo: `price_1XyZaBcDeFgHiJkLmNoPqRs`

#### Passo 4: Salvar Produto

1. Clique em **"Save product"**
2. Confirme que ambos os preços estão listados

---

### 3. Configurar Variáveis de Ambiente

Edite o arquivo `.env.local` na raiz do projeto e adicione:

```env
# Stripe - Chave Secreta da API (já deve ter)
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Stripe - Webhook Secret (já deve ter do Stripe CLI)
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Stripe - IDs dos Preços (copie os Price IDs do passo anterior)
NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY=price_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_YEARLY=price_xxxxxxxxxxxxx
```

**Importante:**
- Substitua `price_xxxxxxxxxxxxx` pelos Price IDs reais que você copiou
- Reinicie o servidor Next.js após adicionar as variáveis:
  ```bash
  # Parar servidor (Ctrl+C)
  npm run dev
  ```

---

### 4. Testar o Sistema Completo

#### Teste 1: Página de Preços

1. Acesse: http://localhost:3000/pricing
2. Verifique se a página carrega corretamente
3. Verifique se os preços estão corretos (R$ 9,90/mês e R$ 79,00/ano)

#### Teste 2: Fluxo de Checkout

1. Na página `/pricing`, clique em **"Assinar Mensal"** ou **"Assinar Anual"**
2. Você deve ser redirecionado para o Stripe Checkout
3. Use um cartão de teste do Stripe:
   - **Número:** `4242 4242 4242 4242`
   - **Data:** Qualquer data futura (ex: `12/25`)
   - **CVC:** Qualquer 3 dígitos (ex: `123`)
   - **CEP:** Qualquer CEP válido (ex: `12345-678`)
4. Complete o pagamento
5. Você deve ser redirecionado de volta para `/account/subscription?success=true`

#### Teste 3: Verificar Webhook

1. Mantenha o terminal do Stripe CLI rodando:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhooks
   ```
2. Você deve ver eventos sendo recebidos no terminal
3. Verifique se há erros

#### Teste 4: Verificar no Banco de Dados

1. Acesse o Supabase Dashboard
2. Vá em **Table Editor**
3. Verifique a tabela `subscriptions`:
   - Deve ter uma entrada com seu `user_id`
   - Status deve ser `active`
   - `plan_type` deve ser `premium`
4. Verifique a tabela `subscription_limits`:
   - Deve ter limites para seu `user_id`
   - `tier_lists_count` deve ter `max_count: -1` (ilimitado)
   - `private_tier_lists_count` deve ter `max_count: -1` (ilimitado)

#### Teste 5: Testar Limites

1. Tente criar uma tier list (como usuário básico, não premium)
2. Crie 5 tier lists (limite do plano básico)
3. Tente criar a 6ª tier list
4. Deve aparecer o modal de limite atingido
5. Faça upgrade para premium
6. Tente criar tier lists novamente - deve funcionar sem limite

---

### 5. Verificar Funcionalidades Premium (Pendentes)

As seguintes funcionalidades ainda precisam ser implementadas:

- [ ] **Fase 5:** Marca d'água no export
- [ ] **Fase 6:** Remover anúncios para usuários premium
- [ ] **Fase 7:** Bloquear funcionalidades premium (privado, alta resolução, estatísticas)

Essas podem ser implementadas depois de validar que o sistema básico está funcionando.

---

## 🐛 Troubleshooting

### Erro: "Stripe price IDs not configured"

**Causa:** Variáveis `NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY` ou `NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_YEARLY` não configuradas

**Solução:**
1. Verifique se as variáveis estão no `.env.local`
2. Reinicie o servidor Next.js
3. Verifique se os Price IDs estão corretos (começam com `price_`)

### Erro: "STRIPE_SECRET_KEY is not set"

**Causa:** Chave secreta do Stripe não configurada

**Solução:**
1. Obtenha a chave em: https://dashboard.stripe.com/test/apikeys
2. Adicione ao `.env.local`
3. Reinicie o servidor

### Erro: Webhook não está sendo processado

**Causa:** Webhook secret incorreto ou servidor não está recebendo eventos

**Solução:**
1. Verifique se o Stripe CLI está rodando
2. Verifique se o webhook secret no `.env.local` corresponde ao do terminal
3. Verifique os logs do servidor Next.js para erros
4. Verifique os logs do Stripe CLI

### Subscription não está sendo criada no banco

**Causa:** Webhook não está processando eventos corretamente

**Solução:**
1. Verifique se a migration foi executada
2. Verifique os logs do servidor para erros
3. Verifique se o webhook está recebendo eventos (Stripe CLI)
4. Teste manualmente o webhook no Dashboard do Stripe

---

## ✅ Checklist Final

- [ ] Migration `011_add_subscriptions.sql` executada
- [ ] Tabelas `subscriptions`, `subscription_limits`, `subscription_events` criadas
- [ ] Produto "SuperTierMaker Premium" criado no Stripe
- [ ] Preço mensal (R$ 9,90) criado e Price ID copiado
- [ ] Preço anual (R$ 79,00) criado e Price ID copiado
- [ ] Variáveis de ambiente configuradas no `.env.local`
- [ ] Servidor Next.js reiniciado
- [ ] Página `/pricing` acessível
- [ ] Checkout funcionando
- [ ] Webhook processando eventos
- [ ] Subscription criada no banco após pagamento
- [ ] Limites atualizados para premium

---

**Próximo Passo Imediato:** Executar a migration do banco de dados!
