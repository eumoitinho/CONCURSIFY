-- ============================================
-- CONCURSIFY - Correção de Índices (Pós-Criação)
-- ============================================

-- Esta migration deve ser executada APÓS todas as tabelas já existirem
-- para garantir que os índices sejam criados corretamente

-- ============================================
-- RECRIAR ÍNDICES ESSENCIAIS
-- ============================================

-- Índices para questões
CREATE INDEX IF NOT EXISTS idx_questoes_materia ON questoes(materia);
CREATE INDEX IF NOT EXISTS idx_questoes_assunto ON questoes(assunto);
CREATE INDEX IF NOT EXISTS idx_questoes_orgao ON questoes(orgao);
CREATE INDEX IF NOT EXISTS idx_questoes_nivel ON questoes(nivel_dificuldade);

-- Índices para cronogramas
CREATE INDEX IF NOT EXISTS idx_cronogramas_user_id ON cronogramas(user_id);
CREATE INDEX IF NOT EXISTS idx_cronogramas_concurso_id ON cronogramas(concurso_id);
CREATE INDEX IF NOT EXISTS idx_cronogramas_created_at ON cronogramas(created_at DESC);

-- Índices para simulados
CREATE INDEX IF NOT EXISTS idx_simulados_user_id ON simulados(user_id);
CREATE INDEX IF NOT EXISTS idx_simulados_status ON simulados(status);
CREATE INDEX IF NOT EXISTS idx_simulados_created_at ON simulados(created_at DESC);

-- Índices para respostas de simulado
CREATE INDEX IF NOT EXISTS idx_simulado_respostas_simulado_id ON simulado_respostas(simulado_id);
CREATE INDEX IF NOT EXISTS idx_simulado_respostas_questao_id ON simulado_respostas(questao_id);

-- Índices para fórum
CREATE INDEX IF NOT EXISTS idx_forum_categories_slug ON forum_categories(slug);
CREATE INDEX IF NOT EXISTS idx_forum_categories_parent_id ON forum_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_forum_categories_position ON forum_categories(position);

CREATE INDEX IF NOT EXISTS idx_forum_threads_category_id ON forum_threads(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_user_id ON forum_threads(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_threads_status ON forum_threads(status);
CREATE INDEX IF NOT EXISTS idx_forum_threads_last_post_at ON forum_threads(last_post_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_threads_created_at ON forum_threads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_threads_slug ON forum_threads(slug);

CREATE INDEX IF NOT EXISTS idx_forum_posts_thread_id ON forum_posts(thread_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_user_id ON forum_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_parent_id ON forum_posts(parent_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_status ON forum_posts(status);
CREATE INDEX IF NOT EXISTS idx_forum_posts_created_at ON forum_posts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_forum_votes_post_id ON forum_votes(post_id);
CREATE INDEX IF NOT EXISTS idx_forum_votes_user_id ON forum_votes(user_id);

-- Índices para notas
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_folder ON notes(folder);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);

-- Índice vector apenas se a extensão estiver disponível
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') THEN
        CREATE INDEX IF NOT EXISTS idx_notes_embedding ON notes USING ivfflat (embedding vector_cosine_ops);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_note_links_from_note_id ON note_links(from_note_id);
CREATE INDEX IF NOT EXISTS idx_note_links_to_note_id ON note_links(to_note_id);
CREATE INDEX IF NOT EXISTS idx_note_tags_user_id ON note_tags(user_id);

-- Índices para Pomodoro
CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_user_id ON pomodoro_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_started_at ON pomodoro_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_note_id ON pomodoro_sessions(note_id);

CREATE INDEX IF NOT EXISTS idx_study_stats_user_id ON study_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_study_stats_date ON study_stats(date DESC);

-- Índices para Spotify
CREATE INDEX IF NOT EXISTS idx_spotify_integrations_user_id ON spotify_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_spotify_playlists_user_id ON spotify_playlists(user_id);
CREATE INDEX IF NOT EXISTS idx_music_preferences_user_id ON music_preferences(user_id);

-- Índices para assinaturas
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON subscription_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);

-- Índices para tracking
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_feature_date ON usage_tracking(user_id, feature, date);
CREATE INDEX IF NOT EXISTS idx_feature_usage_logs_user_id ON feature_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_feature_usage_logs_feature ON feature_usage_logs(feature);
CREATE INDEX IF NOT EXISTS idx_feature_usage_logs_created_at ON feature_usage_logs(created_at DESC);

-- ============================================
-- VERIFICAR E RECRIAR TRIGGERS ESSENCIAIS
-- ============================================

-- Trigger para atualizar contador de posts na thread
DO $$ BEGIN
    -- Verificar se o trigger existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'trigger_update_thread_posts_count' 
        AND event_object_table = 'forum_posts'
    ) THEN
        CREATE TRIGGER trigger_update_thread_posts_count
          AFTER INSERT OR DELETE ON forum_posts
          FOR EACH ROW EXECUTE FUNCTION update_thread_posts_count();
    END IF;
END $$;

-- Trigger para atualizar contador de votos
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'trigger_update_post_votes_count' 
        AND event_object_table = 'forum_votes'
    ) THEN
        CREATE TRIGGER trigger_update_post_votes_count
          AFTER INSERT OR UPDATE OR DELETE ON forum_votes
          FOR EACH ROW EXECUTE FUNCTION update_post_votes_count();
    END IF;
END $$;

-- Triggers para estatísticas do usuário no fórum
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'trigger_update_forum_user_stats_threads' 
        AND event_object_table = 'forum_threads'
    ) THEN
        CREATE TRIGGER trigger_update_forum_user_stats_threads
          AFTER INSERT ON forum_threads
          FOR EACH ROW EXECUTE FUNCTION update_forum_user_stats();
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'trigger_update_forum_user_stats_posts' 
        AND event_object_table = 'forum_posts'
    ) THEN
        CREATE TRIGGER trigger_update_forum_user_stats_posts
          AFTER INSERT ON forum_posts
          FOR EACH ROW EXECUTE FUNCTION update_forum_user_stats();
    END IF;
END $$; 