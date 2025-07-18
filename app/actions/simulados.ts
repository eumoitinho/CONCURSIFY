'use server'

import { createServerSupabaseClient } from '@/lib/supabase'
import { simuladosAI, ConfiguracaoSimulado, AnalisePerformance } from '@/lib/ai/simulados-ai'
import { SubscriptionLimits, checkFeatureAccess } from '@/lib/middleware/subscription-check'
import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const supabase = createServerSupabaseClient()

// Schema para criação de simulado
const CriarSimuladoSchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório'),
  materias: z.array(z.string()).min(1, 'Selecione pelo menos uma matéria'),
  num_questoes: z.number().min(5, 'Mínimo 5 questões').max(100, 'Máximo 100 questões'),
  tempo_limite: z.number().min(5, 'Mínimo 5 minutos').max(300, 'Máximo 5 horas'),
  nivel_dificuldade: z.enum(['facil', 'medio', 'dificil', 'misto']),
  orgaos_preferidos: z.array(z.string()).optional(),
  anos_preferidos: z.array(z.number()).optional(),
  assuntos_focados: z.array(z.string()).optional(),
  modo: z.enum(['prova', 'treino', 'revisao']).default('treino'),
  adaptativo: z.boolean().default(false),
})

// Schema para resposta de simulado
const ResponderSimuladoSchema = z.object({
  simulado_id: z.string().uuid(),
  respostas: z.array(z.object({
    questao_id: z.string().uuid(),
    resposta_usuario: z.string().regex(/^[A-E]$/),
    tempo_resposta: z.number().min(0), // em segundos
  })),
  tempo_total: z.number().min(0), // em minutos
})

export type CriarSimuladoInput = z.infer<typeof CriarSimuladoSchema>
export type ResponderSimuladoInput = z.infer<typeof ResponderSimuladoSchema>

