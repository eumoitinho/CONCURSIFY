# Integração Spotify com IA

## Visão Geral

O módulo de integração com Spotify oferece uma experiência musical personalizada e inteligente para maximizar o foco e produtividade durante os estudos. Utilizando inteligência artificial avançada, o sistema gera playlists otimizadas baseadas no contexto de estudo, preferências pessoais e padrões comportamentais.

## Funcionalidades Principais

### 🎵 Geração Inteligente de Playlists
- **IA Generativa**: Criação automática de playlists baseada em contexto
- **Análise de Matéria**: Considera o tipo de conteúdo sendo estudado
- **Personalização Dinâmica**: Adapta-se ao horário, energia e ambiente
- **Aprendizado Contínuo**: Melhora com feedback e uso

### 🎧 Player Integrado
- **Controles Nativos**: Play, pause, skip diretamente na plataforma
- **Visualização de Estado**: Informações da música atual e dispositivo
- **Sincronização Real-time**: Estado atualizado automaticamente
- **Suporte Multi-dispositivo**: Funciona com qualquer dispositivo Spotify

### 🧠 Inteligência Contextual
- **Análise de Sessão**: Considera tipo (foco, estudo, revisão, pausa)
- **Fatores Ambientais**: Horário, energia, ruído de fundo
- **Preferências Históricas**: Aprende com comportamento passado
- **Características Musicais**: Tempo, energia, valência, instrumentalidade

## Componentes da Arquitetura

### Backend Services

#### SpotifyClient (`lib/spotify/spotify-client.ts`)
Cliente completo para API do Spotify:
- **OAuth 2.0**: Fluxo de autorização seguro
- **Token Management**: Renovação automática de tokens
- **API Wrapper**: Métodos para todas as operações necessárias
- **Error Handling**: Tratamento robusto de erros

```typescript
class SpotifyClient {
  async exchangeCodeForToken(code: string): Promise<SpotifyToken>
  async refreshAccessToken(refreshToken: string): Promise<SpotifyToken>
  async getCurrentUser(accessToken: string): Promise<SpotifyUser>
  async getRecommendations(accessToken: string, seeds: Seeds, attributes: Attributes): Promise<SpotifyTrack[]>
  async createPlaylist(accessToken: string, userId: string, name: string): Promise<SpotifyPlaylist>
}
```

#### PlaylistAI (`lib/spotify/playlist-ai.ts`)
Motor de IA para geração de playlists:
- **Análise Contextual**: Gemini AI para compreender contexto de estudo
- **Seleção Musical**: Algoritmos para escolher músicas adequadas
- **Personalização**: Baseada em preferências e histórico
- **Geração de Metadados**: Nomes e descrições criativas

```typescript
class PlaylistAI {
  async generatePlaylist(accessToken: string, request: PlaylistGenerationRequest): Promise<GeneratedPlaylist>
  async analyzeStudyContext(request: PlaylistGenerationRequest): Promise<ContextAnalysis>
  async createSpotifyPlaylist(accessToken: string, userId: string, playlist: GeneratedPlaylist): Promise<string>
}
```

### Database Schema

#### Tabelas Principais (`supabase/migrations/005_spotify_integration.sql`)

**spotify_connections**: Conexões OAuth dos usuários
```sql
CREATE TABLE spotify_connections (
  user_id UUID REFERENCES auth.users(id),
  spotify_user_id VARCHAR NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  product VARCHAR, -- free, premium
  is_active BOOLEAN DEFAULT TRUE
);
```

**ai_generated_playlists**: Playlists criadas pela IA
```sql
CREATE TABLE ai_generated_playlists (
  user_id UUID REFERENCES auth.users(id),
  spotify_playlist_id VARCHAR NOT NULL,
  subject VARCHAR NOT NULL,
  session_type VARCHAR NOT NULL,
  generation_rationale TEXT,
  ai_confidence DECIMAL(3,2),
  user_rating INTEGER,
  play_count INTEGER DEFAULT 0
);
```

**user_music_preferences**: Preferências musicais personalizadas
```sql
CREATE TABLE user_music_preferences (
  user_id UUID PRIMARY KEY,
  preferred_genres TEXT[],
  instrumental_only BOOLEAN DEFAULT FALSE,
  language_preference VARCHAR DEFAULT 'any',
  enable_ai_recommendations BOOLEAN DEFAULT TRUE
);
```

### API Routes

#### OAuth Flow (`app/api/spotify/`)
- **`/auth`**: Inicia fluxo OAuth com state CSRF
- **`/callback`**: Processa retorno do Spotify
- **`/playback`**: Controla reprodução atual

### Server Actions (`app/actions/spotify.ts`)

#### Connection Management
```typescript
export async function getSpotifyConnection(): Promise<ConnectionResult>
export async function disconnectSpotify(): Promise<ActionResult>
```

#### Playlist Operations
```typescript
export async function generatePlaylist(input: GeneratePlaylistInput): Promise<PlaylistResult>
export async function getUserPlaylists(filters: PlaylistFilters): Promise<PlaylistsResult>
export async function ratePlaylist(playlistId: string, rating: number): Promise<ActionResult>
```

