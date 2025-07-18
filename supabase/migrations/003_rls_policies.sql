-- ============================================
-- CONCURSIFY - Row Level Security (RLS)
-- ============================================

-- ============================================
-- HABILITAR RLS
-- ============================================

-- Tabelas principais
ALTER TABLE concursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE questoes ENABLE ROW LEVEL SECURITY;

-- Sistema de usuários
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Sistema de cronogramas
ALTER TABLE cronogramas ENABLE ROW LEVEL SECURITY;

-- Sistema de simulados
ALTER TABLE simulados ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulado_respostas ENABLE ROW LEVEL SECURITY;

-- Sistema de fórum
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_user_stats ENABLE ROW LEVEL SECURITY;

-- Sistema de notas
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_tags ENABLE ROW LEVEL SECURITY;

-- Sistema Pomodoro
ALTER TABLE pomodoro_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_stats ENABLE ROW LEVEL SECURITY;

-- Sistema Spotify
ALTER TABLE spotify_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE spotify_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_preferences ENABLE ROW LEVEL SECURITY;

-- Sistema de assinaturas
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- Sistema de tracking
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_usage_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS PARA DADOS PÚBLICOS
-- ============================================

-- Concursos são públicos para leitura
DROP POLICY IF EXISTS "Anyone can view concursos" ON concursos;
CREATE POLICY "Anyone can view concursos" ON concursos
  FOR SELECT USING (true);

-- Questões são públicas para leitura
DROP POLICY IF EXISTS "Anyone can view questoes" ON questoes;
CREATE POLICY "Anyone can view questoes" ON questoes
  FOR SELECT USING (true);

-- Planos de assinatura são públicos
DROP POLICY IF EXISTS "Anyone can view subscription plans" ON subscription_plans;
CREATE POLICY "Anyone can view subscription plans" ON subscription_plans
  FOR SELECT USING (is_active = true);

-- ============================================
-- POLÍTICAS PARA DADOS DE USUÁRIO
-- ============================================

-- Perfis de usuário
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Configurações de usuário
DROP POLICY IF EXISTS "Users can view own settings" ON user_settings;
CREATE POLICY "Users can view own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;
CREATE POLICY "Users can insert own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;
CREATE POLICY "Users can update own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own settings" ON user_settings;
CREATE POLICY "Users can delete own settings" ON user_settings
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- POLÍTICAS PARA CRONOGRAMAS
-- ============================================

DROP POLICY IF EXISTS "Users can manage own cronogramas" ON cronogramas;
CREATE POLICY "Users can manage own cronogramas" ON cronogramas
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- POLÍTICAS PARA SIMULADOS
-- ============================================

DROP POLICY IF EXISTS "Users can manage own simulados" ON simulados;
CREATE POLICY "Users can manage own simulados" ON simulados
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own simulado respostas" ON simulado_respostas;
CREATE POLICY "Users can manage own simulado respostas" ON simulado_respostas
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM simulados 
      WHERE simulados.id = simulado_respostas.simulado_id 
      AND simulados.user_id = auth.uid()
    )
  );

-- ============================================
-- POLÍTICAS PARA FÓRUM
-- ============================================

-- Categorias do fórum são públicas
DROP POLICY IF EXISTS "Anyone can view forum categories" ON forum_categories;
CREATE POLICY "Anyone can view forum categories" ON forum_categories
  FOR SELECT USING (is_active = true);

-- Threads do fórum
DROP POLICY IF EXISTS "Anyone can view active threads" ON forum_threads;
CREATE POLICY "Anyone can view active threads" ON forum_threads
  FOR SELECT USING (status IN ('active', 'locked'));

DROP POLICY IF EXISTS "Authenticated users can create threads" ON forum_threads;
CREATE POLICY "Authenticated users can create threads" ON forum_threads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own threads" ON forum_threads;
CREATE POLICY "Users can update own threads" ON forum_threads
  FOR UPDATE USING (auth.uid() = user_id);

-- Posts do fórum
DROP POLICY IF EXISTS "Anyone can view active posts" ON forum_posts;
CREATE POLICY "Anyone can view active posts" ON forum_posts
  FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Authenticated users can create posts" ON forum_posts;
