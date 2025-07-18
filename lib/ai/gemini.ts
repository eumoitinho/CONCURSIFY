import { GoogleGenerativeAI } from '@google/generative-ai'
import { z } from 'zod'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// Schema para preferências do usuário
const UserPreferencesSchema = z.object({
  horasDisponiveis: z.number().min(1).max(24),
  diasSemana: z.array(z.number().min(0).max(6)), // 0=domingo, 6=sábado
  materiasPrioritarias: z.array(z.string()),
  nivelConhecimento: z.enum(['iniciante', 'intermediario', 'avancado']),
  tempoProva: z.string().optional(), // Quando é a prova
  pontosFortes: z.array(z.string()).optional(),
  pontosFracos: z.array(z.string()).optional(),
  metodoEstudo: z.enum(['teorico', 'pratico', 'misto']).default('misto'),
})

// Schema para o cronograma gerado
const CronogramaSchema = z.object({
  titulo: z.string(),
  duracao_semanas: z.number(),
  semanas: z.array(z.object({
    numero: z.number(),
    tema: z.string(),
    dias: z.array(z.object({
      dia: z.number(), // 0-6
      materias: z.array(z.object({
        nome: z.string(),
        tempo_minutos: z.number(),
        topicos: z.array(z.string()),
        tipo: z.enum(['teoria', 'exercicios', 'revisao']),
        dificuldade: z.enum(['facil', 'medio', 'dificil']),
      }))
    }))
  })),
  dicas: z.array(z.string()),
  recursos: z.array(z.object({
    nome: z.string(),
    tipo: z.enum(['livro', 'video', 'site', 'app']),
    url: z.string().optional(),
    descricao: z.string(),
  })),
  metas: z.array(z.object({
    semana: z.number(),
    descricao: z.string(),
    indicador: z.string(),
  })),
})

export type UserPreferences = z.infer<typeof UserPreferencesSchema>
export type CronogramaData = z.infer<typeof CronogramaSchema>

export class GeminiAI {
  private model = genAI.getGenerativeModel({ model: 'gemini-pro' })

  async gerarCronograma(
    concurso: { titulo: string; orgao: string; materias: string[]; data_prova?: string },
    preferences: UserPreferences
  ): Promise<CronogramaData> {
    try {
      // Validar preferências
      const validatedPrefs = UserPreferencesSchema.parse(preferences)

      // Calcular semanas até a prova
      let semanasDisponiveis = 12 // padrão
      if (concurso.data_prova) {
        const dataProva = new Date(concurso.data_prova)
        const hoje = new Date()
        const diffTime = dataProva.getTime() - hoje.getTime()
        const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7))
        semanasDisponiveis = Math.max(1, Math.min(diffWeeks, 24))
      }

      const prompt = this.buildCronogramaPrompt(concurso, validatedPrefs, semanasDisponiveis)
      
      const result = await this.model.generateContent(prompt)
      const response = result.response
      const text = response.text()

      // Tentar fazer parse do JSON
      const cronogramaData = this.parseAIResponse(text)
      
      // Validar com schema
      const validatedCronograma = CronogramaSchema.parse(cronogramaData)
      
