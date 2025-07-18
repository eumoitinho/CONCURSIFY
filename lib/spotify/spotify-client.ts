import { z } from 'zod'

// Spotify API Endpoints
const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize'
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token'
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1'

// Escopos necessários
const SPOTIFY_SCOPES = [
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'streaming',
  'user-read-email',
  'user-read-private',
  'playlist-read-collaborative',
  'playlist-modify-public',
  'playlist-modify-private',
  'user-library-read',
  'user-library-modify',
  'user-top-read',
  'user-read-recently-played'
].join(' ')

// Schemas de validação
const SpotifyTokenSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  expires_in: z.number(),
  refresh_token: z.string(),
  scope: z.string()
})

const SpotifyUserSchema = z.object({
  id: z.string(),
  display_name: z.string(),
  email: z.string(),
  images: z.array(z.object({
    url: z.string(),
    height: z.number().nullable(),
    width: z.number().nullable()
  })),
  product: z.string() // free ou premium
})

const SpotifyTrackSchema = z.object({
  id: z.string(),
  name: z.string(),
  duration_ms: z.number(),
  artists: z.array(z.object({
    id: z.string(),
    name: z.string()
  })),
  album: z.object({
    id: z.string(),
    name: z.string(),
    images: z.array(z.object({
      url: z.string(),
      height: z.number(),
      width: z.number()
    }))
  }),
  preview_url: z.string().nullable(),
  uri: z.string()
})

const SpotifyPlaylistSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  images: z.array(z.object({
    url: z.string(),
    height: z.number().nullable(),
    width: z.number().nullable()
  })),
  tracks: z.object({
    total: z.number()
  }),
  uri: z.string(),
  public: z.boolean()
})

export type SpotifyToken = z.infer<typeof SpotifyTokenSchema>
export type SpotifyUser = z.infer<typeof SpotifyUserSchema>
export type SpotifyTrack = z.infer<typeof SpotifyTrackSchema>
export type SpotifyPlaylist = z.infer<typeof SpotifyPlaylistSchema>

export class SpotifyClient {
  private clientId: string
  private clientSecret: string
  private redirectUri: string
  
