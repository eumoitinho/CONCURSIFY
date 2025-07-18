'use server'

import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { createServerSupabaseClient } from '@/lib/supabase'
import { spotifyClient } from '@/lib/spotify/spotify-client'
import { playlistAI } from '@/lib/spotify/playlist-ai'
import { z } from 'zod'

const supabase = createServerSupabaseClient()

// Schemas de validação
const GeneratePlaylistSchema = z.object({
  subject: z.string().min(1, 'Matéria é obrigatória'),
  sessionType: z.enum(['focus', 'study', 'review', 'break']),
  duration: z.number().min(5).max(180),
  mood: z.string().optional(),
  energy: z.number().min(1).max(10).optional(),
  preferences: z.object({
    genres: z.array(z.string()).optional(),
    instrumental: z.boolean().optional(),
    language: z.enum(['portuguese', 'english', 'any']).optional(),
    tempo: z.enum(['slow', 'medium', 'fast']).optional()
  }).optional()
})

const UpdateMusicPreferencesSchema = z.object({
  preferred_genres: z.array(z.string()).optional(),
  disliked_genres: z.array(z.string()).optional(),
  instrumental_only: z.boolean().optional(),
  language_preference: z.enum(['portuguese', 'english', 'any']).optional(),
  tempo_preference: z.enum(['slow', 'medium', 'fast']).optional(),
  energy_preference: z.enum(['low', 'medium', 'high']).optional(),
  enable_ai_recommendations: z.boolean().optional(),
  ai_learning_enabled: z.boolean().optional(),
  auto_generate_playlists: z.boolean().optional(),
  default_volume: z.number().min(0).max(100).optional()
})

export type GeneratePlaylistInput = z.infer<typeof GeneratePlaylistSchema>
export type UpdateMusicPreferencesInput = z.infer<typeof UpdateMusicPreferencesSchema>

/**
 * Busca conexão Spotify do usuário
 */
export async function getSpotifyConnection() {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const { data, error } = await supabase
      .from('spotify_connections')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('is_active', true)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    // Verificar se token não expirou
    if (data && new Date(data.expires_at) <= new Date()) {
      // Token expirado, tentar renovar
      try {
        const newToken = await spotifyClient.refreshAccessToken(data.refresh_token)
        
        // Atualizar no banco
        await supabase
          .rpc('update_spotify_token', {
            p_user_id: session.user.id,
            p_access_token: newToken.access_token,
            p_refresh_token: newToken.refresh_token,
            p_expires_in: newToken.expires_in
          })

        // Retornar dados atualizados
        const { data: updatedData } = await supabase
          .from('spotify_connections')
          .select('*')
          .eq('user_id', session.user.id)
          .single()

        return { success: true, data: updatedData }
      } catch (refreshError) {
        console.error('Failed to refresh Spotify token:', refreshError)
        
        // Marcar conexão como inativa
        await supabase
          .from('spotify_connections')
          .update({ is_active: false })
          .eq('user_id', session.user.id)

        return { success: false, error: 'Token expirado - reconecte sua conta Spotify' }
      }
    }

    return { success: true, data }

  } catch (error) {
    console.error('Erro ao buscar conexão Spotify:', error)
    return { success: false, error: 'Erro ao verificar conexão com Spotify' }
  }
}

/**
 * Desconecta conta Spotify
 */
export async function disconnectSpotify() {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const { error } = await supabase
      .from('spotify_connections')
      .update({ is_active: false })
      .eq('user_id', session.user.id)

    if (error) {
      throw error
    }

    revalidatePath('/spotify')
    return { success: true, message: 'Conta Spotify desconectada' }

  } catch (error) {
    console.error('Erro ao desconectar Spotify:', error)
    return { success: false, error: 'Erro ao desconectar conta' }
  }
}

/**
 * Gera playlist personalizada com IA
 */
