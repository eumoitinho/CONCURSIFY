import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { spotifyClient } from '@/lib/spotify/spotify-client'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Gerar state único para segurança
    const state = `${session.user.id}-${Date.now()}-${Math.random().toString(36).substring(7)}`
    
    // Salvar state no Supabase para validação posterior
    const supabase = createServerSupabaseClient()
    await supabase
      .from('user_sessions')
      .upsert({
        user_id: session.user.id,
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