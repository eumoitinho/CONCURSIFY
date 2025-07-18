-- Schema para o sistema de caderno estilo Obsidian

-- Enum para tipos de nota
CREATE TYPE note_type AS ENUM ('note', 'daily', 'template', 'canvas');

-- Enum para status de nota
CREATE TYPE note_status AS ENUM ('active', 'archived', 'deleted');

-- Tabela de notas (equivalente a arquivos no Obsidian)
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title VARCHAR NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  type note_type DEFAULT 'note',
  status note_status DEFAULT 'active',
  slug VARCHAR, -- Para URLs amigáveis
  folder_path VARCHAR DEFAULT '/', -- Caminho da pasta virtual
  tags TEXT[], -- Tags da nota
  
  -- Metadados do arquivo
  file_size INTEGER DEFAULT 0, -- Tamanho em bytes
  word_count INTEGER DEFAULT 0,
  read_time_minutes INTEGER DEFAULT 0,
  
  -- Configurações de visualização
  is_pinned BOOLEAN DEFAULT FALSE,
  is_favorite BOOLEAN DEFAULT FALSE,
  view_mode VARCHAR DEFAULT 'edit', -- 'edit', 'preview', 'split'
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_accessed_at TIMESTAMP DEFAULT NOW(),
  
  -- Índices para busca full-text
  content_vector tsvector GENERATED ALWAYS AS (to_tsvector('portuguese', title || ' ' || content)) STORED
);

-- Tabela de links bidirecionais entre notas
CREATE TABLE note_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_note_id UUID REFERENCES notes(id) ON DELETE CASCADE NOT NULL,
  target_note_id UUID REFERENCES notes(id) ON DELETE CASCADE NOT NULL,
  link_text VARCHAR, -- Texto do link no formato [[link_text]]
  context_before TEXT, -- Contexto antes do link (para preview)
  context_after TEXT, -- Contexto depois do link
  line_number INTEGER, -- Linha onde o link aparece
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(source_note_id, target_note_id, link_text)
);

-- Tabela de blocos/parágrafos para referências de bloco
CREATE TABLE note_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE NOT NULL,
  block_id VARCHAR NOT NULL, -- ID único do bloco (^block-id)
  content TEXT NOT NULL,
  block_type VARCHAR DEFAULT 'paragraph', -- 'paragraph', 'heading', 'list', 'quote', etc.
  position INTEGER NOT NULL, -- Posição do bloco na nota
  parent_block_id UUID REFERENCES note_blocks(id), -- Para blocos aninhados
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(note_id, block_id)
);

-- Tabela de referências de bloco
CREATE TABLE block_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_note_id UUID REFERENCES notes(id) ON DELETE CASCADE NOT NULL,
  target_block_id UUID REFERENCES note_blocks(id) ON DELETE CASCADE NOT NULL,
  reference_text VARCHAR, -- Texto da referência ![[note#^block-id]]
  context_before TEXT,
  context_after TEXT,
  line_number INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(source_note_id, target_block_id)
);

-- Tabela de templates
CREATE TABLE note_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name VARCHAR NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  variables JSONB DEFAULT '{}', -- Variáveis do template como {{date}}, {{title}}, etc.
  is_system BOOLEAN DEFAULT FALSE, -- Templates do sistema vs usuário
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de anexos/arquivos
CREATE TABLE note_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE NOT NULL,
  filename VARCHAR NOT NULL,
  original_filename VARCHAR NOT NULL,
  file_type VARCHAR, -- image, pdf, etc.
  file_size INTEGER,
  storage_path VARCHAR NOT NULL, -- Caminho no storage (Supabase Storage)
  alt_text VARCHAR,
  caption TEXT,
  position_in_note INTEGER, -- Posição do anexo na nota
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de folders/estrutura hierárquica
CREATE TABLE note_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name VARCHAR NOT NULL,
  path VARCHAR NOT NULL, -- Caminho completo /folder/subfolder
  parent_id UUID REFERENCES note_folders(id), -- Para hierarquia
  color VARCHAR(7), -- Cor do folder
  icon VARCHAR, -- Ícone do folder
  is_expanded BOOLEAN DEFAULT TRUE, -- Estado da UI
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, path)
);

