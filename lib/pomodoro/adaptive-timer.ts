import { z } from 'zod'

// Schemas para dados do timer adaptativo
const UserPerformanceSchema = z.object({
  avgCompletionRate: z.number().min(0).max(1),
  avgProductivityScore: z.number().min(1).max(10),
  avgFocusScore: z.number().min(1).max(10),
  preferredTimeOfDay: z.array(z.number().min(0).max(23)),
  avgInterruptionsPerSession: z.number().min(0),
  energyPatterns: z.record(z.string(), z.number()), // hora -> energia média
  mostProductiveSubjects: z.array(z.string()),
  sessionHistory: z.array(z.object({
    duration: z.number(),
    completionRate: z.number(),
    productivityScore: z.number(),
    timeOfDay: z.number(),
    dayOfWeek: z.number()
  }))
})

const AdaptiveRecommendationSchema = z.object({
  recommendedDuration: z.number().min(10).max(120),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
  factors: z.array(z.object({
    factor: z.string(),
    impact: z.number(),
    description: z.string()
  })),
  alternativeDurations: z.array(z.object({
    duration: z.number(),
    probability: z.number(),
    reason: z.string()
  }))
})

export type UserPerformance = z.infer<typeof UserPerformanceSchema>
export type AdaptiveRecommendation = z.infer<typeof AdaptiveRecommendationSchema>

export interface SessionContext {
  currentTime: Date
  subject?: string
  sessionType: 'focus' | 'study' | 'review'
  userEnergyLevel?: number // 1-10
  environmentNoise?: 'silent' | 'ambient' | 'busy'
  availableTime?: number // minutos disponíveis
  difficulty?: 'easy' | 'medium' | 'hard'
  isFirstSessionOfDay?: boolean
  consecutiveSessionsToday?: number
}

export class AdaptiveTimer {
  private defaultDurations = {
    focus: 25,
    study: 45,
    review: 20,
    short_break: 5,
    long_break: 15
  }

  private minDuration = 10
  private maxDuration = 120

  /**
   * Calcula a duração ideal para uma sessão baseada no histórico do usuário
   */
  async calculateOptimalDuration(
    userPerformance: UserPerformance,
    context: SessionContext
  ): Promise<AdaptiveRecommendation> {
    try {
      const factors = []
      let baselineScore = 0.5
      let durationMultiplier = 1.0

      // Análise do histórico de performance
      const performanceFactor = this.analyzePerformanceHistory(userPerformance)
      factors.push(performanceFactor)
      baselineScore += performanceFactor.impact * 0.3

      // Análise do horário atual
      const timeFactor = this.analyzeTimeOfDay(userPerformance, context.currentTime)
      factors.push(timeFactor)
      durationMultiplier *= (1 + timeFactor.impact * 0.2)

      // Análise do nível de energia
      if (context.userEnergyLevel) {
        const energyFactor = this.analyzeEnergyLevel(context.userEnergyLevel)
        factors.push(energyFactor)
        durationMultiplier *= energyFactor.impact
      }

      // Análise do ambiente
      if (context.environmentNoise) {
        const environmentFactor = this.analyzeEnvironment(context.environmentNoise)
        factors.push(environmentFactor)
        durationMultiplier *= environmentFactor.impact
      }

      // Análise da dificuldade do conteúdo
      if (context.difficulty) {
        const difficultyFactor = this.analyzeDifficulty(context.difficulty)
        factors.push(difficultyFactor)
        durationMultiplier *= difficultyFactor.impact
      }

      // Análise de sessões consecutivas
      if (context.consecutiveSessionsToday) {
        const fatigueFactor = this.analyzeFatigue(context.consecutiveSessionsToday)
        factors.push(fatigueFactor)
        durationMultiplier *= fatigueFactor.impact
      }

      // Calcular duração recomendada
      const baseDuration = this.defaultDurations[context.sessionType]
      let recommendedDuration = Math.round(baseDuration * durationMultiplier)

      // Aplicar limitações
      if (context.availableTime) {
        recommendedDuration = Math.min(recommendedDuration, context.availableTime - 5)
      }

      recommendedDuration = Math.max(this.minDuration, Math.min(this.maxDuration, recommendedDuration))

      // Calcular confiança na recomendação
      const confidence = this.calculateConfidence(userPerformance, factors)

      // Gerar alternativas
      const alternatives = this.generateAlternatives(recommendedDuration, factors)

      // Gerar explicação
      const reasoning = this.generateReasoning(recommendedDuration, baseDuration, factors)

      return {
        recommendedDuration,
        confidence,
        reasoning,
        factors,
        alternativeDurations: alternatives
      }

    } catch (error) {
      console.error('Erro ao calcular duração adaptativa:', error)
      return this.getFallbackRecommendation(context.sessionType)
    }
  }

