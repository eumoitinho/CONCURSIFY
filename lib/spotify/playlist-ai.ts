import { GoogleGenerativeAI } from '@google/generative-ai'
import { spotifyClient, SpotifyTrack } from './spotify-client'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)

interface PlaylistGenerationRequest {
  subject: string
  sessionType: 'focus' | 'study' | 'review' | 'break'
  duration: number // em minutos
  mood?: string
  energy?: number // 1-10
  preferences?: {
    genres?: string[]
    instrumental?: boolean
    language?: 'portuguese' | 'english' | 'any'
    tempo?: 'slow' | 'medium' | 'fast'
  }
}

interface GeneratedPlaylist {
  name: string
  description: string
  tracks: SpotifyTrack[]
  rationale: string
  characteristics: {
    avgTempo: number
    avgEnergy: number
    avgValence: number
    mainGenres: string[]
  }
}

const STUDY_MUSIC_GENRES = [
  'ambient',
  'classical',
  'jazz',
  'lo-fi',
  'instrumental',
  'piano',
  'chill',
  'downtempo',
  'new-age',
  'minimal-techno',
  'post-rock',
  'world-music'
]

const BREAK_MUSIC_GENRES = [
  'pop',
  'indie',
  'electronic',
  'rock',
  'latin',
  'funk',
  'soul',
  'reggae',
  'bossa-nova',
  'happy'
]

export class PlaylistAI {
  
  /**
   * Gera playlist personalizada usando IA
   */
  async generatePlaylist(
    accessToken: string,
    request: PlaylistGenerationRequest,
    userTopTracks?: SpotifyTrack[]
  ): Promise<GeneratedPlaylist> {
    console.log('🎵 Gerando playlist com IA para:', request.subject, request.sessionType)

    // 1. Análise do contexto com IA
    const playlistContext = await this.analyzeStudyContext(request)
    
    // 2. Determinação de características musicais
    const musicAttributes = this.determineMusicAttributes(request, playlistContext)
    
    // 3. Seleção de seeds baseados no contexto
    const seeds = await this.selectSeeds(accessToken, request, userTopTracks)
    
    // 4. Buscar recomendações do Spotify
    const recommendations = await spotifyClient.getRecommendations(
      accessToken,
      seeds,
      musicAttributes
    )

    // 5. Filtrar e refinar tracks
    const filteredTracks = this.filterAndRankTracks(recommendations, request, playlistContext)
    
    // 6. Calcular duração alvo
    const targetDurationMs = request.duration * 60 * 1000
    const selectedTracks = this.selectTracksByDuration(filteredTracks, targetDurationMs)

    // 7. Gerar metadados da playlist
    const playlistMetadata = await this.generatePlaylistMetadata(request, playlistContext, selectedTracks)

    return {
      name: playlistMetadata.name,
      description: playlistMetadata.description,
      tracks: selectedTracks,
      rationale: playlistContext.rationale,
      characteristics: this.calculatePlaylistCharacteristics(selectedTracks)
    }
  }

  /**
   * Analisa contexto de estudo usando IA Gemini
   */
  private async analyzeStudyContext(request: PlaylistGenerationRequest) {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `
Analise o contexto de estudo e determine as características ideais da música:

CONTEXTO:
- Matéria: ${request.subject}
- Tipo de sessão: ${request.sessionType}
- Duração: ${request.duration} minutos
- Energia do usuário: ${request.energy || 'não informada'}/10
- Humor: ${request.mood || 'não informado'}

PREFERÊNCIAS:
- Gêneros preferidos: ${request.preferences?.genres?.join(', ') || 'nenhum especificado'}
- Instrumental: ${request.preferences?.instrumental ? 'preferencial' : 'qualquer'}
- Idioma: ${request.preferences?.language || 'qualquer'}
- Ritmo: ${request.preferences?.tempo || 'qualquer'}

Responda em JSON com:
{
  "musicType": "tipo de música recomendado",
  "recommendedGenres": ["gêneros específicos"],
  "energyLevel": "baixa/média/alta",
  "instrumentalRecommended": true/false,
  "tempoRecommendation": "lento/moderado/rápido",
  "rationale": "explicação da recomendação"
}

Considere:
- Foco/Estudo: música calma, instrumental, sem distração
- Revisão: música um pouco mais estimulante
- Pausa: música mais energética e motivacional
- Matérias de exatas: preferencialmente instrumental
- Matérias de humanas: evitar letras em português se leitura envolvida
- Energia baixa: música mais estimulante
- Energia alta: música para manter o foco
`

    try {
      const result = await model.generateContent(prompt)
      const responseText = result.response.text()
      
      // Extrair JSON da resposta
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    } catch (error) {
      console.error('Erro na análise IA:', error)
    }

    // Fallback para análise simples
    return this.getFallbackAnalysis(request)
  }

