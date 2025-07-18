-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Tabela de concursos
CREATE TABLE concursos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo VARCHAR NOT NULL,
  orgao VARCHAR NOT NULL,
  vagas VARCHAR,
  inscricoes VARCHAR,
  link VARCHAR NOT NULL,
  data_prova DATE,
  materias TEXT[],
  estado VARCHAR(2),
  scraped_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de cronogramas
CREATE TABLE cronogramas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  concurso_id UUID REFERENCES concursos(id),
  user_id UUID REFERENCES auth.users(id),
  user_preferences JSONB NOT NULL,
  cronograma_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de questões para simulados
CREATE TABLE questoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  texto TEXT NOT NULL,
  alternativas JSONB NOT NULL, -- Array de alternativas
  resposta_correta VARCHAR(1) NOT NULL, -- A, B, C, D, E
  explicacao TEXT,
  materia VARCHAR NOT NULL,
  assunto VARCHAR NOT NULL,
  orgao VARCHAR,
  ano INTEGER,
  nivel_dificuldade VARCHAR CHECK (nivel_dificuldade IN ('facil', 'medio', 'dificil')),
  tags TEXT[],
  fonte VARCHAR,
  scraped_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de simulados
CREATE TABLE simulados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  titulo VARCHAR NOT NULL,
  configuracao JSONB NOT NULL, -- materias, num_questoes, tempo_limite, etc
  questoes_ids UUID[], -- Array de IDs das questões
  status VARCHAR DEFAULT 'em_andamento' CHECK (status IN ('em_andamento', 'finalizado', 'pausado')),
  tempo_inicio TIMESTAMP,
  tempo_fim TIMESTAMP,
  pontuacao INTEGER,
  total_questoes INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de respostas do simulado
CREATE TABLE simulado_respostas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  simulado_id UUID REFERENCES simulados(id),
  questao_id UUID REFERENCES questoes(id),
  resposta_usuario VARCHAR(1),
  resposta_correta VARCHAR(1),
  tempo_resposta INTEGER, -- em segundos
  is_correct BOOLEAN,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Threads do fórum
CREATE TABLE forum_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  description TEXT,
  author_id UUID REFERENCES auth.users(id),
  category VARCHAR NOT NULL CHECK (category IN ('concurso', 'materia', 'geral', 'simulados')),
  tags TEXT[],
  pinned BOOLEAN DEFAULT FALSE,
  locked BOOLEAN DEFAULT FALSE,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Posts do fórum
CREATE TABLE forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES forum_threads(id),
  author_id UUID REFERENCES auth.users(id),
  content TEXT NOT NULL,
  parent_id UUID REFERENCES forum_posts(id), -- Para replies
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Reações aos posts
CREATE TABLE forum_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES forum_posts(id),
  user_id UUID REFERENCES auth.users(id),
  type VARCHAR NOT NULL CHECK (type IN ('like', 'dislike', 'helpful')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(post_id, user_id, type)
);

-- Notas do caderno
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  title VARCHAR NOT NULL,
  content TEXT NOT NULL,
  markdown_content TEXT,
  tags TEXT[],
  folder VARCHAR,
  embedding VECTOR(1536), -- Para busca semântica
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Links entre notas
CREATE TABLE note_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_note_id UUID REFERENCES notes(id),
  to_note_id UUID REFERENCES notes(id),
  context TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(from_note_id, to_note_id)
);

-- Tags das notas
CREATE TABLE note_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name VARCHAR NOT NULL,
  color VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Sessões Pomodoro
CREATE TABLE pomodoro_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  duration INTEGER NOT NULL, -- em minutos
  type VARCHAR NOT NULL CHECK (type IN ('work', 'short_break', 'long_break')),
  subject VARCHAR,
  note_id UUID REFERENCES notes(id),
  completed BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP
);

-- Estatísticas de estudo
CREATE TABLE study_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  date DATE NOT NULL,
  total_minutes INTEGER DEFAULT 0,
  completed_pomodoros INTEGER DEFAULT 0,
  subjects_studied TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Integrações Spotify