  /**
   * Analisa o histórico de performance do usuário
   */
  private analyzePerformanceHistory(performance: UserPerformance) {
    let impact = 0
    let description = ''

    if (performance.avgCompletionRate > 0.8) {
      impact = 0.2 // Pode fazer sessões mais longas
      description = 'Alto índice de conclusão de sessões'
    } else if (performance.avgCompletionRate < 0.6) {
      impact = -0.3 // Deve fazer sessões mais curtas
      description = 'Baixo índice de conclusão, sessões mais curtas recomendadas'
    } else {
      impact = 0
      description = 'Taxa de conclusão moderada'
    }

    // Ajustar baseado na produtividade
    if (performance.avgProductivityScore > 7) {
      impact += 0.1
      description += ' com alta produtividade'
    } else if (performance.avgProductivityScore < 4) {
      impact -= 0.1
      description += ' com baixa produtividade'
    }

    return {
      factor: 'Histórico de Performance',
      impact,
      description
    }
  }

  /**
   * Analisa o melhor horário baseado no histórico
   */
  private analyzeTimeOfDay(performance: UserPerformance, currentTime: Date) {
    const hour = currentTime.getHours()
    const isPreferredTime = performance.preferredTimeOfDay.includes(hour)
    
    let impact = 0
    let description = ''

    if (isPreferredTime) {
      impact = 0.15
      description = 'Horário de alta performance identificado'
    } else {
      // Verificar padrões de energia por horário
      const energyKey = `${hour}:00`
      const energyLevel = performance.energyPatterns[energyKey]
      
      if (energyLevel && energyLevel > 7) {
        impact = 0.1
        description = 'Horário com boa energia'
      } else if (energyLevel && energyLevel < 4) {
        impact = -0.2
        description = 'Horário de baixa energia'
      } else {
        impact = 0
        description = 'Horário neutro'
      }
    }

    return {
      factor: 'Horário do Dia',
      impact,
      description
    }
  }

  /**
   * Analisa o nível de energia atual
   */
  private analyzeEnergyLevel(energyLevel: number) {
    let impact = 1.0
    let description = ''

    if (energyLevel >= 8) {
      impact = 1.3
      description = 'Alta energia - sessão mais longa recomendada'
    } else if (energyLevel >= 6) {
      impact = 1.1
      description = 'Energia boa - duração padrão'
    } else if (energyLevel >= 4) {
      impact = 0.9
      description = 'Energia moderada - sessão ligeiramente mais curta'
    } else {
      impact = 0.7
      description = 'Baixa energia - sessão mais curta recomendada'
    }

    return {
      factor: 'Nível de Energia',
      impact,
      description
    }
  }

  /**
   * Analisa o impacto do ambiente
   */
  private analyzeEnvironment(noise: string) {
    let impact = 1.0
    let description = ''

    switch (noise) {
      case 'silent':
        impact = 1.1
        description = 'Ambiente silencioso favorece concentração'
        break
      case 'ambient':
        impact = 1.0
        description = 'Ambiente com ruído ambiente neutro'
        break
      case 'busy':
        impact = 0.8
        description = 'Ambiente barulhento - sessão mais curta'
        break
    }

    return {
      factor: 'Ambiente',
      impact,
      description
    }
  }

  /**
   * Analisa a dificuldade do conteúdo
   */
  private analyzeDifficulty(difficulty: string) {
    let impact = 1.0
    let description = ''

    switch (difficulty) {
      case 'easy':
        impact = 1.2
        description = 'Conteúdo fácil permite sessões mais longas'
        break
      case 'medium':
        impact = 1.0
        description = 'Dificuldade moderada'
        break
      case 'hard':
        impact = 0.8
        description = 'Conteúdo difícil requer sessões mais curtas e focadas'
        break
    }

    return {
      factor: 'Dificuldade do Conteúdo',
      impact,
      description
    }
  }

