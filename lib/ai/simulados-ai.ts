import { GoogleGenerativeAI } from '@google/generative-ai'
import { z } from 'zod'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// Schema para configuração do simulado
const ConfiguracaoSimuladoSchema = z.object({
  titulo: z.string().min(1),
  materias: z.array(z.string()).min(1),
  num_questoes: z.number().min(1).max(100),
  tempo_limite: z.number().min(1).max(300), // em minutos
  nivel_dificuldade: z.enum(['facil', 'medio', 'dificil', 'misto']).default('misto'),
  orgaos_preferidos: z.array(z.string()).optional(),
  anos_preferidos: z.array(z.number()).optional(),
  assuntos_focados: z.array(z.string()).optional(),
  modo: z.enum(['prova', 'treino', 'revisao']).default('treino'),
})

// Schema para análise de performance
const AnalisePerformanceSchema = z.object({
  questoes_respondidas: z.array(z.object({
    questao_id: z.string(),
    resposta_usuario: z.string(),
    resposta_correta: z.string(),
    tempo_resposta: z.number(), // em segundos
    materia: z.string(),
    assunto: z.string(),
    nivel_dificuldade: z.string(),
  })),
  tempo_total: z.number(), // em minutos
})

export type ConfiguracaoSimulado = z.infer<typeof ConfiguracaoSimuladoSchema>
export type AnalisePerformance = z.infer<typeof AnalisePerformanceSchema>

export interface SimuladoGerado {
  configuracao: ConfiguracaoSimulado
  questoes_selecionadas: string[] // IDs das questões
  distribuicao: {
    por_materia: Record<string, number>
    por_dificuldade: Record<string, number>
    por_assunto: Record<string, number>
  }
  tempo_estimado: number
  dicas_preparacao: string[]
}

export interface FeedbackDetalhado {
  pontuacao_geral: number
  pontuacao_por_materia: Record<string, { acertos: number; total: number; percentual: number }>
  pontos_fortes: string[]
  pontos_fracos: string[]
  recomendacoes: string[]
  tempo_medio_por_questao: number
  questoes_mais_demoradas: Array<{ questao_id: string; tempo: number; materia: string }>
  nivel_sugerido: 'facil' | 'medio' | 'dificil'
  plano_estudo_sugerido: {
    materias_prioritarias: string[]
    tempo_sugerido_por_materia: Record<string, number>
    proximos_assuntos: string[]
  }
}

export class SimuladosAI {
  private model = genAI.getGenerativeModel({ model: 'gemini-pro' })

  async gerarConfiguracaoOtimizada(
    preferenciasUsuario: {
      materias_interesse: string[]
      nivel_atual: string
      tempo_disponivel: number
      objetivos: string[]
      historico_performance?: Record<string, number>
    },
    bancoQuestoes: Array<{
      id: string
      materia: string
      assunto: string
      nivel_dificuldade: string
      tags: string[]
    }>
  ): Promise<ConfiguracaoSimulado> {
    try {
      const prompt = this.buildConfiguracaoPrompt(preferenciasUsuario, bancoQuestoes)
      
      const result = await this.model.generateContent(prompt)
      const response = result.response.text()
      
      const configuracaoData = this.parseAIResponse(response)
      const validatedConfig = ConfiguracaoSimuladoSchema.parse(configuracaoData)
      
      return validatedConfig

    } catch (error) {
      console.error('Erro ao gerar configuração:', error)
      return this.getFallbackConfiguracao(preferenciasUsuario)
    }
  }

  async selecionarQuestoes(
    configuracao: ConfiguracaoSimulado,
    bancoQuestoes: Array<{
      id: string
      materia: string
      assunto: string
      nivel_dificuldade: string
      tags: string[]
      orgao?: string
      ano?: number
    }>
  ): Promise<SimuladoGerado> {
    try {
      // Filtrar questões baseado na configuração
      let questoesFiltradas = bancoQuestoes.filter(q => 
        configuracao.materias.includes(q.materia)
      )

      // Aplicar filtros adicionais
      if (configuracao.orgaos_preferidos?.length) {
        questoesFiltradas = questoesFiltradas.filter(q => 
          configuracao.orgaos_preferidos!.some(orgao => 
            q.orgao?.toLowerCase().includes(orgao.toLowerCase())
          )
        )
      }

      if (configuracao.anos_preferidos?.length) {
        questoesFiltradas = questoesFiltradas.filter(q => 
          configuracao.anos_preferidos!.includes(q.ano!)
        )
      }

      // Algoritmo de seleção inteligente
      const questoesSelecionadas = this.selecionarQuestoesInteligente(
        questoesFiltradas,
        configuracao
      )

      // Calcular distribuição
      const distribuicao = this.calcularDistribuicao(questoesSelecionadas, bancoQuestoes)

      // Estimar tempo
      const tempoEstimado = this.calcularTempoEstimado(questoesSelecionadas, configuracao)

      // Gerar dicas
      const dicas = await this.gerarDicasPreparacao(configuracao, questoesSelecionadas)

      return {
        configuracao,
        questoes_selecionadas: questoesSelecionadas,
        distribuicao,
        tempo_estimado: tempoEstimado,
        dicas_preparacao: dicas
      }

    } catch (error) {
      console.error('Erro na seleção de questões:', error)
      throw new Error('Falha na geração do simulado')
    }
  }