-- Tabela de workspace/canvas (para mapas mentais)
CREATE TABLE canvases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title VARCHAR NOT NULL,
  description TEXT,
  canvas_data JSONB NOT NULL DEFAULT '{}', -- Dados do canvas (nodes, edges, etc.)
  width INTEGER DEFAULT 2000,
  height INTEGER DEFAULT 2000,
  zoom_level DECIMAL(3,2) DEFAULT 1.00,
  viewport_x INTEGER DEFAULT 0,
  viewport_y INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de nós do canvas
CREATE TABLE canvas_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canvas_id UUID REFERENCES canvases(id) ON DELETE CASCADE NOT NULL,
  node_id VARCHAR NOT NULL, -- ID único no canvas
  type VARCHAR NOT NULL, -- 'note', 'text', 'image', 'group'
  x_position INTEGER NOT NULL,
  y_position INTEGER NOT NULL,
  width INTEGER DEFAULT 200,
  height INTEGER DEFAULT 100,
  
  -- Conteúdo baseado no tipo
  note_id UUID REFERENCES notes(id), -- Se for tipo 'note'
  text_content TEXT, -- Se for tipo 'text'
  image_url VARCHAR, -- Se for tipo 'image'
  
  -- Estilo
  background_color VARCHAR(7) DEFAULT '#ffffff',
  border_color VARCHAR(7) DEFAULT '#cccccc',
  text_color VARCHAR(7) DEFAULT '#000000',
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(canvas_id, node_id)
);

-- Tabela de conexões do canvas
CREATE TABLE canvas_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  canvas_id UUID REFERENCES canvases(id) ON DELETE CASCADE NOT NULL,
  edge_id VARCHAR NOT NULL, -- ID único no canvas
  source_node_id VARCHAR NOT NULL, -- ID do nó de origem
  target_node_id VARCHAR NOT NULL, -- ID do nó de destino
  
  -- Pontos de conexão
  source_point VARCHAR DEFAULT 'center', -- 'top', 'bottom', 'left', 'right', 'center'
  target_point VARCHAR DEFAULT 'center',
  
  -- Estilo da conexão
  stroke_color VARCHAR(7) DEFAULT '#cccccc',
  stroke_width INTEGER DEFAULT 2,
  line_type VARCHAR DEFAULT 'straight', -- 'straight', 'curved', 'step'
  
  -- Label da conexão
  label VARCHAR,
  label_position DECIMAL(3,2) DEFAULT 0.5, -- Posição do label (0-1)
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(canvas_id, edge_id)
);

-- Tabela de configurações do usuário para o caderno
CREATE TABLE caderno_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  
  -- Configurações gerais
  default_folder_path VARCHAR DEFAULT '/',
  default_note_type note_type DEFAULT 'note',
  auto_save_interval INTEGER DEFAULT 30, -- segundos
  
  -- Configurações de editor
  editor_theme VARCHAR DEFAULT 'light', -- 'light', 'dark', 'auto'
  font_family VARCHAR DEFAULT 'system',
  font_size INTEGER DEFAULT 14,
  line_height DECIMAL(3,1) DEFAULT 1.5,
  
  -- Configurações de linking
  auto_link_detection BOOLEAN DEFAULT TRUE,
  show_link_previews BOOLEAN DEFAULT TRUE,
  auto_complete_links BOOLEAN DEFAULT TRUE,
  
  -- Configurações de sincronização
  sync_enabled BOOLEAN DEFAULT TRUE,
  offline_mode BOOLEAN DEFAULT FALSE,
  
  -- Layout e UI
  sidebar_collapsed BOOLEAN DEFAULT FALSE,
  show_word_count BOOLEAN DEFAULT TRUE,
  show_character_count BOOLEAN DEFAULT FALSE,
  vim_mode BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de histórico de versões das notas
CREATE TABLE note_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID REFERENCES notes(id) ON DELETE CASCADE NOT NULL,
  version_number INTEGER NOT NULL,
  title VARCHAR NOT NULL,
  content TEXT NOT NULL,
  change_summary VARCHAR, -- Resumo das mudanças
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(note_id, version_number)
);

