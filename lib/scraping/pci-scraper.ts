import * as cheerio from 'cheerio'
import { z } from 'zod'

// Schema para validação dos dados extraídos
const ConcursoSchema = z.object({
  titulo: z.string().min(1),
  orgao: z.string().min(1),
  vagas: z.string().optional(),
  inscricoes: z.string().optional(),
  link: z.string().url(),
  data_prova: z.string().optional(),
  materias: z.array(z.string()).default([]),
  estado: z.string().length(2).optional(),
})

export type ConcursoData = z.infer<typeof ConcursoSchema>

export class PCIScraper {
  private baseUrl = 'https://www.pciconcursos.com.br'
  private headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
  }

  async scrapeLatestConcursos(limit: number = 50): Promise<ConcursoData[]> {
    try {
      console.log('🕷️ Iniciando scraping do PCI Concursos...')
      
      const response = await fetch(`${this.baseUrl}/concursos/`, {
        headers: this.headers,
        next: { revalidate: 3600 } // Cache por 1 hora
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const html = await response.text()
      const $ = cheerio.load(html)
      const concursos: ConcursoData[] = []

      // Seletor para os cards de concursos
      $('.ca').each((index, element) => {
        if (index >= limit) return false // Limitar resultados

        try {
          const $el = $(element)
          
          // Extrair dados do concurso
          const titulo = $el.find('h4 a').text().trim()
          const link = $el.find('h4 a').attr('href')
          const orgao = $el.find('.ca-empresa').text().trim()
          const vagas = $el.find('.ca-vagas').text().trim()
          const inscricoes = $el.find('.ca-inscricoes').text().trim()
          const localizacao = $el.find('.ca-localizacao').text().trim()

          // Extrair data da prova se disponível
          let data_prova = ''
          const dataTexto = $el.find('.ca-data').text().trim()
          if (dataTexto) {
            data_prova = this.parseDataProva(dataTexto)
          }

          // Extrair estado da localização
          const estado = this.extractEstado(localizacao)

          // Extrair matérias/áreas
          const materias = this.extractMaterias($el)

          if (titulo && link) {
            const concursoData: ConcursoData = {
              titulo,
              orgao: orgao || 'Não informado',
              vagas: vagas || 'Não informado',
              inscricoes: inscricoes || 'Não informado',
              link: link.startsWith('http') ? link : `${this.baseUrl}${link}`,
              data_prova: data_prova || undefined,
              materias,
              estado: estado || undefined,
            }

            // Validar dados
            const validatedData = ConcursoSchema.parse(concursoData)
            concursos.push(validatedData)
          }
        } catch (error) {
          console.error('Erro ao processar concurso:', error)
          // Continuar com próximo concurso
        }
      })

      console.log(`✅ Scraping concluído: ${concursos.length} concursos extraídos`)
      return concursos

    } catch (error) {
      console.error('❌ Erro no scraping:', error)
      throw new Error(`Falha no scraping: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    }
  }

  async scrapeConcursoDetails(url: string): Promise<Partial<ConcursoData> & { descricao?: string; requisitos?: string; salario?: string }> {
    try {
      const response = await fetch(url, {
        headers: this.headers,
        next: { revalidate: 86400 } // Cache por 24 horas
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const html = await response.text()
      const $ = cheerio.load(html)

      // Extrair informações detalhadas
      const descricao = $('.descricao-concurso').text().trim()
      const requisitos = $('.requisitos').text().trim()
      const salario = $('.salario').text().trim()

      // Extrair matérias mais detalhadas
      const materias: string[] = []
      $('.materias li, .disciplinas li').each((_, el) => {
        const materia = $(el).text().trim()
        if (materia) materias.push(materia)
      })

      return {
        descricao: descricao || undefined,
        requisitos: requisitos || undefined,
        salario: salario || undefined,
        materias: materias.length > 0 ? materias : undefined,
      }

    } catch (error) {
      console.error('Erro ao extrair detalhes:', error)
      return {}
    }
  }

  private parseDataProva(dataTexto: string): string {
    try {
      // Tentar extrair data no formato DD/MM/AAAA
      const dataRegex = /(\d{1,2})\/(\d{1,2})\/(\d{4})/
      const match = dataTexto.match(dataRegex)
      
      if (match) {
        const [, dia, mes, ano] = match
        return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`
      }

      return ''
    } catch {
      return ''
    }
  }

  private extractEstado(localizacao: string): string | undefined {
    // Extrair UF do texto de localização
    const estadoRegex = /\b([A-Z]{2})\b/g
    const matches = localizacao.match(estadoRegex)
    
    if (matches && matches.length > 0) {
      // Pegar o último match (geralmente é o estado)
      return matches[matches.length - 1]
    }

    return undefined
  }

  private extractMaterias($el: cheerio.Cheerio<cheerio.Element>): string[] {
    const materias: string[] = []
    
    // Tentar extrair de diferentes seletores possíveis
    const materiasTexto = $el.find('.ca-areas, .ca-materias, .areas').text().trim()
    
    if (materiasTexto) {
      // Dividir por vírgulas ou pontos e vírgulas
      const materiasArray = materiasTexto
        .split(/[,;]/)
        .map(m => m.trim())
        .filter(m => m.length > 0)
      
      materias.push(...materiasArray)
    }

    // Matérias padrão baseadas no título/órgão se não encontrou
    if (materias.length === 0) {
      materias.push('Conhecimentos Gerais', 'Português', 'Matemática')
    }

    return materias
  }

  // Método para scraping com filtros específicos
  async scrapeWithFilters(filters: {
    estado?: string
    cargo?: string
    escolaridade?: string
    salarioMin?: number
  }): Promise<ConcursoData[]> {
    try {
      let url = `${this.baseUrl}/concursos/`
      const params = new URLSearchParams()

      if (filters.estado) params.append('uf', filters.estado)
      if (filters.cargo) params.append('cargo', filters.cargo)
      if (filters.escolaridade) params.append('escolaridade', filters.escolaridade)
      if (filters.salarioMin) params.append('salario_min', filters.salarioMin.toString())

      if (params.toString()) {
        url += '?' + params.toString()
      }

      const response = await fetch(url, {
        headers: this.headers,
        next: { revalidate: 1800 } // Cache por 30 minutos
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const html = await response.text()
      const $ = cheerio.load(html)
      
      return this.parseConcursosFromHTML($)

    } catch (error) {
      console.error('Erro no scraping com filtros:', error)
      return []
    }
  }

  private parseConcursosFromHTML($: cheerio.CheerioAPI): ConcursoData[] {
    const concursos: ConcursoData[] = []

    $('.ca').each((index, element) => {
      try {
        const $el = $(element)
        
        const titulo = $el.find('h4 a').text().trim()
        const link = $el.find('h4 a').attr('href')
        const orgao = $el.find('.ca-empresa').text().trim()
        const vagas = $el.find('.ca-vagas').text().trim()
        const inscricoes = $el.find('.ca-inscricoes').text().trim()
        const localizacao = $el.find('.ca-localizacao').text().trim()

        if (titulo && link) {
          const concursoData: ConcursoData = {
            titulo,
            orgao: orgao || 'Não informado',
            vagas: vagas || 'Não informado',
            inscricoes: inscricoes || 'Não informado',
            link: link.startsWith('http') ? link : `${this.baseUrl}${link}`,
            materias: this.extractMaterias($el),
            estado: this.extractEstado(localizacao),
          }

          const validatedData = ConcursoSchema.parse(concursoData)
          concursos.push(validatedData)
        }
      } catch (error) {
        console.error('Erro ao processar concurso:', error)
      }
    })

    return concursos
  }
}

// Instância singleton do scraper
export const pciScraper = new PCIScraper()