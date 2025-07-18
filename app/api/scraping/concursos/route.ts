import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { scrapeConcursos } from '@/app/actions/concursos'

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 })
  }
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    // Verificar se é admin ou se tem permissão (opcional)
    // Por enquanto, qualquer usuário autenticado pode disparar o scraping

    console.log('🔄 Iniciando scraping via API...')

    const result = await scrapeConcursos()

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        count: result.count
      })
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('❌ Erro na API de scraping:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// GET para verificar status do último scraping
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const action = searchParams.get('action')

    if (action === 'status') {
      // Retornar informações do último scraping
      // Isso poderia vir de uma tabela de logs ou cache
      
      return NextResponse.json({
        success: true,
        data: {
          ultimoScraping: new Date().toISOString(),
          status: 'completed',
          totalConcursos: 0, // Buscar do banco
          proximoScraping: new Date(Date.now() + 3600000).toISOString() // 1h
        }
      })
    }

    return NextResponse.json(
      { error: 'Ação não especificada' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Erro ao verificar status:', error)
    return NextResponse.json(
      { error: 'Erro ao verificar status' },
      { status: 500 }
    )
  }
}