-- Tabela de sessões de estudo (integração com Pomodoro)
CREATE TABLE study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  note_id UUID REFERENCES notes(id),
  canvas_id UUID REFERENCES canvases(id),
  
  -- Dados da sessão
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  duration_minutes INTEGER,
  session_type VARCHAR DEFAULT 'study', -- 'study', 'review', 'break'
  
  -- Produtividade
  words_written INTEGER DEFAULT 0,
  notes_created INTEGER DEFAULT 0,
  links_created INTEGER DEFAULT 0,
  
  -- Metadados
  focus_score INTEGER, -- 1-10
  notes_session TEXT, -- Notas sobre a sessão
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Inserir templates padrão do sistema
INSERT INTO note_templates (name, description, content, variables, is_system, user_id) VALUES
('Nota Diária', 'Template para notas diárias de estudo', E'# {{date}}\n\n## Objetivos do Dia\n- [ ] \n- [ ] \n- [ ] \n\n## Estudos Realizados\n\n\n## Dúvidas\n\n\n## Reflexões\n\n\n## Próximos Passos\n\n\n---\n*Criado em {{datetime}}*', '{"date": "YYYY-MM-DD", "datetime": "YYYY-MM-DD HH:mm"}', true, (SELECT id FROM auth.users LIMIT 1)),

