-- Schema para o sistema Pomodoro integrado

-- Enum para tipos de sessão
CREATE TYPE session_type AS ENUM ('focus', 'short_break', 'long_break', 'study', 'review');

-- Enum para status da sessão
CREATE TYPE session_status AS ENUM ('scheduled', 'in_progress', 'completed', 'paused', 'cancelled', 'interrupted');

-- Enum para tipos de interrupção
CREATE TYPE interruption_type AS ENUM ('external', 'internal', 'urgent', 'distraction', 'technical');

-- Tabela de sessões Pomodoro
CREATE TABLE pomodoro_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  
  -- Configuração da sessão
  session_type session_type NOT NULL,
  planned_duration INTEGER NOT NULL, -- Duração planejada em minutos
  actual_duration INTEGER, -- Duração real em minutos
  
  -- Timestamps
  scheduled_start TIMESTAMP,
  actual_start TIMESTAMP,
  actual_end TIMESTAMP,
  paused_at TIMESTAMP,
  total_pause_time INTEGER DEFAULT 0, -- Tempo total pausado em segundos
  
  -- Status e controle
  status session_status DEFAULT 'scheduled',
  completion_percentage INTEGER DEFAULT 0, -- 0-100
  
  -- Contexto da sessão
  note_id UUID REFERENCES notes(id), -- Nota sendo estudada
  subject VARCHAR, -- Matéria sendo estudada
  task_description TEXT, -- Descrição da tarefa
  goals TEXT[], -- Objetivos da sessão
  
  -- Resultados e produtividade
  productivity_score INTEGER, -- 1-10, autoavaliação
  focus_score INTEGER, -- 1-10, nível de foco
  energy_level INTEGER, -- 1-10, nível de energia no início
  energy_level_end INTEGER, -- 1-10, nível de energia no final
  mood_before VARCHAR, -- Humor antes da sessão
  mood_after VARCHAR, -- Humor após a sessão
  
  -- Métricas de estudo
  pages_read INTEGER DEFAULT 0,
  exercises_completed INTEGER DEFAULT 0,
  notes_created INTEGER DEFAULT 0,
  words_written INTEGER DEFAULT 0,
  concepts_learned TEXT[],
  
  -- Observações
  session_notes TEXT,
  achievements TEXT[], -- Conquistas da sessão
  challenges TEXT[], -- Dificuldades enfrentadas
  
  -- Metadados
  device_used VARCHAR, -- desktop, mobile, tablet
  environment VARCHAR, -- casa, biblioteca, trabalho
  background_noise VARCHAR, -- silent, music, ambient, busy
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de interrupções durante sessões
CREATE TABLE session_interruptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES pomodoro_sessions(id) ON DELETE CASCADE NOT NULL,
  
  -- Detalhes da interrupção
  interruption_type interruption_type NOT NULL,
  description TEXT,
  duration_seconds INTEGER NOT NULL, -- Duração da interrupção
  occurred_at TIMESTAMP NOT NULL,
  
  -- Impacto
  impact_level INTEGER, -- 1-5, impacto no foco
  handled_well BOOLEAN, -- Se foi bem gerenciada
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de configurações do Pomodoro por usuário
CREATE TABLE pomodoro_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  
  -- Durações padrão (em minutos)
  focus_duration INTEGER DEFAULT 25,
  short_break_duration INTEGER DEFAULT 5,
  long_break_duration INTEGER DEFAULT 15,
  cycles_before_long_break INTEGER DEFAULT 4,
  
  -- Configurações adaptativas
  adaptive_mode BOOLEAN DEFAULT TRUE,
  min_focus_duration INTEGER DEFAULT 15,
  max_focus_duration INTEGER DEFAULT 50,
  
  -- Notificações
  sound_enabled BOOLEAN DEFAULT TRUE,
  sound_type VARCHAR DEFAULT 'bell',
  sound_volume INTEGER DEFAULT 70, -- 0-100
  vibration_enabled BOOLEAN DEFAULT TRUE,
  desktop_notifications BOOLEAN DEFAULT TRUE,
  
  -- Configurações de break
  auto_start_breaks BOOLEAN DEFAULT FALSE,
  auto_start_focus BOOLEAN DEFAULT FALSE,
  enforce_breaks BOOLEAN DEFAULT TRUE,
  
  -- Métricas e tracking
  track_productivity BOOLEAN DEFAULT TRUE,
  track_mood BOOLEAN DEFAULT TRUE,
  track_energy BOOLEAN DEFAULT TRUE,
  daily_goal_sessions INTEGER DEFAULT 8,
  weekly_goal_hours INTEGER DEFAULT 25,
  
  -- Integração com outros módulos
  auto_create_study_notes BOOLEAN DEFAULT TRUE,
  sync_with_calendar BOOLEAN DEFAULT FALSE,
  share_stats BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de templates de sessão
