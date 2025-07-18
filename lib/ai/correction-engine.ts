import { GoogleGenerativeAI } from '@google/generative-ai'
import { z } from 'zod'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// Schema para questão com resposta
const QuestaoComRespostaSchema = z.object({
  id: z.string(),
  texto: z.string(),
  alternativas: z.array(z.string()),
  resposta_correta: z.string(),
  resposta_usuario: z.string(),
  materia: z.string(),
  assunto: z.string(),
  nivel_dificuldade: z.string(),
  tempo_resposta: z.number(), // em segundos
  explicacao_existente: z.string().optional(),
})

// Schema para feedback personalizado
const FeedbackPersonalizadoSchema = z.object({
  questao_id: z.string(),
  acertou: z.boolean(),
  explicacao_detalhada: z.string(),
  dica_resolucao: z.string(),
  conceitos_envolvidos: z.array(z.string()),
  nivel_confianca: z.enum(['baixo', 'medio', 'alto']),
  tempo_ideal: z.number(), // tempo ideal em segundos
  materiais_estudo: z.array(z.object({
    tipo: z.enum(['livro', 'video', 'site', 'exercicio']),
    titulo: z.string(),
    descricao: z.string(),
    url: z.string().optional(),
  })),
})

export type QuestaoComResposta = z.infer<typeof QuestaoComRespostaSchema>
export type FeedbackPersonalizado = z.infer<typeof FeedbackPersonalizadoSchema>

export interface AnaliseComparativa {
  sua_resposta: string
  resposta_correta: string
  explicacao_diferenca: string
  motivos_erro: string[]
  estrategia_correcao: string
  nivel_dificuldade_percebida: 'facil' | 'medio' | 'dificil'
}

export interface RecomendacaoEstudo {
  materia: string
  assunto: string
  prioridade: 'alta' | 'media' | 'baixa'
  tempo_sugerido: number // em minutos
  recursos_recomendados: Array<{
    tipo: 'teoria' | 'exercicios' | 'video' | 'resumo'
    titulo: string
    descricao: string
    url?: string
  }>
  proximas_questoes_sugeridas: string[] // tipos de questões para praticar
}

export class CorrectionEngine {
  private model = genAI.getGenerativeModel({ model: 'gemini-pro' })

  async corrigirQuestao(questao: QuestaoComResposta): Promise<FeedbackPersonalizado> {
    try {
      const acertou = questao.resposta_correta === questao.resposta_usuario
      
      // Gerar explicação detalhada com IA
      const explicacaoDetalhada = await this.gerarExplicacaoDetalhada(questao, acertou)
      
      // Gerar dica de resolução
      const dicaResolucao = await this.gerarDicaResolucao(questao)
      
      // Extrair conceitos envolvidos
      const conceitosEnvolvidos = await this.extrairConceitos(questao)
      
      // Calcular nível de confiança baseado no tempo
      const nivelConfianca = this.calcularNivelConfianca(questao.tempo_resposta, questao.nivel_dificuldade)
      
      // Calcular tempo ideal
      const tempoIdeal = this.calcularTempoIdeal(questao.nivel_dificuldade)
      
      // Gerar materiais de estudo
      const materiaisEstudo = await this.gerarMateriaisEstudo(questao, acertou)

      const feedback: FeedbackPersonalizado = {
        questao_id: questao.id,
        acertou,
        explicacao_detalhada,
        dica_resolucao: dicaResolucao,
        conceitos_envolvidos: conceitosEnvolvidos,
        nivel_confianca: nivelConfianca,
        tempo_ideal: tempoIdeal,
        materiais_estudo: materiaisEstudo,
      }

      return FeedbackPersonalizadoSchema.parse(feedback)

    } catch (error) {
      console.error('Erro na correção da questão:', error)
      return this.getFallbackFeedback(questao)
    }
  }

