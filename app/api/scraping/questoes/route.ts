import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { scrapeQuestoes } from '@/app/actions/questoes'

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

    // Por segurança, apenas usuários autenticados podem disparar scraping
    // Em produção, considere adicionar verificação de admin/role

    console.log('🔄 Iniciando scraping de questões via API...')

    const result = await scrapeQuestoes()

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
    console.error('❌ Erro na API de scraping de questões:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// GET para verificar status do banco de questões
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const action = searchParams.get('action')

    if (action === 'status') {
      // Importar aqui para evitar problemas de edge runtime
      const { createServerSupabaseClient } = await import('@/lib/supabase')
      const supabase = createServerSupabaseClient()

      // Estatísticas básicas do banco de questões
      const { count: totalQuestoes } = await supabase
        .from('questoes')
        .select('*', { count: 'exact', head: true })

      const { data: ultimaQuestao } = await supabase
        .from('questoes')
        .select('scraped_at')
        .order('scraped_at', { ascending: false })
        .limit(1)
        .single()

      const { data: materias } = await supabase
        .from('questoes')
        .select('materia')
        .not('materia', 'is', null)

      const materiasUnicas = materias ? [...new Set(materias.map(m => m.materia))] : []

      return NextResponse.json({
        success: true,
        data: {
          total_questoes: totalQuestoes || 0,
          materias_disponiveis: materiasUnicas,
          ultimo_scraping: ultimaQuestao?.scraped_at || null,
          proximo_scraping_sugerido: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24h
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