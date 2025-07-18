import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase'
import { generateSimuladoReport, SimuladoReportData } from '@/lib/reports/simulado-report'
import { checkFeatureAccess } from '@/lib/middleware/subscription-check'
import { readFile } from 'fs/promises'
import path from 'path'

const supabase = createServerClient()

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 })
  }
    const userId = (session?.user as any)?.id
    if (!userId) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }

    // Verificar acesso à feature de simulados
    const accessCheck = await checkFeatureAccess(userId, 'simulados')
    if (!accessCheck.allowed) {
      return NextResponse.json({
        error: accessCheck.error,
        requiresUpgrade: accessCheck.upgradeRequired
      }, { status: 403 })
    }

    const { type = 'pdf' } = await req.json()
    
    // Buscar dados do simulado
    const { data: simulado, error } = await supabase
      .from('simulados')
      .select(`
        *,
        simulado_respostas (
          *,
          questoes (
            id,
            texto,
            alternativas,
            resposta_correta,
            materia,
            dificuldade,
            explicacao
          )
        )
      `)
      .eq('id', params.id)
      .eq('user_id', userId)
      .single()

    if (error || !simulado) {
      return NextResponse.json(
        { error: 'Simulado não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se o simulado foi finalizado
    if (simulado.status !== 'finalizado') {
      return NextResponse.json(
        { error: 'Simulado ainda não foi finalizado' },
        { status: 400 }
      )
    }

    // Processar respostas
    const respostas = simulado.simulado_respostas || []
    const totalQuestoes = respostas.length
    
    if (totalQuestoes === 0) {
      return NextResponse.json(
        { error: 'Nenhuma resposta encontrada para este simulado' },
        { status: 400 }
      )
    }

    // Calcular estatísticas
    const acertos = respostas.filter((r: any) => r.resposta_usuario === r.resposta_correta).length
    const pontuacaoGeral = (acertos / totalQuestoes) * 100

    // Agrupar por matéria
    const performancePorMateria: Record<string, { acertos: number; total: number; percentual: number }> = {}
    
    respostas.forEach((r: any) => {
      const materia = r.questoes.materia
      if (!performancePorMateria[materia]) {
        performancePorMateria[materia] = { acertos: 0, total: 0, percentual: 0 }
      }
      performancePorMateria[materia].total++
      if (r.resposta_usuario === r.resposta_correta) {
        performancePorMateria[materia].acertos++
      }
    })

    // Calcular percentuais
    Object.keys(performancePorMateria).forEach((materia: string) => {
      const stats = performancePorMateria[materia]
      stats.percentual = (stats.acertos / stats.total) * 100
    })

    // Calcular tempo médio antes de usar reportData
    const tempoMedioPorQuestao = simulado.tempo_fim && simulado.tempo_inicio
      ? Math.round((new Date(simulado.tempo_fim).getTime() - new Date(simulado.tempo_inicio).getTime()) / (1000 * respostas.length))
      : 120

    // Preparar dados para o relatório
    const reportData: SimuladoReportData = {
      simulado: {
        id: simulado.id,
        titulo: simulado.titulo,
        configuracao: simulado.configuracao,
        pontuacao: simulado.pontuacao || pontuacaoGeral,
        tempo_total: simulado.tempo_fim 
          ? Math.round((new Date(simulado.tempo_fim).getTime() - new Date(simulado.tempo_inicio).getTime()) / (1000 * 60))
          : 0,
        data_realizacao: simulado.tempo_fim || simulado.created_at
      },
      respostas: respostas.map((r: any) => ({
        questao_id: r.questao_id,
        questao_texto: r.questoes.texto,
        resposta_usuario: r.resposta_usuario,
        resposta_correta: r.resposta_correta,
        correto: r.resposta_usuario === r.resposta_correta,
        tempo_resposta: r.tempo_resposta || 0,
        materia: r.questoes.materia,
        dificuldade: r.questoes.dificuldade,
        explicacao: r.questoes.explicacao
      })),
      feedback: {
        pontuacao_geral: pontuacaoGeral,
        pontuacao_por_materia: performancePorMateria,
        pontos_fortes: generatePontosFortes(performancePorMateria),
        pontos_fracos: generatePontosFracos(performancePorMateria),
        recomendacoes: generateRecomendacoes(performancePorMateria, pontuacaoGeral),
        tempo_medio_por_questao: tempoMedioPorQuestao,
        questoes_mais_demoradas: respostas
          .sort((a: any, b: any) => b.tempo_resposta - a.tempo_resposta)
          .slice(0, 3)
          .map((r: any) => ({
            questao_id: r.questao_id,
            tempo: r.tempo_resposta,
            materia: r.questoes.materia
          })),
        nivel_sugerido: pontuacaoGeral >= 70 ? 'dificil' : pontuacaoGeral >= 50 ? 'medio' : 'facil',
        plano_estudo_sugerido: {
          materias_prioritarias: Object.entries(performancePorMateria)
            .filter(([, stats]) => stats.percentual < 60)
            .map(([materia]) => materia),
          tempo_sugerido_por_materia: {},
          proximos_assuntos: generateProximosPassos(performancePorMateria, pontuacaoGeral)
        }
      },
      usuario: {
        nome: (session?.user as any)?.name || 'Usuário',
        email: (session?.user as any)?.email || '',
        plano: 'free'
      }
    }

    // Gerar relatório baseado no tipo
    if (type === 'pdf') {
      const pdfBuffer = await generateSimuladoReport(reportData, 'pdf')
      
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="relatorio-simulado-${simulado.titulo}.pdf"`
        }
      })
    } else if (type === 'json') {
      return NextResponse.json(reportData)
    } else {
      return NextResponse.json(
        { error: 'Tipo de relatório não suportado' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Erro ao gerar relatório:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Funções auxiliares para gerar insights
function generatePontosFortes(performance: Record<string, any>): string[] {
  return Object.entries(performance)
    .filter(([, stats]) => stats.percentual >= 70)
    .map(([materia]) => `Excelente desempenho em ${materia}`)
}

function generatePontosFracos(performance: Record<string, any>): string[] {
  return Object.entries(performance)
    .filter(([, stats]) => stats.percentual < 50)
    .map(([materia]) => `Necessita melhorar em ${materia}`)
}

function generateRecomendacoes(performance: Record<string, any>, pontuacaoGeral: number): string[] {
  const recomendacoes = []
  
  if (pontuacaoGeral < 50) {
    recomendacoes.push('Foque em revisão de conceitos básicos')
    recomendacoes.push('Pratique mais exercícios de fixação')
  } else if (pontuacaoGeral < 70) {
    recomendacoes.push('Continue praticando para consolidar o conhecimento')
    recomendacoes.push('Foque nas matérias com menor desempenho')
  } else {
    recomendacoes.push('Excelente desempenho! Continue praticando')
    recomendacoes.push('Considere simulados mais desafiadores')
  }
  
  return recomendacoes
}

function generateProximosPassos(performance: Record<string, any>, pontuacaoGeral: number): string[] {
  const passos = []
  
  const materiasFracas = Object.entries(performance)
    .filter(([, stats]) => stats.percentual < 60)
    .map(([materia]) => materia)
  
  if (materiasFracas.length > 0) {
    passos.push(`Dedicar mais tempo às matérias: ${materiasFracas.join(', ')}`)
  }
  
  if (pontuacaoGeral < 70) {
    passos.push('Fazer mais simulados para praticar')
    passos.push('Revisar explicações das questões erradas')
  }
  
  return passos
}