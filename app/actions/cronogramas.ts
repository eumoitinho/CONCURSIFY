'use server'

import { createServerSupabaseClient } from '@/lib/supabase'
import { geminiAI, UserPreferences, CronogramaData } from '@/lib/ai/gemini'
import { SubscriptionLimits, checkFeatureAccess } from '@/lib/middleware/subscription-check'
import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const supabase = createServerSupabaseClient()

// Schema para geração de cronograma
const GerarCronogramaSchema = z.object({
  concurso_id: z.string().uuid(),
  user_preferences: z.object({
    horasDisponiveis: z.number().min(1).max(24),
    diasSemana: z.array(z.number().min(0).max(6)),
    materiasPrioritarias: z.array(z.string()),
    nivelConhecimento: z.enum(['iniciante', 'intermediario', 'avancado']),
    tempoProva: z.string().optional(),
    pontosFortes: z.array(z.string()).optional(),
    pontosFracos: z.array(z.string()).optional(),
    metodoEstudo: z.enum(['teorico', 'pratico', 'misto']).default('misto'),
  })
})

export async function gerarCronograma(input: z.infer<typeof GerarCronogramaSchema>) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    // Verificar acesso à feature
    const accessCheck = await checkFeatureAccess(session.user.id, 'cronogramas')
    if (!accessCheck.allowed) {
      return { 
        success: false, 
        error: accessCheck.error,
        requiresUpgrade: accessCheck.upgradeRequired
      }
    }

    // Validar input
    const validatedInput = GerarCronogramaSchema.parse(input)

    // Buscar dados do concurso
    const { data: concurso, error: concursoError } = await supabase
      .from('concursos')
      .select('*')
      .eq('id', validatedInput.concurso_id)
      .single()

    if (concursoError || !concurso) {
      return { success: false, error: 'Concurso não encontrado' }
    }

    console.log('🤖 Gerando cronograma com IA...')

    // Gerar cronograma com IA
    const cronogramaData = await geminiAI.gerarCronograma(
      {
        titulo: concurso.titulo,
        orgao: concurso.orgao,
        materias: concurso.materias || [],
        data_prova: concurso.data_prova
      },
      validatedInput.user_preferences
    )

    // Salvar cronograma no banco
    const { data: cronogramaSalvo, error: saveError } = await supabase
      .from('cronogramas')
      .insert({
        concurso_id: validatedInput.concurso_id,
        user_id: session.user.id,
        user_preferences: validatedInput.user_preferences,
        cronograma_data: cronogramaData,
      })
      .select()
      .single()

    if (saveError) {
      console.error('Erro ao salvar cronograma:', saveError)
      return { success: false, error: 'Erro ao salvar cronograma' }
    }

    // Registrar uso da feature
    await SubscriptionLimits.trackFeatureUsage(session.user.id, 'cronogramas')

    // Revalidar cache
    revalidatePath('/concursos')
    revalidatePath('/cronogramas')

    console.log('✅ Cronograma gerado e salvo com sucesso')

    return { 
      success: true, 
      data: cronogramaSalvo,
      message: 'Cronograma gerado com sucesso!'
    }

  } catch (error) {
    console.error('❌ Erro ao gerar cronograma:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }
  }
}

export async function buscarCronogramas(userId?: string) {
  try {
    const session = await getServerSession()
    const targetUserId = userId || session?.user?.id

    if (!targetUserId) {
      return { success: false, error: 'Usuário não identificado' }
    }

    const { data, error } = await supabase
      .from('cronogramas')
      .select(`
        *,
        concursos:concurso_id (
          titulo,
          orgao,
          data_prova,
          materias
        )
      `)
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return { success: true, data: data || [] }

  } catch (error) {
    console.error('Erro ao buscar cronogramas:', error)
    return { 
      success: false, 
      error: 'Erro ao carregar cronogramas',
      data: []
    }
  }
}

export async function getCronogramaById(id: string) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const { data, error } = await supabase
      .from('cronogramas')
      .select(`
        *,
        concursos:concurso_id (
          titulo,
          orgao,
          data_prova,
          materias,
          link
        )
      `)
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single()

    if (error || !data) {
      return { success: false, error: 'Cronograma não encontrado' }
    }

    return { success: true, data }

  } catch (error) {
    console.error('Erro ao buscar cronograma:', error)
    return { 
      success: false, 
      error: 'Erro ao carregar cronograma',
      data: null
    }
  }
}

