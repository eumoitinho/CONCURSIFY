-- Adicionar tabelas do fórum ao schema existente

-- Enum para status de posts
CREATE TYPE post_status AS ENUM ('active', 'locked', 'deleted', 'under_review');

-- Enum para tipos de thread
CREATE TYPE thread_type AS ENUM ('discussion', 'question', 'study_group', 'announcement', 'doubt');

-- Enum para níveis de moderação
CREATE TYPE moderation_level AS ENUM ('automatic', 'manual', 'flagged');

-- Tabela de categorias do fórum
CREATE TABLE forum_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  description TEXT,
  slug VARCHAR UNIQUE NOT NULL,
  color VARCHAR(7) DEFAULT '#3b82f6', -- Cor hex
  icon VARCHAR, -- Nome do ícone
  position INTEGER DEFAULT 0, -- Ordem de exibição
  is_active BOOLEAN DEFAULT true,
  parent_id UUID REFERENCES forum_categories(id), -- Para subcategorias
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de threads (tópicos)
CREATE TABLE forum_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES forum_categories(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title VARCHAR NOT NULL,
  content TEXT NOT NULL,
  slug VARCHAR UNIQUE NOT NULL,
  type thread_type DEFAULT 'discussion',
  status post_status DEFAULT 'active',
  is_pinned BOOLEAN DEFAULT false,
  is_solved BOOLEAN DEFAULT false, -- Para threads tipo 'question'
  solved_by UUID REFERENCES auth.users(id), -- Quem marcou como resolvido
  solved_at TIMESTAMP,
  views_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0, -- Cache do número de posts
  last_post_at TIMESTAMP DEFAULT NOW(),
  last_post_by UUID REFERENCES auth.users(id),
  tags TEXT[], -- Tags da thread
  metadata JSONB DEFAULT '{}', -- Metadados adicionais
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de posts (respostas)
CREATE TABLE forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES forum_threads(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  parent_id UUID REFERENCES forum_posts(id), -- Para respostas aninhadas
  content TEXT NOT NULL,
  status post_status DEFAULT 'active',
  is_solution BOOLEAN DEFAULT false, -- Marca se é a solução da thread
  upvotes_count INTEGER DEFAULT 0,
  downvotes_count INTEGER DEFAULT 0,
  reports_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de votos em posts
CREATE TABLE forum_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES forum_posts(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  vote_type VARCHAR CHECK (vote_type IN ('up', 'down')) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(post_id, user_id) -- Um usuário só pode votar uma vez por post
);

-- Tabela de reports/denúncias
CREATE TABLE forum_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES forum_posts(id),
  thread_id UUID REFERENCES forum_threads(id),
  reporter_id UUID REFERENCES auth.users(id) NOT NULL,
  reason VARCHAR NOT NULL,
  description TEXT,
  status VARCHAR CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')) DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  
  CHECK (post_id IS NOT NULL OR thread_id IS NOT NULL) -- Deve reportar post OU thread
);

-- Tabela de moderação IA
CREATE TABLE forum_moderation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type VARCHAR CHECK (content_type IN ('thread', 'post')) NOT NULL,
  content_id UUID NOT NULL, -- ID da thread ou post
  user_id UUID REFERENCES auth.users(id),
  action VARCHAR NOT NULL, -- 'approved', 'flagged', 'auto_deleted', etc.
  reason TEXT,
  confidence_score DECIMAL(3,2), -- Score de confiança da IA (0.00 - 1.00)
  ai_model VARCHAR, -- Modelo de IA usado
  moderation_level moderation_level DEFAULT 'automatic',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de follows/subscriptions
CREATE TABLE forum_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  thread_id UUID REFERENCES forum_threads(id),
  category_id UUID REFERENCES forum_categories(id),
  user_followed_id UUID REFERENCES auth.users(id), -- Para seguir usuários
  notification_type VARCHAR CHECK (notification_type IN ('all', 'replies_only', 'mentions_only')) DEFAULT 'all',
  created_at TIMESTAMP DEFAULT NOW(),
  
  CHECK (
    (thread_id IS NOT NULL AND category_id IS NULL AND user_followed_id IS NULL) OR
    (thread_id IS NULL AND category_id IS NOT NULL AND user_followed_id IS NULL) OR
    (thread_id IS NULL AND category_id IS NULL AND user_followed_id IS NOT NULL)
  ),
  
  UNIQUE(user_id, thread_id),
  UNIQUE(user_id, category_id),
  UNIQUE(user_id, user_followed_id)
);

