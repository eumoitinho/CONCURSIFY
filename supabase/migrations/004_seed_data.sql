-- ============================================
-- CONCURSIFY - Dados Iniciais (Seed Data)
-- ============================================

-- ============================================
-- CATEGORIAS DO FÓRUM
-- ============================================

-- Inserir categorias padrão do fórum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM forum_categories WHERE slug = 'geral') THEN
    INSERT INTO forum_categories (name, description, slug, color, icon, position) VALUES
    ('Geral', 'Discussões gerais sobre concursos públicos', 'geral', '#3b82f6', 'MessageCircle', 1),
    ('Dúvidas de Estudo', 'Tire suas dúvidas sobre matérias e conteúdos', 'duvidas', '#10b981', 'HelpCircle', 2),
    ('Direito Constitucional', 'Discussões sobre Direito Constitucional', 'direito-constitucional', '#8b5cf6', 'Scale', 3),
    ('Direito Administrativo', 'Discussões sobre Direito Administrativo', 'direito-administrativo', '#f59e0b', 'Building', 4),
    ('Português', 'Língua Portuguesa para concursos', 'portugues', '#ef4444', 'BookOpen', 5),
    ('Matemática', 'Matemática e Raciocínio Lógico', 'matematica', '#06b6d4', 'Calculator', 6),
    ('Informática', 'Noções de Informática', 'informatica', '#84cc16', 'Monitor', 7),
    ('Experiências', 'Compartilhe sua experiência em concursos', 'experiencias', '#f97316', 'Star', 8),
    ('Grupos de Estudo', 'Forme e participe de grupos de estudo', 'grupos-estudo', '#ec4899', 'Users', 9),
    ('Concursos Abertos', 'Discussões sobre editais em aberto', 'concursos-abertos', '#14b8a6', 'Briefcase', 10);
  END IF;
END $$;

-- ============================================
-- PLANOS DE ASSINATURA
-- ============================================

-- Inserir planos de assinatura padrão
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM subscription_plans WHERE name = 'Gratuito') THEN
    INSERT INTO subscription_plans (
      name, 
      description, 
      price_monthly, 
      price_yearly, 
      features, 
      limits, 
      is_popular, 
      sort_order
    ) VALUES
    (
      'Gratuito',
      'Ideal para começar seus estudos',
      0,
      0,
      '{"cronogramas": true, "simulados": true, "forum": true, "caderno": true, "pomodoro": true}',
      '{"cronogramas": 3, "simulados": 5, "notas": 50, "forum_posts": 10, "pomodoro_sessions": 10, "spotify_playlists": 0, "pdf_export": false, "backup": false, "priority_support": false}',
      false,
      1
    ),
    (
      'Estudante',
      'Para estudantes dedicados',
      1990,
      19900,
      '{"cronogramas": true, "simulados": true, "forum": true, "caderno": true, "pomodoro": true, "spotify": true, "pdf_export": true}',
      '{"cronogramas": 10, "simulados": 50, "notas": 500, "forum_posts": 100, "pomodoro_sessions": 100, "spotify_playlists": 5, "pdf_export": true, "backup": true, "priority_support": false}',
      true,
      2
    ),
    (
      'Profissional',
      'Para quem quer o máximo desempenho',
      3990,
      39900,
      '{"cronogramas": true, "simulados": true, "forum": true, "caderno": true, "pomodoro": true, "spotify": true, "pdf_export": true, "analytics": true, "priority_support": true}',
      '{"cronogramas": -1, "simulados": -1, "notas": -1, "forum_posts": -1, "pomodoro_sessions": -1, "spotify_playlists": -1, "pdf_export": true, "backup": true, "priority_support": true}',
      false,
      3
    );
  END IF;
END $$;

-- ============================================
-- QUESTÕES DE EXEMPLO
-- ============================================

-- Inserir algumas questões de exemplo
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM questoes LIMIT 1) THEN
    INSERT INTO questoes (
      texto, 
      alternativas, 
      resposta_correta, 
      explicacao, 
      materia, 
      assunto, 
      orgao, 
      ano, 
      nivel_dificuldade, 
      tags,
      fonte
    ) VALUES
    (
      'Segundo a Constituição Federal de 1988, são direitos sociais:',
      '["a) educação, saúde e segurança pública", "b) educação, saúde, alimentação, trabalho, moradia, transporte, lazer, segurança, previdência social, proteção à maternidade e à infância, assistência aos desamparados", "c) apenas educação e saúde", "d) apenas trabalho e previdência social", "e) apenas educação, saúde e trabalho"]',
      'b',
      'O artigo 6º da Constituição Federal lista todos os direitos sociais mencionados na alternativa B.',
      'Direito Constitucional',
      'Direitos Sociais',
      'CESPE',
      2023,
      'medio',
      '["constitucional", "direitos-sociais", "cf88"]',
      'Constituição Federal de 1988, Art. 6º'
    ),
    (
      'A administração pública direta é composta por:',
      '["a) apenas ministérios", "b) autarquias e fundações", "c) órgãos que integram a estrutura administrativa da União, Estados, Distrito Federal e Municípios", "d) empresas públicas e sociedades de economia mista", "e) apenas secretarias municipais"]',
      'c',
      'A administração direta é formada pelos órgãos que integram a estrutura administrativa dos entes federativos.',
      'Direito Administrativo',
      'Organização Administrativa',
      'FCC',
      2023,
      'facil',
      '["administrativo", "organizacao", "administracao-direta"]',
      'Lei 9.784/99 e doutrina'
    ),
    (
      'Qual é o resultado da expressão: 2³ + 3² - 4¹?',
      '["a) 13", "b) 12", "c) 11", "d) 10", "e) 9"]',
      'a',
      '2³ = 8, 3² = 9, 4¹ = 4. Então: 8 + 9 - 4 = 13',
      'Matemática',
      'Potenciação',
      'VUNESP',
      2023,
      'facil',
      '["matematica", "potenciacao", "operacoes"]',
      'Matemática Básica'
    );
  END IF;
END $$;

-- ============================================
-- CONCURSOS DE EXEMPLO
-- ============================================

-- Inserir alguns concursos de exemplo
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM concursos LIMIT 1) THEN
    INSERT INTO concursos (
      titulo, 
      orgao, 
      vagas, 
      inscricoes, 
      link, 
      data_prova, 
      materias, 
      estado
    ) VALUES
    (
      'Concurso Público para Analista Judiciário - TRF 1ª Região',
      'Tribunal Regional Federal da 1ª Região',
      '120 vagas',
      'Abertas até 15/03/2024',
      'https://www.cespe.unb.br/concursos/trf1_23',
      '2024-04-20',
      '["Direito Constitucional", "Direito Administrativo", "Português", "Raciocínio Lógico"]',
      'DF'
    ),
    (
      'Concurso Público para Auditor Fiscal - Receita Federal',
      'Receita Federal do Brasil',
      '230 vagas',
      'Abertas até 28/02/2024',
      'https://www.cesgranrio.org.br/concursos/receita_federal_24',
      '2024-05-12',
      '["Direito Tributário", "Direito Constitucional", "Português", "Matemática Financeira", "Contabilidade"]',
      'BR'
    ),
    (
      'Concurso Público para Professor - SEEDF',
      'Secretaria de Educação do Distrito Federal',
      '2500 vagas',
      'Abertas até 10/03/2024',
      'https://www.ibfc.org.br/concursos/seedf_24',
      '2024-04-14',
      '["Conhecimentos Pedagógicos", "Português", "Legislação de Ensino"]',
      'DF'
    );
  END IF;
END $$;