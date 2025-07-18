# Changelog - Concursify

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

## [0.3.0] - 2025-01-15

### ✨ Novas Funcionalidades

#### 🔐 Sistema de Autenticação Completo
- **Contexto de autenticação** React com gerenciamento de estado global
- **APIs de autenticação** integradas com Supabase:
  - 📝 Cadastro (`/api/auth/signup`)
  - 🔑 Login (`/api/auth/signin`)
  - 🚪 Logout (`/api/auth/signout`)
- **Criação automática de perfil** com dados iniciais
- **Configurações padrão** para novos usuários
- **Tracking de eventos** de cadastro e login

#### 👤 Sistema de Perfil de Usuário
- **Perfil automático** criado no cadastro
- **Configurações personalizáveis**:
  - 🎨 Tema (claro/escuro)
  - 🔔 Notificações (email/push)
  - ⏰ Preferências Pomodoro
  - 🌍 Localização e idioma
- **Preferências musicais** para integração Spotify
- **Estatísticas do fórum** inicializadas

#### 💎 Sistema de Monetização Inteligente
- **Verificação de plano** em tempo real
- **Limitações por funcionalidade**:
  - 🆓 Plano Gratuito: 1 cronograma/mês, 3 simulados/mês, 10 notas
  - 💰 Plano Premium: Recursos ilimitados
- **Controle de acesso** baseado em features
- **Tracking de uso** mensal para aplicar limitações

#### 🏗️ Infraestrutura Aprimorada
- **AuthProvider** global para gerenciar estado de autenticação
- **Migração de banco** robusta com verificações condicionais
- **Índices otimizados** para melhor performance
- **Triggers automáticos** para contadores e estatísticas

### 🔧 Melhorias Técnicas

#### 🗃️ Banco de Dados
- **Migrations corrigidas** com verificações de existência
- **Índices condicionais** para evitar erros de ordem
- **Triggers protegidos** contra tabelas inexistentes
- **Extensões opcionais** (vector) com fallback

#### 🎨 Interface
- **Página de cadastro** integrada com API real
- **Tratamento de erros** amigável ao usuário
- **Validação de formulários** no frontend e backend
- **Feedback visual** durante operações

### 🐛 Correções
- **Erros de TypeScript** em rotas de API resolvidos
- **Problema do header azul** em modo escuro corrigido
- **Migrations falhando** por dependências de ordem
- **Tipos de autenticação** do NextAuth corrigidos

## [0.2.0] - 2025-07-18

### ✨ Novas Funcionalidades

#### 🏗️ Infraestrutura Completa
- **Next.js 15** configurado com App Router e TypeScript
- **Supabase Pro** com esquemas completos para todos os módulos
- **Stripe** integrado para sistema de monetização freemium
- **Sistema de limitações** por plano de assinatura
- **Middleware** de autenticação e verificação de acesso
- **Estrutura modular** organizada por funcionalidades