CREATE TABLE session_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  
  name VARCHAR NOT NULL,
  description TEXT,
  
  -- Configuração da sessão
  session_type session_type NOT NULL,
  duration INTEGER NOT NULL, -- em minutos
  
  -- Configurações específicas
  subject VARCHAR,
  default_goals TEXT[],
  pre_session_checklist TEXT[],
  post_session_questions TEXT[],
  
  -- Metadados
  usage_count INTEGER DEFAULT 0,
  is_favorite BOOLEAN DEFAULT FALSE,
  is_system BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de estatísticas diárias agregadas
CREATE TABLE pomodoro_daily_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  date DATE NOT NULL,
  
  -- Contadores de sessões
  total_sessions INTEGER DEFAULT 0,
  completed_sessions INTEGER DEFAULT 0,
  focus_sessions INTEGER DEFAULT 0,
  break_sessions INTEGER DEFAULT 0,
  
  -- Tempo
  total_planned_minutes INTEGER DEFAULT 0,
  total_actual_minutes INTEGER DEFAULT 0,
  total_focus_minutes INTEGER DEFAULT 0,
  total_break_minutes INTEGER DEFAULT 0,
  total_pause_minutes INTEGER DEFAULT 0,
  
  -- Produtividade
  avg_productivity_score DECIMAL(3,2),
  avg_focus_score DECIMAL(3,2),
  avg_completion_rate DECIMAL(5,2),
  
  -- Metas
  daily_goal_met BOOLEAN DEFAULT FALSE,
  goal_sessions INTEGER,
  sessions_over_goal INTEGER DEFAULT 0,
  
  -- Interrupções
  total_interruptions INTEGER DEFAULT 0,
  avg_interruptions_per_session DECIMAL(3,2),
  
  -- Metadados
  subjects_studied TEXT[],
  notes_created INTEGER DEFAULT 0,
  words_written INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);

-- Tabela de metas e desafios
CREATE TABLE pomodoro_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  
  -- Configuração da meta
  title VARCHAR NOT NULL,
  description TEXT,
  goal_type VARCHAR NOT NULL, -- 'daily', 'weekly', 'monthly', 'custom'
  
  -- Métricas alvo
  target_sessions INTEGER,
  target_minutes INTEGER,
  target_subjects TEXT[],
  target_completion_rate DECIMAL(5,2),
  target_productivity_score DECIMAL(3,2),
  
  -- Período
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  
  -- Progresso
  current_sessions INTEGER DEFAULT 0,
  current_minutes INTEGER DEFAULT 0,
  current_completion_rate DECIMAL(5,2) DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_achieved BOOLEAN DEFAULT FALSE,
  achieved_at TIMESTAMP,
  
  -- Gamificação
  reward_points INTEGER DEFAULT 0,
  badge_earned VARCHAR,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de achievements/conquistas
CREATE TABLE pomodoro_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  
  -- Conquista
  achievement_key VARCHAR NOT NULL, -- 'first_session', 'week_streak', etc.
  title VARCHAR NOT NULL,
  description TEXT,
  icon VARCHAR,
  category VARCHAR, -- 'consistency', 'productivity', 'milestone'
  
  -- Metadados
  earned_at TIMESTAMP DEFAULT NOW(),
  points_awarded INTEGER DEFAULT 0,
  session_id UUID REFERENCES pomodoro_sessions(id), -- Sessão que desbloqueou
  
  -- Progresso
  progress_value INTEGER, -- Valor que desbloqueou
  progress_target INTEGER, -- Valor necessário
  
  UNIQUE(user_id, achievement_key)
);

-- Tabela de insights e sugestões da IA
CREATE TABLE pomodoro_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  
  -- Tipo de insight
  insight_type VARCHAR NOT NULL, -- 'schedule', 'productivity', 'break', 'duration'
  title VARCHAR NOT NULL,
  description TEXT NOT NULL,
  
  -- Dados de suporte
  confidence_score DECIMAL(3,2), -- 0.00 - 1.00
  based_on_sessions INTEGER, -- Quantas sessões analisadas
  time_period VARCHAR, -- '7d', '30d', 'all'
  
  -- Sugestões
  suggested_action TEXT,
  expected_improvement VARCHAR,
  
  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  is_applied BOOLEAN DEFAULT FALSE,
  user_feedback INTEGER, -- 1-5 se foi útil
  
  -- Metadados
  generated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP, -- Quando o insight perde validade
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Inserir templates padrão do sistema
INSERT INTO session_templates (name, description, session_type, duration, default_goals, pre_session_checklist, post_session_questions, is_system, user_id) VALUES
('Foco Intenso - 25min', 'Sessão padrão de foco para máxima concentração', 'focus', 25, 
 ARRAY['Completar capítulo do livro', 'Resolver 10 exercícios', 'Fazer resumo'], 
 ARRAY['Celular no modo silencioso', 'Mesa organizada', 'Água disponível', 'Objetivo claro definido'],
 ARRAY['O que consegui completar?', 'Qual foi meu nível de foco (1-10)?', 'Houve interrupções?', 'O que posso melhorar?'],
 true, (SELECT id FROM auth.users LIMIT 1)),

