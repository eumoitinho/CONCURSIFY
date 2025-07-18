-- Inserir planos de assinatura
INSERT INTO subscription_plans (name, stripe_price_id, price_cents, interval, features, limits) VALUES
(
  'Gratuito',
  NULL,
  0,
  'month',
  '{"cronogramas": true, "notas": true, "pomodoro": true, "forum": true, "spotify": true, "simulados": true}',
  '{"cronogramas": 1, "notas": 10, "pomodoro_sessions": 5, "forum_posts": 3, "spotify_playlists": 1, "simulados": 3, "pdf_export": false, "backup": false, "priority_support": false}'
),
(
  'Premium Mensal',
  'price_premium_monthly', -- Será substituído pelo ID real do Stripe
  3990,
  'month',
  '{"cronogramas": true, "notas": true, "pomodoro": true, "forum": true, "spotify": true, "simulados": true, "pdf_export": true, "backup": true, "priority_support": true, "vip_forum_access": true, "advanced_analytics": true}',
  '{"cronogramas": "unlimited", "notas": "unlimited", "pomodoro_sessions": "unlimited", "forum_posts": "unlimited", "spotify_playlists": "unlimited", "simulados": "unlimited", "pdf_export": true, "backup": true, "priority_support": true}'
),
(
  'Premium Anual',
  'price_premium_yearly', -- Será substituído pelo ID real do Stripe
  39900,
  'year',
  '{"cronogramas": true, "notas": true, "pomodoro": true, "forum": true, "spotify": true, "simulados": true, "pdf_export": true, "backup": true, "priority_support": true, "vip_forum_access": true, "advanced_analytics": true}',
  '{"cronogramas": "unlimited", "notas": "unlimited", "pomodoro_sessions": "unlimited", "forum_posts": "unlimited", "spotify_playlists": "unlimited", "simulados": "unlimited", "pdf_export": true, "backup": true, "priority_support": true}'
);

-- Inserir algumas categorias de tags padrão
INSERT INTO note_tags (user_id, name, color) VALUES
-- Estas serão tags globais/padrão, user_id será NULL para indicar que são globais
(NULL, 'Constitucional', '#FF723A'),
(NULL, 'Administrativo', '#E55A2B'),
(NULL, 'Penal', '#EF4444'),
(NULL, 'Civil', '#FFB08A'),
(NULL, 'Processual', '#F59E0B'),
(NULL, 'Tributário', '#FF723A'),
(NULL, 'Matemática', '#84CC16'),
(NULL, 'Português', '#F97316'),
(NULL, 'Informática', '#E55A2B'),
(NULL, 'Conhecimentos Gerais', '#64748B');

-- Inserir algumas questões de exemplo
INSERT INTO questoes (texto, alternativas, resposta_correta, explicacao, materia, assunto, orgao, ano, nivel_dificuldade, tags) VALUES
(
  'Segundo a Constituição Federal de 1988, todos são iguais perante a lei, sem distinção de qualquer natureza. Este princípio refere-se ao:',
  '["a) Princípio da legalidade", "b) Princípio da isonomia", "c) Princípio da moralidade", "d) Princípio da impessoalidade", "e) Princípio da publicidade"]',
  'b',
  'O princípio da isonomia, previsto no art. 5º, caput, da CF/88, estabelece que todos são iguais perante a lei, garantindo tratamento igual aos iguais e desigual aos desiguais na medida de suas desigualdades.',
  'Direito Constitucional',
  'Princípios Constitucionais',
  'Exemplo',
  2024,
  'facil',
  '["constitucional", "principios", "isonomia"]'
),
(
  'A Lei nº 8.112/90, que dispõe sobre o regime jurídico dos servidores públicos civis da União, estabelece que o prazo para posse em cargo público é de:',
  '["a) 15 dias", "b) 30 dias", "c) 45 dias", "d) 60 dias", "e) 90 dias"]',
  'b',
  'Conforme o art. 13 da Lei 8.112/90, a posse ocorrerá no prazo de trinta dias contados da publicação do ato de provimento.',
  'Direito Administrativo',
  'Servidores Públicos',
  'Exemplo',
  2024,
  'medio',
  '["administrativo", "servidores", "posse"]'
);

-- Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger de updated_at nas tabelas necessárias
CREATE TRIGGER update_cronogramas_updated_at BEFORE UPDATE ON cronogramas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forum_threads_updated_at BEFORE UPDATE ON forum_threads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forum_posts_updated_at BEFORE UPDATE ON forum_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON user_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_spotify_integrations_updated_at BEFORE UPDATE ON spotify_integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_simulados_updated_at BEFORE UPDATE ON simulados FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();