#### 📚 Módulo de Concursos
- **Web scraping PCI Concursos** com validação e deduplicação
- **Integração Gemini AI** para geração de cronogramas personalizados
- **Sistema de exportação múltipla**:
  - 📄 PDF (com marca d'água para plano gratuito)
  - 📅 ICS (calendário)
  - 📱 WhatsApp (mensagens formatadas)
- **Server Actions** para CRUD completo
- **APIs de exportação** com diferentes formatos
- **Busca e filtros** avançados por estado, órgão, matérias

#### 🤖 Sistema de IA
- **Google Gemini AI** para cronogramas personalizados
- **Análise de preferências** do usuário
- **Geração de dicas** personalizadas
- **Validação automática** de dados com schemas Zod

#### 💰 Sistema de Monetização
- **Planos freemium** (Gratuito, Premium Mensal, Premium Anual)
- **Limitações inteligentes** por funcionalidade
- **Webhooks Stripe** para processamento de pagamentos
- **Tracking automático** de uso de funcionalidades
- **Middleware de verificação** de limites

### 🗄️ Banco de Dados

#### Tabelas Implementadas
- `concursos` - Editais extraídos via scraping
- `cronogramas` - Cronogramas gerados pela IA
- `questoes` - Banco de questões para simulados (preparado)
- `simulados` - Sistema de simulados (preparado)
- `forum_threads` - Threads do fórum (preparado)
- `forum_posts` - Posts do fórum (preparado)
- `notes` - Caderno estilo Obsidian (preparado)
- `pomodoro_sessions` - Sessões de estudo (preparado)
- `spotify_integrations` - Integração musical (preparado)
- `user_profiles` - Perfis estendidos de usuário
- `user_settings` - Configurações personalizadas
- `subscription_plans` - Planos de assinatura
- `user_subscriptions` - Assinaturas dos usuários
- `usage_tracking` - Tracking de uso de funcionalidades
- `payment_history` - Histórico de pagamentos

#### Funcionalidades SQL
- **RLS (Row Level Security)** implementado
- **Triggers automáticos** para updated_at
- **Funções personalizadas** para tracking de uso
- **Índices otimizados** para performance
- **Auto-tracking** de uso de funcionalidades

### 🔧 Configurações

#### Dependências Adicionadas
- `@supabase/supabase-js` - Cliente Supabase
- `@google/generative-ai` - Google Gemini AI
- `stripe` + `@stripe/stripe-js` - Pagamentos
- `cheerio` - Web scraping
- `pdfkit` - Geração de PDF
- `next-auth` - Autenticação
- `zod` - Validação de schemas

#### Variáveis de Ambiente
- Supabase (URL, keys)
- Google Gemini API
- Stripe (secret key, publishable key, webhook secret)
- NextAuth (secret, URL)

### 📁 Estrutura de Arquivos

```
app/
├── actions/              # Server Actions
│   ├── concursos.ts     # CRUD de concursos
│   └── cronogramas.ts   # CRUD de cronogramas
├── api/                 # API Routes
│   ├── auth/           # NextAuth
│   ├── payments/       # Webhooks Stripe
│   ├── scraping/       # APIs de scraping
│   └── cronogramas/    # APIs de exportação
├── concursos/          # Módulo de concursos
├── simulados/          # Módulo de simulados (preparado)
├── forum/              # Módulo do fórum (preparado)
├── caderno/            # Módulo de notas (preparado)
├── pomodoro/           # Módulo de produtividade (preparado)
├── spotify/            # Integração musical (preparado)
└── subscription/       # Sistema de assinaturas (preparado)

lib/
├── supabase.ts         # Cliente Supabase
├── stripe.ts           # Configuração Stripe
├── ai/                 # Integração com IA
│   └── gemini.ts       # Google Gemini AI
├── scraping/           # Sistema de web scraping
│   └── pci-scraper.ts  # Scraper PCI Concursos
├── exports/            # Sistema de exportação
│   ├── pdf-generator.ts    # Geração de PDF
│   ├── calendar-export.ts  # Exportação calendário
│   └── whatsapp-export.ts  # Mensagens WhatsApp
├── subscription/       # Sistema de limitações
│   └── limits.ts       # Controle de limites por plano
└── middleware/         # Middlewares customizados
    └── subscription-check.ts  # Verificação de acesso

supabase/
└── migrations/         # Migrações SQL
    ├── 001_initial_schema.sql    # Schema inicial
    ├── 002_seed_data.sql         # Dados iniciais
    └── 003_usage_functions.sql   # Funções de uso
```

### 🚀 Próximos Passos

#### Em Desenvolvimento
- [ ] **Sistema de Simulados** (Fase 3 - 10h)
  - Banco de questões inteligente
  - Geração automática com IA
  - Correção e feedback personalizado
  - Analytics de performance

#### Planejado
- [ ] **Fórum Colaborativo** (Fase 4 - 4h)
- [ ] **Caderno Obsidian** (Fase 5 - 5h)
- [ ] **Pomodoro Integrado** (Fase 6 - 2h)
- [ ] **Integração Spotify** (Fase 7 - 3h)
- [ ] **UI/UX Polish** (Fase 8 - 4h)
- [ ] **Deploy em Produção** (Fase 10 - 1h)

### 📊 Estatísticas

- **Total de arquivos criados**: 20+
- **Linhas de código**: 3000+
- **Funcionalidades implementadas**: 70% da Fase 1 e 2
- **Tempo investido**: 5 horas
- **Progresso geral**: 20% do projeto total

### 🔄 Processo de Desenvolvimento

- ✅ **Fase 1**: Infraestrutura e Setup (2h) - **CONCLUÍDA**
- ✅ **Fase 2**: Módulo de Concursos (3h) - **CONCLUÍDA**
- 🔄 **Fase 3**: Sistema de Simulados (10h) - **EM ANDAMENTO**

### 🎯 Metas Atingidas

- [x] Configuração completa da infraestrutura
- [x] Sistema de monetização funcional
- [x] Web scraping automatizado
- [x] IA integrada para cronogramas
- [x] Sistema de exportação múltipla
- [x] Banco de dados estruturado
- [x] Autenticação e autorização

---

## [0.1.0] - 2025-07-17

### 🎉 Versão Inicial
- Projeto Next.js 15 criado
- shadcn/ui configurado
- Interface inicial implementada
- Estrutura básica de componentes