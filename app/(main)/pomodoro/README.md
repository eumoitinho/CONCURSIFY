# Sistema Pomodoro Integrado

## Visão Geral

O módulo Pomodoro é um sistema avançado de gerenciamento de tempo que utiliza a técnica Pomodoro adaptada com inteligência artificial para maximizar a produtividade dos estudos.

## Funcionalidades Principais

### 🧠 Timer Adaptativo com IA
- **Algoritmo de Aprendizado**: A IA aprende com seus padrões de estudo e adapta as durações das sessões
- **Contexto Inteligente**: Considera horário, energia, ambiente e dificuldade do conteúdo
- **Recomendações Personalizadas**: Sugere durações ótimas baseadas no histórico pessoal

### ⏱️ Timer Interativo
- **Controles Intuitivos**: Start, pause, stop com interface responsiva
- **Feedback Visual**: Progress bar, countdown timer e indicadores de status
- **Notificações**: Som, vibração e notificações desktop configuráveis

### 📊 Tracking Completo
- **Métricas Detalhadas**: Produtividade, foco, energia antes/depois
- **Sessões Customizáveis**: Foco, estudo profundo, revisão, pausas
- **Interrupções**: Registro e categorização de interrupções

### 🏆 Gamificação
- **Sistema de Conquistas**: Badges por marcos e consistência
- **Metas Personalizadas**: Objetivos diários e semanais
- **Estatísticas Visuais**: Gráficos de progresso e insights

## Componentes

### Core Components

#### PomodoroTimer (`components/pomodoro/pomodoro-timer.tsx`)
Timer principal com:
- Countdown visual
- Controles de sessão
- Dialog de finalização com avaliações
- Registro de interrupções em tempo real

#### SessionCreateForm (`components/pomodoro/session-create-form.tsx`)
Formulário de criação de sessões com:
- Seleção de tipo de sessão
- Configuração de duração com IA
- Definição de objetivos e contexto
- Slider de energia e ambiente

#### SessionHistory (`components/pomodoro/session-history.tsx`)
Histórico completo com:
- Filtros avançados (status, tipo, data)
- Visualização detalhada de sessões
- Métricas de produtividade
- Timeline de atividades

#### PomodoroStats (`components/pomodoro/pomodoro-stats.tsx`)
Dashboard de estatísticas com:
- Gráficos semanais e mensais
- Insights personalizados da IA
- Progresso de metas
- Conquistas recentes

#### PomodoroSettings (`components/pomodoro/pomodoro-settings.tsx`)
Configurações avançadas:
- Durações padrão personalizáveis
- Configuração de IA adaptativa
- Som e notificações
- Automação de sessões
- Metas e tracking

### Server Actions

#### Session Management (`app/actions/pomodoro.ts`)
- `createSession()`: Criação de novas sessões
- `startSession()`: Início de sessões com controle de concorrência
- `updateSession()`: Atualização de status e métricas
- `getSessions()`: Busca com filtros
- `getActiveSession()`: Sessão atual ativa

#### Analytics & AI (`app/actions/pomodoro.ts`)
- `getAdaptiveRecommendation()`: Recomendações IA baseadas em contexto
- `getPomodoroStats()`: Estatísticas agregadas
- `addInterruption()`: Registro de interrupções

#### Configuration (`app/actions/pomodoro.ts`)
- `updateSettings()`: Configurações personalizadas
- `getSettings()`: Carregamento de preferências

## Inteligência Artificial

### Adaptive Timer (`lib/pomodoro/adaptive-timer.ts`)

O sistema de IA analisa múltiplos fatores:

#### Análise de Performance
- Taxa de conclusão histórica
- Scores de produtividade e foco
- Padrões de horário preferido
- Média de interrupções

#### Contexto da Sessão
- Hora atual vs. padrões históricos
- Nível de energia do usuário
- Ambiente de estudo
- Dificuldade do conteúdo
- Tempo disponível

#### Algoritmo de Recomendação
```typescript
duração_recomendada = duração_base * multiplicador_contexto

onde multiplicador_contexto considera:
- Histórico de performance (30%)
- Horário do dia (20%)
- Nível de energia (multiplicador direto)
- Ambiente (fator de ruído)
- Dificuldade (ajuste de complexidade)
- Fadiga acumulada (sessões consecutivas)
```

