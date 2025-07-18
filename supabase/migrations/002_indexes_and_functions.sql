-- ============================================
-- CONCURSIFY - Índices e Funções
-- ============================================

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

-- Índices para concursos
CREATE INDEX IF NOT EXISTS idx_concursos_estado ON concursos(estado);
CREATE INDEX IF NOT EXISTS idx_concursos_data_prova ON concursos(data_prova);
CREATE INDEX IF NOT EXISTS idx_concursos_created_at ON concursos(created_at DESC);

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

-- Índices para fórum (verificar se tabelas existem)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'forum_categories') THEN
        CREATE INDEX IF NOT EXISTS idx_forum_categories_slug ON forum_categories(slug);
        CREATE INDEX IF NOT EXISTS idx_forum_categories_parent_id ON forum_categories(parent_id);
        CREATE INDEX IF NOT EXISTS idx_forum_categories_position ON forum_categories(position);
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'forum_threads') THEN
        CREATE INDEX IF NOT EXISTS idx_forum_threads_category_id ON forum_threads(category_id);
        CREATE INDEX IF NOT EXISTS idx_forum_threads_user_id ON forum_threads(user_id);
        CREATE INDEX IF NOT EXISTS idx_forum_threads_status ON forum_threads(status);
        CREATE INDEX IF NOT EXISTS idx_forum_threads_last_post_at ON forum_threads(last_post_at DESC);
        CREATE INDEX IF NOT EXISTS idx_forum_threads_created_at ON forum_threads(created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_forum_threads_slug ON forum_threads(slug);
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'forum_posts') THEN
        CREATE INDEX IF NOT EXISTS idx_forum_posts_thread_id ON forum_posts(thread_id);
        CREATE INDEX IF NOT EXISTS idx_forum_posts_user_id ON forum_posts(user_id);
        CREATE INDEX IF NOT EXISTS idx_forum_posts_parent_id ON forum_posts(parent_id);
        CREATE INDEX IF NOT EXISTS idx_forum_posts_status ON forum_posts(status);
        CREATE INDEX IF NOT EXISTS idx_forum_posts_created_at ON forum_posts(created_at DESC);
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'forum_votes') THEN
        CREATE INDEX IF NOT EXISTS idx_forum_votes_post_id ON forum_votes(post_id);
        CREATE INDEX IF NOT EXISTS idx_forum_votes_user_id ON forum_votes(user_id);
    END IF;
END $$;

-- Índices para notas (verificar se tabelas existem)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notes') THEN
        CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
        CREATE INDEX IF NOT EXISTS idx_notes_folder ON notes(folder);
        CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);
        -- Índice vector apenas se a extensão estiver disponível
        IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') THEN
            CREATE INDEX IF NOT EXISTS idx_notes_embedding ON notes USING ivfflat (embedding vector_cosine_ops);
        END IF;
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'note_links') THEN
        CREATE INDEX IF NOT EXISTS idx_note_links_from_note_id ON note_links(from_note_id);
        CREATE INDEX IF NOT EXISTS idx_note_links_to_note_id ON note_links(to_note_id);
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'note_tags') THEN
        CREATE INDEX IF NOT EXISTS idx_note_tags_user_id ON note_tags(user_id);
    END IF;
END $$;

-- Índices para Pomodoro (verificar se tabelas existem)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pomodoro_sessions') THEN
        CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_user_id ON pomodoro_sessions(user_id);
        CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_started_at ON pomodoro_sessions(started_at DESC);
        CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_note_id ON pomodoro_sessions(note_id);
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'study_stats') THEN
        CREATE INDEX IF NOT EXISTS idx_study_stats_user_id ON study_stats(user_id);
        CREATE INDEX IF NOT EXISTS idx_study_stats_date ON study_stats(date DESC);
    END IF;
END $$;

-- Índices para Spotify (verificar se tabelas existem)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'spotify_integrations') THEN
        CREATE INDEX IF NOT EXISTS idx_spotify_integrations_user_id ON spotify_integrations(user_id);
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'spotify_playlists') THEN
        CREATE INDEX IF NOT EXISTS idx_spotify_playlists_user_id ON spotify_playlists(user_id);
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'music_preferences') THEN
        CREATE INDEX IF NOT EXISTS idx_music_preferences_user_id ON music_preferences(user_id);
    END IF;
