import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    // Fazer logout no Supabase Auth
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Erro no logout:', error)
      return NextResponse.json(
        { error: 'Erro ao fazer logout' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Logout realizado com sucesso'
    })

  } catch (error) {
    console.error('Erro no servidor:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 