('Revisão Rápida - 15min', 'Sessão curta para revisão de conteúdo', 'review', 15,
 ARRAY['Revisar anotações', 'Fazer flashcards', 'Memorizar fórmulas'],
 ARRAY['Material de revisão separado', 'Anotações organizadas'],
 ARRAY['Consegui revisar todo o conteúdo?', 'O que precisa de mais atenção?'],
 true, (SELECT id FROM auth.users LIMIT 1)),

('Estudo Profundo - 45min', 'Sessão longa para estudo aprofundado', 'study', 45,
 ARRAY['Entender conceito complexo', 'Fazer exercícios práticos', 'Criar mapa mental'],
 ARRAY['Ambiente silencioso', 'Materiais organizados', 'Cronômetro configurado'],
 ARRAY['Qual conceito aprendi hoje?', 'Como posso aplicar esse conhecimento?', 'Preciso revisar algo?'],
 true, (SELECT id FROM auth.users LIMIT 1)),

('Break Ativo - 5min', 'Pausa com movimento para recarregar energia', 'short_break', 5,
 ARRAY['Alongar o corpo', 'Respirar profundamente', 'Hidratar'],
 ARRAY['Levantar da cadeira', 'Afastar dos equipamentos'],
 ARRAY['Me sinto mais energizado?', 'Estou pronto para a próxima sessão?'],
 true, (SELECT id FROM auth.users LIMIT 1));

-- Inserir configurações padrão para novos usuários
CREATE OR REPLACE FUNCTION create_default_pomodoro_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO pomodoro_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para criar configurações padrão
CREATE TRIGGER trigger_create_default_pomodoro_settings
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_default_pomodoro_settings();

-- Índices para performance
CREATE INDEX idx_pomodoro_sessions_user_date ON pomodoro_sessions(user_id, actual_start);
CREATE INDEX idx_pomodoro_sessions_status ON pomodoro_sessions(user_id, status);
CREATE INDEX idx_pomodoro_sessions_note ON pomodoro_sessions(note_id);

CREATE INDEX idx_session_interruptions_session ON session_interruptions(session_id);
CREATE INDEX idx_pomodoro_daily_stats_user_date ON pomodoro_daily_stats(user_id, date);
CREATE INDEX idx_pomodoro_goals_user_active ON pomodoro_goals(user_id, is_active);
CREATE INDEX idx_pomodoro_achievements_user ON pomodoro_achievements(user_id, earned_at);
CREATE INDEX idx_pomodoro_insights_user_read ON pomodoro_insights(user_id, is_read);

-- Triggers para atualização de estatísticas

-- Trigger para atualizar estatísticas diárias quando sessão termina
CREATE OR REPLACE FUNCTION update_pomodoro_daily_stats()
RETURNS TRIGGER AS $$
DECLARE
  session_date DATE;
