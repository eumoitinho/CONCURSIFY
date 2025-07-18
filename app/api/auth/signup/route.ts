import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { email, password, nome, telefone, concursos_interesse, nivel_estudos } = await request.json()

    // Validar dados obrigatórios
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: nome,
          phone: telefone
        }
      }
    })

    if (authError) {
      console.error('Erro no cadastro:', authError)
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Falha ao criar usuário' },
        { status: 500 }
      )
    }

    // Criar perfil do usuário
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: authData.user.id,
        display_name: nome || email.split('@')[0],
        bio: null,
        avatar_url: null,
        location: null,
        concursos_interesse: concursos_interesse || [],
        nivel_estudos: nivel_estudos || 'iniciante'
      })
      .select()
      .single()

    if (profileError) {
      console.error('Erro ao criar perfil:', profileError)
      // Não falhar o cadastro se o perfil não for criado
    }

    // Criar configurações padrão do usuário
    const { error: settingsError } = await supabase
      .from('user_settings')
      .insert({
        user_id: authData.user.id,
        notifications: { email: true, push: true },
        theme: 'light',
        language: 'pt-BR',
        pomodoro_duration: 25,
        break_duration: 5
      })

    if (settingsError) {
      console.error('Erro ao criar configurações:', settingsError)
    }

    // Criar preferências musicais padrão
    const { error: musicError } = await supabase
      .from('music_preferences')
      .insert({
        user_id: authData.user.id,
        preferred_genres: ['lo-fi', 'classical', 'ambient'],
        spotify_connected: false,
        auto_play: false,
        volume_level: 50
      })

    if (musicError) {
      console.error('Erro ao criar preferências musicais:', musicError)
    }

    // Criar estatísticas iniciais do fórum
    const { error: statsError } = await supabase
      .from('forum_user_stats')
      .insert({
        user_id: authData.user.id,
        threads_count: 0,
        posts_count: 0,
        upvotes_received: 0,
        downvotes_received: 0,
        solutions_count: 0,
        reputation_score: 0
      })

    if (statsError) {
      console.error('Erro ao criar estatísticas do fórum:', statsError)
    }

    // Registrar evento de cadastro
    const { error: trackingError } = await supabase
      .from('feature_usage_logs')
      .insert({
        user_id: authData.user.id,
        feature: 'signup',
        action: 'account_created',
        metadata: {
          email: email,
          nivel_estudos: nivel_estudos || 'iniciante',
          concursos_interesse: concursos_interesse || [],
          signup_date: new Date().toISOString()
        }
      })

    if (trackingError) {
      console.error('Erro ao registrar evento:', trackingError)
    }

    return NextResponse.json({
      message: 'Usuário criado com sucesso',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        profile: profileData
      },
      needsConfirmation: !authData.session
    })

  } catch (error) {
    console.error('Erro no servidor:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 