  /**
   * Análise de fallback quando IA falha
   */
  private getFallbackAnalysis(request: PlaylistGenerationRequest) {
    const isStudySession = ['focus', 'study', 'review'].includes(request.sessionType)
    
    return {
      musicType: isStudySession ? 'ambient/instrumental' : 'energetic',
      recommendedGenres: isStudySession ? STUDY_MUSIC_GENRES.slice(0, 3) : BREAK_MUSIC_GENRES.slice(0, 3),
      energyLevel: request.sessionType === 'break' ? 'alta' : 'baixa',
      instrumentalRecommended: isStudySession,
      tempoRecommendation: isStudySession ? 'lento' : 'moderado',
      rationale: `Música ${isStudySession ? 'calma e focada' : 'energética'} para ${request.sessionType}`
    }
  }

  /**
   * Determina atributos musicais baseados no contexto
   */
  private determineMusicAttributes(request: PlaylistGenerationRequest, context: any) {
    const attributes: any = {}

    // Energia musical
    switch (context.energyLevel) {
      case 'baixa':
        attributes.energy = 0.3
        break
      case 'média':
        attributes.energy = 0.6
        break
      case 'alta':
        attributes.energy = 0.8
        break
    }

    // Valência (felicidade/positividade)
    if (request.sessionType === 'break') {
      attributes.valence = 0.7 // Mais feliz para pausas
    } else {
      attributes.valence = 0.5 // Neutro para estudo
    }

    // Acústico vs eletrônico
    if (context.instrumentalRecommended) {
      attributes.acousticness = 0.6
      attributes.instrumentalness = 0.8
    } else {
      attributes.acousticness = 0.3
      attributes.instrumentalness = 0.3
    }

    // Tempo (BPM)
    switch (context.tempoRecommendation) {
      case 'lento':
        attributes.tempo = 80
        break
      case 'moderado':
        attributes.tempo = 120
        break
      case 'rápido':
        attributes.tempo = 140
        break
    }

    return attributes
  }

  /**
   * Seleciona seeds para recomendações
   */
  private async selectSeeds(
    accessToken: string,
    request: PlaylistGenerationRequest,
    userTopTracks?: SpotifyTrack[]
  ) {
    const seeds: any = { genres: [], artists: [], tracks: [] }

    // Gêneros baseados no tipo de sessão
    if (request.sessionType === 'break') {
      seeds.genres = BREAK_MUSIC_GENRES.slice(0, 2)
    } else {
      seeds.genres = STUDY_MUSIC_GENRES.slice(0, 2)
    }

    // Preferências do usuário
    if (request.preferences?.genres?.length) {
      seeds.genres = request.preferences.genres.slice(0, 2)
    }

    // Seeds de tracks dos top tracks do usuário
    if (userTopTracks?.length) {
      const suitableTracks = userTopTracks
        .filter(track => this.isTrackSuitableForStudy(track, request.sessionType))
        .slice(0, 2)
      
      seeds.tracks = suitableTracks.map(track => track.id)
    }

    return seeds
  }

  /**
   * Verifica se track é adequado para estudo
   */
  private isTrackSuitableForStudy(track: SpotifyTrack, sessionType: string): boolean {
    const isStudySession = ['focus', 'study', 'review'].includes(sessionType)
    
    if (!isStudySession) return true // Pausas podem ter qualquer música
    
    // Para sessões de estudo, preferir tracks com nomes que sugiram instrumental
    const trackName = track.name.toLowerCase()
    const artistName = track.artists[0]?.name.toLowerCase() || ''
    
    const instrumentalKeywords = [
      'instrumental', 'piano', 'classical', 'ambient', 
      'lofi', 'chill', 'study', 'focus', 'meditation'
    ]
    
    return instrumentalKeywords.some(keyword => 
      trackName.includes(keyword) || artistName.includes(keyword)
    )
  }

  /**
   * Filtra e ranqueia tracks por adequação
   */
  private filterAndRankTracks(
    tracks: SpotifyTrack[],
    request: PlaylistGenerationRequest,
    context: any
  ): SpotifyTrack[] {
    const isStudySession = ['focus', 'study', 'review'].includes(request.sessionType)
    
    return tracks
      .filter(track => {
        // Filtro básico: remover tracks muito curtos
        if (track.duration_ms < 30000) return false // menos de 30s
        
        // Para sessões de estudo, filtrar por características
        if (isStudySession) {
          const trackName = track.name.toLowerCase()
          
          // Evitar tracks com palavras que sugiram alta energia
          const highEnergyWords = ['party', 'dance', 'club', 'remix', 'feat.']
          if (highEnergyWords.some(word => trackName.includes(word))) {
            return false
          }
        }
        
        return true
      })
      .sort((a, b) => {
        // Priorizar tracks com preview (para teste)
        if (a.preview_url && !b.preview_url) return -1
        if (!a.preview_url && b.preview_url) return 1
        
        // Para estudo, priorizar tracks com palavras-chave instrumentais
        if (isStudySession) {
          const aScore = this.calculateStudyScore(a)
          const bScore = this.calculateStudyScore(b)
          return bScore - aScore
        }
        
        return 0
      })
  }

