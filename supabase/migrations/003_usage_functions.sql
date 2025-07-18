-- Função para incrementar contador de uso
CREATE OR REPLACE FUNCTION increment_usage(
  p_user_id UUID,
  p_feature VARCHAR,
  p_date DATE
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO usage_tracking (user_id, feature, date, count)
  VALUES (p_user_id, p_feature, p_date, 1)
  ON CONFLICT (user_id, feature, date)
  DO UPDATE SET count = usage_tracking.count + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar limites de uso
CREATE OR REPLACE FUNCTION check_user_limit(
  p_user_id UUID,
  p_feature VARCHAR,
  p_timeframe VARCHAR DEFAULT 'monthly'
)
RETURNS TABLE(
  current_usage INTEGER,
  plan_limit INTEGER,
  can_use BOOLEAN
) AS $$
DECLARE
  user_plan_limits JSONB;
  feature_limit INTEGER;
  usage_count INTEGER;
  start_date DATE;
BEGIN
  -- Determinar data de início baseada no timeframe
  IF p_timeframe = 'daily' THEN
    start_date := CURRENT_DATE;
  ELSE
    start_date := DATE_TRUNC('month', CURRENT_DATE)::DATE;
  END IF;

  -- Buscar limites do plano do usuário
  SELECT sp.limits INTO user_plan_limits
  FROM user_subscriptions us
  JOIN subscription_plans sp ON sp.id = us.plan_id
  WHERE us.user_id = p_user_id 
    AND us.status = 'active';

  -- Se não tem assinatura ativa, usar plano gratuito
  IF user_plan_limits IS NULL THEN
    SELECT sp.limits INTO user_plan_limits
    FROM subscription_plans sp
    WHERE sp.name = 'Gratuito';
  END IF;

  -- Extrair limite para a feature específica
  feature_limit := (user_plan_limits ->> p_feature)::INTEGER;
  
  -- Se o limite é NULL, assumir unlimited (-1)
  IF feature_limit IS NULL THEN
    feature_limit := -1;
  END IF;

  -- Calcular uso atual
  SELECT COALESCE(SUM(ut.count), 0) INTO usage_count
  FROM usage_tracking ut
  WHERE ut.user_id = p_user_id
    AND ut.feature = p_feature
    AND ut.date >= start_date;

  -- Retornar resultado
  RETURN QUERY SELECT 
    usage_count,
    feature_limit,
    (feature_limit = -1 OR usage_count < feature_limit);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para buscar informações completas do usuário
CREATE OR REPLACE FUNCTION get_user_subscription_info(p_user_id UUID)
RETURNS TABLE(
  plan_name VARCHAR,
  plan_limits JSONB,
  subscription_status VARCHAR,
  current_period_end TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sp.name,
    sp.limits,
    COALESCE(us.status, 'free'::VARCHAR),
    us.current_period_end
  FROM subscription_plans sp
  LEFT JOIN user_subscriptions us ON us.plan_id = sp.id AND us.user_id = p_user_id
  WHERE (us.user_id = p_user_id AND us.status = 'active') 
     OR (us.user_id IS NULL AND sp.name = 'Gratuito')
  ORDER BY sp.price_cents DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para auto-tracking de algumas ações
CREATE OR REPLACE FUNCTION auto_track_usage()
RETURNS TRIGGER AS $$
DECLARE
  feature_name VARCHAR;
BEGIN
  -- Determinar o nome da feature baseado na tabela
  CASE TG_TABLE_NAME
    WHEN 'cronogramas' THEN feature_name := 'cronogramas';
    WHEN 'notes' THEN feature_name := 'notas';
    WHEN 'pomodoro_sessions' THEN feature_name := 'pomodoro_sessions';
    WHEN 'forum_posts' THEN feature_name := 'forum_posts';
    WHEN 'spotify_playlists' THEN feature_name := 'spotify_playlists';
    WHEN 'simulados' THEN feature_name := 'simulados';
    ELSE RETURN NEW;
  END CASE;

  -- Registrar o uso
  PERFORM increment_usage(NEW.user_id, feature_name, CURRENT_DATE);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar triggers de auto-tracking
CREATE TRIGGER track_cronogramas_usage 
  AFTER INSERT ON cronogramas 
  FOR EACH ROW EXECUTE FUNCTION auto_track_usage();

CREATE TRIGGER track_notes_usage 
  AFTER INSERT ON notes 
  FOR EACH ROW EXECUTE FUNCTION auto_track_usage();

CREATE TRIGGER track_pomodoro_usage 
  AFTER INSERT ON pomodoro_sessions 
  FOR EACH ROW EXECUTE FUNCTION auto_track_usage();

CREATE TRIGGER track_forum_posts_usage 
  AFTER INSERT ON forum_posts 
  FOR EACH ROW EXECUTE FUNCTION auto_track_usage();

CREATE TRIGGER track_spotify_playlists_usage 
  AFTER INSERT ON spotify_playlists 
  FOR EACH ROW EXECUTE FUNCTION auto_track_usage();

CREATE TRIGGER track_simulados_usage 
  AFTER INSERT ON simulados 
  FOR EACH ROW EXECUTE FUNCTION auto_track_usage();