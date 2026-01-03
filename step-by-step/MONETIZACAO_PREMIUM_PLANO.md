# Plano de Implementação - Sistema de Monetização Premium

## 📊 Análise da Resposta GPT e Decisões

### Decisões Confirmadas
- ✅ **Modelo Principal**: Premium (MODELO 2) com Stripe
- ✅ **Preços**: R$ 9,90/mês ou R$ 79/ano (R$ 6,58/mês equivalente)
- ✅ **Planos**: Básico (gratuito) e Premium (pago)
- ✅ **Gateway**: Stripe
- ✅ **Pagamento único**: Não (apenas assinaturas)
- ✅ **Anúncios**: Remover automaticamente para premium
- ✅ **Views**: Estatísticas detalhadas apenas no premium
- ✅ **Foco geográfico**: Brasil primeiro, mas preparado para internacional
- ✅ **Moedas**: Real inicialmente, arquitetura desacoplada

---

## 💡 Sugestões de Limites e Funcionalidades (Baseadas em Benchmarks)

### Plano Básico (Gratuito) - Limites Sugeridos

**Tier Lists:**
- ✅ **5 tier lists salvas** (limite generoso para experimentação)
- ✅ **Tier lists públicas ilimitadas** (mas com marca d'água)
- ✅ **Tier lists privadas: 0** (apenas premium pode criar privadas)

**Templates:**
- ✅ **Sem limites** para criar templates (gera conteúdo para a plataforma)
- ✅ **Upload de imagens ilimitado** (mas com limite de tamanho por arquivo)

**Funcionalidades Bloqueadas:**
- ❌ **Marca d'água** no print/export (discreta mas visível)
- ❌ **Tier lists privadas**
- ❌ **Export em alta resolução** (apenas 1080p no básico, 4K no premium)
- ❌ **Estatísticas detalhadas** (apenas contador básico de views)
- ❌ **Organização por pastas** (apenas lista simples)
- ❌ **Sem anúncios removidos** (anúncios ativos)

**Imagens:**
- ✅ **Sem limite de imagens por tier list** (limite vem do template)
- ✅ **Limite de tamanho por imagem: 5MB** (já implementado)

### Plano Premium (Pago) - Recursos Desbloqueados

**Tier Lists:**
- ✅ **Tier lists salvas: ilimitadas**
- ✅ **Tier lists privadas: ilimitadas**
- ✅ **Sem marca d'água** no print/export
- ✅ **Export em alta resolução** (até 4K)
- ✅ **Organização por pastas/categorias**

**Anúncios:**
- ✅ **Remover todos os anúncios** (automático)

**Estatísticas:**
- ✅ **Estatísticas detalhadas**:
  - Views por dia/semana/mês
  - Gráficos de visualizações
  - Top tier lists
  - Origem de tráfego (quando implementado)
  - Engajamento (likes, comentários)

**Outros:**
- ✅ **Prioridade no suporte** (futuro)
- ✅ **Templates personalizados avançados** (futuro)

### Marca d'água - Sugestão

**Posição**: Canto inferior direito ou centro inferior
**Estilo**: 
- Logo pequeno (50-60px de altura)
- Opacidade: 70-80% (visível mas não intrusivo)
- Texto opcional: "Criado em SuperTierMaker" (fonte pequena, discreta)

**Razão**: 
- Marca d'água visível incentiva upgrade
- Não deve ser completamente transparente (perde o propósito)
- Deve ser discreta o suficiente para não arruinar a experiência, mas clara o suficiente para identificar a plataforma

---

## 🏗 Arquitetura do Sistema Premium

### 1. Estrutura de Banco de Dados

#### Nova Tabela: `subscriptions`
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'incomplete', 'trialing')),
  plan_type TEXT NOT NULL CHECK (plan_type IN ('basic', 'premium')),
  currency TEXT NOT NULL DEFAULT 'BRL',
  amount INTEGER NOT NULL, -- em centavos (990 = R$ 9,90)
  interval TEXT NOT NULL CHECK (interval IN ('month', 'year')),
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status) WHERE status = 'active';
```

#### Nova Tabela: `subscription_limits` (para controle de limites)
```sql
CREATE TABLE subscription_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  limit_type TEXT NOT NULL, -- 'tier_lists_count', 'private_tier_lists_count'
  current_count INTEGER DEFAULT 0,
  max_count INTEGER NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, limit_type)
);

