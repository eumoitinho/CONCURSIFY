import { GoogleGenerativeAI } from '@google/generative-ai'
import { z } from 'zod'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// Schema para análise de moderação
const ModerationAnalysisSchema = z.object({
  is_appropriate: z.boolean(),
  confidence_score: z.number().min(0).max(1),
  issues: z.array(z.enum([
    'spam',
    'offensive_language',
    'inappropriate_content',
    'off_topic',
    'self_promotion',
    'misinformation',
    'personal_attack',
    'duplicate_content'
  ])),
  severity: z.enum(['low', 'medium', 'high']),
  recommended_action: z.enum(['approve', 'flag_for_review', 'auto_delete', 'request_edit']),
  explanation: z.string(),
  suggested_tags: z.array(z.string()).optional(),
  category_suggestion: z.string().optional()
})

// Schema para análise de sentimento
const SentimentAnalysisSchema = z.object({
  sentiment: z.enum(['positive', 'neutral', 'negative']),
  confidence: z.number().min(0).max(1),
  emotion: z.enum(['joy', 'sadness', 'anger', 'fear', 'surprise', 'neutral']),
  toxicity_score: z.number().min(0).max(1)
})

export type ModerationAnalysis = z.infer<typeof ModerationAnalysisSchema>
export type SentimentAnalysis = z.infer<typeof SentimentAnalysisSchema>

export interface ContentForModeration {
  type: 'thread' | 'post'
  title?: string
  content: string
  category?: string
  author_history?: {
    previous_violations: number
    reputation_score: number
    account_age_days: number
  }
  context?: {
    parent_content?: string
    thread_topic?: string
  }
}

export class ForumModerationAI {
  private model = genAI.getGenerativeModel({ model: 'gemini-pro' })

  async analyzeContent(content: ContentForModeration): Promise<ModerationAnalysis> {
    try {
      const prompt = this.buildModerationPrompt(content)
      
      const result = await this.model.generateContent(prompt)
      const response = result.response.text()
      
      const analysis = this.parseAIResponse(response)
      
      // Ajustar baseado no histórico do usuário
      const adjustedAnalysis = this.adjustBasedOnUserHistory(analysis, content.author_history)
      
      return ModerationAnalysisSchema.parse(adjustedAnalysis)

    } catch (error) {
      console.error('Erro na análise de moderação:', error)
      return this.getFallbackAnalysis(content)
    }
  }

  async analyzeSentiment(content: string): Promise<SentimentAnalysis> {
    try {
      const prompt = `
Analise o sentimento e toxicidade do seguinte texto em português:

TEXTO: "${content}"

Retorne sua análise em JSON:

{
  "sentiment": "positive|neutral|negative",
  "confidence": 0.85,
  "emotion": "joy|sadness|anger|fear|surprise|neutral",
  "toxicity_score": 0.15
}

Critérios:
- sentiment: tom geral do texto
- confidence: confiança na análise (0-1)
- emotion: emoção predominante
- toxicity_score: nível de toxicidade (0=nada tóxico, 1=muito tóxico)
`

      const result = await this.model.generateContent(prompt)
      const response = result.response.text()
      
      const sentiment = this.parseAIResponse(response)
      
      return SentimentAnalysisSchema.parse(sentiment)

    } catch (error) {
      console.error('Erro na análise de sentimento:', error)
      return {
        sentiment: 'neutral',
        confidence: 0.5,
        emotion: 'neutral',
        toxicity_score: 0.2
      }
    }
  }

  async suggestTags(content: string, category?: string): Promise<string[]> {
    try {
      const prompt = `
Sugira até 5 tags relevantes para o seguinte conteúdo de fórum sobre concursos públicos:

CONTEÚDO: "${content.substring(0, 500)}..."
CATEGORIA: ${category || 'Não especificada'}

Retorne apenas as tags separadas por vírgula, focando em:
- Matérias específicas
- Tipos de concurso
- Órgãos
- Tópicos de estudo
- Níveis de dificuldade

Tags:
`

      const result = await this.model.generateContent(prompt)
      const response = result.response.text()
      
      const tags = response
        .replace('Tags:', '')
        .split(',')
        .map(tag => tag.trim().toLowerCase())
        .filter(tag => tag.length > 0 && tag.length <= 30)
        .slice(0, 5)

      return tags

    } catch (error) {
      console.error('Erro ao sugerir tags:', error)
      return []
    }
  }

  async suggestCategory(title: string, content: string): Promise<string | null> {
    try {
      const availableCategories = [
        'geral',
        'duvidas',
        'direito-constitucional',
        'direito-administrativo',
        'portugues',
        'matematica',
        'informatica',
        'experiencias',
        'grupos-estudo',
        'concursos-abertos'
      ]

      const prompt = `
Sugira a categoria mais apropriada para este post de fórum sobre concursos:

TÍTULO: "${title}"
CONTEÚDO: "${content.substring(0, 300)}..."

CATEGORIAS DISPONÍVEIS:
${availableCategories.map(cat => `- ${cat}`).join('\n')}

Retorne apenas o slug da categoria mais apropriada:
`

      const result = await this.model.generateContent(prompt)
      const response = result.response.text().trim().toLowerCase()
      
      // Verificar se a resposta é uma categoria válida
      if (availableCategories.includes(response)) {
        return response
      }

      return null

    } catch (error) {
      console.error('Erro ao sugerir categoria:', error)
      return null
    }
  }