  async analisarPerformance(
    analiseData: AnalisePerformance,
    configuracao: ConfiguracaoSimulado
  ): Promise<FeedbackDetalhado> {
    try {
      const prompt = this.buildAnalisePrompt(analiseData, configuracao)
      
      const result = await this.model.generateContent(prompt)
      const response = result.response.text()
      
      const feedbackIA = this.parseAnaliseResponse(response)
      
      // Combinar análise IA com cálculos precisos
      const feedback = this.calcularFeedbackDetalhado(analiseData, feedbackIA)
      
      return feedback

    } catch (error) {
      console.error('Erro na análise de performance:', error)
      return this.getFallbackFeedback(analiseData)
    }
  }

  private selecionarQuestoesInteligente(
    questoesDisponiveis: Array<{
      id: string
      materia: string
      assunto: string
      nivel_dificuldade: string
      tags: string[]
    }>,
    configuracao: ConfiguracaoSimulado
  ): string[] {
    const questoesSelecionadas: string[] = []
    const questoesPorMateria = this.agruparPorMateria(questoesDisponiveis)
    
    // Distribuir questões por matéria proporcionalmente
    const questoesPorMateriaCount = Math.floor(configuracao.num_questoes / configuracao.materias.length)
    const questoesExtras = configuracao.num_questoes % configuracao.materias.length

    configuracao.materias.forEach((materia, index) => {
      const questoesMateria = questoesPorMateria[materia] || []
      let numQuestoes = questoesPorMateriaCount
      
      // Distribuir questões extras
      if (index < questoesExtras) {
        numQuestoes++
      }

      // Selecionar questões da matéria respeitando distribuição de dificuldade
      const questoesMateriaIds = this.selecionarPorDificuldade(
        questoesMateria,
        numQuestoes,
        configuracao.nivel_dificuldade
      )

      questoesSelecionadas.push(...questoesMateriaIds)
    })

    // Embaralhar questões
    return questoesSelecionadas.sort(() => Math.random() - 0.5)
  }

  private selecionarPorDificuldade(
    questoes: Array<{ id: string; nivel_dificuldade: string }>,
    quantidade: number,
    nivelDesejado: string
  ): string[] {
    if (nivelDesejado === 'misto') {
      // Distribuição balanceada: 30% fácil, 50% médio, 20% difícil
      const faceis = questoes.filter(q => q.nivel_dificuldade === 'facil')
      const medias = questoes.filter(q => q.nivel_dificuldade === 'medio')
      const dificeis = questoes.filter(q => q.nivel_dificuldade === 'dificil')

      const numFaceis = Math.floor(quantidade * 0.3)
      const numMedias = Math.floor(quantidade * 0.5)
      const numDificeis = quantidade - numFaceis - numMedias

      const selecionadas = [
        ...this.embaralharESelecionar(faceis, numFaceis),
        ...this.embaralharESelecionar(medias, numMedias),
        ...this.embaralharESelecionar(dificeis, numDificeis)
      ]

      return selecionadas.map(q => q.id)
    } else {
      // Selecionar apenas do nível específico
      const questoesFiltradas = questoes.filter(q => q.nivel_dificuldade === nivelDesejado)
      const selecionadas = this.embaralharESelecionar(questoesFiltradas, quantidade)
      return selecionadas.map(q => q.id)
    }
  }

  private embaralharESelecionar<T>(array: T[], quantidade: number): T[] {
    const embaralhado = [...array].sort(() => Math.random() - 0.5)
    return embaralhado.slice(0, Math.min(quantidade, embaralhado.length))
  }

  private agruparPorMateria(questoes: Array<{ materia: string; [key: string]: any }>): Record<string, Array<any>> {
    return questoes.reduce((acc, questao) => {
      if (!acc[questao.materia]) {
        acc[questao.materia] = []
      }
      acc[questao.materia].push(questao)
      return acc
    }, {} as Record<string, Array<any>>)
  }