  /**
   * Analisa fadiga por sessões consecutivas
   */
  private analyzeFatigue(consecutiveSessions: number) {
    let impact = 1.0
    let description = ''

    if (consecutiveSessions === 0) {
      impact = 1.1
      description = 'Primeira sessão do dia - energia máxima'
    } else if (consecutiveSessions <= 2) {
      impact = 1.0
      description = 'Poucas sessões realizadas - energia boa'
    } else if (consecutiveSessions <= 4) {
      impact = 0.9
      description = 'Algumas sessões realizadas - leve fadiga'
    } else if (consecutiveSessions <= 6) {
      impact = 0.8
      description = 'Várias sessões - fadiga moderada'
    } else {
      impact = 0.7
      description = 'Muitas sessões - alta fadiga'
    }

    return {
      factor: 'Fadiga Acumulada',
      impact,
      description
    }
  }

  /**
   * Calcula a confiança na recomendação
   */
  private calculateConfidence(performance: UserPerformance, factors: any[]): number {
    const historySize = performance.sessionHistory.length
    let confidence = 0.5

    // Mais histórico = mais confiança
    if (historySize > 50) {
      confidence += 0.3
    } else if (historySize > 20) {
      confidence += 0.2
    } else if (historySize > 10) {
      confidence += 0.1
    }

    // Consistência nos fatores
    const factorImpacts = factors.map(f => Math.abs(f.impact))
    const avgImpact = factorImpacts.reduce((sum, impact) => sum + impact, 0) / factorImpacts.length
    confidence += avgImpact * 0.2

    return Math.min(1.0, confidence)
  }

  /**
   * Gera durações alternativas
   */
  private generateAlternatives(recommendedDuration: number, factors: any[]) {
    const alternatives = []

    // Versão mais curta
    const shorter = Math.max(this.minDuration, recommendedDuration - 10)
    if (shorter !== recommendedDuration) {
      alternatives.push({
        duration: shorter,
        probability: 0.7,
        reason: 'Para maior garantia de conclusão'
      })
    }

    // Versão mais longa
    const longer = Math.min(this.maxDuration, recommendedDuration + 10)
    if (longer !== recommendedDuration) {
      alternatives.push({
        duration: longer,
        probability: 0.6,
        reason: 'Para máximo aproveitamento se energia permitir'
      })
    }

    // Duração conservadora
    alternatives.push({
      duration: 25,
      probability: 0.8,
      reason: 'Duração padrão Pomodoro (sempre funciona)'
    })

    return alternatives.slice(0, 3)
  }

  /**
   * Gera explicação para a recomendação
   */
  private generateReasoning(recommended: number, baseline: number, factors: any[]): string {
    const diff = recommended - baseline
    const mainFactors = factors
      .filter(f => Math.abs(f.impact) > 0.1)
      .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
      .slice(0, 3)

    let reasoning = `Recomendação: ${recommended} minutos (base: ${baseline} minutos). `

    if (diff > 5) {
      reasoning += 'Sessão mais longa recomendada devido a: '
    } else if (diff < -5) {
      reasoning += 'Sessão mais curta recomendada devido a: '
    } else {
      reasoning += 'Duração próxima ao padrão. Fatores considerados: '
    }

    reasoning += mainFactors.map(f => f.description).join(', ')

    return reasoning
  }

  /**
   * Recomendação de fallback se algo der errado
   */
  private getFallbackRecommendation(sessionType: string): AdaptiveRecommendation {
    const duration = this.defaultDurations[sessionType as keyof typeof this.defaultDurations] || 25

    return {
      recommendedDuration: duration,
      confidence: 0.5,
      reasoning: `Duração padrão para ${sessionType} (25 min)`,
      factors: [],
      alternativeDurations: [
        { duration: 20, probability: 0.7, reason: 'Versão mais curta' },
        { duration: 30, probability: 0.6, reason: 'Versão mais longa' }
      ]
    }
  }