-- Tabela de notificações do fórum
CREATE TABLE forum_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  thread_id UUID REFERENCES forum_threads(id),
  post_id UUID REFERENCES forum_posts(id),
  trigger_user_id UUID REFERENCES auth.users(id), -- Usuário que causou a notificação
  type VARCHAR NOT NULL, -- 'new_post', 'thread_reply', 'mention', 'solution_marked', etc.
  title VARCHAR NOT NULL,
  content TEXT,
  is_read BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de badges/conquistas do fórum
CREATE TABLE forum_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  description TEXT,
  icon VARCHAR,
  color VARCHAR(7) DEFAULT '#3b82f6',
  requirements JSONB NOT NULL, -- Critérios para ganhar o badge
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de badges dos usuários
CREATE TABLE user_forum_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  badge_id UUID REFERENCES forum_badges(id) NOT NULL,
  earned_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  
  UNIQUE(user_id, badge_id)
);

-- Tabela de estatísticas dos usuários no fórum
CREATE TABLE forum_user_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  threads_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  upvotes_received INTEGER DEFAULT 0,
  downvotes_received INTEGER DEFAULT 0,
  solutions_count INTEGER DEFAULT 0, -- Quantas soluções foram aceitas
  reputation_score INTEGER DEFAULT 0,
  last_activity TIMESTAMP DEFAULT NOW(),
  join_date TIMESTAMP DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Inserir categorias padrão
INSERT INTO forum_categories (name, description, slug, color, icon, position) VALUES
('Geral', 'Discussões gerais sobre concursos públicos', 'geral', '#3b82f6', 'MessageCircle', 1),
('Dúvidas de Estudo', 'Tire suas dúvidas sobre matérias e conteúdos', 'duvidas', '#10b981', 'HelpCircle', 2),
('Direito Constitucional', 'Discussões sobre Direito Constitucional', 'direito-constitucional', '#8b5cf6', 'Scale', 3),
('Direito Administrativo', 'Discussões sobre Direito Administrativo', 'direito-administrativo', '#f59e0b', 'Building', 4),
('Português', 'Língua Portuguesa para concursos', 'portugues', '#ef4444', 'BookOpen', 5),
('Matemática', 'Matemática e Raciocínio Lógico', 'matematica', '#06b6d4', 'Calculator', 6),
('Informatica', 'Noções de Informática', 'informatica', '#84cc16', 'Monitor', 7),
('Experiências', 'Compartilhe sua experiência em concursos', 'experiencias', '#f97316', 'Star', 8),
('Grupos de Estudo', 'Forme e participe de grupos de estudo', 'grupos-estudo', '#ec4899', 'Users', 9),
('Concursos Abertos', 'Discussões sobre editais em aberto', 'concursos-abertos', '#14b8a6', 'Briefcase', 10);

-- Inserir badges padrão
INSERT INTO forum_badges (name, description, icon, color, requirements) VALUES
('Primeiro Post', 'Fez sua primeira publicação no fórum', 'MessageSquare', '#10b981', '{"posts_count": 1}'),
('Contribuidor', 'Fez 10 publicações no fórum', 'Edit3', '#3b82f6', '{"posts_count": 10}'),
('Especialista', 'Fez 50 publicações no fórum', 'Award', '#8b5cf6', '{"posts_count": 50}'),
('Solucionador', 'Teve 5 respostas marcadas como solução', 'CheckCircle', '#f59e0b', '{"solutions_count": 5}'),
('Popular', 'Recebeu 50 upvotes', 'ThumbsUp', '#ef4444', '{"upvotes_received": 50}'),
('Veterano', 'Membro há mais de 6 meses', 'Clock', '#6b7280', '{"days_since_join": 180}'),
('Mentor', 'Recebeu 100 upvotes e teve 10 soluções aceitas', 'Crown', '#fbbf24', '{"upvotes_received": 100, "solutions_count": 10}');

-- Índices para performance
CREATE INDEX idx_forum_threads_category ON forum_threads(category_id);
CREATE INDEX idx_forum_threads_user ON forum_threads(user_id);
CREATE INDEX idx_forum_threads_status ON forum_threads(status);
CREATE INDEX idx_forum_threads_last_post ON forum_threads(last_post_at DESC);
CREATE INDEX idx_forum_threads_created_at ON forum_threads(created_at DESC);