export async function generatePlaylist(input: GeneratePlaylistInput) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const validatedInput = GeneratePlaylistSchema.parse(input)

    // Verificar conexão Spotify
    const connectionResult = await getSpotifyConnection()
    if (!connectionResult.success || !connectionResult.data) {
      return { success: false, error: 'Conecte sua conta Spotify primeiro' }
    }

    const connection = connectionResult.data
    console.log('🎵 Iniciando geração de playlist:', validatedInput.subject, validatedInput.sessionType)

    // Buscar top tracks do usuário para melhor personalização
    let userTopTracks
    try {
      userTopTracks = await spotifyClient.getUserTopTracks(connection.access_token)
    } catch (error) {
      console.warn('Não foi possível buscar top tracks do usuário:', error)
      userTopTracks = []
    }

    // Gerar playlist com IA
    const generatedPlaylist = await playlistAI.generatePlaylist(
      connection.access_token,
      validatedInput,
      userTopTracks
    )

    // Criar playlist no Spotify
    const spotifyPlaylistId = await playlistAI.createSpotifyPlaylist(
      connection.access_token,
      connection.spotify_user_id,
      generatedPlaylist
    )

    // Salvar no banco de dados
    const { data: savedPlaylist, error: dbError } = await supabase
      .from('ai_generated_playlists')
      .insert({
        user_id: session.user.id,
        spotify_playlist_id: spotifyPlaylistId,
        spotify_uri: `spotify:playlist:${spotifyPlaylistId}`,
        subject: validatedInput.subject,
        session_type: validatedInput.sessionType,
        planned_duration: validatedInput.duration,
        name: generatedPlaylist.name,
        description: generatedPlaylist.description,
        user_energy_level: validatedInput.energy,
        user_mood: validatedInput.mood,
        avg_tempo: generatedPlaylist.characteristics.avgTempo,
        avg_energy: generatedPlaylist.characteristics.avgEnergy,
        avg_valence: generatedPlaylist.characteristics.avgValence,
        main_genres: generatedPlaylist.characteristics.mainGenres,
        generation_rationale: generatedPlaylist.rationale,
        ai_confidence: 0.85 // Placeholder
      })
      .select()
      .single()

    if (dbError) {
      console.error('Erro ao salvar playlist:', dbError)
      // Playlist foi criada no Spotify mas falhou ao salvar localmente
      return { 
        success: true, 
        data: {
          ...generatedPlaylist,
          id: spotifyPlaylistId,
          spotify_url: `https://open.spotify.com/playlist/${spotifyPlaylistId}`
        },
        warning: 'Playlist criada mas não foi salva localmente'
      }
    }

    // Salvar tracks da playlist
    const trackInserts = generatedPlaylist.tracks.map((track, index) => ({
      playlist_id: savedPlaylist.id,
      spotify_track_id: track.id,
      spotify_uri: track.uri,
      name: track.name,
      artist_name: track.artists[0]?.name || 'Unknown',
      album_name: track.album.name,
      duration_ms: track.duration_ms,
      preview_url: track.preview_url,
      track_position: index + 1,
      ai_relevance_score: 0.8, // Placeholder
      study_suitability_score: validatedInput.sessionType === 'break' ? 0.6 : 0.9
    }))

    await supabase
      .from('ai_playlist_tracks')
      .insert(trackInserts)

    revalidatePath('/spotify')

    console.log('✅ Playlist gerada e salva com sucesso:', savedPlaylist.id)

    return {
      success: true,
      data: {
        ...generatedPlaylist,
        id: savedPlaylist.id,
        spotify_playlist_id: spotifyPlaylistId,
        spotify_url: `https://open.spotify.com/playlist/${spotifyPlaylistId}`
      },
      message: 'Playlist gerada com sucesso!'
    }

  } catch (error) {
    console.error('❌ Erro ao gerar playlist:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao gerar playlist'
    }
  }
}

/**
 * Busca playlists IA do usuário
 */
export async function getUserPlaylists(filters: {
  subject?: string
  session_type?: string
  limit?: number
  offset?: number
} = {}) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const { subject, session_type, limit = 20, offset = 0 } = filters

    let query = supabase
      .from('ai_generated_playlists')
      .select(`
        *,
        ai_playlist_tracks(count)
      `)
      .eq('user_id', session.user.id)
      .eq('is_archived', false)
      .order('created_at', { ascending: false })

    if (subject) {
      query = query.ilike('subject', `%${subject}%`)
    }

    if (session_type) {
      query = query.eq('session_type', session_type)
    }

    query = query.range(offset, offset + limit - 1)

    const { data, error } = await query

    if (error) {
      throw error
    }

    return { success: true, data: data || [] }

  } catch (error) {
    console.error('Erro ao buscar playlists:', error)
    return {
      success: false,
      error: 'Erro ao carregar playlists',
      data: []
    }
  }
}

/**
 * Busca detalhes de uma playlist
 */