('Resumo de Matéria', 'Template para resumos de matérias', E'# {{subject}}\n\n## Conceitos Principais\n\n### {{concept1}}\n\n\n### {{concept2}}\n\n\n## Fórmulas e Regras\n\n\n## Exemplos Práticos\n\n\n## Dicas para Memorização\n\n\n## Questões Importantes\n\n\n## Links Relacionados\n- [[]], '{"subject": "Nome da Matéria", "concept1": "Conceito 1", "concept2": "Conceito 2"}', true, (SELECT id FROM auth.users LIMIT 1)),

('Plano de Estudos', 'Template para planejamento de estudos', E'# Plano de Estudos - {{period}}\n\n## Objetivo\n{{goal}}\n\n## Cronograma\n\n### Semana 1\n- [ ] \n- [ ] \n\n### Semana 2\n- [ ] \n- [ ] \n\n### Semana 3\n- [ ] \n- [ ] \n\n### Semana 4\n- [ ] \n- [ ] \n\n## Recursos Necessários\n- \n- \n\n## Marcos e Avaliações\n- {{milestone1}}\n- {{milestone2}}\n\n## Observações\n', '{"period": "Mês/Período", "goal": "Objetivo do plano", "milestone1": "Marco 1", "milestone2": "Marco 2"}', true, (SELECT id FROM auth.users LIMIT 1)),

('Questão Comentada', 'Template para análise de questões', E'# Questão {{question_number}} - {{subject}}\n\n## Enunciado\n{{question_text}}\n\n## Alternativas\nA) \nB) \nC) \nD) \nE) \n\n## Resposta Correta\n**{{correct_answer}}**\n\n## Comentário\n\n\n## Conceitos Envolvidos\n- [[conceito1]]\n- [[conceito2]]\n\n## Dicas para Resolução\n\n\n## Questões Similares\n- [[questao1]]\n- [[questao2]]\n\n---\n*Fonte: {{source}}*\n*Data: {{date}}*', '{"question_number": "001", "subject": "Matéria", "question_text": "Texto da questão", "correct_answer": "A", "source": "Fonte", "date": "YYYY-MM-DD"}', true, (SELECT id FROM auth.users LIMIT 1));

-- Índices para performance
CREATE INDEX idx_notes_user_status ON notes(user_id, status);
CREATE INDEX idx_notes_folder_path ON notes(user_id, folder_path);
CREATE INDEX idx_notes_tags ON notes USING GIN(tags);
CREATE INDEX idx_notes_updated_at ON notes(updated_at DESC);
CREATE INDEX idx_notes_content_search ON notes USING GIN(content_vector);

CREATE INDEX idx_note_links_source ON note_links(source_note_id);
CREATE INDEX idx_note_links_target ON note_links(target_note_id);

CREATE INDEX idx_note_blocks_note ON note_blocks(note_id, position);
CREATE INDEX idx_block_references_source ON block_references(source_note_id);
CREATE INDEX idx_block_references_target ON block_references(target_block_id);

CREATE INDEX idx_canvas_nodes_canvas ON canvas_nodes(canvas_id);
CREATE INDEX idx_canvas_edges_canvas ON canvas_edges(canvas_id);

-- Triggers para atualizar timestamps
CREATE OR REPLACE FUNCTION update_note_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  
  -- Atualizar estatísticas
  NEW.word_count = array_length(string_to_array(trim(NEW.content), ' '), 1);
  NEW.file_size = length(NEW.content);
  NEW.read_time_minutes = GREATEST(1, ROUND(NEW.word_count / 200.0)); -- 200 WPM
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_note_timestamp
  BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION update_note_timestamp();

-- Trigger para criar links bidirecionais automaticamente
CREATE OR REPLACE FUNCTION extract_note_links()
RETURNS TRIGGER AS $$
DECLARE
  link_matches TEXT[];
  link_text TEXT;
  target_note notes%ROWTYPE;
  line_num INTEGER := 1;
  content_lines TEXT[];
  line TEXT;
BEGIN
  -- Deletar links antigos desta nota
  DELETE FROM note_links WHERE source_note_id = NEW.id;
  
  -- Extrair linhas do conteúdo
  content_lines := string_to_array(NEW.content, E'\n');
  
  -- Buscar por padrões [[link]] em cada linha
  FOREACH line IN ARRAY content_lines LOOP
    -- Regex para encontrar [[texto]] ou [[nota|alias]]
    link_matches := regexp_split_to_array(line, '\[\[([^\]]+)\]\]');
    
    -- Processar cada match encontrado
    FOR i IN 2..array_length(link_matches, 1) BY 2 LOOP
      link_text := split_part(link_matches[i], '|', 1); -- Pegar parte antes do |
      
      -- Buscar nota de destino pelo título ou slug
      SELECT * INTO target_note 
      FROM notes 
      WHERE user_id = NEW.user_id 
        AND status = 'active'
        AND (title ILIKE link_text OR slug = lower(replace(link_text, ' ', '-')))
      LIMIT 1;
      
      -- Se encontrou a nota, criar o link
      IF target_note.id IS NOT NULL THEN
        INSERT INTO note_links (source_note_id, target_note_id, link_text, line_number)
        VALUES (NEW.id, target_note.id, link_text, line_num)
        ON CONFLICT (source_note_id, target_note_id, link_text) DO NOTHING;
      END IF;
    END LOOP;
    
    line_num := line_num + 1;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_extract_note_links
  AFTER INSERT OR UPDATE OF content ON notes
  FOR EACH ROW EXECUTE FUNCTION extract_note_links();

-- Trigger para versionamento automático
CREATE OR REPLACE FUNCTION create_note_version()
RETURNS TRIGGER AS $$
BEGIN
  -- Criar versão apenas se o conteúdo mudou significativamente
  IF OLD.content IS DISTINCT FROM NEW.content AND 
     length(NEW.content) - length(OLD.content) > 50 THEN
    
    INSERT INTO note_versions (note_id, version_number, title, content, created_by)
    VALUES (
      NEW.id,
      COALESCE((SELECT MAX(version_number) FROM note_versions WHERE note_id = NEW.id), 0) + 1,
      OLD.title,
      OLD.content,
      NEW.user_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_note_version
  AFTER UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION create_note_version();

-- RLS (Row Level Security)
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE block_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvases ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE caderno_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança

-- Notas: usuários só veem suas próprias notas
CREATE POLICY "Users can view own notes" ON notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own notes" ON notes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes" ON notes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes" ON notes
  FOR DELETE USING (auth.uid() = user_id);

-- Links: acesso baseado nas notas
CREATE POLICY "Users can view own note links" ON note_links
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM notes WHERE id = source_note_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can manage own note links" ON note_links
  FOR ALL USING (
    EXISTS (SELECT 1 FROM notes WHERE id = source_note_id AND user_id = auth.uid())
  );

-- Templates: acesso a próprios templates e templates do sistema
CREATE POLICY "Users can view accessible templates" ON note_templates
  FOR SELECT USING (user_id = auth.uid() OR is_system = true);

CREATE POLICY "Users can manage own templates" ON note_templates
  FOR ALL USING (user_id = auth.uid());

-- Outras tabelas seguem o mesmo padrão
CREATE POLICY "Users can manage own folders" ON note_folders
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own canvases" ON canvases
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own settings" ON caderno_settings
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own study sessions" ON study_sessions
  FOR ALL USING (auth.uid() = user_id);