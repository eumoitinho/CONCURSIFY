-- ============================================
-- CONCURSIFY - Schema Principal Limpo
-- ============================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================
-- TIPOS ENUMERADOS
-- ============================================

-- Status dos posts/threads
DO $$ BEGIN
    CREATE TYPE content_status AS ENUM ('active', 'locked', 'deleted', 'under_review');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Tipos de thread do fórum
DO $$ BEGIN
    CREATE TYPE thread_type AS ENUM ('discussion', 'question', 'study_group', 'announcement', 'doubt');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Níveis de dificuldade
DO $$ BEGIN
    CREATE TYPE difficulty_level AS ENUM ('facil', 'medio', 'dificil');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Status de simulado
DO $$ BEGIN
    CREATE TYPE simulado_status AS ENUM ('em_andamento', 'finalizado', 'pausado');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Tipos de sessão Pomodoro
DO $$ BEGIN
    CREATE TYPE pomodoro_type AS ENUM ('work', 'short_break', 'long_break');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Status de assinatura
DO $$ BEGIN
    CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'unpaid');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- TABELAS PRINCIPAIS
-- ============================================

-- Tabela de concursos
CREATE TABLE IF NOT EXISTS concursos (
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

-- Tabela de questões para simulados
CREATE TABLE IF NOT EXISTS questoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  texto TEXT NOT NULL,
  alternativas JSONB NOT NULL,
  resposta_correta VARCHAR(1) NOT NULL,
  explicacao TEXT,
  materia VARCHAR NOT NULL,
  assunto VARCHAR NOT NULL,
  orgao VARCHAR,
  ano INTEGER,
  nivel_dificuldade difficulty_level,
  tags TEXT[],
  fonte VARCHAR,
  scraped_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- SISTEMA DE USUÁRIOS E PERFIS
-- ============================================

-- Perfis de usuário
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name VARCHAR,
  bio TEXT,
  avatar_url VARCHAR,
  location VARCHAR,
  concursos_interesse TEXT[],
  nivel_estudos VARCHAR CHECK (nivel_estudos IN ('iniciante', 'intermediario', 'avancado')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Configurações do usuário
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  notifications JSONB DEFAULT '{"email": true, "push": true}',
  theme VARCHAR DEFAULT 'light',
  language VARCHAR DEFAULT 'pt-BR',
  pomodoro_duration INTEGER DEFAULT 25,
  break_duration INTEGER DEFAULT 5,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================
-- SISTEMA DE CRONOGRAMAS
-- ============================================

-- Tabela de cronogramas
CREATE TABLE IF NOT EXISTS cronogramas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  concurso_id UUID REFERENCES concursos(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo VARCHAR NOT NULL,
  user_preferences JSONB NOT NULL,
  cronograma_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- SISTEMA DE SIMULADOS
-- ============================================

-- Tabela de simulados
CREATE TABLE IF NOT EXISTS simulados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo VARCHAR NOT NULL,
  configuracao JSONB NOT NULL,
  questoes_ids UUID[],
  status simulado_status DEFAULT 'em_andamento',
  tempo_inicio TIMESTAMP,
  tempo_fim TIMESTAMP,
  pontuacao INTEGER,
  total_questoes INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de respostas do simulado
CREATE TABLE IF NOT EXISTS simulado_respostas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  simulado_id UUID REFERENCES simulados(id) ON DELETE CASCADE,
  questao_id UUID REFERENCES questoes(id) ON DELETE CASCADE,
  resposta_usuario VARCHAR(1),
  resposta_correta VARCHAR(1),
  tempo_resposta INTEGER,
  is_correct BOOLEAN,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- SISTEMA DE FÓRUM
-- ============================================

-- Categorias do fórum
CREATE TABLE IF NOT EXISTS forum_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  description TEXT,
  slug VARCHAR UNIQUE NOT NULL,
  color VARCHAR(7) DEFAULT '#3b82f6',
  icon VARCHAR,
  position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  parent_id UUID REFERENCES forum_categories(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Threads do fórum
CREATE TABLE IF NOT EXISTS forum_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES forum_categories(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL,
  content TEXT NOT NULL,
  slug VARCHAR UNIQUE NOT NULL,
  type thread_type DEFAULT 'discussion',
  status content_status DEFAULT 'active',
  is_pinned BOOLEAN DEFAULT false,
  is_solved BOOLEAN DEFAULT false,
  solved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  solved_at TIMESTAMP,
  views_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  last_post_at TIMESTAMP DEFAULT NOW(),
  last_post_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Posts do fórum
CREATE TABLE IF NOT EXISTS forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES forum_threads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  status content_status DEFAULT 'active',
  is_solution BOOLEAN DEFAULT false,
  upvotes_count INTEGER DEFAULT 0,
  downvotes_count INTEGER DEFAULT 0,
  reports_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Votos nos posts
CREATE TABLE IF NOT EXISTS forum_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type VARCHAR CHECK (vote_type IN ('up', 'down')) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- ============================================
-- SISTEMA DE CADERNO/NOTAS
-- ============================================

-- Notas do caderno
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL,
  content TEXT NOT NULL,
  markdown_content TEXT,
  tags TEXT[],
  folder VARCHAR,
  embedding VECTOR(1536),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Links entre notas
CREATE TABLE IF NOT EXISTS note_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
  to_note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
  context TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(from_note_id, to_note_id)
);

-- Tags das notas
CREATE TABLE IF NOT EXISTS note_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  color VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- ============================================
-- SISTEMA POMODORO
-- ============================================

-- Sessões Pomodoro
CREATE TABLE IF NOT EXISTS pomodoro_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  duration INTEGER NOT NULL,
  type pomodoro_type NOT NULL,
  subject VARCHAR,
  note_id UUID REFERENCES notes(id) ON DELETE SET NULL,
  completed BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP
);

-- Estatísticas de estudo
CREATE TABLE IF NOT EXISTS study_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_minutes INTEGER DEFAULT 0,
  completed_pomodoros INTEGER DEFAULT 0,
  subjects_studied TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- ============================================
-- SISTEMA SPOTIFY
-- ============================================

-- Integrações Spotify
CREATE TABLE IF NOT EXISTS spotify_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  spotify_user_id VARCHAR NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Playlists Spotify
CREATE TABLE IF NOT EXISTS spotify_playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  spotify_id VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  description TEXT,
  subject VARCHAR,
  mood VARCHAR CHECK (mood IN ('focus', 'relax', 'energetic')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Preferências musicais
CREATE TABLE IF NOT EXISTS music_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_genres TEXT[],
  spotify_connected BOOLEAN DEFAULT FALSE,
  auto_play BOOLEAN DEFAULT FALSE,
  volume_level INTEGER DEFAULT 50,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================
-- SISTEMA DE ASSINATURAS
-- ============================================

-- Planos de assinatura
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR UNIQUE NOT NULL,
  description TEXT,
  stripe_price_id_monthly VARCHAR UNIQUE,
  stripe_price_id_yearly VARCHAR UNIQUE,
  price_monthly INTEGER NOT NULL,
  price_yearly INTEGER NOT NULL,
  features JSONB NOT NULL DEFAULT '{}',
  limits JSONB NOT NULL DEFAULT '{}',
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Assinaturas dos usuários
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id) ON DELETE SET NULL,
  stripe_customer_id VARCHAR,
  stripe_subscription_id VARCHAR UNIQUE,
  status subscription_status NOT NULL,
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Histórico de pagamentos
CREATE TABLE IF NOT EXISTS payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_payment_intent_id VARCHAR UNIQUE,
  amount_cents INTEGER NOT NULL,
  currency VARCHAR DEFAULT 'brl',
  status VARCHAR NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- SISTEMA DE TRACKING E ANALYTICS
-- ============================================

-- Tracking de uso
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  feature VARCHAR NOT NULL,
  date DATE NOT NULL,
  count INTEGER DEFAULT 1,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, feature, date)
);

-- Analytics de uso de funcionalidades
CREATE TABLE IF NOT EXISTS feature_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  feature VARCHAR NOT NULL,
  action VARCHAR NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Estatísticas do usuário no fórum
CREATE TABLE IF NOT EXISTS forum_user_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  threads_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  upvotes_received INTEGER DEFAULT 0,
  downvotes_received INTEGER DEFAULT 0,
  solutions_count INTEGER DEFAULT 0,
  reputation_score INTEGER DEFAULT 0,
  last_activity TIMESTAMP DEFAULT NOW(),
  join_date TIMESTAMP DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  updated_at TIMESTAMP DEFAULT NOW()
);