  /**
   * Calcula score de adequação para estudo
   */
  private calculateStudyScore(track: SpotifyTrack): number {
    let score = 0
    
    const trackName = track.name.toLowerCase()
    const artistName = track.artists[0]?.name.toLowerCase() || ''
    const fullText = `${trackName} ${artistName}`
    
    // Palavras-chave positivas
    const positiveKeywords = [
      'instrumental', 'piano', 'classical', 'ambient', 'lofi', 
      'chill', 'study', 'focus', 'meditation', 'peaceful', 'calm'
    ]
    
    // Palavras-chave negativas
    const negativeKeywords = [
      'explicit', 'remix', 'radio edit', 'club', 'party', 
      'dance', 'electronic', 'bass', 'beat'
    ]
    
    positiveKeywords.forEach(keyword => {
      if (fullText.includes(keyword)) score += 2
    })
    
    negativeKeywords.forEach(keyword => {
      if (fullText.includes(keyword)) score -= 1
    })
    
    // Duração adequada (3-6 minutos é ideal)
    const durationMinutes = track.duration_ms / 60000
    if (durationMinutes >= 3 && durationMinutes <= 6) {
      score += 1
    }
    
    return score
  }

  /**
   * Seleciona tracks para atingir duração alvo
   */
  private selectTracksByDuration(tracks: SpotifyTrack[], targetDurationMs: number): SpotifyTrack[] {
    const selected: SpotifyTrack[] = []
    let currentDuration = 0
    
    for (const track of tracks) {
      if (currentDuration + track.duration_ms <= targetDurationMs + 300000) { // +5min buffer
        selected.push(track)
        currentDuration += track.duration_ms
        
        if (currentDuration >= targetDurationMs) break
      }
    }
    
    // Garantir mínimo de 5 tracks
    if (selected.length < 5) {
      const remaining = tracks.slice(selected.length, selected.length + (5 - selected.length))
      selected.push(...remaining)
    }
    
    return selected
  }

  /**
   * Gera metadados da playlist usando IA
   */
  private async generatePlaylistMetadata(
    request: PlaylistGenerationRequest,
    context: any,
    tracks: SpotifyTrack[]
  ) {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const artistsPreview = tracks.slice(0, 3).map(t => t.artists[0]?.name).join(', ')
    
    const prompt = `
Crie um nome e descrição para playlist de estudo:

CONTEXTO:
- Matéria: ${request.subject}
- Tipo: ${request.sessionType}
- Duração: ${request.duration}min
- Artistas inclusos: ${artistsPreview}
- Rationale: ${context.rationale}

Responda em JSON:
{
  "name": "nome criativo e atrativo (máx 50 chars)",
  "description": "descrição envolvente explicando o propósito (máx 200 chars)"
}

Exemplos de nomes:
- "Foco Total: Matemática 🧮"
- "Deep Study: História 📚"
- "Chill Review: Português ✍️"
- "Power Break: Energize! ⚡"
`

    try {
      const result = await model.generateContent(prompt)
      const responseText = result.response.text()
      
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    } catch (error) {
      console.error('Erro ao gerar metadados:', error)
    }

    // Fallback
    return {
      name: `${request.sessionType.toUpperCase()}: ${request.subject}`,
      description: `Playlist personalizada para ${request.sessionType} de ${request.subject} (${request.duration}min)`
    }
  }

  /**
   * Calcula características da playlist
   */
  private calculatePlaylistCharacteristics(tracks: SpotifyTrack[]) {
    if (tracks.length === 0) {
      return {
        avgTempo: 0,
        avgEnergy: 0,
        avgValence: 0,
        mainGenres: []
      }
    }

    // Para características musicais, precisaríamos dos audio features
    // Por enquanto, estimamos baseado no que sabemos
    const totalDuration = tracks.reduce((sum, track) => sum + track.duration_ms, 0)
    const avgDurationMinutes = totalDuration / tracks.length / 60000

    return {
      avgTempo: avgDurationMinutes < 4 ? 120 : 90, // Estimativa
      avgEnergy: 0.5, // Estimativa
      avgValence: 0.6, // Estimativa
      mainGenres: ['study', 'ambient', 'instrumental'] // Estimativa
    }
  }

  /**
   * Cria playlist no Spotify do usuário
   */
  async createSpotifyPlaylist(
    accessToken: string,
    userId: string,
    generatedPlaylist: GeneratedPlaylist
  ): Promise<string> {
    console.log('🎵 Criando playlist no Spotify:', generatedPlaylist.name)

    // Criar playlist
    const playlist = await spotifyClient.createPlaylist(
      accessToken,
      userId,
      generatedPlaylist.name,
      generatedPlaylist.description,
      false // privada por padrão
    )

    // Adicionar tracks
    const trackUris = generatedPlaylist.tracks.map(track => track.uri)
    await spotifyClient.addTracksToPlaylist(accessToken, playlist.id, trackUris)

    console.log('✅ Playlist criada com sucesso:', playlist.id)
    return playlist.id
  }
}

// Instância singleton
export const playlistAI = new PlaylistAI()