CREATE INDEX idx_subscription_limits_user_id ON subscription_limits(user_id);
```

#### Adicionar campo em `tier_lists` (se necessário para controle)
- Já existe `is_public` (suficiente)

#### Nova Tabela: `subscription_events` (para auditoria e webhooks)
```sql
CREATE TABLE subscription_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stripe_event_id TEXT UNIQUE,
  event_type TEXT NOT NULL,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_subscription_events_stripe_event_id ON subscription_events(stripe_event_id);
CREATE INDEX idx_subscription_events_processed ON subscription_events(processed) WHERE processed = false;
```

### 2. Estrutura de Arquivos

```
src/
├── services/
│   ├── subscription.service.ts       # Lógica de negócio de assinaturas
│   ├── subscriptionLimit.service.ts  # Controle de limites
│   └── stripe.service.ts             # Integração com Stripe
│
├── types/
│   ├── subscription.types.ts         # Tipos TypeScript
│   └── stripe.types.ts               # Tipos do Stripe
│
├── components/
│   ├── subscription/
│   │   ├── SubscriptionButton.tsx    # Botão "Upgrade to Premium"
│   │   ├── PricingCard.tsx           # Card de preço
│   │   ├── PricingPage.tsx           # Página de preços
│   │   ├── SubscriptionStatus.tsx    # Status da assinatura
│   │   ├── ManageSubscription.tsx    # Gerenciar/cancelar assinatura
│   │   └── LimitReachedModal.tsx     # Modal quando limite é atingido
│   │
│   └── watermark/
│       └── WatermarkOverlay.tsx      # Componente de marca d'água
│
├── app/
│   ├── api/
│   │   └── stripe/
│   │       ├── webhooks/
│   │       │   └── route.ts          # Webhook do Stripe
│   │       ├── create-checkout/
│   │       │   └── route.ts          # Criar checkout session
│   │       ├── create-portal/
│   │       │   └── route.ts          # Customer portal (cancelar/alterar)
│   │       └── subscription-status/
│   │           └── route.ts          # Status da assinatura
│   │
│   ├── pricing/
│   │   └── page.tsx                  # Página de preços
│   │
│   └── account/
│       └── subscription/
│           └── page.tsx              # Gerenciar assinatura
│
├── lib/
│   ├── stripe/
│   │   ├── client.ts                 # Cliente Stripe
│   │   ├── prices.ts                 # IDs de preços (desacoplado)
│   │   └── currencies.ts             # Configuração de moedas
│   │
│   └── subscription/
│       ├── limits.ts                 # Constantes de limites
│       └── utils.ts                  # Utilitários
│
└── hooks/
    ├── useSubscription.ts            # Hook para assinatura
    └── useSubscriptionLimits.ts      # Hook para limites
```

---

## 🔧 Implementação Técnica

### Fase 1: Setup Base (Stripe + Database)

#### 1.1. Configuração Stripe
- [ ] Criar conta Stripe (se não existir)
- [ ] Configurar produtos e preços no Stripe Dashboard
  - Produto: "SuperTierMaker Premium"
  - Preço Mensal: R$ 9,90/mês
  - Preço Anual: R$ 79,00/ano
- [ ] Obter chaves API (pública e secreta)
- [ ] Configurar webhook endpoint
- [ ] Adicionar variáveis de ambiente

#### 1.2. Migration do Banco de Dados
- [ ] Criar migration `011_add_subscriptions.sql`
- [ ] Criar tabelas: `subscriptions`, `subscription_limits`, `subscription_events`
- [ ] Criar RLS policies
- [ ] Criar índices
- [ ] Executar migration

#### 1.3. Configuração de Moedas (Desacoplada)
- [ ] Criar arquivo `lib/stripe/currencies.ts`
- [ ] Estrutura preparada para múltiplas moedas
- [ ] Configuração atual: BRL apenas
- [ ] Interface para adicionar novas moedas facilmente

### Fase 2: Serviços e Lógica de Negócio

#### 2.1. Stripe Service
- [ ] `StripeService` para comunicação com Stripe
- [ ] Métodos: criar checkout, customer portal, webhooks
- [ ] Tratamento de erros

#### 2.2. Subscription Service
- [ ] `SubscriptionService` para lógica de assinaturas
- [ ] Métodos: criar, atualizar, cancelar, verificar status
- [ ] Sincronização com Stripe

#### 2.3. Subscription Limit Service
- [ ] `SubscriptionLimitService` para controle de limites
- [ ] Verificar limites antes de criar tier list
- [ ] Incrementar/decrementar contadores
- [ ] Resetar limites quando necessário

#### 2.4. Constants e Types
- [ ] Definir tipos TypeScript
- [ ] Constantes de limites
- [ ] Enums de status

### Fase 3: API Routes (Backend)

#### 3.1. Webhook do Stripe
- [ ] Rota `/api/stripe/webhooks`
- [ ] Verificar assinatura do webhook
- [ ] Processar eventos:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`