CREATE POLICY "Authenticated users can create posts" ON forum_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own posts" ON forum_posts;
CREATE POLICY "Users can update own posts" ON forum_posts
  FOR UPDATE USING (auth.uid() = user_id);

-- Votos do fórum
DROP POLICY IF EXISTS "Users can manage own votes" ON forum_votes;
CREATE POLICY "Users can manage own votes" ON forum_votes
  FOR ALL USING (auth.uid() = user_id);

-- Estatísticas do fórum são públicas para leitura, mas restritas para escrita
DROP POLICY IF EXISTS "Anyone can view forum user stats" ON forum_user_stats;
CREATE POLICY "Anyone can view forum user stats" ON forum_user_stats
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own forum stats" ON forum_user_stats;
CREATE POLICY "Users can insert own forum stats" ON forum_user_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Users can update own forum stats" ON forum_user_stats;
CREATE POLICY "Users can update own forum stats" ON forum_user_stats
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- ============================================
-- POLÍTICAS PARA NOTAS
-- ============================================

DROP POLICY IF EXISTS "Users can manage own notes" ON notes;
CREATE POLICY "Users can manage own notes" ON notes
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own note links" ON note_links;
CREATE POLICY "Users can manage own note links" ON note_links
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM notes 
      WHERE notes.id = note_links.from_note_id 
      AND notes.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can manage own note tags" ON note_tags;
CREATE POLICY "Users can manage own note tags" ON note_tags
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- POLÍTICAS PARA POMODORO
-- ============================================

DROP POLICY IF EXISTS "Users can manage own pomodoro sessions" ON pomodoro_sessions;
CREATE POLICY "Users can manage own pomodoro sessions" ON pomodoro_sessions
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own study stats" ON study_stats;
CREATE POLICY "Users can manage own study stats" ON study_stats
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- POLÍTICAS PARA SPOTIFY
-- ============================================

DROP POLICY IF EXISTS "Users can view own spotify integration" ON spotify_integrations;
CREATE POLICY "Users can view own spotify integration" ON spotify_integrations
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own spotify integration" ON spotify_integrations;
CREATE POLICY "Users can insert own spotify integration" ON spotify_integrations
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Users can update own spotify integration" ON spotify_integrations;
CREATE POLICY "Users can update own spotify integration" ON spotify_integrations
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own spotify integration" ON spotify_integrations;
CREATE POLICY "Users can delete own spotify integration" ON spotify_integrations
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own spotify playlists" ON spotify_playlists;
CREATE POLICY "Users can view own spotify playlists" ON spotify_playlists
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own spotify playlists" ON spotify_playlists;
CREATE POLICY "Users can insert own spotify playlists" ON spotify_playlists
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Users can update own spotify playlists" ON spotify_playlists;
CREATE POLICY "Users can update own spotify playlists" ON spotify_playlists
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own spotify playlists" ON spotify_playlists;
CREATE POLICY "Users can delete own spotify playlists" ON spotify_playlists
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own music preferences" ON music_preferences;
CREATE POLICY "Users can view own music preferences" ON music_preferences
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own music preferences" ON music_preferences;
CREATE POLICY "Users can insert own music preferences" ON music_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Users can update own music preferences" ON music_preferences;
CREATE POLICY "Users can update own music preferences" ON music_preferences
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own music preferences" ON music_preferences;
CREATE POLICY "Users can delete own music preferences" ON music_preferences
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- POLÍTICAS PARA ASSINATURAS
-- ============================================

DROP POLICY IF EXISTS "Users can view own subscription" ON user_subscriptions;
CREATE POLICY "Users can view own subscription" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own payment history" ON payment_history;
CREATE POLICY "Users can view own payment history" ON payment_history
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- POLÍTICAS PARA TRACKING
-- ============================================

DROP POLICY IF EXISTS "Users can track own usage" ON usage_tracking;
CREATE POLICY "Users can track own usage" ON usage_tracking
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own usage" ON usage_tracking;
CREATE POLICY "Users can view own usage" ON usage_tracking
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can log own feature usage" ON feature_usage_logs;
CREATE POLICY "Users can log own feature usage" ON feature_usage_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "Users can view own feature usage" ON feature_usage_logs;
CREATE POLICY "Users can view own feature usage" ON feature_usage_logs
  FOR SELECT USING (auth.uid() = user_id);