'use server'

import { createServerSupabaseClient } from '@/lib/supabase'
import { questionsScraper, QuestaoData } from '@/lib/scraping/questions-scraper'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const supabase = createServerSupabaseClient()

// Schema para filtros de busca de questões
const BuscaQuestoesSchema = z.object({
  materia: z.string().optional(),
  assunto: z.string().optional(),
  orgao: z.string().optional(),
  ano: z.number().int().min(1990).max(2030).optional(),
  nivel_dificuldade: z.enum(['facil', 'medio', 'dificil']).optional(),
  tags: z.array(z.string()).optional(),
  limite: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
})

export type BuscaQuestoesFiltros = z.infer<typeof BuscaQuestoesSchema>

export async function scrapeQuestoes() {
  try {
    console.log('🔄 Iniciando scraping de questões...')
    
    // Fazer scraping de questões de múltiplas fontes
    const questoesData = await questionsScraper.scrapeMultipleSources(200)
    
    if (questoesData.length === 0) {
      return { success: false, error: 'Nenhuma questão encontrada no scraping' }
    }

    // Inserir questões no banco (com deduplicação)
    const results = []
    for (const questao of questoesData) {
      try {
        // Verificar se já existe (baseado no texto - primeiros 100 caracteres)
        const textoHash = questao.texto.substring(0, 100).toLowerCase().trim()
        
        const { data: existing } = await supabase
          .from('questoes')
          .select('id')
          .ilike('texto', `${textoHash}%`)
          .single()

        if (!existing) {
          // Inserir nova questão
          const { data, error } = await supabase
            .from('questoes')
            .insert({
              texto: questao.texto,
              alternativas: questao.alternativas,
              resposta_correta: questao.resposta_correta,
              explicacao: questao.explicacao,
              materia: questao.materia,
              assunto: questao.assunto,
              orgao: questao.orgao,
              ano: questao.ano,
              nivel_dificuldade: questao.nivel_dificuldade,
              tags: questao.tags,
              fonte: questao.fonte,
              scraped_at: new Date().toISOString(),
            })
            .select()
            .single()

          if (error) {
            console.error('Erro ao inserir questão:', error)
            continue
          }

          results.push(data)
        }
      } catch (error) {
        console.error('Erro ao processar questão individual:', error)
        continue
      }
    }

    // Revalidar cache
    revalidatePath('/simulados')
    
    console.log(`✅ Scraping de questões concluído: ${results.length} questões processadas`)
    
    return { 
      success: true, 
      count: results.length,
      message: `${results.length} questões novas adicionadas ao banco`
    }

  } catch (error) {
    console.error('❌ Erro no scraping de questões:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido no scraping'
    }
  }
}

export async function buscarQuestoes(filtros: BuscaQuestoesFiltros = {}) {
  try {
    const validatedFiltros = BuscaQuestoesSchema.parse(filtros)
    
    let query = supabase
      .from('questoes')
      .select(`
        id,
        texto,
        alternativas,
        resposta_correta,
        explicacao,
        materia,
        assunto,
        orgao,
        ano,
        nivel_dificuldade,
        tags,
        fonte,
        created_at
      `)
      .order('created_at', { ascending: false })

    // Aplicar filtros
    if (validatedFiltros.materia) {
      query = query.eq('materia', validatedFiltros.materia)
    }

    if (validatedFiltros.assunto) {
      query = query.ilike('assunto', `%${validatedFiltros.assunto}%`)
    }

    if (validatedFiltros.orgao) {
      query = query.ilike('orgao', `%${validatedFiltros.orgao}%`)
    }

    if (validatedFiltros.ano) {
      query = query.eq('ano', validatedFiltros.ano)
    }

    if (validatedFiltros.nivel_dificuldade) {
      query = query.eq('nivel_dificuldade', validatedFiltros.nivel_dificuldade)
    }

    if (validatedFiltros.tags && validatedFiltros.tags.length > 0) {
      query = query.overlaps('tags', validatedFiltros.tags)
    }

    // Paginação
    query = query
      .range(validatedFiltros.offset, validatedFiltros.offset + validatedFiltros.limite - 1)

    const { data, error } = await query

    if (error) {
      throw error
    }

    return { success: true, data: data || [] }

  } catch (error) {
    console.error('Erro na busca de questões:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro na busca',
      data: []
    }
  }
}

export async function getQuestaoById(id: string) {
  try {
    const { data, error } = await supabase
      .from('questoes')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      throw error
    }

    return { success: true, data }

  } catch (error) {
    console.error('Erro ao buscar questão:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Questão não encontrada',
      data: null
    }
  }
}

export async function getMateriasDisponiveis() {
  try {
    const { data, error } = await supabase
      .from('questoes')
      .select('materia')
      .not('materia', 'is', null)

    if (error) {
      throw error
    }

    // Extrair matérias únicas
    const materias = [...new Set(data.map(item => item.materia))].sort()
    
    return { success: true, data: materias }

  } catch (error) {
    console.error('Erro ao buscar matérias:', error)
    return { success: false, error: 'Erro ao carregar matérias', data: [] }
  }
}