BEGIN
  -- Determinar a data da sessão
  session_date := COALESCE(NEW.actual_start, NEW.scheduled_start, NEW.created_at)::DATE;
  
  -- Inserir ou atualizar estatísticas diárias
  INSERT INTO pomodoro_daily_stats (
    user_id, 
    date,
    total_sessions,
    completed_sessions,
    focus_sessions,
    break_sessions,
    total_planned_minutes,
    total_actual_minutes,
    total_focus_minutes,
    total_break_minutes
  )
  VALUES (
    NEW.user_id,
    session_date,
    1,
    CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END,
    CASE WHEN NEW.session_type = 'focus' THEN 1 ELSE 0 END,
    CASE WHEN NEW.session_type IN ('short_break', 'long_break') THEN 1 ELSE 0 END,
    NEW.planned_duration,
    COALESCE(NEW.actual_duration, 0),
    CASE WHEN NEW.session_type IN ('focus', 'study', 'review') THEN COALESCE(NEW.actual_duration, 0) ELSE 0 END,
    CASE WHEN NEW.session_type IN ('short_break', 'long_break') THEN COALESCE(NEW.actual_duration, 0) ELSE 0 END
  )
  ON CONFLICT (user_id, date) 
  DO UPDATE SET
    total_sessions = pomodoro_daily_stats.total_sessions + 1,
    completed_sessions = pomodoro_daily_stats.completed_sessions + (CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END),
    focus_sessions = pomodoro_daily_stats.focus_sessions + (CASE WHEN NEW.session_type = 'focus' THEN 1 ELSE 0 END),
    break_sessions = pomodoro_daily_stats.break_sessions + (CASE WHEN NEW.session_type IN ('short_break', 'long_break') THEN 1 ELSE 0 END),
    total_planned_minutes = pomodoro_daily_stats.total_planned_minutes + NEW.planned_duration,
    total_actual_minutes = pomodoro_daily_stats.total_actual_minutes + COALESCE(NEW.actual_duration, 0),
    total_focus_minutes = pomodoro_daily_stats.total_focus_minutes + 
      (CASE WHEN NEW.session_type IN ('focus', 'study', 'review') THEN COALESCE(NEW.actual_duration, 0) ELSE 0 END),
    total_break_minutes = pomodoro_daily_stats.total_break_minutes + 
      (CASE WHEN NEW.session_type IN ('short_break', 'long_break') THEN COALESCE(NEW.actual_duration, 0) ELSE 0 END),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_pomodoro_daily_stats
  AFTER INSERT OR UPDATE ON pomodoro_sessions
  FOR EACH ROW EXECUTE FUNCTION update_pomodoro_daily_stats();

-- Trigger para verificar conquistas
CREATE OR REPLACE FUNCTION check_pomodoro_achievements()
RETURNS TRIGGER AS $$
DECLARE
  total_sessions INTEGER;
  completed_sessions INTEGER;
  consecutive_days INTEGER;
BEGIN
  -- Primeira sessão completada
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    INSERT INTO pomodoro_achievements (user_id, achievement_key, title, description, icon, category, session_id, points_awarded)
    VALUES (NEW.user_id, 'first_session', 'Primeira Sessão', 'Completou sua primeira sessão Pomodoro!', '🍅', 'milestone', NEW.id, 10)
    ON CONFLICT (user_id, achievement_key) DO NOTHING;
    
    -- Verificar outras conquistas baseadas em totais
    SELECT COUNT(*) INTO total_sessions
    FROM pomodoro_sessions 
    WHERE user_id = NEW.user_id AND status = 'completed';
    
    -- Marcos de sessões
    IF total_sessions = 10 THEN
      INSERT INTO pomodoro_achievements (user_id, achievement_key, title, description, icon, category, session_id, points_awarded)
      VALUES (NEW.user_id, 'ten_sessions', 'Dez Sessões', 'Completou 10 sessões Pomodoro!', '🔥', 'milestone', NEW.id, 50)
      ON CONFLICT (user_id, achievement_key) DO NOTHING;
    END IF;
    
    IF total_sessions = 50 THEN
      INSERT INTO pomodoro_achievements (user_id, achievement_key, title, description, icon, category, session_id, points_awarded)
      VALUES (NEW.user_id, 'fifty_sessions', 'Cinquenta Sessões', 'Completou 50 sessões Pomodoro!', '💯', 'milestone', NEW.id, 100)
      ON CONFLICT (user_id, achievement_key) DO NOTHING;
    END IF;
    
    -- Produtividade alta
    IF NEW.productivity_score >= 9 THEN
      INSERT INTO pomodoro_achievements (user_id, achievement_key, title, description, icon, category, session_id, points_awarded)
      VALUES (NEW.user_id, 'high_productivity', 'Alta Produtividade', 'Sessão com produtividade 9+!', '⚡', 'productivity', NEW.id, 25)
      ON CONFLICT (user_id, achievement_key) DO NOTHING;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_pomodoro_achievements
  AFTER UPDATE ON pomodoro_sessions
  FOR EACH ROW EXECUTE FUNCTION check_pomodoro_achievements();

-- RLS (Row Level Security)
ALTER TABLE pomodoro_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_interruptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pomodoro_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE pomodoro_daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE pomodoro_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE pomodoro_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE pomodoro_insights ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Users can manage own pomodoro sessions" ON pomodoro_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own interruptions" ON session_interruptions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM pomodoro_sessions WHERE id = session_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can manage own pomodoro settings" ON pomodoro_settings
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view system and own templates" ON session_templates
  FOR SELECT USING (is_system = true OR auth.uid() = user_id);

CREATE POLICY "Users can manage own templates" ON session_templates
  FOR ALL USING (auth.uid() = user_id AND is_system = false);

CREATE POLICY "Users can manage own daily stats" ON pomodoro_daily_stats
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own goals" ON pomodoro_goals
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own achievements" ON pomodoro_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own insights" ON pomodoro_insights
  FOR ALL USING (auth.uid() = user_id);