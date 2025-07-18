-- Schema para integração com Spotify

-- Tabela de conexões Spotify dos usuários
CREATE TABLE spotify_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Dados da conta Spotify
  spotify_user_id VARCHAR NOT NULL,
  display_name VARCHAR,
  email VARCHAR,
  product VARCHAR, -- free, premium
  profile_image_url TEXT,
  
  -- Tokens OAuth
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  scope TEXT NOT NULL,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMP DEFAULT NOW(),
  
  -- Metadados
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id),
  UNIQUE(spotify_user_id)
);

-- Tabela de playlists geradas pela IA
CREATE TABLE ai_generated_playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Referência no Spotify
  spotify_playlist_id VARCHAR NOT NULL,
  spotify_uri VARCHAR NOT NULL,
  
  -- Contexto de geração
  subject VARCHAR NOT NULL,
  session_type VARCHAR NOT NULL, -- focus, study, review, break
  planned_duration INTEGER NOT NULL, -- em minutos
  
  -- Metadados da playlist
  name VARCHAR NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  
  -- Contexto do usuário na geração
  user_energy_level INTEGER, -- 1-10
  user_mood VARCHAR,
  environment VARCHAR,
  
  -- Características musicais
  avg_tempo INTEGER,
  avg_energy DECIMAL(3,2),
  avg_valence DECIMAL(3,2),
  main_genres TEXT[],
  
  -- IA insights
  generation_rationale TEXT,
  ai_confidence DECIMAL(3,2), -- 0.00 - 1.00
  
  -- Uso e feedback
  play_count INTEGER DEFAULT 0,
  last_played_at TIMESTAMP,
  user_rating INTEGER, -- 1-5 estrelas
  user_feedback TEXT,
  
  -- Status
  is_public BOOLEAN DEFAULT FALSE,
  is_favorite BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de tracks das playlists IA
CREATE TABLE ai_playlist_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID REFERENCES ai_generated_playlists(id) ON DELETE CASCADE NOT NULL,
  
  -- Dados do track no Spotify
  spotify_track_id VARCHAR NOT NULL,
  spotify_uri VARCHAR NOT NULL,
  
  -- Metadados do track
  name VARCHAR NOT NULL,
  artist_name VARCHAR NOT NULL,
  album_name VARCHAR NOT NULL,
  duration_ms INTEGER NOT NULL,
  preview_url TEXT,
  
  -- Audio features (quando disponível)
  tempo DECIMAL(6,2),
  energy DECIMAL(3,2),
  valence DECIMAL(3,2),
  acousticness DECIMAL(3,2),
  instrumentalness DECIMAL(3,2),
  
  -- Posição na playlist
  track_position INTEGER NOT NULL,
  
  -- IA scoring
  ai_relevance_score DECIMAL(3,2), -- quão relevante é para o contexto
  study_suitability_score DECIMAL(3,2), -- adequação para estudo
  
  -- Feedback
  skip_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de sessões de música durante Pomodoro