export async function getAssuntosDisponiveis(materia?: string) {
  try {
    let query = supabase
      .from('questoes')
      .select('assunto')
      .not('assunto', 'is', null)

    if (materia) {
      query = query.eq('materia', materia)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    // Extrair assuntos únicos
    const assuntos = [...new Set(data.map(item => item.assunto))].sort()
    
    return { success: true, data: assuntos }

  } catch (error) {
    console.error('Erro ao buscar assuntos:', error)
    return { success: false, error: 'Erro ao carregar assuntos', data: [] }
  }
}

export async function getOrgaosQuestoes() {
  try {
    const { data, error } = await supabase
      .from('questoes')
      .select('orgao')
      .not('orgao', 'is', null)

    if (error) {
      throw error
    }

    // Extrair órgãos únicos e contar frequência
    const orgaosCount: Record<string, number> = {}
    
    data.forEach(item => {
      if (item.orgao) {
        orgaosCount[item.orgao] = (orgaosCount[item.orgao] || 0) + 1
      }
    })

    // Ordenar por frequência e pegar os 20 mais comuns
    const orgaos = Object.entries(orgaosCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([orgao]) => orgao)
    
    return { success: true, data: orgaos }

  } catch (error) {
    console.error('Erro ao buscar órgãos:', error)
    return { success: false, error: 'Erro ao carregar órgãos', data: [] }
  }
}

export async function getEstatisticasQuestoes() {
  try {
    // Total de questões
    const { count: totalQuestoes } = await supabase
      .from('questoes')
      .select('*', { count: 'exact', head: true })

    // Questões por matéria
    const { data: porMateria } = await supabase
      .from('questoes')
      .select('materia')
      .not('materia', 'is', null)

    const materiasCount = porMateria?.reduce((acc: Record<string, number>, curr) => {
      acc[curr.materia] = (acc[curr.materia] || 0) + 1
      return acc
    }, {}) || {}

    // Questões por dificuldade
    const { data: porDificuldade } = await supabase
      .from('questoes')
      .select('nivel_dificuldade')
      .not('nivel_dificuldade', 'is', null)

    const dificuldadeCount = porDificuldade?.reduce((acc: Record<string, number>, curr) => {
      acc[curr.nivel_dificuldade] = (acc[curr.nivel_dificuldade] || 0) + 1
      return acc
    }, {}) || {}

    // Questões recentes (últimos 7 dias)
    const seteDiasAtras = new Date()
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7)

    const { count: recentes } = await supabase
      .from('questoes')
      .select('*', { count: 'exact', head: true })
      .gte('scraped_at', seteDiasAtras.toISOString())

    return {
      success: true,
      data: {
        total: totalQuestoes || 0,
        recentes: recentes || 0,
        porMateria: materiasCount,
        porDificuldade: dificuldadeCount,
        ultimaAtualizacao: new Date().toISOString(),
      }
    }

  } catch (error) {
    console.error('Erro ao buscar estatísticas de questões:', error)
    return { 
      success: false, 
      error: 'Erro ao carregar estatísticas',
      data: null
    }
  }
}

export async function buscarQuestoesAleatorias(filtros: {
  materia?: string
  nivel_dificuldade?: string
  quantidade: number
}) {
  try {
    const { materia, nivel_dificuldade, quantidade } = filtros

    let query = supabase
      .from('questoes')
      .select(`
        id,
        texto,
        alternativas,
        resposta_correta,
        explicacao,
        materia,
        assunto,
        nivel_dificuldade,
        tags
      `)

    // Aplicar filtros
    if (materia) {
      query = query.eq('materia', materia)
    }

    if (nivel_dificuldade) {
      query = query.eq('nivel_dificuldade', nivel_dificuldade)
    }

    // Buscar mais questões para randomizar
    const { data, error } = await query.limit(quantidade * 3)

    if (error) {
      throw error
    }

    if (!data || data.length === 0) {
      return { success: true, data: [] }
    }

    // Embaralhar e pegar a quantidade solicitada
    const questoesEmbaralhadas = data
      .sort(() => Math.random() - 0.5)
      .slice(0, quantidade)

    return { success: true, data: questoesEmbaralhadas }

  } catch (error) {
    console.error('Erro ao buscar questões aleatórias:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro na busca',
      data: []
    }
  }
}

export async function validarResposta(questaoId: string, respostaUsuario: string) {
  try {
    const { data: questao, error } = await supabase
      .from('questoes')
      .select('resposta_correta, explicacao')
      .eq('id', questaoId)
      .single()

    if (error || !questao) {
      return { 
        success: false, 
        error: 'Questão não encontrada' 
      }
    }

    const isCorrect = questao.resposta_correta.toUpperCase() === respostaUsuario.toUpperCase()

    return {
      success: true,
      data: {
        correct: isCorrect,
        resposta_correta: questao.resposta_correta,
        explicacao: questao.explicacao,
      }
    }

  } catch (error) {
    console.error('Erro ao validar resposta:', error)
    return { 
      success: false, 
      error: 'Erro na validação'
    }
  }
}