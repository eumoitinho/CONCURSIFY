import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { createServerSupabaseClient } from '@/lib/supabase'
import { PDFGenerator } from '@/lib/exports/pdf-generator'
import { CalendarExport } from '@/lib/exports/calendar-export'
import { WhatsAppExport } from '@/lib/exports/whatsapp-export'
import { SubscriptionLimits } from '@/lib/subscription/limits'
import '@/lib/auth'

const supabase = createServerSupabaseClient()

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    const userId = (session?.user as any)?.id
    if (!userId) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const formato = searchParams.get('formato') // 'pdf', 'ics', 'whatsapp'
    const tipo = searchParams.get('tipo') // 'cronograma', 'semanal', 'diario'

    // Buscar cronograma
    const { data: cronograma, error } = await supabase
      .from('cronogramas')
      .select(`
        *,
        concursos:concurso_id (
          titulo,
          orgao,
          data_prova
        )
      `)
      .eq('id', params.id)
      .eq('user_id', userId)
      .single()

    if (error || !cronograma) {
      return NextResponse.json(
        { error: 'Cronograma não encontrado' },
        { status: 404 }
      )
    }

    // Verificar plano do usuário para PDF
    const userPlan = await SubscriptionLimits.getUserPlan(userId)
    const isFreePlan = userPlan === 'free'

    // Verificar se pode exportar PDF limpo
    if (formato === 'pdf' && isFreePlan) {
      const canExportClean = await SubscriptionLimits.canUseFeature(userId, 'pdf_export')
      // Se é plano gratuito, sempre adicionar marca d'água (canExportClean será false)
    }

    switch (formato) {
      case 'pdf':
        return await exportPDF(cronograma, isFreePlan)

      case 'ics':
        return await exportICS(cronograma)

      case 'whatsapp':
        return await exportWhatsApp(cronograma)

      default:
        return NextResponse.json(
          { error: 'Formato não suportado' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Erro ao exportar cronograma:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

async function exportPDF(cronograma: any, isFreePlan: boolean) {
  const pdfBuffer = await PDFGenerator.gerarCronogramaPDF(
    cronograma.conteudo,
    cronograma.concursos || { titulo: cronograma.titulo, orgao: cronograma.orgao },
    isFreePlan
  )

  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="cronograma-${cronograma.titulo}.pdf"`
    }
  })
}

async function exportICS(cronograma: any) {
  const icsContent = CalendarExport.gerarEventosICS(
    cronograma.conteudo,
    cronograma.concursos || { titulo: cronograma.titulo, orgao: cronograma.orgao },
    new Date()
  )

  return new NextResponse(icsContent, {
    headers: {
      'Content-Type': 'text/calendar',
      'Content-Disposition': `attachment; filename="cronograma-${cronograma.titulo}.ics"`
    }
  })
}

async function exportWhatsApp(cronograma: any) {
  const message = WhatsAppExport.gerarMensagemCronograma(
    cronograma.conteudo,
    cronograma.concursos || { titulo: cronograma.titulo, orgao: cronograma.orgao }
  )

  return NextResponse.json({
    message,
    url: `https://wa.me/?text=${encodeURIComponent(message)}`
  })
}

// Endpoint para gerar nova versão do cronograma
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    const userId = (session?.user as any)?.id
    if (!userId) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { dataInicio } = body

    // Buscar cronograma
    const { data: cronograma, error } = await supabase
      .from('cronogramas')
      .select(`
        *,
        concursos:concurso_id (
          titulo,
          orgao,
          data_prova
        )
      `)
      .eq('id', params.id)
      .eq('user_id', userId)
      .single()

    if (error || !cronograma) {
      return NextResponse.json(
        { error: 'Cronograma não encontrado' },
        { status: 404 }
      )
    }

    // Verificar limite de cronogramas
    const canCreate = await SubscriptionLimits.canUseFeature(userId, 'cronogramas')
    if (!canCreate) {
      return NextResponse.json(
        { error: 'Limite de cronogramas atingido' },
        { status: 403 }
      )
    }

    // Gerar nova versão baseada na data de início
    const { data: novoCronograma, error: createError } = await supabase
      .from('cronogramas')
      .insert({
        user_id: userId,
        concurso_id: cronograma.concurso_id,
        titulo: `${cronograma.titulo} - Nova versão`,
        conteudo: {
          ...cronograma.conteudo,
          dataInicio: dataInicio
        },
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (createError) {
      throw createError
    }

    // Incrementar contador de uso usando o método disponível
    await supabase
      .from('usage_tracking')
      .insert({
        user_id: userId,
        feature: 'cronogramas',
        date: new Date().toISOString().split('T')[0],
        count: 1
      })

    return NextResponse.json(novoCronograma)
  } catch (error) {
    console.error('Erro ao gerar nova versão do cronograma:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}