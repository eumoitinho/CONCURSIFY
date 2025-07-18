'use client'

import { useState, useEffect } from 'react'
import { getUserSubscription, getUserUsage, checkUsageLimit, incrementUsage } from '@/app/actions/subscription'

interface SubscriptionData {
  id: string
  plan_id: string
  status: string
  billing_cycle: string
  current_period_end: string
  cancel_at_period_end: boolean
  subscription_plans: {
    name: string
    limits: Record<string, any>
    features: Record<string, any>
  }
}

interface UsageData {
  [key: string]: number
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [usage, setUsage] = useState<UsageData>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadSubscriptionData()
  }, [])

  const loadSubscriptionData = async () => {
    try {
      setLoading(true)
      
      const [subResult, usageResult] = await Promise.all([
        getUserSubscription(),
        getUserUsage()
      ])

      if (subResult.error) {
        setError(subResult.error)
      } else {
        setSubscription(subResult.subscription)
      }

      if (usageResult.error) {
        setError(usageResult.error)
      } else {
        setUsage(usageResult.usage)
      }

    } catch (err) {
      setError('Erro ao carregar dados da assinatura')
      console.error('Erro na subscription:', err)
    } finally {
      setLoading(false)
    }
  }

  const checkLimit = async (resourceType: string, increment: number = 1) => {
    try {
      const result = await checkUsageLimit(resourceType, increment)
      return result.allowed
    } catch (error) {
      console.error('Erro ao verificar limite:', error)
      return false
    }
  }

  const useResource = async (resourceType: string, amount: number = 1) => {
    try {
      const result = await incrementUsage(resourceType, amount)
      
      if (result.success) {
        // Atualizar estado local
        setUsage(prev => ({
          ...prev,
          [resourceType]: (prev[resourceType] || 0) + amount
        }))
        return true
      } else {
        setError(result.error || 'Limite de uso atingido')
        return false
      }
    } catch (error) {
      console.error('Erro ao usar recurso:', error)
      setError('Erro ao registrar uso do recurso')
      return false
    }
  }

  const getLimit = (resourceType: string) => {
    if (!subscription?.subscription_plans?.limits) return 0
    return subscription.subscription_plans.limits[resourceType] || 0
  }

  const getCurrentUsage = (resourceType: string) => {
    return usage[resourceType] || 0
  }

  const getRemainingUsage = (resourceType: string) => {
    const limit = getLimit(resourceType)
    if (limit === -1) return -1 // Ilimitado
    
    const current = getCurrentUsage(resourceType)
    return Math.max(0, limit - current)
  }

  const getUsagePercentage = (resourceType: string) => {
    const limit = getLimit(resourceType)
    if (limit === -1) return 0 // Ilimitado
    
    const current = getCurrentUsage(resourceType)
    return Math.min(100, (current / limit) * 100)
  }

  const isLimitReached = (resourceType: string) => {
    const limit = getLimit(resourceType)
    if (limit === -1) return false // Ilimitado
    
    const current = getCurrentUsage(resourceType)
    return current >= limit
  }

  const hasFeature = (featureName: string) => {
    if (!subscription?.subscription_plans?.features) return false
    return subscription.subscription_plans.features[featureName] === true ||
           subscription.subscription_plans.features[featureName] === 'unlimited' ||
           subscription.subscription_plans.features[featureName] === 'premium'
  }

  const isPlanActive = () => {
    return subscription?.status === 'active'
  }

  const isPlanCanceling = () => {
    return subscription?.cancel_at_period_end === true
  }

  const getPlanName = () => {
    return subscription?.subscription_plans?.name || 'Gratuito'
  }

  const getBillingCycle = () => {
    return subscription?.billing_cycle || 'monthly'
  }

  const getCurrentPeriodEnd = () => {
    if (!subscription?.current_period_end) return null
    return new Date(subscription.current_period_end)
  }

  const getDaysUntilRenewal = () => {
    const endDate = getCurrentPeriodEnd()
    if (!endDate) return null
    
    const now = new Date()
    const diffTime = endDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return Math.max(0, diffDays)
  }

  const refreshData = () => {
    loadSubscriptionData()
  }

  return {
    // Estados
    subscription,
    usage,
    loading,
    error,
    
    // Métodos de verificação
    checkLimit,
    useResource,
    
    // Getters de limites
    getLimit,
    getCurrentUsage,
    getRemainingUsage,
    getUsagePercentage,
    isLimitReached,
    
    // Getters de features
    hasFeature,
    
    // Getters de plano
    isPlanActive,
    isPlanCanceling,
    getPlanName,
    getBillingCycle,
    getCurrentPeriodEnd,
    getDaysUntilRenewal,
    
    // Utilities
    refreshData
  }
}

// Hook simplificado para verificar se pode usar um recurso
export function useResourceCheck(resourceType: string) {
  const { checkLimit, useResource, isLimitReached, getRemainingUsage } = useSubscription()
  
  return {
    canUse: !isLimitReached(resourceType),
    checkAndUse: async (amount: number = 1) => {
      const canUse = await checkLimit(resourceType, amount)
      if (canUse) {
        return await useResource(resourceType, amount)
      }
      return false
    },
    remaining: getRemainingUsage(resourceType),
    isLimitReached: isLimitReached(resourceType)
  }
}

// Hook para verificar features específicas
export function useFeatureAccess() {
  const { hasFeature, isPlanActive, getPlanName } = useSubscription()
  
  return {
    hasSpotifyAccess: hasFeature('spotify') && isPlanActive(),
    hasPdfExport: hasFeature('pdf_export') && isPlanActive(),
    hasBackup: hasFeature('backup') && isPlanActive(),
    hasPrioritySupport: hasFeature('priority_support') && isPlanActive(),
    hasAdvancedPomodoro: hasFeature('pomodoro') === 'advanced' || hasFeature('pomodoro') === 'premium',
    hasForumAccess: hasFeature('forum') && isPlanActive(),
    planName: getPlanName()
  }
}