  async analisarPadraoErros(
    questoesRespondidas: QuestaoComResposta[]
  ): Promise<{
    padroes_identificados: string[]
    materias_com_dificuldade: Array<{ materia: string; percentual_erro: number }>
    assuntos_problematicos: Array<{ assunto: string; frequencia_erro: number }>
    recomendacoes_gerais: string[]
    plano_revisao: RecomendacaoEstudo[]
  }> {
    try {
      // Analisar padrões de erro
      const erros = questoesRespondidas.filter(q => q.resposta_correta !== q.resposta_usuario)
      
      // Agrupar por matéria
      const errosPorMateria = this.agruparErrosPorMateria(erros, questoesRespondidas)
      
      // Agrupar por assunto
      const errosPorAssunto = this.agruparErrosPorAssunto(erros)
      
      // Gerar análise com IA
      const analiseIA = await this.gerarAnalisePadroes(questoesRespondidas)
      
      // Gerar plano de revisão
      const planoRevisao = await this.gerarPlanoRevisao(errosPorMateria, errosPorAssunto)

      return {
        padroes_identificados: analiseIA.padroes || [],
        materias_com_dificuldade: errosPorMateria,
        assuntos_problematicos: errosPorAssunto,
        recomendacoes_gerais: analiseIA.recomendacoes || [],
        plano_revisao: planoRevisao,
      }

    } catch (error) {
      console.error('Erro na análise de padrões:', error)
      return {
        padroes_identificados: ['Necessita mais prática'],
        materias_com_dificuldade: [],
        assuntos_problematicos: [],
        recomendacoes_gerais: ['Continue praticando regularmente'],
        plano_revisao: [],
      }
    }
  }