CREATE TABLE music_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pomodoro_session_id UUID REFERENCES pomodoro_sessions(id) ON DELETE CASCADE,
  playlist_id UUID REFERENCES ai_generated_playlists(id),
  
  -- Contexto da sessão
  session_type VARCHAR NOT NULL,
  planned_duration INTEGER NOT NULL,
  actual_duration INTEGER,
  
  -- Estado da reprodução
  started_at TIMESTAMP NOT NULL,
  paused_at TIMESTAMP,
  resumed_at TIMESTAMP,
  ended_at TIMESTAMP,
  
  -- Tracks tocados
  tracks_played INTEGER DEFAULT 0,
  tracks_skipped INTEGER DEFAULT 0,
  total_play_time INTEGER DEFAULT 0, -- em segundos
  
  -- Interações
  pause_count INTEGER DEFAULT 0,
  skip_count INTEGER DEFAULT 0,
  volume_changes INTEGER DEFAULT 0,
  
  -- Feedback da sessão
  music_helped_focus BOOLEAN,
  focus_score INTEGER, -- 1-10
  music_rating INTEGER, -- 1-5
  music_feedback TEXT,
  
  -- Dispositivo usado
  spotify_device_id VARCHAR,
  device_name VARCHAR,
  device_type VARCHAR, -- computer, smartphone, tablet, speaker
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de preferências musicais do usuário
CREATE TABLE user_music_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Gêneros preferidos
  preferred_genres TEXT[] DEFAULT '{}',
  disliked_genres TEXT[] DEFAULT '{}',
  
  -- Configurações de estudo
  instrumental_only BOOLEAN DEFAULT FALSE,
  language_preference VARCHAR DEFAULT 'any', -- portuguese, english, any
  tempo_preference VARCHAR DEFAULT 'medium', -- slow, medium, fast
  energy_preference VARCHAR DEFAULT 'medium', -- low, medium, high
  
  -- Configurações por tipo de sessão
  focus_settings JSONB DEFAULT '{}',
  study_settings JSONB DEFAULT '{}',
  review_settings JSONB DEFAULT '{}',
  break_settings JSONB DEFAULT '{}',
  
  -- IA personalização
  enable_ai_recommendations BOOLEAN DEFAULT TRUE,
  ai_learning_enabled BOOLEAN DEFAULT TRUE,
  auto_generate_playlists BOOLEAN DEFAULT TRUE,
  
  -- Horários preferenciais
  morning_genres TEXT[] DEFAULT '{}',
  afternoon_genres TEXT[] DEFAULT '{}',
  evening_genres TEXT[] DEFAULT '{}',
  
  -- Configurações de volume
  default_volume INTEGER DEFAULT 50, -- 0-100
  auto_adjust_volume BOOLEAN DEFAULT FALSE,
  
  -- Histórico de aprendizado
  total_listening_time INTEGER DEFAULT 0, -- em minutos
  most_used_genres TEXT[] DEFAULT '{}',
  avg_session_rating DECIMAL(3,2),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de análise de performance musical
CREATE TABLE music_performance_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  
  -- Métricas de uso
  total_sessions INTEGER DEFAULT 0,
  total_listening_time INTEGER DEFAULT 0, -- em minutos
  avg_session_duration INTEGER DEFAULT 0,
  
  -- Métricas de engajamento
  tracks_played INTEGER DEFAULT 0,
  tracks_skipped INTEGER DEFAULT 0,
  skip_rate DECIMAL(5,2), -- porcentagem
  
  -- Métricas de foco
  avg_focus_score DECIMAL(3,2),
  music_helped_focus_rate DECIMAL(5,2), -- porcentagem de vezes que ajudou
  
  -- Gêneros mais usados no dia
  top_genres TEXT[],
  session_types_used TEXT[],
  
  -- Dispositivos utilizados
  devices_used TEXT[],
  primary_device VARCHAR,
  
  -- Horários de uso
  morning_sessions INTEGER DEFAULT 0,
  afternoon_sessions INTEGER DEFAULT 0,
  evening_sessions INTEGER DEFAULT 0,
  
  -- Ratings médios
  avg_music_rating DECIMAL(3,2),
  playlists_generated INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);