  /**
   * Sugere o melhor horário para estudar baseado no histórico
   */
  suggestOptimalStudyTime(performance: UserPerformance): Array<{
    hour: number
    score: number
    reason: string
  }> {
    const suggestions = []

    // Analisar horários preferidos
    for (const hour of performance.preferredTimeOfDay) {
      const energyKey = `${hour}:00`
      const energy = performance.energyPatterns[energyKey] || 5

      suggestions.push({
        hour,
        score: energy * 0.8 + (performance.avgProductivityScore / 10) * 0.2,
        reason: 'Horário de alta performance histórica'
      })
    }

    // Analisar padrões de energia
    Object.entries(performance.energyPatterns).forEach(([timeKey, energy]) => {
      const hour = parseInt(timeKey.split(':')[0])
      if (!performance.preferredTimeOfDay.includes(hour) && energy > 6) {
        suggestions.push({
          hour,
          score: energy * 0.6,
          reason: 'Alto nível de energia neste horário'
        })
      }
    })

    return suggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
  }

  /**
   * Calcula estatísticas de performance
   */
  calculatePerformanceMetrics(sessions: Array<{
    planned_duration: number
    actual_duration: number
    completion_percentage: number
    productivity_score?: number
    focus_score?: number
    actual_start: string
  }>): UserPerformance {
    if (sessions.length === 0) {
      return this.getDefaultPerformance()
    }

    // Calcular taxa de conclusão média
    const avgCompletionRate = sessions.reduce((sum, s) => sum + (s.completion_percentage / 100), 0) / sessions.length

    // Calcular scores médios
    const productivityScores = sessions.filter(s => s.productivity_score).map(s => s.productivity_score!)
    const focusScores = sessions.filter(s => s.focus_score).map(s => s.focus_score!)

    const avgProductivityScore = productivityScores.length > 0
      ? productivityScores.reduce((sum, score) => sum + score, 0) / productivityScores.length
      : 5

    const avgFocusScore = focusScores.length > 0
      ? focusScores.reduce((sum, score) => sum + score, 0) / focusScores.length
      : 5

    // Analisar horários preferidos
    const hourCounts: Record<number, number> = {}
    const hourProductivity: Record<number, number[]> = {}

    sessions.forEach(session => {
      const hour = new Date(session.actual_start).getHours()
      hourCounts[hour] = (hourCounts[hour] || 0) + 1
      
      if (session.productivity_score) {
        if (!hourProductivity[hour]) hourProductivity[hour] = []
        hourProductivity[hour].push(session.productivity_score)
      }
    })

    // Identificar horários mais produtivos
    const preferredTimeOfDay = Object.entries(hourProductivity)
      .map(([hour, scores]) => ({
        hour: parseInt(hour),
        avgScore: scores.reduce((sum, score) => sum + score, 0) / scores.length,
        frequency: hourCounts[parseInt(hour)]
      }))
      .filter(h => h.frequency >= 3 && h.avgScore > avgProductivityScore)
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 3)
      .map(h => h.hour)

    // Criar padrões de energia por horário
    const energyPatterns: Record<string, number> = {}
    Object.entries(hourProductivity).forEach(([hour, scores]) => {
      const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length
      energyPatterns[`${hour}:00`] = avgScore
    })

    // Preparar histórico para análise
    const sessionHistory = sessions.map(session => ({
      duration: session.actual_duration || session.planned_duration,
      completionRate: session.completion_percentage / 100,
      productivityScore: session.productivity_score || 5,
      timeOfDay: new Date(session.actual_start).getHours(),
      dayOfWeek: new Date(session.actual_start).getDay()
    }))

    return {
      avgCompletionRate,
      avgProductivityScore,
      avgFocusScore,
      preferredTimeOfDay,
      avgInterruptionsPerSession: 0, // Será calculado separadamente
      energyPatterns,
      mostProductiveSubjects: [], // Será calculado separadamente
      sessionHistory
    }
  }

  private getDefaultPerformance(): UserPerformance {
    return {
      avgCompletionRate: 0.7,
      avgProductivityScore: 5,
      avgFocusScore: 5,
      preferredTimeOfDay: [9, 14, 19], // 9h, 14h, 19h
      avgInterruptionsPerSession: 1,
      energyPatterns: {
        '9:00': 7,
        '14:00': 6,
        '19:00': 7
      },
      mostProductiveSubjects: [],
      sessionHistory: []
    }
  }
}

// Instância singleton
export const adaptiveTimer = new AdaptiveTimer()