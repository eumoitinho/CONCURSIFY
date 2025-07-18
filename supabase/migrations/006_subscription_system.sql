-- Tabela de planos de assinatura
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2) NOT NULL,
  price_yearly DECIMAL(10,2),
  stripe_price_id_monthly VARCHAR,
  stripe_price_id_yearly VARCHAR,
  stripe_product_id VARCHAR,
  features JSONB NOT NULL DEFAULT '{}',
  limits JSONB NOT NULL DEFAULT '{}',
  is_popular BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de assinaturas dos usuários
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id),
  stripe_subscription_id VARCHAR UNIQUE,
  stripe_customer_id VARCHAR,
  status VARCHAR NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid', 'incomplete', 'trialing')),
  billing_cycle VARCHAR NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  trial_start TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Tabela de uso de recursos pelos usuários
CREATE TABLE user_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_type VARCHAR NOT NULL,
  usage_count INTEGER DEFAULT 0,
  last_reset_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, resource_type)
);

-- Tabela de histórico de pagamentos
CREATE TABLE payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES user_subscriptions(id),
  stripe_payment_intent_id VARCHAR,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'BRL',
  status VARCHAR NOT NULL,
  payment_method VARCHAR,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de webhooks do Stripe
CREATE TABLE stripe_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id VARCHAR UNIQUE NOT NULL,
  event_type VARCHAR NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Inserir planos padrão
INSERT INTO subscription_plans (name, description, price_monthly, price_yearly, features, limits, is_popular, sort_order) VALUES
(
  'Gratuito',
  'Perfeito para começar seus estudos',
  0.00,
  0.00,
  '{"cronogramas": "limited", "simulados": "limited", "forum": "basic", "pomodoro": "basic", "spotify": "none", "support": "community"}',
  '{"cronogramas": 1, "simulados": 5, "notas": 10, "forum_posts": 5, "pomodoro_sessions": 10, "spotify_playlists": 0, "pdf_export": false}',
  false,
  1
),
(
  'Estudante',
  'Ideal para estudantes dedicados',
  29.90,
  299.00,
  '{"cronogramas": "unlimited", "simulados": "unlimited", "forum": "full", "pomodoro": "advanced", "spotify": "basic", "support": "email", "pdf_export": true}',
  '{"cronogramas": -1, "simulados": -1, "notas": -1, "forum_posts": -1, "pomodoro_sessions": -1, "spotify_playlists": 10, "pdf_export": true}',
  true,
  2
),
(
  'Profissional',
  'Para quem quer o máximo de recursos',
  59.90,
  599.00,
  '{"cronogramas": "unlimited", "simulados": "unlimited", "forum": "premium", "pomodoro": "premium", "spotify": "unlimited", "support": "priority", "pdf_export": true, "backup": true, "analytics": true}',
  '{"cronogramas": -1, "simulados": -1, "notas": -1, "forum_posts": -1, "pomodoro_sessions": -1, "spotify_playlists": -1, "pdf_export": true, "backup": true, "priority_support": true}',
  false,
  3
);

-- Indexes para performance
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_user_subscriptions_stripe_id ON user_subscriptions(stripe_subscription_id);
CREATE INDEX idx_user_usage_user_resource ON user_usage(user_id, resource_type);
CREATE INDEX idx_payment_history_user_id ON payment_history(user_id);
CREATE INDEX idx_stripe_webhooks_event_id ON stripe_webhooks(stripe_event_id);
CREATE INDEX idx_stripe_webhooks_processed ON stripe_webhooks(processed);

-- RLS Policies
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_webhooks ENABLE ROW LEVEL SECURITY;

-- Políticas para subscription_plans (público para leitura)
CREATE POLICY "Anyone can view subscription plans" ON subscription_plans
  FOR SELECT USING (is_active = true);

-- Políticas para user_subscriptions
CREATE POLICY "Users can view own subscription" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" ON user_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para user_usage
CREATE POLICY "Users can view own usage" ON user_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own usage" ON user_usage
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage" ON user_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para payment_history
CREATE POLICY "Users can view own payment history" ON payment_history
  FOR SELECT USING (auth.uid() = user_id);

-- Políticas para stripe_webhooks (apenas sistema)
CREATE POLICY "Service role can manage webhooks" ON stripe_webhooks
  FOR ALL USING (auth.role() = 'service_role');

-- Função para atualizar timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON user_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_usage_updated_at BEFORE UPDATE ON user_usage FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para resetar contadores mensais
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS void AS $$
BEGIN
  UPDATE user_usage 
  SET usage_count = 0, last_reset_date = CURRENT_DATE
  WHERE last_reset_date < CURRENT_DATE - INTERVAL '1 month';
END;
$$ LANGUAGE plpgsql;

-- Função para verificar limites de uso
CREATE OR REPLACE FUNCTION check_usage_limit(
  p_user_id UUID,
  p_resource_type VARCHAR,
  p_increment INTEGER DEFAULT 1
)
RETURNS BOOLEAN AS $$
DECLARE
  current_usage INTEGER;
  user_limit INTEGER;
  subscription_limits JSONB;
BEGIN
  -- Buscar o limite do usuário baseado na assinatura
  SELECT limits INTO subscription_limits
  FROM subscription_plans sp
  JOIN user_subscriptions us ON sp.id = us.plan_id
  WHERE us.user_id = p_user_id AND us.status = 'active';
  
  -- Se não tem assinatura ativa, usar plano gratuito
  IF subscription_limits IS NULL THEN
    SELECT limits INTO subscription_limits
    FROM subscription_plans
    WHERE name = 'Gratuito';
  END IF;
  
  -- Extrair o limite específico (-1 significa ilimitado)
  user_limit := COALESCE((subscription_limits ->> p_resource_type)::INTEGER, 0);
  
  -- Se ilimitado, permitir
  IF user_limit = -1 THEN
    RETURN TRUE;
  END IF;
  
  -- Buscar uso atual
  SELECT COALESCE(usage_count, 0) INTO current_usage
  FROM user_usage
  WHERE user_id = p_user_id AND resource_type = p_resource_type;
  
  -- Verificar se pode incrementar
  RETURN (current_usage + p_increment) <= user_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para incrementar uso
CREATE OR REPLACE FUNCTION increment_usage(
  p_user_id UUID,
  p_resource_type VARCHAR,
  p_amount INTEGER DEFAULT 1
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Verificar se pode incrementar
  IF NOT check_usage_limit(p_user_id, p_resource_type, p_amount) THEN
    RETURN FALSE;
  END IF;
  
  -- Incrementar ou inserir
  INSERT INTO user_usage (user_id, resource_type, usage_count, last_reset_date)
  VALUES (p_user_id, p_resource_type, p_amount, CURRENT_DATE)
  ON CONFLICT (user_id, resource_type)
  DO UPDATE SET 
    usage_count = user_usage.usage_count + p_amount,
    updated_at = NOW();
    
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;