CREATE INDEX idx_forum_posts_thread ON forum_posts(thread_id);
CREATE INDEX idx_forum_posts_user ON forum_posts(user_id);
CREATE INDEX idx_forum_posts_status ON forum_posts(status);
CREATE INDEX idx_forum_posts_created_at ON forum_posts(created_at DESC);

CREATE INDEX idx_forum_votes_post ON forum_votes(post_id);
CREATE INDEX idx_forum_votes_user ON forum_votes(user_id);

CREATE INDEX idx_forum_notifications_user ON forum_notifications(user_id);
CREATE INDEX idx_forum_notifications_read ON forum_notifications(user_id, is_read);

-- Triggers para atualizar contadores

-- Trigger para atualizar posts_count na thread
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
    SET posts_count = posts_count - 1
    WHERE id = OLD.thread_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_thread_posts_count
  AFTER INSERT OR DELETE ON forum_posts
  FOR EACH ROW EXECUTE FUNCTION update_thread_posts_count();

-- Trigger para atualizar contador de votos
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
      UPDATE forum_posts SET upvotes_count = upvotes_count - 1 WHERE id = OLD.post_id;
    ELSE
      UPDATE forum_posts SET downvotes_count = downvotes_count - 1 WHERE id = OLD.post_id;
    END IF;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.vote_type = 'up' AND NEW.vote_type = 'down' THEN
      UPDATE forum_posts 
      SET upvotes_count = upvotes_count - 1,
          downvotes_count = downvotes_count + 1 
      WHERE id = NEW.post_id;
    ELSIF OLD.vote_type = 'down' AND NEW.vote_type = 'up' THEN
      UPDATE forum_posts 
      SET upvotes_count = upvotes_count + 1,
          downvotes_count = downvotes_count - 1 
      WHERE id = NEW.post_id;
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_post_votes_count
  AFTER INSERT OR UPDATE OR DELETE ON forum_votes
  FOR EACH ROW EXECUTE FUNCTION update_post_votes_count();

-- Trigger para atualizar estatísticas do usuário
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

CREATE TRIGGER trigger_update_forum_user_stats_threads
  AFTER INSERT ON forum_threads
  FOR EACH ROW EXECUTE FUNCTION update_forum_user_stats();

CREATE TRIGGER trigger_update_forum_user_stats_posts
  AFTER INSERT ON forum_posts
  FOR EACH ROW EXECUTE FUNCTION update_forum_user_stats();

-- RLS (Row Level Security)
ALTER TABLE forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_user_stats ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança

-- Categorias: todos podem ver, apenas admins podem modificar
CREATE POLICY "Anyone can view forum categories" ON forum_categories
  FOR SELECT USING (true);

-- Threads: todos podem ver threads ativas, apenas donos/admins podem modificar
CREATE POLICY "Anyone can view active threads" ON forum_threads
  FOR SELECT USING (status IN ('active', 'locked'));

CREATE POLICY "Users can create threads" ON forum_threads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own threads" ON forum_threads
  FOR UPDATE USING (auth.uid() = user_id);

-- Posts: todos podem ver posts ativos, apenas donos/admins podem modificar
CREATE POLICY "Anyone can view active posts" ON forum_posts
  FOR SELECT USING (status = 'active');

CREATE POLICY "Users can create posts" ON forum_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts" ON forum_posts
  FOR UPDATE USING (auth.uid() = user_id);

-- Votos: usuários só podem ver/gerenciar seus próprios votos
CREATE POLICY "Users can manage own votes" ON forum_votes
  FOR ALL USING (auth.uid() = user_id);

-- Reports: usuários podem criar, apenas mods podem ver todos
CREATE POLICY "Users can create reports" ON forum_reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view own reports" ON forum_reports
  FOR SELECT USING (auth.uid() = reporter_id);

-- Follows: usuários só gerenciam seus próprios follows
CREATE POLICY "Users can manage own follows" ON forum_follows
  FOR ALL USING (auth.uid() = user_id);

-- Notificações: usuários só veem suas próprias
CREATE POLICY "Users can view own notifications" ON forum_notifications
  FOR ALL USING (auth.uid() = user_id);

-- Stats: todos podem ver, sistema atualiza
CREATE POLICY "Anyone can view user stats" ON forum_user_stats
  FOR SELECT USING (true);