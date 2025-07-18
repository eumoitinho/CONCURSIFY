import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { spotifyClient } from '@/lib/spotify/spotify-client'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 })
    }

    const userId = user.id

    // Gerar state único para segurança
    const state = `${userId}-${Date.now()}-${Math.random().toString(36).substring(7)}`
    
    // Salvar state no Supabase para validação posterior
    await supabase
      .from('user_sessions')
      .upsert({
        user_id: userId,
        session_data: { spotify_oauth_state: state },
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutos
      })

    // Gerar URL de autorização do Spotify
    const authUrl = spotifyClient.getAuthorizationUrl(state)

    return NextResponse.json({ authUrl })

  } catch (error) {
    console.error('Spotify auth error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate Spotify authentication' },
      { status: 500 }
    )
  }
}