#### Métricas de Confiança
- Baseada no tamanho do histórico
- Consistência dos fatores analisados
- Qualidade dos dados de entrada

## Banco de Dados

### Schema Principal (`supabase/migrations/004_pomodoro_schema.sql`)

#### Tabelas Core
- **pomodoro_sessions**: Sessões completas com métricas
- **session_interruptions**: Registro de interrupções
- **pomodoro_settings**: Configurações por usuário

#### Analytics
- **pomodoro_daily_stats**: Estatísticas agregadas diárias
- **pomodoro_goals**: Sistema de metas personalizadas
- **pomodoro_achievements**: Conquistas desbloqueadas

#### IA e Insights
- **session_templates**: Templates pré-configurados
- **pomodoro_insights**: Sugestões geradas pela IA

### Triggers Automáticos
- Atualização de estatísticas diárias
- Verificação de conquistas
- Criação de configurações padrão

## Integrações

### Caderno de Estudos
- Link de sessões com notas específicas
- Criação automática de notas de estudo
- Tracking de páginas lidas e exercícios

### Sistema de Assinaturas
- Limitações por plano (sessões/mês)
- Tracking de uso para billing
- Features premium (IA avançada, insights)

### Notificações
- Desktop notifications
- Som customizável
- Vibração em dispositivos móveis

## Tipos de Sessão

### Focus (25min padrão)
- Concentração máxima em uma tarefa
- Ambiente silencioso recomendado
- Objetivos específicos e mensuráveis

### Study (45min padrão)
- Aprendizado de novos conceitos
- Leitura ativa e compreensão
- Criação de resumos e mapas mentais

### Review (20min padrão)
- Revisão de conteúdo aprendido
- Flashcards e exercícios
- Memorização e fixação

### Breaks (5-15min)
- Pausa ativa com movimento
- Hidratação e respiração
- Preparação para próxima sessão

## Métricas Coletadas

### Durante a Sessão
- Duração real vs. planejada
- Número e tipo de interrupções
- Contexto ambiental

### Pós-Sessão
- Score de produtividade (1-10)
- Score de foco (1-10)
- Energia inicial vs. final
- Humor antes/depois
- Conquistas e desafios

### Analytics Agregadas
- Padrões de horário
- Matérias mais produtivas
- Evolução temporal
- Consistência semanal

## Configurações Personalizáveis

### Durações
- Foco: 10-120 minutos
- Pausas: 1-60 minutos
- Ciclos até pausa longa: 2-10

### IA Adaptativa
- Modo ativo/inativo
- Limites mín/máx de duração
- Confiança mínima para sugestões

### Automação
- Auto-início de pausas
- Auto-início de foco
- Forçar pausas obrigatórias

### Notificações
- Som (tipo, volume)
- Vibração mobile
- Desktop notifications
- Timing de lembretes

## Uso Recomendado

### Iniciantes
1. Começar com 15-20 minutos
2. Usar templates pré-definidos
3. Focar na consistência
4. Ativar modo adaptativo

### Avançados
1. Personalizar durações por matéria
2. Usar insights da IA
3. Definir metas desafiadoras
4. Integrar com outras ferramentas

### Estratégias de Estudo
- **Manhã**: Sessões longas para conteúdo novo
- **Tarde**: Revisão e exercícios
- **Noite**: Resumos e planejamento

## Roadmap

### Próximas Features
- [ ] Integração com Spotify
- [ ] Modo colaborativo
- [ ] Análise de tendências semanais
- [ ] Sugestões de break activities
- [ ] Export de dados

### Melhorias de IA
- [ ] Predição de interrupções
- [ ] Sugestão de horários ótimos
- [ ] Adaptação por matéria
- [ ] Análise de sentimentos

Este sistema representa o estado da arte em gerenciamento de tempo para estudos, combinando a eficácia comprovada da técnica Pomodoro com inteligência artificial moderna para criar uma experiência verdadeiramente personalizada e otimizada.