#### Playback Control
```typescript
export async function playPlaylist(playlistId: string): Promise<ActionResult>
export async function pausePlayback(): Promise<ActionResult>
export async function resumePlayback(): Promise<ActionResult>
```

## Frontend Components

### Core Components

#### SpotifyConnect (`components/spotify/spotify-connect.tsx`)
Interface de conexão inicial:
- **OAuth Trigger**: Botão para iniciar autorização
- **Features Overview**: Explicação das funcionalidades
- **Security Information**: Informações sobre privacidade
- **FAQ Section**: Perguntas frequentes

#### PlaylistGenerator (`components/spotify/playlist-generator.tsx`)
Gerador inteligente de playlists:
- **Context Form**: Coleta informações de contexto
- **AI Integration**: Interface para recomendações IA
- **Preview Results**: Visualização da playlist gerada
- **Spotify Integration**: Criação direta no Spotify

#### SpotifyPlayer (`components/spotify/spotify-player.tsx`)
Player embarcado:
- **Playback State**: Visualização do estado atual
- **Media Controls**: Controles de reprodução
- **Device Info**: Informações do dispositivo ativo
- **Progress Tracking**: Barra de progresso da música

#### PlaylistLibrary (`components/spotify/playlist-library.tsx`)
Biblioteca de playlists:
- **Advanced Filtering**: Filtros por matéria, tipo, data
- **Rating System**: Sistema de avaliação 5 estrelas
- **Detailed Views**: Modais com informações completas
- **Batch Operations**: Ações em múltiplas playlists

#### MusicPreferences (`components/spotify/music-preferences.tsx`)
Configurações personalizadas:
- **Genre Selection**: Seleção de gêneros preferidos/não gostados
- **AI Settings**: Configuração do comportamento da IA
- **Session Customization**: Preferências por tipo de sessão
- **Volume & Audio**: Configurações de áudio

## Inteligência Artificial

### Análise de Contexto

O sistema IA analisa múltiplos fatores para gerar playlists otimizadas:

#### Fatores de Entrada
- **Matéria**: Tipo de conteúdo (exatas vs humanas)
- **Sessão**: Foco, estudo, revisão ou pausa
- **Tempo**: Duração planejada da sessão
- **Estado**: Humor e nível de energia
- **Ambiente**: Localização e nível de ruído
- **Histórico**: Preferências e padrões passados

#### Processamento IA
```typescript
interface PlaylistGenerationRequest {
  subject: string
  sessionType: 'focus' | 'study' | 'review' | 'break'
  duration: number
  mood?: string
  energy?: number
  preferences?: {
    genres?: string[]
    instrumental?: boolean
    language?: 'portuguese' | 'english' | 'any'
    tempo?: 'slow' | 'medium' | 'fast'
  }
}
```

#### Algoritmo de Recomendação

1. **Análise Contextual**: Gemini AI processa contexto de estudo
2. **Determinação de Atributos**: Mapeia contexto para características musicais
3. **Seleção de Seeds**: Escolhe artistas/tracks/gêneros base
4. **Busca no Spotify**: Utiliza API de recomendações
5. **Filtragem Inteligente**: Remove tracks inadequados
6. **Otimização de Duração**: Seleciona tracks para duração alvo

### Características Musicais

#### Atributos Analisados
- **Energy** (0-1): Intensidade e poder da música
- **Valence** (0-1): Positividade musical (alegre vs melancólico)
- **Acousticness** (0-1): Confiança de que é acústica
- **Instrumentalness** (0-1): Predição se contém vocais
- **Tempo** (BPM): Velocidade/ritmo da música

#### Mapeamento por Contexto
```typescript
// Sessão de Foco
attributes = {
  energy: 0.3,      // Baixa energia
  valence: 0.5,     // Neutro
  acousticness: 0.6, // Mais acústico
  instrumentalness: 0.8, // Principalmente instrumental
  tempo: 80         // Ritmo lento
}

// Pausa Energizante
attributes = {
  energy: 0.8,      // Alta energia
  valence: 0.7,     // Mais alegre
  acousticness: 0.3, // Menos acústico
  instrumentalness: 0.3, // Pode ter vocais
  tempo: 140        // Ritmo rápido
}
```

## Integração com Pomodoro

### Controle Automático
- **Início de Sessão**: Inicia playlist automaticamente
- **Pausas Inteligentes**: Pausa música durante intervalos
- **Música de Pausa**: Troca para playlist energizante
- **Feedback Loop**: Coleta dados de performance

### Analytics Musicais
- **Tempo de Escuta**: Tracking por sessão
- **Skip Rate**: Taxa de pulo de músicas
- **Ratings**: Avaliações por playlist
- **Correlação**: Música vs produtividade

## Tipos de Sessão e Recomendações

### Focus (Foco Intenso)
**Características**: Concentração máxima, zero distração
**Música Recomendada**:
- Ambient, minimal, drone
- BPM: 60-90
- Instrumentalness > 0.8
- Energy < 0.4

