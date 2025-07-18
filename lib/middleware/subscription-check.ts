import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { SubscriptionLimits, FeatureType } from '@/lib/subscription/limits'

// Re-export SubscriptionLimits for other modules
export { SubscriptionLimits }

export interface SubscriptionCheckConfig {
  feature: FeatureType
  timeframe?: 'daily' | 'monthly'
  redirectTo?: string
  errorMessage?: string
}

export function withSubscriptionCheck(config: SubscriptionCheckConfig) {
  return function middleware(handler: Function) {
    return async function (req: NextRequest, context?: any) {
      const session = await getServerSession()
      
      if (!session?.user?.id) {
        return NextResponse.json(
          { error: 'Não autenticado' },
          { status: 401 }
        )
      }

      // Verificar se pode usar a feature
      const canUse = await SubscriptionLimits.canUseFeature(
        session.user.id,
        config.feature,
        config.timeframe
      )

      if (!canUse) {
        const upgradeInfo = await SubscriptionLimits.requiresUpgrade(
          session.user.id,
          config.feature
        )

        return NextResponse.json(
          {
            error: 'Limite atingido',
            message: upgradeInfo.reason,
            requiresUpgrade: true,
            feature: config.feature,
            redirectTo: config.redirectTo || '/subscription/upgrade'
          },
          { status: 403 }
        )
      }

      // Se pode usar, continuar com o handler original
      return handler(req, context)
    }
  }
}

// Hook personalizado para uso em Server Actions
export async function checkFeatureAccess(
  userId: string,
  feature: FeatureType,
  timeframe: 'daily' | 'monthly' = 'monthly'
): Promise<{ allowed: boolean; error?: string; upgradeRequired?: boolean }> {
  const canUse = await SubscriptionLimits.canUseFeature(userId, feature, timeframe)
  
  if (!canUse) {
    const upgradeInfo = await SubscriptionLimits.requiresUpgrade(userId, feature)
    return {
      allowed: false,
      error: upgradeInfo.reason,
      upgradeRequired: true
    }
  }

  return { allowed: true }
}

// Middleware para endpoints específicos
export const FEATURE_ENDPOINTS: Record<string, FeatureType> = {
  '/api/cronogramas': 'cronogramas',
  '/api/notes': 'notas',
  '/api/pomodoro': 'pomodoro_sessions',
  '/api/forum/posts': 'forum_posts',
  '/api/spotify/playlists': 'spotify_playlists',
  '/api/simulados': 'simulados'
}

export function getFeatureFromPath(pathname: string): FeatureType | null {
  for (const [path, feature] of Object.entries(FEATURE_ENDPOINTS)) {
    if (pathname.startsWith(path)) {
      return feature
    }
  }
  return null
}