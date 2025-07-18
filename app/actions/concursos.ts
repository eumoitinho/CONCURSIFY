'use server'

import { createServerClient } from '@/lib/supabase'
import { pciScraper, ConcursoData } from '@/lib/scraping/pci-scraper'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const supabase = createServerClient()

// Schema para filtros de busca
const BuscaFiltrosSchema = z.object({
  estado: z.string().optional(),
  orgao: z.string().optional(),
  materias: z.array(z.string()).optional(),
  termo: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
})

export type BuscaFiltros = z.infer<typeof BuscaFiltrosSchema>

export async function scrapeConcursos() {
  try {
    console.log('🔄 Iniciando scraping de concursos...')
    
    // Fazer scraping dos dados mais recentes
    const concursosData = await pciScraper.scrapeLatestConcursos(100)
    
    if (concursosData.length === 0) {
      return { success: false, error: 'Nenhum concurso encontrado no scraping' }
    }

    // Inserir concursos no banco (com deduplicação)
    const results = []
    for (const concurso of concursosData) {
      try {
        // Verificar se já existe
        const { data: existing } = await supabase
          .from('concursos')
          .select('id')
          .eq('link', concurso.link)
          .single()

        if (!existing) {
          // Inserir novo concurso
          const { data, error } = await supabase
            .from('concursos')
            .insert({
              titulo: concurso.titulo,
              orgao: concurso.orgao,
              vagas: concurso.vagas,
              inscricoes: concurso.inscricoes,
              link: concurso.link,
              data_prova: concurso.data_prova || null,
              materias: concurso.materias,
              estado: concurso.estado,
              scraped_at: new Date().toISOString(),
            })
            .select()
            .single()

          if (error) {
            console.error('Erro ao inserir concurso:', error)
            continue
          }

          results.push(data)
        } else {
          // Atualizar concurso existente
          const { data, error } = await supabase
            .from('concursos')
            .update({
              titulo: concurso.titulo,
              orgao: concurso.orgao,
              vagas: concurso.vagas,
              inscricoes: concurso.inscricoes,
              data_prova: concurso.data_prova || null,
              materias: concurso.materias,
              estado: concurso.estado,
              scraped_at: new Date().toISOString(),
            })
            .eq('link', concurso.link)
            .select()
            .single()

          if (!error && data) {
            results.push(data)
          }
        }
      } catch (error) {
        console.error('Erro ao processar concurso individual:', error)
        continue
      }
    }

    // Revalidar cache
    revalidatePath('/concursos')
    
    console.log(`✅ Scraping concluído: ${results.length} concursos processados`)
    
    return { 
      success: true, 
      count: results.length,
      message: `${results.length} concursos atualizados com sucesso`
    }

  } catch (error) {
    console.error('❌ Erro no scraping:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido no scraping'
    }
  }
}

export async function buscarConcursos(filtros: BuscaFiltros = {}) {
  try {
    const validatedFiltros = BuscaFiltrosSchema.parse(filtros)
    
    let query = supabase
      .from('concursos')
      .select(`
        id,
        titulo,
        orgao,
        vagas,
        inscricoes,
        link,
        data_prova,
        materias,
        estado,
        created_at,
        scraped_at
      `)
      .order('scraped_at', { ascending: false })

    // Aplicar filtros
    if (validatedFiltros.estado) {
      query = query.eq('estado', validatedFiltros.estado)
    }

    if (validatedFiltros.orgao) {
      query = query.ilike('orgao', `%${validatedFiltros.orgao}%`)
    }

    if (validatedFiltros.termo) {
      query = query.or(`titulo.ilike.%${validatedFiltros.termo}%,orgao.ilike.%${validatedFiltros.termo}%`)
    }

    if (validatedFiltros.materias && validatedFiltros.materias.length > 0) {
      query = query.overlaps('materias', validatedFiltros.materias)
    }

    // Paginação
    query = query
      .range(validatedFiltros.offset, validatedFiltros.offset + validatedFiltros.limit - 1)

    const { data, error } = await query

    if (error) {
      throw error
    }

    return { success: true, data: data || [] }

  } catch (error) {
    console.error('Erro na busca de concursos:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro na busca',
      data: []
    }
  }
}

export async function getConcursoById(id: string) {
  try {
    const { data, error } = await supabase
      .from('concursos')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      throw error
    }

    return { success: true, data }

  } catch (error) {
    console.error('Erro ao buscar concurso:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Concurso não encontrado',
      data: null
    }
  }
}

export async function getEstadosDisponiveis() {
  try {
    const { data, error } = await supabase
      .from('concursos')
      .select('estado')
      .not('estado', 'is', null)

    if (error) {
      throw error
    }

    // Extrair estados únicos
    const estados = [...new Set(data.map(item => item.estado))].sort()
    
    return { success: true, data: estados }

  } catch (error) {
    console.error('Erro ao buscar estados:', error)
    return { success: false, error: 'Erro ao carregar estados', data: [] }
  }
}

export async function getOrgaosDisponiveis() {
  try {
    const { data, error } = await supabase
      .from('concursos')
      .select('orgao')
      .not('orgao', 'is', null)
      .limit(100)

    if (error) {
      throw error
    }

    // Extrair órgãos únicos mais comuns
    const orgaos = [...new Set(data.map(item => item.orgao))]
      .sort()
      .slice(0, 50) // Limitar a 50 mais comuns
    
    return { success: true, data: orgaos }

  } catch (error) {
    console.error('Erro ao buscar órgãos:', error)
    return { success: false, error: 'Erro ao carregar órgãos', data: [] }
  }
}

export async function getMateriasDisponiveis() {
  try {
    const { data, error } = await supabase
      .from('concursos')
      .select('materias')
      .not('materias', 'is', null)

    if (error) {
      throw error
    }

    // Extrair todas as matérias e contar frequência
    const materiasCount: Record<string, number> = {}
    
    data.forEach(item => {
      if (item.materias) {
        item.materias.forEach((materia: string) => {
          materiasCount[materia] = (materiasCount[materia] || 0) + 1
        })
      }
    })

    // Ordenar por frequência e pegar as 30 mais comuns
    const materias = Object.entries(materiasCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 30)
      .map(([materia]) => materia)
    
    return { success: true, data: materias }

  } catch (error) {
    console.error('Erro ao buscar matérias:', error)
    return { success: false, error: 'Erro ao carregar matérias', data: [] }
  }
}

export async function getEstatisticasConcursos() {
  try {
    // Total de concursos
    const { count: totalConcursos } = await supabase
      .from('concursos')
      .select('*', { count: 'exact', head: true })

    // Concursos por estado
    const { data: porEstado } = await supabase
      .from('concursos')
      .select('estado')
      .not('estado', 'is', null)

    const estadosCount = porEstado?.reduce((acc: Record<string, number>, curr) => {
      acc[curr.estado] = (acc[curr.estado] || 0) + 1
      return acc
    }, {}) || {}

    // Concursos recentes (últimos 7 dias)
    const seteDiasAtras = new Date()
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7)

    const { count: recentes } = await supabase
      .from('concursos')
      .select('*', { count: 'exact', head: true })
      .gte('scraped_at', seteDiasAtras.toISOString())

    return {
      success: true,
      data: {
        total: totalConcursos || 0,
        recentes: recentes || 0,
        porEstado: estadosCount,
        ultimaAtualizacao: new Date().toISOString(),
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