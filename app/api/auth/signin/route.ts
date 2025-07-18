import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validar dados obrigatórios
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Fazer login no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError) {
      console.error('Erro no login:', authError)
      
      // Personalizar mensagens de erro
      let errorMessage = 'Credenciais inválidas'
      
      if (authError.message.includes('Invalid login credentials')) {
        errorMessage = 'Email ou senha incorretos'
      } else if (authError.message.includes('Email not confirmed')) {
        errorMessage = 'Email não confirmado. Verifique sua caixa de entrada.'
      } else if (authError.message.includes('Too many requests')) {
        errorMessage = 'Muitas tentativas de login. Tente novamente em alguns minutos.'
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 401 }
      )
    }

    if (!authData.user || !authData.session) {
      return NextResponse.json(
        { error: 'Falha na autenticação' },
        { status: 401 }
      )
    }

    // Buscar perfil do usuário
    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', authData.user.id)
      .single()

    // Buscar assinatura do usuário
    const { data: subscriptionData } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', authData.user.id)
      .single()

    // Registrar evento de login
    const { error: trackingError } = await supabase
      .from('feature_usage_logs')
      .insert({
        user_id: authData.user.id,
        feature: 'signin',
        action: 'user_login',
        metadata: {
          email: email,
          login_date: new Date().toISOString(),
          user_agent: request.headers.get('user-agent') || 'unknown'
        }
      })

    if (trackingError) {
      console.error('Erro ao registrar evento:', trackingError)
    }

    return NextResponse.json({
      message: 'Login realizado com sucesso',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        profile: profileData,
        subscription: subscriptionData
      },
      session: {
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token,
        expires_at: authData.session.expires_at
      }
    })

  } catch (error) {
    console.error('Erro no servidor:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 