#### 3.2. Checkout Session
- [ ] Rota `/api/stripe/create-checkout`
- [ ] Criar sessão de checkout
- [ ] Suportar mensal e anual

#### 3.3. Customer Portal
- [ ] Rota `/api/stripe/create-portal`
- [ ] Permitir gerenciar/cancelar assinatura

#### 3.4. Subscription Status
- [ ] Rota `/api/stripe/subscription-status`
- [ ] Retornar status atual da assinatura do usuário

### Fase 4: Componentes UI

#### 4.1. Página de Preços
- [ ] `PricingPage` com cards de preço
- [ ] Comparação Básico vs Premium
- [ ] Botões "Assinar" que redirecionam para checkout
- [ ] Design atraente e responsivo

#### 4.2. Componentes de Assinatura
- [ ] `SubscriptionButton` (botão de upgrade)
- [ ] `SubscriptionStatus` (status atual)
- [ ] `ManageSubscription` (página de gerenciamento)
- [ ] `LimitReachedModal` (quando limite é atingido)

#### 4.3. Integração com Sistema Existente
- [ ] Adicionar checks de limite ao criar tier list
- [ ] Adicionar checks de privacidade (privado = premium)
- [ ] Mostrar marca d'água para usuários básicos
- [ ] Ocultar anúncios para premium
- [ ] Mostrar estatísticas detalhadas apenas para premium

### Fase 5: Marca d'água e Export

#### 5.1. Componente de Marca d'água
- [ ] `WatermarkOverlay` para adicionar marca d'água
- [ ] Usar `html2canvas` para export com marca d'água
- [ ] Posicionamento: canto inferior direito

#### 5.2. Export de Imagem
- [ ] Atualizar função de export
- [ ] Adicionar marca d'água para básico
- [ ] Alta resolução (4K) apenas para premium

### Fase 6: Integração com Anúncios

#### 6.1. Remover Anúncios para Premium
- [ ] Verificar status de assinatura no `AdSpace`
- [ ] Não renderizar anúncios se usuário for premium
- [ ] Fazer check no servidor e no cliente

### Fase 7: Estatísticas Detalhadas

#### 7.1. Sistema de Estatísticas
- [ ] Criar página de estatísticas
- [ ] Gráficos de views ao longo do tempo
- [ ] Top tier lists
- [ ] Bloquear acesso para usuários básicos
- [ ] Mostrar apenas contador simples para básico

### Fase 8: Organização por Pastas

#### 8.1. Sistema de Pastas (Futuro - Pode ser Fase 9)
- [ ] Tabela `tier_list_folders`
- [ ] Interface para criar/gerenciar pastas
- [ ] Apenas premium

---

## 🔐 Segurança e RLS Policies

### RLS Policies para `subscriptions`

```sql
-- Usuários podem ver apenas suas próprias assinaturas
CREATE POLICY "Users can view their own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Apenas sistema (via service role) pode criar/atualizar
-- (via webhooks do Stripe)
CREATE POLICY "System can manage subscriptions"
  ON subscriptions FOR ALL
  USING (false); -- Desabilitar acesso direto, usar service role
```

### RLS Policies para `subscription_limits`

```sql
-- Usuários podem ver apenas seus próprios limites
CREATE POLICY "Users can view their own limits"
  ON subscription_limits FOR SELECT
  USING (auth.uid() = user_id);

-- Sistema pode gerenciar limites
CREATE POLICY "System can manage limits"
  ON subscription_limits FOR ALL
  USING (false); -- Desabilitar acesso direto, usar service role
```

---

## 📋 Ordem de Implementação (Cronograma Sugerido)

### Semana 1: Fundação
1. ✅ Setup Stripe (configuração, produtos, preços)
2. ✅ Migration do banco de dados
3. ✅ Serviços base (StripeService, SubscriptionService)
4. ✅ Tipos e constantes

### Semana 2: Backend e Integração
5. ✅ API Routes (webhooks, checkout, portal)
6. ✅ Integração com criação de tier lists (limites)
7. ✅ Sistema de limites (SubscriptionLimitService)

