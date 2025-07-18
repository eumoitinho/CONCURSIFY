import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { spotifyClient } from '@/lib/spotify/spotify-client'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }

    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    if (error) {
      console.error('Spotify OAuth error:', error)
      return NextResponse.redirect(
        new URL('/spotify?error=access_denied', request.url)
      )
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/spotify?error=invalid_request', request.url)
      )
    }

    // Validar state para prevenir CSRF
    const { data: sessionData } = await supabase
      .from('user_sessions')
      .select('session_data')
      .eq('user_id', user.id)
      .single()

    if (!sessionData?.session_data?.spotify_oauth_state || 
        sessionData.session_data.spotify_oauth_state !== state) {
      return NextResponse.redirect(
        new URL('/spotify?error=invalid_state', request.url)
      )
    }

    // Trocar código por token
    const tokenData = await spotifyClient.exchangeCodeForToken(code)
    
    // Buscar dados do usuário Spotify
    const spotifyUser = await spotifyClient.getCurrentUser(tokenData.access_token)

    // Salvar conexão no banco
    const { error: dbError } = await supabase
      .from('spotify_connections')
      .upsert({
        user_id: user.id,
        spotify_user_id: spotifyUser.id,
        display_name: spotifyUser.display_name,
        email: spotifyUser.email,
        product: spotifyUser.product,
        profile_image_url: spotifyUser.images?.[0]?.url,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
        scope: tokenData.scope,
        is_active: true,
        last_used_at: new Date().toISOString()
      })

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.redirect(
        new URL('/spotify?error=database_error', request.url)
      )
    }

    // Limpar state da sessão
    await supabase
      .from('user_sessions')
      .update({ 
        session_data: null 
      })
      .eq('user_id', user.id)

    console.log('✅ Spotify connected successfully for user:', user.id)

    // Redirecionar para página de sucesso
    return NextResponse.redirect(
      new URL('/spotify?connected=true', request.url)
    )

  } catch (error) {
    console.error('Spotify callback error:', error)
    return NextResponse.redirect(
      new URL('/spotify?error=connection_failed', request.url)
    )
  }
}