      return validatedCronograma

    } catch (error) {
      console.error('Erro ao gerar cronograma:', error)
      throw new Error(`Falha na geração do cronograma: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    }
  }

  async gerarDicasPersonalizadas(
    materias: string[],
    nivelConhecimento: string,
    pontosFortes: string[] = [],
    pontosFracos: string[] = []
  ): Promise<string[]> {
    try {
      const prompt = `
Como especialista em concursos públicos, gere 8-10 dicas personalizadas de estudo para:

**Matérias:** ${materias.join(', ')}
**Nível:** ${nivelConhecimento}
**Pontos Fortes:** ${pontosFortes.join(', ') || 'Não informado'}
**Pontos Fracos:** ${pontosFracos.join(', ') || 'Não informado'}

Retorne apenas uma lista de dicas práticas e específicas, uma por linha, começando com "- ".
`

      const result = await this.model.generateContent(prompt)
      const response = result.response.text()

      // Extrair dicas do texto
      const dicas = response
        .split('\n')
        .filter(linha => linha.trim().startsWith('- '))
        .map(linha => linha.replace(/^- /, '').trim())
        .filter(dica => dica.length > 10)

      return dicas.slice(0, 10) // Máximo 10 dicas

    } catch (error) {
      console.error('Erro ao gerar dicas:', error)
      return [
        'Crie um cronograma de estudos e siga-o rigorosamente',
        'Faça resumos das matérias mais importantes',
        'Resolva questões de provas anteriores',
        'Mantenha uma rotina de estudos consistente',
      ]
    }
  }

  async analisarMateriasForte(
    historicoEstudos: Array<{ materia: string; tempo_estudo: number; performance: number }>
  ): Promise<{ pontos_fortes: string[]; pontos_fracos: string[]; recomendacoes: string[] }> {
    try {
      const prompt = `
Analise o histórico de estudos abaixo e identifique pontos fortes e fracos:

${historicoEstudos.map(h => 
  `${h.materia}: ${h.tempo_estudo}min estudados, performance ${h.performance}%`
).join('\n')}

Retorne um JSON com:
{
  "pontos_fortes": ["matéria1", "matéria2"],
  "pontos_fracos": ["matéria3", "matéria4"], 
  "recomendacoes": ["recomendação1", "recomendação2"]
}
`

      const result = await this.model.generateContent(prompt)
      const response = result.response.text()
      
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }

      throw new Error('Resposta inválida da IA')

    } catch (error) {
      console.error('Erro na análise:', error)
      return {
        pontos_fortes: [],
        pontos_fracos: [],
        recomendacoes: ['Foque nas matérias com menor performance', 'Aumente o tempo de estudo gradualmente']
      }
    }
  }

  private buildCronogramaPrompt(
    concurso: { titulo: string; orgao: string; materias: string[]; data_prova?: string },
    preferences: UserPreferences,
    semanasDisponiveis: number
  ): string {
    return `
Você é um especialista em concursos públicos. Crie um cronograma de estudos detalhado e personalizado.

**CONCURSO:**
- Título: ${concurso.titulo}
- Órgão: ${concurso.orgao}
- Matérias: ${concurso.materias.join(', ')}
- Data da Prova: ${concurso.data_prova || 'Não informada'}

**PERFIL DO CANDIDATO:**
- Horas disponíveis por dia: ${preferences.horasDisponiveis}
- Dias da semana disponíveis: ${preferences.diasSemana.map(d => ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'][d]).join(', ')}
- Nível de conhecimento: ${preferences.nivelConhecimento}
- Matérias prioritárias: ${preferences.materiasPrioritarias.join(', ')}
- Método preferido: ${preferences.metodoEstudo}
- Pontos fortes: ${preferences.pontosFortes?.join(', ') || 'Não informado'}
- Pontos fracos: ${preferences.pontosFracos?.join(', ') || 'Não informado'}

**REQUISITOS:**
- Duração: ${semanasDisponiveis} semanas
- Distribuir carga horária de forma equilibrada
- Focar mais nas matérias prioritárias e pontos fracos
- Incluir tempo para revisão nas últimas semanas
- Alternar entre teoria, exercícios e revisão

Retorne APENAS um JSON válido no seguinte formato:

{
  "titulo": "Cronograma para [Nome do Concurso]",
  "duracao_semanas": ${semanasDisponiveis},
  "semanas": [
    {
      "numero": 1,
      "tema": "Fundamentação Básica",
      "dias": [
        {
          "dia": 1,
          "materias": [
            {
              "nome": "Português",
              "tempo_minutos": 120,
              "topicos": ["Gramática básica", "Interpretação de texto"],
              "tipo": "teoria",
              "dificuldade": "facil"
            }
          ]
        }
      ]
    }
  ],
  "dicas": [
    "Mantenha regularidade nos estudos",
    "Faça pausas regulares durante o estudo"
  ],
  "recursos": [
    {
      "nome": "Gramática Essencial",
      "tipo": "livro",
      "url": "",
      "descricao": "Livro base para Português"
    }
  ],
  "metas": [
    {
      "semana": 1,
      "descricao": "Dominar fundamentos de Português",
      "indicador": "80% de acertos em exercícios básicos"
    }
  ]
}
`
  }

  private parseAIResponse(text: string): any {
    try {
      // Tentar extrair JSON da resposta
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }

      throw new Error('JSON não encontrado na resposta')
    } catch (error) {
      console.error('Erro ao fazer parse da resposta:', error)
      
      // Retornar cronograma de fallback
      return this.getFallbackCronograma()
    }
  }

  private getFallbackCronograma(): any {
    return {
      titulo: "Cronograma Básico de Estudos",
      duracao_semanas: 8,
      semanas: [
        {
          numero: 1,
          tema: "Fundamentação",
          dias: [
            {
              dia: 1,
              materias: [
                {
                  nome: "Português",
                  tempo_minutos: 120,
                  topicos: ["Gramática", "Interpretação"],
                  tipo: "teoria",
                  dificuldade: "facil"
                }
              ]
            }
          ]
        }
      ],
      dicas: [
        "Mantenha consistência nos estudos",
        "Faça revisões regulares",
        "Resolva questões de provas anteriores"
      ],
      recursos: [
        {
          nome: "Material de Estudo",
          tipo: "site",
          descricao: "Recursos online gratuitos"
        }
      ],
      metas: [
        {
          semana: 1,
          descricao: "Estabelecer rotina de estudos",
          indicador: "Cumprir 80% do cronograma"
        }
      ]
    }
  }
}

// Instância singleton
export const geminiAI = new GeminiAI()