  async compararRespostas(questao: QuestaoComResposta): Promise<AnaliseComparativa> {
    try {
      const prompt = `
Analise a seguinte questão de concurso e compare as respostas:

QUESTÃO: ${questao.texto}

ALTERNATIVAS:
${questao.alternativas.map((alt, index) => `${String.fromCharCode(65 + index)}) ${alt}`).join('\n')}

SUA RESPOSTA: ${questao.resposta_usuario}
RESPOSTA CORRETA: ${questao.resposta_correta}
MATÉRIA: ${questao.materia}
ASSUNTO: ${questao.assunto}

Forneça uma análise comparativa em JSON:

{
  "sua_resposta": "${questao.resposta_usuario}",
  "resposta_correta": "${questao.resposta_correta}",
  "explicacao_diferenca": "Explicação clara da diferença entre as respostas",
  "motivos_erro": ["motivo1", "motivo2"],
  "estrategia_correcao": "Como evitar este erro no futuro",
  "nivel_dificuldade_percebida": "medio"
}
`

      const result = await this.model.generateContent(prompt)
      const response = result.response.text()
      
      const analise = this.parseAIResponse(response)
      
      return {
        sua_resposta: questao.resposta_usuario,
        resposta_correta: questao.resposta_correta,
        explicacao_diferenca: analise.explicacao_diferenca || 'Respostas diferentes',
        motivos_erro: analise.motivos_erro || ['Interpretação incorreta'],
        estrategia_correcao: analise.estrategia_correcao || 'Revisar conceitos básicos',
        nivel_dificuldade_percebida: analise.nivel_dificuldade_percebida || 'medio',
      }

    } catch (error) {
      console.error('Erro na comparação de respostas:', error)
      return {
        sua_resposta: questao.resposta_usuario,
        resposta_correta: questao.resposta_correta,
        explicacao_diferenca: 'Houve divergência na resposta',
        motivos_erro: ['Necessita revisão do conteúdo'],
        estrategia_correcao: 'Estudar mais o assunto',
        nivel_dificuldade_percebida: 'medio',
      }
    }
  }

  private async gerarExplicacaoDetalhada(questao: QuestaoComResposta, acertou: boolean): Promise<string> {
    try {
      const prompt = `
Como professor especialista em ${questao.materia}, explique de forma didática:

QUESTÃO: ${questao.texto}

ALTERNATIVAS:
${questao.alternativas.map((alt, index) => `${String.fromCharCode(65 + index)}) ${alt}`).join('\n')}

RESPOSTA CORRETA: ${questao.resposta_correta}
RESPOSTA DO ALUNO: ${questao.resposta_usuario}
RESULTADO: ${acertou ? 'ACERTOU' : 'ERROU'}

${questao.explicacao_existente ? `EXPLICAÇÃO BASE: ${questao.explicacao_existente}` : ''}

Forneça uma explicação detalhada e didática (máximo 200 palavras) sobre:
1. Por que a resposta correta está certa
2. ${!acertou ? 'Por que a resposta escolhida está incorreta' : 'Reforço do conhecimento'}
3. Conceitos importantes envolvidos

Explicação:
`

      const result = await this.model.generateContent(prompt)
      const response = result.response.text()
      
      return response.replace('Explicação:', '').trim()

    } catch (error) {
      console.error('Erro ao gerar explicação:', error)
      return questao.explicacao_existente || 'Explicação não disponível no momento.'
    }
  }

  private async gerarDicaResolucao(questao: QuestaoComResposta): Promise<string> {
    try {
      const prompt = `
Para a questão de ${questao.materia} sobre ${questao.assunto}, dê uma dica prática de resolução em no máximo 50 palavras:

QUESTÃO: ${questao.texto.substring(0, 200)}...
NÍVEL: ${questao.nivel_dificuldade}

Dica:
`

      const result = await this.model.generateContent(prompt)
      const response = result.response.text()
      
      return response.replace('Dica:', '').trim()

    } catch (error) {
      console.error('Erro ao gerar dica:', error)
      return 'Leia com atenção e elimine as alternativas claramente incorretas.'
    }
  }

  private async extrairConceitos(questao: QuestaoComResposta): Promise<string[]> {
    try {
      const prompt = `
Extraia os 3 principais conceitos/tópicos abordados nesta questão de ${questao.materia}:

QUESTÃO: ${questao.texto.substring(0, 300)}...
ASSUNTO: ${questao.assunto}

Responda apenas os conceitos separados por vírgula:
`

      const result = await this.model.generateContent(prompt)
      const response = result.response.text()
      
      const conceitos = response
        .split(',')
        .map(c => c.trim())
        .filter(c => c.length > 0)
        .slice(0, 3)

      return conceitos.length > 0 ? conceitos : [questao.assunto]

    } catch (error) {
      console.error('Erro ao extrair conceitos:', error)
      return [questao.assunto]
    }
  }

  private calcularNivelConfianca(tempoResposta: number, nivelDificuldade: string): 'baixo' | 'medio' | 'alto' {
    // Tempo ideal por nível (em segundos)
    const temposIdeais = {
      facil: 60,
      medio: 120,
      dificil: 180
    }

    const tempoIdeal = temposIdeais[nivelDificuldade as keyof typeof temposIdeais] || 120

    if (tempoResposta < tempoIdeal * 0.5) {
      return 'alto' // muito rápido, pode ser chute
    } else if (tempoResposta > tempoIdeal * 2) {
      return 'baixo' // muito lento, provavelmente com dúvidas
    } else {
      return 'medio' // tempo razoável
    }
  }

  private calcularTempoIdeal(nivelDificuldade: string): number {
    const temposIdeais = {
      facil: 60,   // 1 minuto
      medio: 120,  // 2 minutos
      dificil: 180 // 3 minutos
    }

    return temposIdeais[nivelDificuldade as keyof typeof temposIdeais] || 120
  }

  private async gerarMateriaisEstudo(questao: QuestaoComResposta, acertou: boolean) {
    const materiais = []

    if (!acertou) {
      // Sugerir materiais para reforço
      materiais.push({
        tipo: 'video' as const,
        titulo: `${questao.assunto} - Revisão`,
        descricao: `Vídeo explicativo sobre ${questao.assunto}`,
      })

      materiais.push({
        tipo: 'exercicio' as const,
        titulo: `Exercícios de ${questao.assunto}`,
        descricao: `Lista de exercícios para praticar ${questao.assunto}`,
      })
    } else {
      // Sugerir materiais para aprofundamento
      materiais.push({
        tipo: 'livro' as const,
        titulo: `${questao.materia} Avançado`,
        descricao: `Material avançado em ${questao.materia}`,
      })
    }

    return materiais
  }

  private agruparErrosPorMateria(
    erros: QuestaoComResposta[],
    total: QuestaoComResposta[]
  ): Array<{ materia: string; percentual_erro: number }> {
    const materiaStats: Record<string, { erros: number; total: number }> = {}

    total.forEach(q => {
      if (!materiaStats[q.materia]) {
        materiaStats[q.materia] = { erros: 0, total: 0 }
      }
      materiaStats[q.materia].total++
    })

    erros.forEach(q => {
      if (materiaStats[q.materia]) {
        materiaStats[q.materia].erros++
      }
    })

    return Object.entries(materiaStats)
      .map(([materia, stats]) => ({
        materia,
        percentual_erro: Math.round((stats.erros / stats.total) * 100)
      }))
      .filter(m => m.percentual_erro > 0)
      .sort((a, b) => b.percentual_erro - a.percentual_erro)
  }

  private agruparErrosPorAssunto(
    erros: QuestaoComResposta[]
  ): Array<{ assunto: string; frequencia_erro: number }> {
    const assuntoCount: Record<string, number> = {}

    erros.forEach(q => {
      assuntoCount[q.assunto] = (assuntoCount[q.assunto] || 0) + 1
    })

    return Object.entries(assuntoCount)
      .map(([assunto, frequencia]) => ({ assunto, frequencia_erro: frequencia }))
      .sort((a, b) => b.frequencia_erro - a.frequencia_erro)
      .slice(0, 5) // Top 5 assuntos problemáticos
  }

  private async gerarAnalisePadroes(questoes: QuestaoComResposta[]): Promise<{ padroes: string[]; recomendacoes: string[] }> {
    try {
      const prompt = `
Analise os padrões de erro neste conjunto de questões de concurso:

ESTATÍSTICAS:
- Total de questões: ${questoes.length}
- Acertos: ${questoes.filter(q => q.resposta_correta === q.resposta_usuario).length}
- Erros: ${questoes.filter(q => q.resposta_correta !== q.resposta_usuario).length}

MATERIAS: ${[...new Set(questoes.map(q => q.materia))].join(', ')}

Identifique padrões e dê recomendações em JSON:

{
  "padroes": ["padrão1", "padrão2"],
  "recomendacoes": ["recomendação1", "recomendação2"]
}
`

      const result = await this.model.generateContent(prompt)
      const response = result.response.text()
      
      return this.parseAIResponse(response)

    } catch (error) {
      console.error('Erro na análise de padrões:', error)
      return {
        padroes: ['Necessita mais prática'],
        recomendacoes: ['Continue estudando regularmente']
      }
    }
  }

  private async gerarPlanoRevisao(
    materias: Array<{ materia: string; percentual_erro: number }>,
    assuntos: Array<{ assunto: string; frequencia_erro: number }>
  ): Promise<RecomendacaoEstudo[]> {
    const plano: RecomendacaoEstudo[] = []

    // Priorizar matérias com maior erro
    materias.slice(0, 3).forEach(materia => {
      const prioridade = materia.percentual_erro > 50 ? 'alta' : 'media'
      const tempoSugerido = Math.max(30, materia.percentual_erro * 2) // minutos

      plano.push({
        materia: materia.materia,
        assunto: 'Revisão Geral',
        prioridade: prioridade as 'alta' | 'media',
        tempo_sugerido: tempoSugerido,
        recursos_recomendados: [
          {
            tipo: 'teoria',
            titulo: `Revisão de ${materia.materia}`,
            descricao: `Material teórico para reforçar ${materia.materia}`,
          },
          {
            tipo: 'exercicios',
            titulo: `Exercícios de ${materia.materia}`,
            descricao: `Bateria de exercícios focados em ${materia.materia}`,
          }
        ],
        proximas_questoes_sugeridas: ['nivel_facil', 'nivel_medio']
      })
    })

    return plano
  }

  private parseAIResponse(response: string): any {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      throw new Error('JSON não encontrado')
    } catch (error) {
      console.error('Erro no parse da resposta IA:', error)
      return {}
    }
  }

  private getFallbackFeedback(questao: QuestaoComResposta): FeedbackPersonalizado {
    const acertou = questao.resposta_correta === questao.resposta_usuario

    return {
      questao_id: questao.id,
      acertou,
      explicacao_detalhada: questao.explicacao_existente || 'Explicação detalhada não disponível.',
      dica_resolucao: 'Leia com atenção e elimine as alternativas incorretas.',
      conceitos_envolvidos: [questao.assunto],
      nivel_confianca: 'medio',
      tempo_ideal: 120,
      materiais_estudo: [
        {
          tipo: 'exercicio',
          titulo: `Exercícios de ${questao.assunto}`,
          descricao: `Pratique mais questões sobre ${questao.assunto}`,
        }
      ],
    }
  }
}

// Instância singleton
export const correctionEngine = new CorrectionEngine()