### Study (Estudo Profundo) 
**Características**: Aprendizado de novos conceitos
**Música Recomendada**:
- Classical, lo-fi, jazz instrumental
- BPM: 80-120
- Instrumentalness > 0.6
- Energy 0.3-0.6

### Review (Revisão)
**Características**: Revisão de conteúdo conhecido
**Música Recomendada**:
- Post-rock, indie instrumental, electronic chill
- BPM: 100-130
- Instrumentalness > 0.5
- Energy 0.4-0.7

### Break (Pausa)
**Características**: Renovação de energia
**Música Recomendada**:
- Pop, indie, world music, uplifting
- BPM: 110-140
- Instrumentalness < 0.5
- Energy > 0.6

## Personalização e Aprendizado

### Machine Learning Features
- **Collaborative Filtering**: Baseado em usuários similares
- **Content-Based**: Análise de características musicais
- **Feedback Loop**: Ratings e comportamento de skip
- **Temporal Patterns**: Padrões de horário e dia

### Adaptação Contínua
- **A/B Testing**: Testa diferentes abordagens
- **Performance Tracking**: Correlaciona música com produtividade
- **Preference Evolution**: Adapta-se a mudanças de gosto
- **Context Learning**: Aprende padrões contextuais

## Configurações e Customização

### Preferências Globais
- **Gêneros Preferidos/Evitados**: Lista personalizada
- **Idioma**: Português, inglês ou qualquer
- **Instrumentalidade**: Apenas instrumental ou misto
- **Energia**: Baixa, média ou alta por padrão

### Configurações por Sessão
- **Focus**: Ultra-minimalista, sem letra
- **Study**: Clássico e lo-fi preferencial
- **Review**: Slightly uptempo permitido
- **Break**: Pop e energia alta

### IA Customization
- **Learning Rate**: Velocidade de adaptação
- **Exploration vs Exploitation**: Novidades vs favoritos
- **Confidence Threshold**: Quando usar fallbacks
- **Diversity Factor**: Variedade nas recomendações

## Segurança e Privacidade

### OAuth 2.0 Security
- **State Parameter**: Proteção CSRF
- **Token Encryption**: Tokens armazenados encriptados
- **Scope Limitation**: Apenas permissões necessárias
- **Auto Refresh**: Renovação transparente de tokens

### Data Protection
- **RLS Policies**: Row Level Security no Supabase
- **User Isolation**: Dados isolados por usuário
- **Token Expiration**: Tokens com TTL limitado
- **Audit Trail**: Log de acessos e modificações

## Performance e Otimização

### Caching Strategy
- **Token Caching**: Cache de tokens válidos
- **Recommendation Cache**: Cache de recomendações recentes
- **User Preference Cache**: Cache de preferências
- **Playlist Metadata Cache**: Cache de metadados

### API Rate Limiting
- **Spotify Limits**: Respeita rate limits da API
- **Request Batching**: Agrupa requests quando possível
- **Graceful Degradation**: Fallbacks para falhas
- **Queue Management**: Fila para requests não urgentes

## Métricas e Analytics

### User Metrics
- **Session Duration**: Tempo médio de escuta
- **Skip Rate**: Taxa de pulo por playlist/gênero
- **Rating Distribution**: Distribuição de avaliações
- **Genre Affinity**: Afinidade por gêneros ao longo do tempo

### System Metrics
- **Generation Success Rate**: Taxa de sucesso na geração
- **API Response Times**: Latência das APIs
- **Error Rates**: Taxa de erros por endpoint
- **User Engagement**: Métricas de engajamento

### Business Intelligence
- **Most Popular Genres**: Gêneros mais populares
- **Peak Usage Times**: Horários de pico
- **Conversion Funnel**: Funil de conexão → uso
- **Retention Analysis**: Análise de retenção

## Roadmap e Melhorias Futuras

### Próximas Features
- [ ] **Modo Colaborativo**: Playlists compartilhadas entre usuários
- [ ] **Voice Control**: Controle por voz durante estudos
- [ ] **Smart Notifications**: Notificações baseadas em padrões
- [ ] **Apple Music Integration**: Suporte a outros serviços
- [ ] **Offline Mode**: Funcionamento sem internet

### AI Enhancements
- [ ] **Emotion Detection**: Análise de humor através de texto/voice
- [ ] **Biometric Integration**: Integração com wearables
- [ ] **Predictive Modeling**: Predição de preferências futuras
- [ ] **Multi-Modal Learning**: Combinação de múltiplas fontes

### Integration Expansions
- [ ] **Calendar Sync**: Sincronização com calendários
- [ ] **Focus Apps**: Integração com apps de produtividade
- [ ] **Smart Home**: Controle de ambiente via IoT
- [ ] **Social Features**: Compartilhamento e colaboração

Este sistema representa uma solução completa e inovadora para integração musical inteligente em plataformas de estudo, combinando o poder da API do Spotify com inteligência artificial avançada para criar uma experiência verdadeiramente personalizada e eficaz.