-- ============================================
-- MIGRATION: Sistema de Assinaturas Premium
-- ============================================
-- Esta migration cria as tabelas necessárias para
-- gerenciar assinaturas premium via Stripe

-- Criar tabela subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
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

-- Criar índices para subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);

-- Criar tabela subscription_limits (para controle de limites)
CREATE TABLE IF NOT EXISTS subscription_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  limit_type TEXT NOT NULL, -- 'tier_lists_count', 'private_tier_lists_count'
  current_count INTEGER DEFAULT 0,
  max_count INTEGER NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, limit_type)
);

-- Criar índices para subscription_limits
CREATE INDEX IF NOT EXISTS idx_subscription_limits_user_id ON subscription_limits(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_limits_limit_type ON subscription_limits(limit_type);

-- Criar tabela subscription_events (para auditoria e webhooks)
CREATE TABLE IF NOT EXISTS subscription_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stripe_event_id TEXT UNIQUE,
  event_type TEXT NOT NULL,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para subscription_events
CREATE INDEX IF NOT EXISTS idx_subscription_events_stripe_event_id ON subscription_events(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_processed ON subscription_events(processed) WHERE processed = false;
CREATE INDEX IF NOT EXISTS idx_subscription_events_user_id ON subscription_events(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_subscription_id ON subscription_events(subscription_id);

-- Criar trigger para atualizar updated_at em subscriptions
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscriptions_updated_at();

-- Criar trigger para atualizar updated_at em subscription_limits
CREATE OR REPLACE FUNCTION update_subscription_limits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_subscription_limits_updated_at ON subscription_limits;
CREATE TRIGGER update_subscription_limits_updated_at
  BEFORE UPDATE ON subscription_limits
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_limits_updated_at();

-- ============================================
-- RLS POLICIES
-- ============================================

-- Habilitar RLS nas tabelas
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;

-- Remover políticas se já existirem
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can view their own limits" ON subscription_limits;
DROP POLICY IF EXISTS "Users can view their own events" ON subscription_events;

-- Política para subscriptions: usuários podem ver apenas suas próprias assinaturas
CREATE POLICY "Users can view their own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Política para subscription_limits: usuários podem ver apenas seus próprios limites
CREATE POLICY "Users can view their own limits"
  ON subscription_limits FOR SELECT
  USING (auth.uid() = user_id);

-- Política para subscription_events: usuários podem ver apenas seus próprios eventos
CREATE POLICY "Users can view their own events"
  ON subscription_events FOR SELECT
  USING (auth.uid() = user_id);

-- Nota: INSERT, UPDATE, DELETE nas tabelas de subscription devem ser feitos
-- apenas via service role (backend) através de webhooks do Stripe ou
-- operações internas do sistema. RLS não permite acesso direto dos usuários
-- para manter a segurança e integridade dos dados.