CREATE TABLE spotify_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  spotify_user_id VARCHAR NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Playlists Spotify
CREATE TABLE spotify_playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  spotify_id VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  description TEXT,
  subject VARCHAR,
  mood VARCHAR CHECK (mood IN ('focus', 'relax', 'energetic')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Preferências musicais
CREATE TABLE music_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  preferred_genres TEXT[],
  spotify_connected BOOLEAN DEFAULT FALSE,
  auto_play BOOLEAN DEFAULT FALSE,
  volume_level INTEGER DEFAULT 50,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Perfis de usuário
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  display_name VARCHAR,
  bio TEXT,
  location VARCHAR,
  concursos_interesse TEXT[],
  nivel_estudos VARCHAR CHECK (nivel_estudos IN ('iniciante', 'intermediario', 'avancado')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Configurações do usuário
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  notifications JSONB DEFAULT '{"email": true, "push": true}',
  theme VARCHAR DEFAULT 'light',
  language VARCHAR DEFAULT 'pt-BR',
  pomodoro_duration INTEGER DEFAULT 25,
  break_duration INTEGER DEFAULT 5,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Planos de assinatura
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  stripe_price_id VARCHAR UNIQUE,
  price_cents INTEGER NOT NULL,
  interval VARCHAR NOT NULL CHECK (interval IN ('month', 'year')),
  features JSONB NOT NULL,
  limits JSONB NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Assinaturas dos usuários
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  plan_id UUID REFERENCES subscription_plans(id),
  stripe_customer_id VARCHAR,
  stripe_subscription_id VARCHAR UNIQUE,
  status VARCHAR NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid')),
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Tracking de uso
CREATE TABLE usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  feature VARCHAR NOT NULL,
  date DATE NOT NULL,
  count INTEGER DEFAULT 1,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, feature, date)
);

-- Histórico de pagamentos
CREATE TABLE payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  stripe_payment_intent_id VARCHAR UNIQUE,
  amount_cents INTEGER NOT NULL,
  currency VARCHAR DEFAULT 'brl',
  status VARCHAR NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Analytics de uso de funcionalidades
CREATE TABLE feature_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  feature VARCHAR NOT NULL,
  action VARCHAR NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_concursos_estado ON concursos(estado);
CREATE INDEX idx_concursos_data_prova ON concursos(data_prova);
CREATE INDEX idx_cronogramas_user_id ON cronogramas(user_id);
CREATE INDEX idx_questoes_materia ON questoes(materia);
CREATE INDEX idx_questoes_assunto ON questoes(assunto);
CREATE INDEX idx_simulados_user_id ON simulados(user_id);
CREATE INDEX idx_forum_threads_category ON forum_threads(category);
CREATE INDEX idx_forum_posts_thread_id ON forum_posts(thread_id);
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_embedding ON notes USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_pomodoro_sessions_user_id ON pomodoro_sessions(user_id);
CREATE INDEX idx_usage_tracking_user_feature_date ON usage_tracking(user_id, feature, date);

-- RLS (Row Level Security) políticas
ALTER TABLE cronogramas ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE pomodoro_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE spotify_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE spotify_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulados ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulado_respostas ENABLE ROW LEVEL SECURITY;

-- Políticas básicas de acesso (usuário pode acessar apenas seus próprios dados)
CREATE POLICY "Users can view own cronogramas" ON cronogramas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cronogramas" ON cronogramas FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas do fórum (acesso público para leitura, autenticado para escrita)
CREATE POLICY "Anyone can view forum threads" ON forum_threads FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create forum threads" ON forum_threads FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Anyone can view forum posts" ON forum_posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create forum posts" ON forum_posts FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Políticas das notas (privadas por usuário)
CREATE POLICY "Users can manage own notes" ON notes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own note links" ON note_links FOR ALL USING (
  EXISTS (SELECT 1 FROM notes WHERE notes.id = note_links.from_note_id AND notes.user_id = auth.uid())
);

-- Políticas do Pomodoro (privadas por usuário)
CREATE POLICY "Users can manage own pomodoro sessions" ON pomodoro_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own study stats" ON study_stats FOR ALL USING (auth.uid() = user_id);

-- Políticas de perfil e configurações
CREATE POLICY "Users can manage own profile" ON user_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own settings" ON user_settings FOR ALL USING (auth.uid() = user_id);

-- Políticas de assinatura
CREATE POLICY "Users can view own subscription" ON user_subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Políticas de tracking (apenas inserção pelos usuários)
CREATE POLICY "Users can track own usage" ON usage_tracking FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas dos simulados
CREATE POLICY "Users can manage own simulados" ON simulados FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own simulado respostas" ON simulado_respostas FOR ALL USING (
  EXISTS (SELECT 1 FROM simulados WHERE simulados.id = simulado_respostas.simulado_id AND simulados.user_id = auth.uid())
);