  async detectDuplicateContent(
    newContent: string,
    existingContents: Array<{ id: string; content: string; similarity_threshold?: number }>
  ): Promise<Array<{ id: string; similarity_score: number }>> {
    try {
      const similarContents: Array<{ id: string; similarity_score: number }> = []

      for (const existing of existingContents) {
        const similarity = await this.calculateContentSimilarity(newContent, existing.content)
        const threshold = existing.similarity_threshold || 0.8

        if (similarity >= threshold) {
          similarContents.push({
            id: existing.id,
            similarity_score: similarity
          })
        }
      }

      return similarContents.sort((a, b) => b.similarity_score - a.similarity_score)

    } catch (error) {
      console.error('Erro ao detectar conteúdo duplicado:', error)
      return []
    }
  }

  private async calculateContentSimilarity(content1: string, content2: string): Promise<number> {
    try {
      const prompt = `
Compare a similaridade entre estes dois textos e retorne um score de 0 a 1:

TEXTO 1: "${content1.substring(0, 500)}"
TEXTO 2: "${content2.substring(0, 500)}"

Considere:
- Semelhança no conteúdo
- Tópicos abordados
- Intenção da mensagem

Retorne apenas o número (0.0 a 1.0):
`

      const result = await this.model.generateContent(prompt)
      const response = result.response.text().trim()
      
      const score = parseFloat(response)
      return isNaN(score) ? 0 : Math.min(Math.max(score, 0), 1)

    } catch (error) {
      console.error('Erro ao calcular similaridade:', error)
      return 0
    }
  }

  private buildModerationPrompt(content: ContentForModeration): string {
    return `
Você é um moderador de IA para um fórum educacional sobre concursos públicos. Analise o seguinte conteúdo:

TIPO: ${content.type}
${content.title ? `TÍTULO: "${content.title}"` : ''}
CONTEÚDO: "${content.content}"
${content.category ? `CATEGORIA: ${content.category}` : ''}

${content.author_history ? `
HISTÓRICO DO AUTOR:
- Violações anteriores: ${content.author_history.previous_violations}
- Pontuação de reputação: ${content.author_history.reputation_score}
- Idade da conta: ${content.author_history.account_age_days} dias
` : ''}

${content.context?.parent_content ? `
CONTEXTO (post pai): "${content.context.parent_content.substring(0, 200)}..."
` : ''}

Analise e retorne em JSON:

{
  "is_appropriate": true/false,
  "confidence_score": 0.85,
  "issues": ["spam", "offensive_language", ...],
  "severity": "low|medium|high",
  "recommended_action": "approve|flag_for_review|auto_delete|request_edit",
  "explanation": "Explicação da decisão",
  "suggested_tags": ["tag1", "tag2", ...],
  "category_suggestion": "categoria-slug"
}

CRITÉRIOS:
✅ APROPRIADO:
- Discussões educacionais sobre concursos
- Dúvidas de estudo legítimas
- Experiências construtivas
- Conteúdo respeitoso e útil

❌ INAPROPRIADO:
- Spam ou autopromoção excessiva
- Linguagem ofensiva ou ataques pessoais
- Conteúdo fora do tópico
- Informações falsas sobre concursos
- Conteúdo duplicado

AÇÕES:
- approve: Conteúdo adequado
- flag_for_review: Requer revisão humana
- auto_delete: Claramente inadequado
- request_edit: Pedir ao autor para editar
`
  }

  private adjustBasedOnUserHistory(
    analysis: any,
    history?: ContentForModeration['author_history']
  ): any {
    if (!history) return analysis

    // Usuários com histórico de violações têm análise mais rigorosa
    if (history.previous_violations > 0) {
      analysis.confidence_score = Math.min(analysis.confidence_score + 0.1, 1)
      
      if (analysis.severity === 'low') {
        analysis.severity = 'medium'
      }
    }

    // Usuários com alta reputação têm mais tolerância
    if (history.reputation_score > 100 && history.previous_violations === 0) {
      if (analysis.severity === 'medium' && analysis.confidence_score < 0.8) {
        analysis.severity = 'low'
        analysis.recommended_action = 'approve'
      }
    }

    // Contas muito novas são mais suspeitas
    if (history.account_age_days < 7) {
      if (analysis.issues.includes('spam') || analysis.issues.includes('self_promotion')) {
        analysis.confidence_score = Math.min(analysis.confidence_score + 0.2, 1)
        analysis.severity = 'high'
      }
    }

    return analysis
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
      throw error
    }
  }

  private getFallbackAnalysis(content: ContentForModeration): ModerationAnalysis {
    // Análise básica como fallback
    const hasSpamIndicators = /comprar?|vender?|promoção|desconto|click|link/i.test(content.content)
    const hasOffensiveWords = /idiota|burro|lixo/i.test(content.content)
    
    return {
      is_appropriate: !hasSpamIndicators && !hasOffensiveWords,
      confidence_score: 0.6,
      issues: [
        ...(hasSpamIndicators ? ['spam'] as const : []),
        ...(hasOffensiveWords ? ['offensive_language'] as const : [])
      ],
      severity: hasOffensiveWords ? 'high' : hasSpamIndicators ? 'medium' : 'low',
      recommended_action: hasOffensiveWords ? 'auto_delete' : hasSpamIndicators ? 'flag_for_review' : 'approve',
      explanation: 'Análise realizada por sistema de fallback',
      suggested_tags: [],
      category_suggestion: undefined
    }
  }
}

// Instância singleton
export const forumModerationAI = new ForumModerationAI()