export async function getPlaylistDetails(playlistId: string) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const { data, error } = await supabase
      .from('ai_generated_playlists')
      .select(`
        *,
        ai_playlist_tracks(*)
      `)
      .eq('id', playlistId)
      .eq('user_id', session.user.id)
      .single()

    if (error) {
      throw error
    }

    return { success: true, data }

  } catch (error) {
    console.error('Erro ao buscar detalhes da playlist:', error)
    return { success: false, error: 'Playlist não encontrada' }
  }
}

/**
 * Avalia playlist (rating)
 */
export async function ratePlaylist(playlistId: string, rating: number, feedback?: string) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    if (rating < 1 || rating > 5) {
      return { success: false, error: 'Rating deve ser entre 1 e 5' }
    }

    const { error } = await supabase
      .from('ai_generated_playlists')
      .update({
        user_rating: rating,
        user_feedback: feedback,
        updated_at: new Date().toISOString()
      })
      .eq('id', playlistId)
      .eq('user_id', session.user.id)

    if (error) {
      throw error
    }

    revalidatePath('/spotify')
    return { success: true, message: 'Avaliação salva com sucesso!' }

  } catch (error) {
    console.error('Erro ao avaliar playlist:', error)
    return { success: false, error: 'Erro ao salvar avaliação' }
  }
}

/**
 * Controles de reprodução Spotify
 */
export async function playPlaylist(playlistId: string, deviceId?: string) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const connectionResult = await getSpotifyConnection()
    if (!connectionResult.success || !connectionResult.data) {
      return { success: false, error: 'Conecte sua conta Spotify primeiro' }
    }

    // Buscar URI da playlist
    const { data: playlist } = await supabase
      .from('ai_generated_playlists')
      .select('spotify_uri')
      .eq('id', playlistId)
      .eq('user_id', session.user.id)
      .single()

    if (!playlist) {
      return { success: false, error: 'Playlist não encontrada' }
    }

    // Reproduzir no Spotify
    await spotifyClient.resumePlayback(connectionResult.data.access_token, deviceId)

    // Atualizar contadores
    await supabase
      .from('ai_generated_playlists')
      .update({
        play_count: supabase.rpc('increment_play_count'),
        last_played_at: new Date().toISOString()
      })
      .eq('id', playlistId)

    return { success: true, message: 'Reprodução iniciada!' }

  } catch (error) {
    console.error('Erro ao reproduzir playlist:', error)
    return { success: false, error: 'Erro ao iniciar reprodução' }
  }
}

export async function pausePlayback() {
  try {
    const connectionResult = await getSpotifyConnection()
    if (!connectionResult.success || !connectionResult.data) {
      return { success: false, error: 'Conecte sua conta Spotify primeiro' }
    }

    await spotifyClient.pausePlayback(connectionResult.data.access_token)
    return { success: true, message: 'Reprodução pausada' }

  } catch (error) {
    console.error('Erro ao pausar reprodução:', error)
    return { success: false, error: 'Erro ao pausar reprodução' }
  }
}

export async function resumePlayback() {
  try {
    const connectionResult = await getSpotifyConnection()
    if (!connectionResult.success || !connectionResult.data) {
      return { success: false, error: 'Conecte sua conta Spotify primeiro' }
    }

    await spotifyClient.resumePlayback(connectionResult.data.access_token)
    return { success: true, message: 'Reprodução retomada' }

  } catch (error) {
    console.error('Erro ao retomar reprodução:', error)
    return { success: false, error: 'Erro ao retomar reprodução' }
  }
}

/**
 * Busca preferências musicais do usuário
 */
export async function getMusicPreferences() {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const { data, error } = await supabase
      .from('user_music_preferences')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return { success: true, data }

  } catch (error) {
    console.error('Erro ao buscar preferências:', error)
    return { success: false, error: 'Erro ao carregar preferências' }
  }
}

/**
 * Atualiza preferências musicais
 */
export async function updateMusicPreferences(input: UpdateMusicPreferencesInput) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const validatedInput = UpdateMusicPreferencesSchema.parse(input)

    const { error } = await supabase
      .from('user_music_preferences')
      .upsert({
        user_id: session.user.id,
        ...validatedInput,
        updated_at: new Date().toISOString()
      })

    if (error) {
      throw error
    }

    revalidatePath('/spotify')
    return { success: true, message: 'Preferências atualizadas!' }

  } catch (error) {
    console.error('Erro ao atualizar preferências:', error)
    return { success: false, error: 'Erro ao salvar preferências' }
  }
}