export async function criarSimulado(input: CriarSimuladoInput) {
  try {
    const supabase = createServerActionClient({ cookies })
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { success: false, error: 'Usuário não autenticado' }
  }
    if (authError || !user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    // Verificar acesso à feature
    const accessCheck = await checkFeatureAccess(user.id, 'simulados')
    if (!accessCheck.allowed) {
      return { 
        success: false, 
        error: accessCheck.error,
        requiresUpgrade: accessCheck.upgradeRequired
      }
    }

    // Validar input
    const validatedInput = CriarSimuladoSchema.parse(input)

    console.log('🎯 Criando simulado com IA...')

    // Buscar questões disponíveis
    const { data: questoesDisponiveis, error: questoesError } = await supabase
      .from('questoes')
      .select(`
        id,
        materia,
        assunto,
        nivel_dificuldade,
        tags,
        orgao,
        ano
      `)
      .in('materia', validatedInput.materias)

    if (questoesError || !questoesDisponiveis || questoesDisponiveis.length < validatedInput.num_questoes) {
      return { 
        success: false, 
        error: `Questões insuficientes. Disponíveis: ${questoesDisponiveis?.length || 0}, Necessárias: ${validatedInput.num_questoes}` 
      }
    }

    // Gerar simulado com IA
    const simuladoGerado = await simuladosAI.selecionarQuestoes(
      validatedInput,
      questoesDisponiveis
    )

    // Salvar simulado no banco
    const { data: simuladoSalvo, error: saveError } = await supabase
      .from('simulados')
      .insert({
        user_id: user.id,
        titulo: validatedInput.titulo,
        configuracao: validatedInput,
        questoes_ids: simuladoGerado.questoes_selecionadas,
        status: 'em_andamento',
        tempo_inicio: new Date().toISOString(),
        total_questoes: validatedInput.num_questoes,
      })
      .select()
      .single()

    if (saveError) {
      console.error('Erro ao salvar simulado:', saveError)
      return { success: false, error: 'Erro ao salvar simulado' }
    }

    // Registrar uso da feature
    await SubscriptionLimits.trackFeatureUsage(user.id, 'simulados', {
      num_questoes: validatedInput.num_questoes,
      materias: validatedInput.materias,
      modo: validatedInput.modo
    })

    // Revalidar cache
    revalidatePath('/simulados')

    console.log('✅ Simulado criado com sucesso')

    return { 
      success: true, 
      data: {
        simulado: simuladoSalvo,
        distribuicao: simuladoGerado.distribuicao,
        tempo_estimado: simuladoGerado.tempo_estimado,
        dicas_preparacao: simuladoGerado.dicas_preparacao
      },
      message: 'Simulado criado com sucesso!'
    }

  } catch (error) {
    console.error('❌ Erro ao criar simulado:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }
  }
}

export async function gerarSimuladoAdaptativo(preferenciasUsuario: {
  materias_interesse: string[]
  nivel_atual: string
  tempo_disponivel: number
  objetivos: string[]
}) {
  try {
    const supabase = createServerActionClient({ cookies })
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { success: false, error: 'Usuário não autenticado' }
  }
    if (authError || !user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    // Verificar acesso
    const accessCheck = await checkFeatureAccess(user.id, 'simulados')
    if (!accessCheck.allowed) {
      return { 
        success: false, 
        error: accessCheck.error,
        requiresUpgrade: accessCheck.upgradeRequired
      }
    }

    // Buscar histórico de performance do usuário
    const { data: historicoSimulados } = await supabase
      .from('simulado_respostas')
      .select(`
        questao_id,
        resposta_usuario,
        resposta_correta,
        is_correct,
        questoes!inner(materia, assunto, nivel_dificuldade)
      `)
      .eq('simulados.user_id', user.id)
      .limit(100)

    // Calcular performance por matéria
    const performancePorMateria: Record<string, number> = {}
    if (historicoSimulados) {
      const materiaStats: Record<string, { acertos: number; total: number }> = {}
      
      historicoSimulados.forEach(resposta => {
        const materia = resposta.questoes.materia
        if (!materiaStats[materia]) {
          materiaStats[materia] = { acertos: 0, total: 0 }
        }
        materiaStats[materia].total++
        if (resposta.is_correct) {
          materiaStats[materia].acertos++
        }
      })

      Object.entries(materiaStats).forEach(([materia, stats]) => {
        performancePorMateria[materia] = (stats.acertos / stats.total) * 100
      })
    }

    // Buscar questões disponíveis
    const { data: questoesDisponiveis } = await supabase
      .from('questoes')
      .select('id, materia, assunto, nivel_dificuldade, tags')
      .in('materia', preferenciasUsuario.materias_interesse)

    if (!questoesDisponiveis || questoesDisponiveis.length < 10) {
      return { success: false, error: 'Questões insuficientes para gerar simulado adaptativo' }
    }

    // Gerar configuração otimizada com IA
    const configuracaoOtimizada = await simuladosAI.gerarConfiguracaoOtimizada(
      {
        ...preferenciasUsuario,
        historico_performance: performancePorMateria
      },
      questoesDisponiveis
    )

    // Criar o simulado
    return await criarSimulado(configuracaoOtimizada)

  } catch (error) {
    console.error('Erro ao gerar simulado adaptativo:', error)
    return { 
      success: false, 
      error: 'Erro ao gerar simulado adaptativo'
    }
  }
}

export async function iniciarSimulado(simuladoId: string) {
  try {
    const supabase = createServerActionClient({ cookies })
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { success: false, error: 'Usuário não autenticado' }
  }
    if (authError || !user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    // Buscar simulado com questões
    const { data: simulado, error } = await supabase
      .from('simulados')
      .select(`
        *,
        questoes:questoes_ids
      `)
      .eq('id', simuladoId)
      .eq('user_id', user.id)
      .single()

    if (error || !simulado) {
      return { success: false, error: 'Simulado não encontrado' }
    }

    // Buscar dados completos das questões
    const { data: questoes, error: questoesError } = await supabase
      .from('questoes')
      .select(`
        id,
        texto,
        alternativas,
        materia,
        assunto,
        nivel_dificuldade,
        tags
      `)
      .in('id', simulado.questoes_ids)

    if (questoesError || !questoes) {
      return { success: false, error: 'Erro ao carregar questões do simulado' }
    }

    // Embaralhar questões se necessário
    const questoesEmbaralhadas = questoes.sort(() => Math.random() - 0.5)

    // Atualizar tempo de início se não foi iniciado
    if (simulado.status === 'em_andamento' && !simulado.tempo_inicio) {
      await supabase
        .from('simulados')
        .update({ tempo_inicio: new Date().toISOString() })
        .eq('id', simuladoId)
    }

    return {
      success: true,
      data: {
        simulado: {
          id: simulado.id,
          titulo: simulado.titulo,
          configuracao: simulado.configuracao,
          status: simulado.status,
          tempo_inicio: simulado.tempo_inicio,
          total_questoes: simulado.total_questoes,
        },
        questoes: questoesEmbaralhadas
      }
    }

  } catch (error) {
    console.error('Erro ao iniciar simulado:', error)
    return { 
      success: false, 
      error: 'Erro ao iniciar simulado'
    }
  }
}

export async function responderSimulado(input: ResponderSimuladoInput) {
  try {
    const supabase = createServerActionClient({ cookies })
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { success: false, error: 'Usuário não autenticado' }
  }
    if (authError || !user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const validatedInput = ResponderSimuladoSchema.parse(input)

    // Verificar se o simulado pertence ao usuário
    const { data: simulado, error: simuladoError } = await supabase
      .from('simulados')
      .select('*')
      .eq('id', validatedInput.simulado_id)
      .eq('user_id', user.id)
      .single()

    if (simuladoError || !simulado) {
      return { success: false, error: 'Simulado não encontrado' }
    }

    // Buscar questões e respostas corretas
    const { data: questoes, error: questoesError } = await supabase
      .from('questoes')
      .select(`
        id,
        resposta_correta,
        explicacao,
        materia,
        assunto,
        nivel_dificuldade
      `)
      .in('id', validatedInput.respostas.map(r => r.questao_id))

    if (questoesError || !questoes) {
      return { success: false, error: 'Erro ao validar respostas' }
    }

    // Processar respostas e calcular resultados
    const respostasProcessadas = validatedInput.respostas.map(resposta => {
      const questao = questoes.find(q => q.id === resposta.questao_id)
      if (!questao) throw new Error('Questão não encontrada')

      const isCorrect = questao.resposta_correta === resposta.resposta_usuario

      return {
        simulado_id: validatedInput.simulado_id,
        questao_id: resposta.questao_id,
        resposta_usuario: resposta.resposta_usuario,
        resposta_correta: questao.resposta_correta,
        tempo_resposta: resposta.tempo_resposta,
        is_correct: isCorrect,
      }
    })

    // Salvar respostas no banco
    const { error: saveError } = await supabase
      .from('simulado_respostas')
      .insert(respostasProcessadas)

    if (saveError) {
      console.error('Erro ao salvar respostas:', saveError)
      return { success: false, error: 'Erro ao salvar respostas' }
    }

    // Calcular pontuação
    const acertos = respostasProcessadas.filter(r => r.is_correct).length
    const pontuacao = Math.round((acertos / respostasProcessadas.length) * 100)

    // Atualizar simulado
    await supabase
      .from('simulados')
      .update({
        status: 'finalizado',
        tempo_fim: new Date().toISOString(),
        pontuacao: pontuacao,
      })
      .eq('id', validatedInput.simulado_id)

    // Gerar análise de performance com IA
    const analiseData: AnalisePerformance = {
      questoes_respondidas: respostasProcessadas.map(r => {
        const questao = questoes.find(q => q.id === r.questao_id)!
        return {
          questao_id: r.questao_id,
          resposta_usuario: r.resposta_usuario,
          resposta_correta: r.resposta_correta,
          tempo_resposta: r.tempo_resposta,
          materia: questao.materia,
          assunto: questao.assunto,
          nivel_dificuldade: questao.nivel_dificuldade,
        }
      }),
      tempo_total: validatedInput.tempo_total,
    }

    console.log('🤖 Gerando análise de performance...')
    const feedbackDetalhado = await simuladosAI.analisarPerformance(
      analiseData,
      simulado.configuracao
    )

    revalidatePath('/simulados')

    return {
      success: true,
      data: {
        pontuacao,
        acertos,
        total_questoes: respostasProcessadas.length,
        tempo_total: validatedInput.tempo_total,
        respostas: respostasProcessadas.map(r => {
          const questao = questoes.find(q => q.id === r.questao_id)!
          return {
            ...r,
            explicacao: questao.explicacao,
            materia: questao.materia,
            assunto: questao.assunto,
          }
        }),
        feedback: feedbackDetalhado,
      },
      message: `Simulado finalizado! Você acertou ${acertos}/${respostasProcessadas.length} questões (${pontuacao}%)`
    }

  } catch (error) {
    console.error('Erro ao responder simulado:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao processar respostas'
    }
  }
}

export async function buscarSimulados(filtros: {
  status?: 'em_andamento' | 'finalizado' | 'pausado'
  materia?: string
  limite?: number
  offset?: number
} = {}) {
  try {
    const supabase = createServerActionClient({ cookies })
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { success: false, error: 'Usuário não autenticado' }
  }
    if (authError || !user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const { status, materia, limite = 20, offset = 0 } = filtros

    let query = supabase
      .from('simulados')
      .select(`
        id,
        titulo,
        configuracao,
        status,
        pontuacao,
        total_questoes,
        tempo_inicio,
        tempo_fim,
        created_at
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    if (materia) {
      query = query.contains('configuracao->materias', [materia])
    }

    query = query.range(offset, offset + limite - 1)

    const { data, error } = await query

    if (error) {
      throw error
    }

    return { success: true, data: data || [] }

  } catch (error) {
    console.error('Erro ao buscar simulados:', error)
    return { 
      success: false, 
      error: 'Erro ao carregar simulados',
      data: []
    }
  }
}

export async function getSimuladoById(id: string) {
  try {
    const supabase = createServerActionClient({ cookies })
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { success: false, error: 'Usuário não autenticado' }
  }
    if (authError || !user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const { data: simulado, error } = await supabase
      .from('simulados')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error || !simulado) {
      return { success: false, error: 'Simulado não encontrado' }
    }

    // Se finalizado, buscar também as respostas
    let respostas = null
    if (simulado.status === 'finalizado') {
      const { data: respostasData } = await supabase
        .from('simulado_respostas')
        .select(`
          *,
          questoes!inner(
            id,
            texto,
            alternativas,
            materia,
            assunto,
            explicacao
          )
        `)
        .eq('simulado_id', id)

      respostas = respostasData
    }

    return { 
      success: true, 
      data: {
        simulado,
        respostas
      }
    }

  } catch (error) {
    console.error('Erro ao buscar simulado:', error)
    return { 
      success: false, 
      error: 'Erro ao carregar simulado',
      data: null
    }
  }
}

export async function deletarSimulado(id: string) {
  try {
    const supabase = createServerActionClient({ cookies })
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { success: false, error: 'Usuário não autenticado' }
  }
    if (authError || !user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    // Primeiro deletar respostas relacionadas
    await supabase
      .from('simulado_respostas')
      .delete()
      .eq('simulado_id', id)

    // Depois deletar o simulado
    const { error } = await supabase
      .from('simulados')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      throw error
    }

    revalidatePath('/simulados')

    return { success: true, message: 'Simulado deletado com sucesso' }

  } catch (error) {
    console.error('Erro ao deletar simulado:', error)
    return { 
      success: false, 
      error: 'Erro ao deletar simulado'
    }
  }
}

export async function getEstatisticasSimulados() {
  try {
    const supabase = createServerActionClient({ cookies })
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { success: false, error: 'Usuário não autenticado' }
  }
    if (authError || !user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    // Total de simulados
    const { count: totalSimulados } = await supabase
      .from('simulados')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    // Simulados finalizados
    const { count: finalizados } = await supabase
      .from('simulados')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'finalizado')

    // Média de pontuação
    const { data: pontuacoes } = await supabase
      .from('simulados')
      .select('pontuacao')
      .eq('user_id', user.id)
      .eq('status', 'finalizado')
      .not('pontuacao', 'is', null)

    const mediaPontuacao = pontuacoes && pontuacoes.length > 0
      ? pontuacoes.reduce((acc, curr) => acc + (curr.pontuacao || 0), 0) / pontuacoes.length
      : 0

    // Performance por matéria
    const { data: respostasMateria } = await supabase
      .from('simulado_respostas')
      .select(`
        is_correct,
        questoes!inner(materia)
      `)
      .eq('simulados.user_id', user.id)

    const performancePorMateria: Record<string, { acertos: number; total: number; percentual: number }> = {}
    
    if (respostasMateria) {
      respostasMateria.forEach(resposta => {
        const materia = resposta.questoes.materia
        if (!performancePorMateria[materia]) {
          performancePorMateria[materia] = { acertos: 0, total: 0, percentual: 0 }
        }
        performancePorMateria[materia].total++
        if (resposta.is_correct) {
          performancePorMateria[materia].acertos++
        }
      })

      Object.keys(performancePorMateria).forEach(materia => {
        const stats = performancePorMateria[materia]
        stats.percentual = Math.round((stats.acertos / stats.total) * 100)
      })
    }

    return {
      success: true,
      data: {
        total_simulados: totalSimulados || 0,
        simulados_finalizados: finalizados || 0,
        media_pontuacao: Math.round(mediaPontuacao),
        performance_por_materia: performancePorMateria,
        ultima_atividade: new Date().toISOString(),
      }
    }

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return { 
      success: false, 
      error: 'Erro ao carregar estatísticas',
      data: null
    }
  }
}