export async function deletarCronograma(id: string) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const { error } = await supabase
      .from('cronogramas')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id)

    if (error) {
      throw error
    }

    revalidatePath('/cronogramas')

    return { success: true, message: 'Cronograma deletado com sucesso' }

  } catch (error) {
    console.error('Erro ao deletar cronograma:', error)
    return { 
      success: false, 
      error: 'Erro ao deletar cronograma'
    }
  }
}

export async function atualizarCronograma(id: string, updates: Partial<CronogramaData>) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    // Buscar cronograma atual
    const { data: cronogramaAtual, error: fetchError } = await supabase
      .from('cronogramas')
      .select('cronograma_data')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single()

    if (fetchError || !cronogramaAtual) {
      return { success: false, error: 'Cronograma não encontrado' }
    }

    // Mesclar updates com dados existentes
    const cronogramaAtualizado = {
      ...cronogramaAtual.cronograma_data,
      ...updates
    }

    // Salvar atualização
    const { error: updateError } = await supabase
      .from('cronogramas')
      .update({
        cronograma_data: cronogramaAtualizado,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', session.user.id)

    if (updateError) {
      throw updateError
    }

    revalidatePath('/cronogramas')

    return { success: true, message: 'Cronograma atualizado com sucesso' }

  } catch (error) {
    console.error('Erro ao atualizar cronograma:', error)
    return { 
      success: false, 
      error: 'Erro ao atualizar cronograma'
    }
  }
}

export async function gerarDicasPersonalizadas(materias: string[], nivelConhecimento: string) {
  try {
    const session = await getServerSession()
    if (!session?.user?.id) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    console.log('🤖 Gerando dicas personalizadas...')

    // Buscar histórico do usuário para personalização
    const { data: historico } = await supabase
      .from('pomodoro_sessions')
      .select('subject, duration, completed')
      .eq('user_id', session.user.id)
      .limit(20)

    const pontosFortes: string[] = []
    const pontosFracos: string[] = []

    // Analisar histórico se disponível
    if (historico && historico.length > 0) {
      const materiaStats = historico.reduce((acc: Record<string, { total: number; completed: number }>, session) => {
        const materia = session.subject || 'Geral'
        if (!acc[materia]) acc[materia] = { total: 0, completed: 0 }
        acc[materia].total++
        if (session.completed) acc[materia].completed++
        return acc
      }, {})

      Object.entries(materiaStats).forEach(([materia, stats]) => {
        const completionRate = stats.completed / stats.total
        if (completionRate > 0.8) {
          pontosFortes.push(materia)
        } else if (completionRate < 0.5) {
          pontosFracos.push(materia)
        }
      })
    }

    const dicas = await geminiAI.gerarDicasPersonalizadas(
      materias,
      nivelConhecimento,
      pontosFortes,
      pontosFracos
    )

    return { 
      success: true, 
      data: dicas,
      pontosFortes,
      pontosFracos
    }

  } catch (error) {
    console.error('Erro ao gerar dicas:', error)
    return { 
      success: false, 
      error: 'Erro ao gerar dicas personalizadas',
      data: []
    }
  }
}

export async function getEstatisticasCronogramas(userId?: string) {
  try {
    const session = await getServerSession()
    const targetUserId = userId || session?.user?.id

    if (!targetUserId) {
      return { success: false, error: 'Usuário não identificado' }
    }

    // Total de cronogramas
    const { count: totalCronogramas } = await supabase
      .from('cronogramas')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', targetUserId)

    // Cronogramas por mês
    const { data: cronogramasPorMes } = await supabase
      .from('cronogramas')
      .select('created_at')
      .eq('user_id', targetUserId)
      .gte('created_at', new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString()) // últimos 6 meses

    const mesStats = cronogramasPorMes?.reduce((acc: Record<string, number>, cronograma) => {
      const mes = new Date(cronograma.created_at).toISOString().substring(0, 7) // YYYY-MM
      acc[mes] = (acc[mes] || 0) + 1
      return acc
    }, {}) || {}

    return {
      success: true,
      data: {
        total: totalCronogramas || 0,
        porMes: mesStats,
        ultimoGerado: cronogramasPorMes?.[0]?.created_at || null,
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