  private calcularDistribuicao(
    questoesSelecionadas: string[],
    bancoQuestoes: Array<{
      id: string
      materia: string
      assunto: string
      nivel_dificuldade: string
    }>
  ) {
    const questoesData = bancoQuestoes.filter(q => questoesSelecionadas.includes(q.id))

    const porMateria: Record<string, number> = {}
    const porDificuldade: Record<string, number> = {}
    const porAssunto: Record<string, number> = {}

    questoesData.forEach(q => {
      porMateria[q.materia] = (porMateria[q.materia] || 0) + 1
      porDificuldade[q.nivel_dificuldade] = (porDificuldade[q.nivel_dificuldade] || 0) + 1
      porAssunto[q.assunto] = (porAssunto[q.assunto] || 0) + 1
    })

    return { por_materia: porMateria, por_dificuldade: porDificuldade, por_assunto: porAssunto }
  }

  private calcularTempoEstimado(questoesSelecionadas: string[], configuracao: ConfiguracaoSimulado): number {
    // Tempo base por questão baseado na dificuldade (em minutos)
    const tempoBase = 2.5 // minutos por questão média
    const numQuestoes = questoesSelecionadas.length
    
    return Math.min(numQuestoes * tempoBase, configuracao.tempo_limite)
  }

  private async gerarDicasPreparacao(
    configuracao: ConfiguracaoSimulado,
    questoesSelecionadas: string[]
  ): Promise<string[]> {
    try {
      const prompt = `
Como especialista em concursos, gere 5 dicas práticas de preparação para um simulado com:

- ${questoesSelecionadas.length} questões
- Matérias: ${configuracao.materias.join(', ')}
- Tempo limite: ${configuracao.tempo_limite} minutos
- Nível: ${configuracao.nivel_dificuldade}
- Modo: ${configuracao.modo}

Dicas devem ser específicas e práticas. Uma dica por linha, começando com "- ".
`

      const result = await this.model.generateContent(prompt)
      const response = result.response.text()

      const dicas = response
        .split('\n')
        .filter(linha => linha.trim().startsWith('- '))
        .map(linha => linha.replace(/^- /, '').trim())
        .filter(dica => dica.length > 10)

      return dicas.slice(0, 5)

    } catch (error) {
      console.error('Erro ao gerar dicas:', error)
      return [
        'Leia cada questão com atenção antes de responder',
        'Gerencie bem o tempo - não fique muito tempo em uma questão',
        'Elimine alternativas claramente incorretas',
        'Revise as questões que tiver dúvida ao final',
        'Mantenha a calma e concentração durante todo o simulado'
      ]
    }
  }

  private buildConfiguracaoPrompt(
    preferencias: any,
    bancoQuestoes: any[]
  ): string {
    return `
Você é um especialista em elaboração de simulados para concursos públicos.

PREFERÊNCIAS DO USUÁRIO:
- Matérias de interesse: ${preferencias.materias_interesse.join(', ')}
- Nível atual: ${preferencias.nivel_atual}
- Tempo disponível: ${preferencias.tempo_disponivel} minutos
- Objetivos: ${preferencias.objetivos.join(', ')}

BANCO DE QUESTÕES DISPONÍVEL:
- Total de questões: ${bancoQuestoes.length}
- Matérias disponíveis: ${[...new Set(bancoQuestoes.map(q => q.materia))].join(', ')}

Crie uma configuração otimizada para simulado retornando APENAS um JSON:

{
  "titulo": "Nome do simulado",
  "materias": ["materia1", "materia2"],
  "num_questoes": 30,
  "tempo_limite": 90,
  "nivel_dificuldade": "misto",
  "modo": "treino"
}
`
  }

  private buildAnalisePrompt(analise: AnalisePerformance, configuracao: ConfiguracaoSimulado): string {
    const acertos = analise.questoes_respondidas.filter(q => 
      q.resposta_usuario === q.resposta_correta
    ).length

    const percentualAcerto = (acertos / analise.questoes_respondidas.length) * 100

    return `
Analise a performance do usuário em um simulado:

CONFIGURAÇÃO DO SIMULADO:
- Matérias: ${configuracao.materias.join(', ')}
- Total de questões: ${configuracao.num_questoes}
- Tempo limite: ${configuracao.tempo_limite} minutos

PERFORMANCE:
- Acertos: ${acertos}/${analise.questoes_respondidas.length} (${percentualAcerto.toFixed(1)}%)
- Tempo total usado: ${analise.tempo_total} minutos

ANÁLISE POR MATÉRIA:
${this.gerarAnaliseMateriasTexto(analise.questoes_respondidas)}

Forneça uma análise detalhada em JSON:

{
  "pontos_fortes": ["area1", "area2"],
  "pontos_fracos": ["area3", "area4"],
  "recomendacoes": ["recomendacao1", "recomendacao2", "recomendacao3"],
  "nivel_sugerido": "medio",
  "materias_prioritarias": ["materia1", "materia2"]
}
`
  }