END $$;

-- Índices para assinaturas (verificar se tabelas existem)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscription_plans') THEN
        CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON subscription_plans(is_active);
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_subscriptions') THEN
        CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
    END IF;
END $$;

-- Índices para tracking (verificar se tabelas existem)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'usage_tracking') THEN
        CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_feature_date ON usage_tracking(user_id, feature, date);
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'feature_usage_logs') THEN
        CREATE INDEX IF NOT EXISTS idx_feature_usage_logs_user_id ON feature_usage_logs(user_id);
        CREATE INDEX IF NOT EXISTS idx_feature_usage_logs_feature ON feature_usage_logs(feature);
        CREATE INDEX IF NOT EXISTS idx_feature_usage_logs_created_at ON feature_usage_logs(created_at DESC);
    END IF;
END $$;

-- ============================================
-- FUNÇÕES E TRIGGERS
-- ============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at (verificar se tabelas existem)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'concursos') THEN
        DROP TRIGGER IF EXISTS update_concursos_updated_at ON concursos;
        CREATE TRIGGER update_concursos_updated_at
            BEFORE UPDATE ON concursos
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cronogramas') THEN
        DROP TRIGGER IF EXISTS update_cronogramas_updated_at ON cronogramas;
        CREATE TRIGGER update_cronogramas_updated_at
            BEFORE UPDATE ON cronogramas
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'simulados') THEN
        DROP TRIGGER IF EXISTS update_simulados_updated_at ON simulados;
        CREATE TRIGGER update_simulados_updated_at
            BEFORE UPDATE ON simulados
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'forum_categories') THEN
        DROP TRIGGER IF EXISTS update_forum_categories_updated_at ON forum_categories;
        CREATE TRIGGER update_forum_categories_updated_at
            BEFORE UPDATE ON forum_categories
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'forum_threads') THEN
        DROP TRIGGER IF EXISTS update_forum_threads_updated_at ON forum_threads;
        CREATE TRIGGER update_forum_threads_updated_at
            BEFORE UPDATE ON forum_threads
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'forum_posts') THEN
        DROP TRIGGER IF EXISTS update_forum_posts_updated_at ON forum_posts;
        CREATE TRIGGER update_forum_posts_updated_at
            BEFORE UPDATE ON forum_posts
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notes') THEN
        DROP TRIGGER IF EXISTS update_notes_updated_at ON notes;
        CREATE TRIGGER update_notes_updated_at
            BEFORE UPDATE ON notes
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
        DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
        CREATE TRIGGER update_user_profiles_updated_at
            BEFORE UPDATE ON user_profiles
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_settings') THEN
        DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
        CREATE TRIGGER update_user_settings_updated_at
            BEFORE UPDATE ON user_settings
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'spotify_integrations') THEN
        DROP TRIGGER IF EXISTS update_spotify_integrations_updated_at ON spotify_integrations;
        CREATE TRIGGER update_spotify_integrations_updated_at
            BEFORE UPDATE ON spotify_integrations
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'music_preferences') THEN
        DROP TRIGGER IF EXISTS update_music_preferences_updated_at ON music_preferences;
        CREATE TRIGGER update_music_preferences_updated_at
            BEFORE UPDATE ON music_preferences
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscription_plans') THEN
        DROP TRIGGER IF EXISTS update_subscription_plans_updated_at ON subscription_plans;
        CREATE TRIGGER update_subscription_plans_updated_at
            BEFORE UPDATE ON subscription_plans
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_subscriptions') THEN
        DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON user_subscriptions;
        CREATE TRIGGER update_user_subscriptions_updated_at
            BEFORE UPDATE ON user_subscriptions
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'forum_user_stats') THEN
        DROP TRIGGER IF EXISTS update_forum_user_stats_updated_at ON forum_user_stats;
        CREATE TRIGGER update_forum_user_stats_updated_at
            BEFORE UPDATE ON forum_user_stats
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- ============================================
-- FUNÇÕES ESPECÍFICAS DO FÓRUM
-- ============================================