### Semana 3: Frontend Base
8. ✅ Página de preços
9. ✅ Botões de upgrade
10. ✅ Página de gerenciamento de assinatura
11. ✅ Status da assinatura

### Semana 4: Integrações e Polimento
12. ✅ Marca d'água no export
13. ✅ Remover anúncios para premium
14. ✅ Bloquear funcionalidades premium (privado, alta resolução)
15. ✅ Testes e ajustes

### Semana 5: Estatísticas (Opcional - pode ser futuro)
16. ✅ Página de estatísticas detalhadas
17. ✅ Gráficos e métricas
18. ✅ Bloqueio para usuários básicos

---

## 🧪 Testes Necessários

### Testes de Integração
- [ ] Criar checkout session
- [ ] Processar webhook de pagamento bem-sucedido
- [ ] Processar webhook de cancelamento
- [ ] Verificar limites ao criar tier list
- [ ] Verificar marca d'água no export
- [ ] Verificar anúncios ocultos para premium

### Testes de UX
- [ ] Fluxo completo: preços → checkout → ativação
- [ ] Gerenciamento de assinatura (cancelar, alterar plano)
- [ ] Modal de limite atingido
- [ ] Transições de estado (básico → premium → cancelado)

---

## 💰 Estrutura de Preços no Stripe

### Configuração no Stripe Dashboard

**Produto:** SuperTierMaker Premium

**Preço 1 - Mensal:**
- Valor: R$ 9,90
- Intervalo: Mensal (month)
- ID do Preço: `price_premium_monthly_brl` (exemplo)

**Preço 2 - Anual:**
- Valor: R$ 79,00
- Intervalo: Anual (year)
- ID do Preço: `price_premium_yearly_brl` (exemplo)

**Nota:** IDs reais serão gerados pelo Stripe. Armazenar em variáveis de ambiente ou arquivo de configuração.

---

## 🔄 Webhooks do Stripe (Eventos a Processar)

1. **checkout.session.completed**
   - Quando usuário completa pagamento
   - Criar/atualizar subscription no banco

2. **customer.subscription.created**
   - Backup: criar subscription se não existir

3. **customer.subscription.updated**
   - Atualizar status da subscription
   - Atualizar limites

4. **customer.subscription.deleted**
   - Cancelar subscription
   - Remover limites premium

5. **invoice.payment_succeeded**
   - Renovação bem-sucedida
   - Atualizar `current_period_end`

6. **invoice.payment_failed**
   - Pagamento falhou
   - Atualizar status para `past_due`
   - Notificar usuário (futuro)

---

## 📊 Métricas e Analytics (Futuro)

- Taxa de conversão (básico → premium)
- Churn rate (cancelamentos)
- MRR (Monthly Recurring Revenue)
- ARR (Annual Recurring Revenue)
- Tempo médio para conversão

---

## ✅ Checklist Final de Implementação

### Banco de Dados
- [ ] Migration criada e executada
- [ ] RLS policies configuradas
- [ ] Índices criados
- [ ] Triggers configurados (updated_at)

### Backend
- [ ] StripeService implementado
- [ ] SubscriptionService implementado
- [ ] SubscriptionLimitService implementado
- [ ] Webhook route implementada
- [ ] Checkout route implementada
- [ ] Portal route implementada
- [ ] Status route implementada

### Frontend
- [ ] Página de preços criada
- [ ] Componentes de assinatura criados
- [ ] Integração com criação de tier lists
- [ ] Marca d'água implementada
- [ ] Anúncios ocultos para premium
- [ ] Estatísticas bloqueadas para básico

### Testes
- [ ] Testes de integração
- [ ] Testes de fluxo completo
- [ ] Testes de limites
- [ ] Testes de webhooks

### Documentação
- [ ] Arquivo step-by-step criado
- [ ] Instruções de setup do Stripe
- [ ] Guia de troubleshooting

---

## 🚀 Próximos Passos Após Implementação

1. **Modelo 3 - Afiliados** (Após validar Premium)
2. **Modelo 4 - Patrocínios** (Quando houver tráfego)
3. **Modelo 5 - Rankings Globais** (Expandir estatísticas)
4. **Modelo 6 - White-label** (Empresas)
5. **Modelo 7 - Criadores/Influencers** (Programa de parcerias)

---

**Data de Criação:** 2025-01-XX
**Última Atualização:** 2025-01-XX