-- Tabela de insights musicais da IA
CREATE TABLE music_ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Tipo de insight
  insight_type VARCHAR NOT NULL, -- genre_recommendation, timing, volume, playlist_optimization
  title VARCHAR NOT NULL,
  description TEXT NOT NULL,
  
  -- Dados de suporte
  confidence_score DECIMAL(3,2),
  based_on_sessions INTEGER,
  data_timeframe VARCHAR, -- 7d, 30d, 90d
  
  -- Recomendação específica
  recommended_action TEXT,
  expected_benefit VARCHAR,
  
  -- Context específico
  subject_context VARCHAR,
  session_type_context VARCHAR,
  time_context VARCHAR,
  
  -- Resultado esperado
  focus_improvement_estimate DECIMAL(3,2),
  productivity_boost_estimate DECIMAL(3,2),
  
  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  is_applied BOOLEAN DEFAULT FALSE,
  user_feedback INTEGER, -- 1-5 útil?
  
  -- Metadados
  generated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  priority INTEGER DEFAULT 1, -- 1-5
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Função para atualizar token Spotify
CREATE OR REPLACE FUNCTION update_spotify_token(
  p_user_id UUID,
  p_access_token TEXT,
  p_refresh_token TEXT,
  p_expires_in INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE spotify_connections 
  SET 
    access_token = p_access_token,
    refresh_token = p_refresh_token,
    expires_at = NOW() + (p_expires_in || ' seconds')::INTERVAL,
    last_used_at = NOW(),
    updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Função para registrar uso de música
CREATE OR REPLACE FUNCTION track_music_usage()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar analytics diárias
  INSERT INTO music_performance_analytics (
    user_id,
    date,
    total_sessions,
    total_listening_time,
    tracks_played,
    tracks_skipped
  )
  VALUES (
    NEW.user_id,
    NEW.created_at::DATE,
    1,
    COALESCE(NEW.actual_duration, 0),
    COALESCE(NEW.tracks_played, 0),
    COALESCE(NEW.tracks_skipped, 0)
  )
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    total_sessions = music_performance_analytics.total_sessions + 1,
    total_listening_time = music_performance_analytics.total_listening_time + COALESCE(NEW.actual_duration, 0),
    tracks_played = music_performance_analytics.tracks_played + COALESCE(NEW.tracks_played, 0),
    tracks_skipped = music_performance_analytics.tracks_skipped + COALESCE(NEW.tracks_skipped, 0),
    skip_rate = CASE 
      WHEN (music_performance_analytics.tracks_played + COALESCE(NEW.tracks_played, 0)) > 0 
      THEN ((music_performance_analytics.tracks_skipped + COALESCE(NEW.tracks_skipped, 0))::DECIMAL / 
            (music_performance_analytics.tracks_played + COALESCE(NEW.tracks_played, 0))) * 100
      ELSE 0
    END,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para analytics automáticas
CREATE TRIGGER trigger_track_music_usage
  AFTER INSERT OR UPDATE ON music_sessions
  FOR EACH ROW EXECUTE FUNCTION track_music_usage();

-- Função para criar preferências padrão
CREATE OR REPLACE FUNCTION create_default_music_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_music_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para criar preferências padrão
CREATE TRIGGER trigger_create_default_music_preferences
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_default_music_preferences();

-- Índices para performance
CREATE INDEX idx_spotify_connections_user ON spotify_connections(user_id);
CREATE INDEX idx_spotify_connections_spotify_user ON spotify_connections(spotify_user_id);
CREATE INDEX idx_spotify_connections_expires ON spotify_connections(expires_at);

CREATE INDEX idx_ai_playlists_user ON ai_generated_playlists(user_id);
CREATE INDEX idx_ai_playlists_subject ON ai_generated_playlists(subject);
CREATE INDEX idx_ai_playlists_type ON ai_generated_playlists(session_type);
CREATE INDEX idx_ai_playlists_created ON ai_generated_playlists(created_at);

CREATE INDEX idx_playlist_tracks_playlist ON ai_playlist_tracks(playlist_id);
CREATE INDEX idx_playlist_tracks_position ON ai_playlist_tracks(playlist_id, track_position);

CREATE INDEX idx_music_sessions_user ON music_sessions(user_id);
CREATE INDEX idx_music_sessions_pomodoro ON music_sessions(pomodoro_session_id);
CREATE INDEX idx_music_sessions_playlist ON music_sessions(playlist_id);
CREATE INDEX idx_music_sessions_date ON music_sessions(started_at);

CREATE INDEX idx_music_analytics_user_date ON music_performance_analytics(user_id, date);
CREATE INDEX idx_music_insights_user_read ON music_ai_insights(user_id, is_read);

-- RLS (Row Level Security)
ALTER TABLE spotify_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generated_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_playlist_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_music_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_performance_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_ai_insights ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Users can manage own Spotify connection" ON spotify_connections
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own playlists" ON ai_generated_playlists
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own playlist tracks" ON ai_playlist_tracks
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM ai_generated_playlists WHERE id = playlist_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can manage own music sessions" ON music_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own music preferences" ON user_music_preferences
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own music analytics" ON music_performance_analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own music insights" ON music_ai_insights
  FOR ALL USING (auth.uid() = user_id);