  constructor() {
    this.clientId = process.env.SPOTIFY_CLIENT_ID!
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET!
    this.redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/spotify/callback`
    
    if (!this.clientId || !this.clientSecret) {
      throw new Error('Spotify credentials not configured')
    }
  }

  /**
   * Gera URL de autorização OAuth
   */
  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: this.redirectUri,
      state,
      scope: SPOTIFY_SCOPES,
      show_dialog: 'true'
    })

    return `${SPOTIFY_AUTH_URL}?${params.toString()}`
  }

  /**
   * Troca código de autorização por token
   */
  async exchangeCodeForToken(code: string): Promise<SpotifyToken> {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: this.redirectUri
    })

    const response = await fetch(SPOTIFY_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`
      },
      body: params.toString()
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Spotify token exchange failed: ${error}`)
    }

    const data = await response.json()
    return SpotifyTokenSchema.parse(data)
  }

  /**
   * Renova token usando refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<SpotifyToken> {
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    })

    const response = await fetch(SPOTIFY_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`
      },
      body: params.toString()
    })

    if (!response.ok) {
      throw new Error('Failed to refresh Spotify token')
    }

    const data = await response.json()
    return {
      ...data,
      refresh_token: refreshToken // Spotify não retorna novo refresh token
    }
  }

  /**
   * Busca informações do usuário
   */
  async getCurrentUser(accessToken: string): Promise<SpotifyUser> {
    const response = await fetch(`${SPOTIFY_API_BASE}/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch Spotify user')
    }

    const data = await response.json()
    return SpotifyUserSchema.parse(data)
  }

  /**
   * Busca estado atual de reprodução
   */
  async getPlaybackState(accessToken: string) {
    const response = await fetch(`${SPOTIFY_API_BASE}/me/player`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    if (response.status === 204) {
      return null // Nenhum dispositivo ativo
    }

    if (!response.ok) {
      throw new Error('Failed to fetch playback state')
    }

    return response.json()
  }

  /**
   * Pausa reprodução
   */
  async pausePlayback(accessToken: string): Promise<void> {
    const response = await fetch(`${SPOTIFY_API_BASE}/me/player/pause`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    if (!response.ok && response.status !== 204) {
      throw new Error('Failed to pause playback')
    }
  }

  /**
   * Retoma reprodução
   */
  async resumePlayback(accessToken: string, deviceId?: string): Promise<void> {
    const body = deviceId ? JSON.stringify({ device_id: deviceId }) : undefined

    const response = await fetch(`${SPOTIFY_API_BASE}/me/player/play`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body
    })

    if (!response.ok && response.status !== 204) {
      throw new Error('Failed to resume playback')
    }
  }

  /**
   * Pula para próxima faixa
   */
  async skipToNext(accessToken: string): Promise<void> {
    const response = await fetch(`${SPOTIFY_API_BASE}/me/player/next`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    if (!response.ok && response.status !== 204) {
      throw new Error('Failed to skip track')
    }
  }

  /**
   * Busca tracks por query
   */
  async searchTracks(accessToken: string, query: string, limit = 20): Promise<SpotifyTrack[]> {
    const params = new URLSearchParams({
      q: query,
      type: 'track',
      limit: limit.toString()
    })

    const response = await fetch(`${SPOTIFY_API_BASE}/search?${params}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    if (!response.ok) {
      throw new Error('Failed to search tracks')
    }

    const data = await response.json()
    return data.tracks.items.map((track: any) => SpotifyTrackSchema.parse(track))
  }

  /**
   * Busca playlists do usuário
   */
  async getUserPlaylists(accessToken: string, limit = 50): Promise<SpotifyPlaylist[]> {
    const params = new URLSearchParams({
      limit: limit.toString()
    })

    const response = await fetch(`${SPOTIFY_API_BASE}/me/playlists?${params}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch playlists')
    }

    const data = await response.json()
    return data.items.map((playlist: any) => SpotifyPlaylistSchema.parse(playlist))
  }

  /**
   * Cria nova playlist
   */
  async createPlaylist(
    accessToken: string, 
    userId: string, 
    name: string, 
    description?: string,
    isPublic = false
  ): Promise<SpotifyPlaylist> {
    const response = await fetch(`${SPOTIFY_API_BASE}/users/${userId}/playlists`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        description,
        public: isPublic
      })
    })

    if (!response.ok) {
      throw new Error('Failed to create playlist')
    }

    const data = await response.json()
    return SpotifyPlaylistSchema.parse(data)
  }

  /**
   * Adiciona tracks a uma playlist
   */
  async addTracksToPlaylist(
    accessToken: string, 
    playlistId: string, 
    trackUris: string[]
  ): Promise<void> {
    const response = await fetch(`${SPOTIFY_API_BASE}/playlists/${playlistId}/tracks`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        uris: trackUris
      })
    })

    if (!response.ok) {
      throw new Error('Failed to add tracks to playlist')
    }
  }

  /**
   * Busca recomendações baseadas em seeds
   */
  async getRecommendations(
    accessToken: string,
    seeds: {
      artists?: string[]
      tracks?: string[]
      genres?: string[]
    },
    attributes?: {
      energy?: number
      valence?: number // felicidade
      acousticness?: number
      instrumentalness?: number
      tempo?: number
    }
  ): Promise<SpotifyTrack[]> {
    const params = new URLSearchParams({
      limit: '50'
    })

    // Adiciona seeds
    if (seeds.artists?.length) {
      params.append('seed_artists', seeds.artists.join(','))
    }
    if (seeds.tracks?.length) {
      params.append('seed_tracks', seeds.tracks.join(','))
    }
    if (seeds.genres?.length) {
      params.append('seed_genres', seeds.genres.join(','))
    }

    // Adiciona atributos
    if (attributes) {
      Object.entries(attributes).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(`target_${key}`, value.toString())
        }
      })
    }

    const response = await fetch(`${SPOTIFY_API_BASE}/recommendations?${params}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    if (!response.ok) {
      throw new Error('Failed to get recommendations')
    }

    const data = await response.json()
    return data.tracks.map((track: any) => SpotifyTrackSchema.parse(track))
  }

  /**
   * Busca gêneros disponíveis para recomendações
   */
  async getAvailableGenres(accessToken: string): Promise<string[]> {
    const response = await fetch(`${SPOTIFY_API_BASE}/recommendations/available-genre-seeds`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch genres')
    }

    const data = await response.json()
    return data.genres
  }

  /**
   * Busca top tracks do usuário
   */
  async getUserTopTracks(accessToken: string, timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term'): Promise<SpotifyTrack[]> {
    const params = new URLSearchParams({
      time_range: timeRange,
      limit: '50'
    })

    const response = await fetch(`${SPOTIFY_API_BASE}/me/top/tracks?${params}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch top tracks')
    }

    const data = await response.json()
    return data.items.map((track: any) => SpotifyTrackSchema.parse(track))
  }
}

// Instância singleton
export const spotifyClient = new SpotifyClient()