-- Função para atualizar contador de posts na thread
CREATE OR REPLACE FUNCTION update_thread_posts_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE forum_threads 
    SET posts_count = posts_count + 1,
        last_post_at = NEW.created_at,
        last_post_by = NEW.user_id
    WHERE id = NEW.thread_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE forum_threads 
    SET posts_count = GREATEST(0, posts_count - 1)
    WHERE id = OLD.thread_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'forum_posts') THEN
        DROP TRIGGER IF EXISTS trigger_update_thread_posts_count ON forum_posts;
        CREATE TRIGGER trigger_update_thread_posts_count
          AFTER INSERT OR DELETE ON forum_posts
          FOR EACH ROW EXECUTE FUNCTION update_thread_posts_count();
    END IF;
END $$;

-- Função para atualizar contador de votos
CREATE OR REPLACE FUNCTION update_post_votes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.vote_type = 'up' THEN
      UPDATE forum_posts SET upvotes_count = upvotes_count + 1 WHERE id = NEW.post_id;
    ELSE
      UPDATE forum_posts SET downvotes_count = downvotes_count + 1 WHERE id = NEW.post_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.vote_type = 'up' THEN
      UPDATE forum_posts SET upvotes_count = GREATEST(0, upvotes_count - 1) WHERE id = OLD.post_id;
    ELSE
      UPDATE forum_posts SET downvotes_count = GREATEST(0, downvotes_count - 1) WHERE id = OLD.post_id;
    END IF;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.vote_type = 'up' AND NEW.vote_type = 'down' THEN
      UPDATE forum_posts 
      SET upvotes_count = GREATEST(0, upvotes_count - 1),
          downvotes_count = downvotes_count + 1 
      WHERE id = NEW.post_id;
    ELSIF OLD.vote_type = 'down' AND NEW.vote_type = 'up' THEN
      UPDATE forum_posts 
      SET upvotes_count = upvotes_count + 1,
          downvotes_count = GREATEST(0, downvotes_count - 1)
      WHERE id = NEW.post_id;
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'forum_votes') THEN
        DROP TRIGGER IF EXISTS trigger_update_post_votes_count ON forum_votes;
        CREATE TRIGGER trigger_update_post_votes_count
          AFTER INSERT OR UPDATE OR DELETE ON forum_votes
          FOR EACH ROW EXECUTE FUNCTION update_post_votes_count();
    END IF;
END $$;

-- Função para atualizar estatísticas do usuário no fórum
CREATE OR REPLACE FUNCTION update_forum_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Inserir ou atualizar estatísticas
    INSERT INTO forum_user_stats (user_id, last_activity)
    VALUES (NEW.user_id, NOW())
    ON CONFLICT (user_id) 
    DO UPDATE SET last_activity = NOW();
    
    -- Se for uma thread
    IF TG_TABLE_NAME = 'forum_threads' THEN
      UPDATE forum_user_stats 
      SET threads_count = threads_count + 1
      WHERE user_id = NEW.user_id;
    
    -- Se for um post
    ELSIF TG_TABLE_NAME = 'forum_posts' THEN
      UPDATE forum_user_stats 
      SET posts_count = posts_count + 1
      WHERE user_id = NEW.user_id;
    END IF;
    
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'forum_threads') THEN
        DROP TRIGGER IF EXISTS trigger_update_forum_user_stats_threads ON forum_threads;
        CREATE TRIGGER trigger_update_forum_user_stats_threads
          AFTER INSERT ON forum_threads
          FOR EACH ROW EXECUTE FUNCTION update_forum_user_stats();
    END IF;
END $$;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'forum_posts') THEN
        DROP TRIGGER IF EXISTS trigger_update_forum_user_stats_posts ON forum_posts;
        CREATE TRIGGER trigger_update_forum_user_stats_posts
          AFTER INSERT ON forum_posts
          FOR EACH ROW EXECUTE FUNCTION update_forum_user_stats();
    END IF;
END $$;