  private gerarAnaliseMateriasTexto(questoes: any[]): string {
    const porMateria: Record<string, { acertos: number; total: number }> = {}

    questoes.forEach(q => {
      if (!porMateria[q.materia]) {
        porMateria[q.materia] = { acertos: 0, total: 0 }
      }
      porMateria[q.materia].total++
      if (q.resposta_usuario === q.resposta_correta) {
        porMateria[q.materia].acertos++
      }
    })

    return Object.entries(porMateria)
      .map(([materia, stats]) => {
        const percentual = (stats.acertos / stats.total) * 100
        return `${materia}: ${stats.acertos}/${stats.total} (${percentual.toFixed(1)}%)`
      })
      .join('\n')
  }

  private parseAIResponse(response: string): any {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      throw new Error('JSON não encontrado')
    } catch (error) {
      console.error('Erro no parse da resposta:', error)
      throw error
    }
  }

  private parseAnaliseResponse(response: string): any {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      throw new Error('JSON não encontrado')
    } catch (error) {
      console.error('Erro no parse da análise:', error)
      return {
        pontos_fortes: [],
        pontos_fracos: [],
        recomendacoes: ['Continue praticando', 'Foque nas matérias com menor performance'],
        nivel_sugerido: 'medio',
        materias_prioritarias: []
      }
    }
  }

  private calcularFeedbackDetalhado(
    analise: AnalisePerformance,
    feedbackIA: any
  ): FeedbackDetalhado {
    const acertos = analise.questoes_respondidas.filter(q => 
      q.resposta_usuario === q.resposta_correta
    ).length

    const pontuacaoGeral = (acertos / analise.questoes_respondidas.length) * 100

    // Calcular por matéria
    const porMateria: Record<string, { acertos: number; total: number; percentual: number }> = {}
    
    analise.questoes_respondidas.forEach(q => {
      if (!porMateria[q.materia]) {
        porMateria[q.materia] = { acertos: 0, total: 0, percentual: 0 }
      }
      porMateria[q.materia].total++
      if (q.resposta_usuario === q.resposta_correta) {
        porMateria[q.materia].acertos++
      }
    })

    Object.keys(porMateria).forEach(materia => {
      const stats = porMateria[materia]
      stats.percentual = (stats.acertos / stats.total) * 100
    })

    // Tempo médio por questão
    const tempoMedioPorQuestao = (analise.tempo_total * 60) / analise.questoes_respondidas.length

    // Questões mais demoradas
    const questoesMaisDemoradas = analise.questoes_respondidas
      .sort((a, b) => b.tempo_resposta - a.tempo_resposta)
      .slice(0, 3)
      .map(q => ({
        questao_id: q.questao_id,
        tempo: q.tempo_resposta,
        materia: q.materia
      }))

    return {
      pontuacao_geral: pontuacaoGeral,
      pontuacao_por_materia: porMateria,
      pontos_fortes: feedbackIA.pontos_fortes || [],
      pontos_fracos: feedbackIA.pontos_fracos || [],
      recomendacoes: feedbackIA.recomendacoes || [],
      tempo_medio_por_questao: tempoMedioPorQuestao,
      questoes_mais_demoradas: questoesMaisDemoradas,
      nivel_sugerido: feedbackIA.nivel_sugerido || 'medio',
      plano_estudo_sugerido: {
        materias_prioritarias: feedbackIA.materias_prioritarias || [],
        tempo_sugerido_por_materia: {},
        proximos_assuntos: []
      }
    }
  }

  private getFallbackConfiguracao(preferencias: any): ConfiguracaoSimulado {
    return {
      titulo: 'Simulado Personalizado',
      materias: preferencias.materias_interesse.slice(0, 3),
      num_questoes: Math.min(30, Math.max(10, Math.floor(preferencias.tempo_disponivel / 3))),
      tempo_limite: preferencias.tempo_disponivel,
      nivel_dificuldade: 'misto',
      modo: 'treino'
    }
  }

  private getFallbackFeedback(analise: AnalisePerformance): FeedbackDetalhado {
    const acertos = analise.questoes_respondidas.filter(q => 
      q.resposta_usuario === q.resposta_correta
    ).length

    const pontuacaoGeral = (acertos / analise.questoes_respondidas.length) * 100

    return {
      pontuacao_geral: pontuacaoGeral,
      pontuacao_por_materia: {},
      pontos_fortes: ['Determinação para estudar'],
      pontos_fracos: ['Necessita mais prática'],
      recomendacoes: [
        'Continue praticando regularmente',
        'Foque nas matérias com menor performance',
        'Revise os conceitos básicos'
      ],
      tempo_medio_por_questao: 120,
      questoes_mais_demoradas: [],
      nivel_sugerido: 'medio',
      plano_estudo_sugerido: {
        materias_prioritarias: [],
        tempo_sugerido_por_materia: {},
        proximos_assuntos: []
      }
    }
  }
}

// Instância singleton
export const simuladosAI = new SimuladosAI()