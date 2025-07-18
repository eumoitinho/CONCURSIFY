import { supabase } from '@/lib/supabase'
import { SUBSCRIPTION_PLANS, PlanType } from '@/lib/stripe'

export type FeatureType = 
  | 'cronogramas'
  | 'notas'
  | 'pomodoro_sessions'
  | 'forum_posts'
  | 'spotify_playlists'
  | 'simulados'
  | 'pdf_export'
  | 'backup'
  | 'priority_support'

export interface UsageInfo {
  current: number
  limit: number | 'unlimited'
  percentage: number
  canUse: boolean
}

export class SubscriptionLimits {
  static async getUserPlan(userId: string): Promise<PlanType> {
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plans:plan_id (*)
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()

    if (!subscription) {
      return 'free'
    }

    return subscription.subscription_plans.name.toLowerCase().includes('premium') 
      ? 'premium' 
      : 'free'
  }

  static async checkFeatureLimit(
    userId: string, 
    feature: FeatureType,
    timeframe: 'daily' | 'monthly' = 'monthly'
  ): Promise<UsageInfo> {
    const plan = await this.getUserPlan(userId)
    const limits = SUBSCRIPTION_PLANS[plan].limits
    const limit = limits[feature as keyof typeof limits]

    // Se é unlimited, sempre pode usar
    if (limit === 'unlimited' || limit === true) {
      return {
        current: 0,
        limit: 'unlimited',
        percentage: 0,
        canUse: true
      }
    }

    // Se a feature não está disponível no plano
    if (limit === false) {
      return {
        current: 0,
        limit: 0,
        percentage: 100,
        canUse: false
      }
    }

    // Buscar uso atual
    const current = await this.getCurrentUsage(userId, feature, timeframe)
    const numericLimit = typeof limit === 'number' ? limit : 0
    const percentage = numericLimit > 0 ? (current / numericLimit) * 100 : 0

    return {
      current,
      limit: numericLimit,
      percentage,
      canUse: current < numericLimit
    }
  }

  static async getCurrentUsage(
    userId: string,
    feature: FeatureType,
    timeframe: 'daily' | 'monthly' = 'monthly'
  ): Promise<number> {
    const date = new Date()
    let startDate: string

    if (timeframe === 'daily') {
      startDate = date.toISOString().split('T')[0] // YYYY-MM-DD
    } else {
      startDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`
    }

    const { data } = await supabase
      .from('usage_tracking')
      .select('count')
      .eq('user_id', userId)
      .eq('feature', feature)
      .gte('date', startDate)

    return data?.reduce((total, record) => total + record.count, 0) || 0
  }

  static async trackFeatureUsage(
    userId: string,
    feature: FeatureType,
    metadata?: Record<string, any>
  ): Promise<void> {
    const today = new Date().toISOString().split('T')[0]

    // Tentar inserir novo registro ou incrementar existente
    const { error } = await supabase
      .from('usage_tracking')
      .upsert({
        user_id: userId,
        feature,
        date: today,
        count: 1,
        metadata
      }, {
        onConflict: 'user_id,feature,date',
        ignoreDuplicates: false
      })

    if (error) {
      // Se der erro de constraint, incrementar o count
      await supabase.rpc('increment_usage', {
        p_user_id: userId,
        p_feature: feature,
        p_date: today
      })
    }
  }

  static async canUseFeature(
    userId: string,
    feature: FeatureType,
    timeframe: 'daily' | 'monthly' = 'monthly'
  ): Promise<boolean> {
    const usage = await this.checkFeatureLimit(userId, feature, timeframe)
    return usage.canUse
  }

  static async requiresUpgrade(
    userId: string,
    feature: FeatureType
  ): Promise<{ requires: boolean; reason: string }> {
    const usage = await this.checkFeatureLimit(userId, feature)
    
    if (!usage.canUse) {
      if (usage.limit === 0) {
        return {
          requires: true,
          reason: `A funcionalidade ${feature} não está disponível no seu plano atual.`
        }
      } else {
        return {
          requires: true,
          reason: `Você atingiu o limite de ${usage.limit} ${feature} do seu plano atual.`
        }
      }
    }

    return { requires: false, reason: '' }
  }

  static async getAllUsageInfo(userId: string): Promise<Record<FeatureType, UsageInfo>> {
    const features: FeatureType[] = [
      'cronogramas',
      'notas', 
      'pomodoro_sessions',
      'forum_posts',
      'spotify_playlists',
      'simulados'
    ]

    const usageInfo: Record<string, UsageInfo> = {}

    for (const feature of features) {
      usageInfo[feature] = await this.checkFeatureLimit(userId, feature)
    }

    return usageInfo as Record<FeatureType, UsageInfo>
  }
}