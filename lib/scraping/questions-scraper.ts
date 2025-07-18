import * as cheerio from 'cheerio'
import { z } from 'zod'

// Schema para validação das questões extraídas
const QuestaoSchema = z.object({
  texto: z.string().min(1),
  alternativas: z.array(z.string()).min(2).max(5),
  resposta_correta: z.string().regex(/^[A-E]$/),
  explicacao: z.string().optional(),
  materia: z.string().min(1),
  assunto: z.string().min(1),
  orgao: z.string().optional(),
  ano: z.number().int().min(1990).max(2030).optional(),
  nivel_dificuldade: z.enum(['facil', 'medio', 'dificil']).optional(),
  tags: z.array(z.string()).default([]),
  fonte: z.string().min(1),
})

export type QuestaoData = z.infer<typeof QuestaoSchema>

export class QuestionsScraper {
  private headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
    'Connection': 'keep-alive',
  }

  async scrapeQuestoesConcursos(limit: number = 100): Promise<QuestaoData[]> {
    try {
      console.log('🕷️ Iniciando scraping de questões - Questões de Concursos...')
      
      const questoes: QuestaoData[] = []
      const baseUrl = 'https://www.qconcursos.com'
      
      // Buscar questões por matéria principal
      const materias = [
        'portugues',
        'matematica', 
        'direito-constitucional',
        'direito-administrativo',
        'informatica',
        'conhecimentos-gerais'
      ]

      for (const materia of materias) {
        if (questoes.length >= limit) break
        
        try {
          const questoesMateria = await this.scrapeQuestoesByMateria(
            materia,
            Math.min(20, limit - questoes.length)
          )
          questoes.push(...questoesMateria)
        } catch (error) {
          console.error(`Erro ao extrair questões de ${materia}:`, error)
          continue
        }
      }

      console.log(`✅ Scraping concluído: ${questoes.length} questões extraídas`)
      return questoes

    } catch (error) {
      console.error('❌ Erro no scraping de questões:', error)
      throw new Error(`Falha no scraping: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    }
  }

  private async scrapeQuestoesByMateria(materia: string, limit: number): Promise<QuestaoData[]> {
    const questoes: QuestaoData[] = []
    const url = `https://www.qconcursos.com/questoes-de-concursos/${materia}`

    try {
      const response = await fetch(url, {
        headers: this.headers,
        next: { revalidate: 7200 } // Cache por 2 horas
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const html = await response.text()
      const $ = cheerio.load(html)

      // Buscar questões na página
      $('.q-item, .question-item, .questao').each((index, element) => {
        if (index >= limit) return false

        try {
          const questao = this.parseQuestaoElement($, $(element), materia)
          if (questao) {
            questoes.push(questao)
          }
        } catch (error) {
          console.error('Erro ao processar questão:', error)
        }
      })

    } catch (error) {
      console.error(`Erro no scraping de ${materia}:`, error)
    }

    return questoes
  }

  private parseQuestaoElement($: cheerio.CheerioAPI, $element: cheerio.Cheerio<cheerio.Element>, materia: string): QuestaoData | null {
    try {
      // Extrair texto da questão
      const textoQuestao = $element.find('.q-text, .question-text, .enunciado').text().trim()
      if (!textoQuestao) return null

      // Extrair alternativas
      const alternativas: string[] = []
      $element.find('.q-alternatives li, .alternatives li, .alternativa').each((_, alt) => {
        const altTexto = $(alt).text().trim()
        if (altTexto) {
          // Remover letra da alternativa (A), B), etc.)
          const altLimpa = altTexto.replace(/^[A-E]\)\s*/, '').trim()
          if (altLimpa) alternativas.push(altLimpa)
        }
      })

      if (alternativas.length < 2) return null

      // Extrair resposta correta
      let respostaCorreta = $element.find('.q-answer, .correct-answer, .gabarito').text().trim()
      if (!respostaCorreta) {
        respostaCorreta = $element.attr('data-answer') || 'A' // Fallback
      }
      
      // Normalizar resposta (garantir que seja A, B, C, D, ou E)
      respostaCorreta = respostaCorreta.toUpperCase().replace(/[^A-E]/, '').charAt(0) || 'A'

      // Extrair explicação se disponível
      const explicacao = $element.find('.q-explanation, .explanation, .comentario').text().trim() || undefined

      // Extrair informações adicionais
      const orgao = this.extractOrgao($element, $)
      const ano = this.extractAno($element, $)
      const assunto = this.extractAssunto($element, $, materia)

      // Determinar nível de dificuldade (heurística simples)
      const dificuldade = this.determineDificuldade(textoQuestao, alternativas)

      // Gerar tags baseadas no conteúdo
      const tags = this.generateTags(textoQuestao, materia, assunto)

      const questaoData: QuestaoData = {
        texto: textoQuestao,
        alternativas,
        resposta_correta: respostaCorreta as 'A' | 'B' | 'C' | 'D' | 'E',
        explicacao,
        materia: this.normalizeMateriaName(materia),
        assunto,
        orgao,
        ano,
        nivel_dificuldade: dificuldade,
        tags,
        fonte: 'Questões de Concursos'
      }

      // Validar com schema
      return QuestaoSchema.parse(questaoData)

    } catch (error) {
      console.error('Erro ao fazer parse da questão:', error)
      return null
    }
  }

  private extractOrgao($element: cheerio.Cheerio<cheerio.Element>, $: cheerio.CheerioAPI): string | undefined {
    const orgaoTexto = $element.find('.q-org, .organization, .banca, .orgao').text().trim()
    if (orgaoTexto) {
      // Limpar e normalizar nome do órgão
      return orgaoTexto.replace(/\s+/g, ' ').trim()
    }
    return undefined
  }

  private extractAno($element: cheerio.Cheerio<cheerio.Element>, $: cheerio.CheerioAPI): number | undefined {
    const anoTexto = $element.find('.q-year, .year, .ano').text().trim()
    if (anoTexto) {
      const anoMatch = anoTexto.match(/\b(19|20)\d{2}\b/)
      if (anoMatch) {
        return parseInt(anoMatch[0])
      }
    }
    return undefined
  }

  private extractAssunto($element: cheerio.Cheerio<cheerio.Element>, $: cheerio.CheerioAPI, materia: string): string {
    const assuntoTexto = $element.find('.q-subject, .subject, .assunto').text().trim()
    if (assuntoTexto) {
      return assuntoTexto
    }

    // Fallback baseado na matéria
    const assuntosPorMateria: Record<string, string> = {
      'portugues': 'Interpretação de Texto',
      'matematica': 'Matemática Básica',
      'direito-constitucional': 'Princípios Constitucionais',
      'direito-administrativo': 'Atos Administrativos',
      'informatica': 'Conceitos Básicos',
      'conhecimentos-gerais': 'Atualidades'
    }

    return assuntosPorMateria[materia] || 'Geral'
  }

  private determineDificuldade(texto: string, alternativas: string[]): 'facil' | 'medio' | 'dificil' {
    let pontos = 0

    // Heurísticas para determinar dificuldade
    
    // Tamanho do texto
    if (texto.length > 500) pontos += 2
    else if (texto.length > 200) pontos += 1

    // Complexidade das alternativas
    const mediaAlternativas = alternativas.reduce((acc, alt) => acc + alt.length, 0) / alternativas.length
    if (mediaAlternativas > 50) pontos += 2
    else if (mediaAlternativas > 25) pontos += 1

    // Palavras-chave de complexidade
    const palavrasComplexas = [
      'conforme', 'segundo', 'mediante', 'outrossim', 'destarte',
      'jurisprudência', 'doutrina', 'precedente', 'súmula'
    ]
    
    const temPalavrasComplexas = palavrasComplexas.some(palavra => 
      texto.toLowerCase().includes(palavra)
    )
    if (temPalavrasComplexas) pontos += 2

    // Presença de números/cálculos
    if (/\d+[.,]\d+|\d+%|\d+\/\d+/.test(texto)) pontos += 1

    // Classificação final
    if (pontos >= 4) return 'dificil'
    if (pontos >= 2) return 'medio'
    return 'facil'
  }

  private generateTags(texto: string, materia: string, assunto: string): string[] {
    const tags: string[] = []

    // Tags baseadas na matéria
    tags.push(materia)

    // Tags baseadas no assunto
    if (assunto !== 'Geral') {
      tags.push(assunto.toLowerCase())
    }

    // Tags baseadas no conteúdo
    const palavrasChave = [
      { palavra: 'constituição', tag: 'constitucional' },
      { palavra: 'lei', tag: 'legislacao' },
      { palavra: 'direito', tag: 'juridico' },
      { palavra: 'cálculo', tag: 'matematica' },
      { palavra: 'interpretação', tag: 'interpretacao' },
      { palavra: 'gramática', tag: 'gramatica' },
      { palavra: 'informática', tag: 'tecnologia' },
      { palavra: 'história', tag: 'historia' },
      { palavra: 'geografia', tag: 'geografia' }
    ]

    const textoLower = texto.toLowerCase()
    palavrasChave.forEach(({ palavra, tag }) => {
      if (textoLower.includes(palavra)) {
        tags.push(tag)
      }
    })

    // Remover duplicatas e limitar a 5 tags
    return [...new Set(tags)].slice(0, 5)
  }

  private normalizeMateriaName(materia: string): string {
    const materiaMap: Record<string, string> = {
      'portugues': 'Português',
      'matematica': 'Matemática',
      'direito-constitucional': 'Direito Constitucional',
      'direito-administrativo': 'Direito Administrativo',
      'informatica': 'Informática',
      'conhecimentos-gerais': 'Conhecimentos Gerais'
    }

    return materiaMap[materia] || materia
  }

  // Método para scraping específico por filtros
  async scrapeWithFilters(filters: {
    materia?: string
    orgao?: string
    ano?: number
    dificuldade?: string
    limit?: number
  }): Promise<QuestaoData[]> {
    try {
      const { materia = 'portugues', limit = 50 } = filters
      
      console.log(`🔍 Scraping com filtros: ${JSON.stringify(filters)}`)
      
      const questoes = await this.scrapeQuestoesByMateria(materia, limit)
      
      // Aplicar filtros adicionais
      let questoesFiltradas = questoes

      if (filters.orgao) {
        questoesFiltradas = questoesFiltradas.filter(q => 
          q.orgao?.toLowerCase().includes(filters.orgao!.toLowerCase())
        )
      }

      if (filters.ano) {
        questoesFiltradas = questoesFiltradas.filter(q => q.ano === filters.ano)
      }

      if (filters.dificuldade) {
        questoesFiltradas = questoesFiltradas.filter(q => 
          q.nivel_dificuldade === filters.dificuldade
        )
      }

      return questoesFiltradas.slice(0, limit)

    } catch (error) {
      console.error('Erro no scraping com filtros:', error)
      return []
    }
  }

  // Método para extrair questões de múltiplas fontes
  async scrapeMultipleSources(limit: number = 200): Promise<QuestaoData[]> {
    const questoes: QuestaoData[] = []

    try {
      // Fonte 1: Questões de Concursos
      const questoesQC = await this.scrapeQuestoesConcursos(limit / 2)
      questoes.push(...questoesQC)

      // Fonte 2: Gran Cursos (implementar quando necessário)
      // const questoesGran = await this.scrapeGranCursos(limit / 4)
      // questoes.push(...questoesGran)

      // Fonte 3: TEC Concursos (implementar quando necessário)
      // const questoesTEC = await this.scrapeTECConcursos(limit / 4)
      // questoes.push(...questoesTEC)

      // Deduplicação baseada no texto da questão
      const questoesUnicas = this.removeDuplicates(questoes)

      console.log(`✅ Total de questões únicas extraídas: ${questoesUnicas.length}`)
      return questoesUnicas

    } catch (error) {
      console.error('Erro no scraping de múltiplas fontes:', error)
      return questoes
    }
  }

  private removeDuplicates(questoes: QuestaoData[]): QuestaoData[] {
    const uniqueQuestoes = new Map<string, QuestaoData>()

    questoes.forEach(questao => {
      // Criar hash baseado no texto (primeiras 100 caracteres)
      const hash = questao.texto.substring(0, 100).toLowerCase().trim()
      
      if (!uniqueQuestoes.has(hash)) {
        uniqueQuestoes.set(hash, questao)
      }
    })

    return Array.from(uniqueQuestoes.values())
  }
}

// Instância singleton do scraper
export const questionsScraper = new QuestionsScraper()