'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useSubscription } from '@/hooks/use-subscription'
import { 
  Calendar,
  FileText,
  MessageSquare,
  Clock,
  Music,
  Crown,
  Zap,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'

export function UsageLimits() {
  const {
    loading,
    error,
    getPlanName,
    getLimit,
    getCurrentUsage,
    getUsagePercentage,
    isLimitReached,
    isPlanActive,
    getDaysUntilRenewal
  } = useSubscription()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Carregando...</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Erro</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">{error}</p>
        </CardContent>
      </Card>
    )
  }

  const planName = getPlanName()
  const daysUntilRenewal = getDaysUntilRenewal()
  const isActive = isPlanActive()

  const resourceTypes = [
    {
      key: 'cronogramas',
      name: 'Cronogramas',
      icon: Calendar,
      color: 'text-blue-600'
    },
    {
      key: 'simulados',
      name: 'Simulados',
      icon: FileText,
      color: 'text-green-600'
    },
    {
      key: 'forum_posts',
      name: 'Posts do Fórum',
      icon: MessageSquare,
      color: 'text-purple-600'
    },
    {
      key: 'pomodoro_sessions',
      name: 'Sessões Pomodoro',
      icon: Clock,
      color: 'text-orange-600'
    },
    {
      key: 'spotify_playlists',
      name: 'Playlists Spotify',
      icon: Music,
      color: 'text-pink-600'
    }
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Crown className="h-5 w-5 text-[#FF723A]" />
            <span>Uso dos Recursos</span>
          </CardTitle>
          <Badge 
            variant={isActive ? 'default' : 'secondary'}
            className={isActive ? 'bg-[#FF723A]' : ''}
          >
            {planName}
          </Badge>
        </div>
        
        {daysUntilRenewal !== null && isActive && (
          <p className="text-sm text-gray-600">
            Renovação em {daysUntilRenewal} dia{daysUntilRenewal !== 1 ? 's' : ''}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {resourceTypes.map((resource) => {
          const limit = getLimit(resource.key)
          const current = getCurrentUsage(resource.key)
          const percentage = getUsagePercentage(resource.key)
          const limitReached = isLimitReached(resource.key)
          const Icon = resource.icon

          if (limit === 0) return null // Recurso não disponível no plano

          return (
            <div key={resource.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Icon className={`h-4 w-4 ${resource.color}`} />
                  <span className="text-sm font-medium">{resource.name}</span>
                </div>
                
                <div className="text-right">
                  {limit === -1 ? (
                    <Badge variant="outline" className="text-xs">
                      <Zap className="h-3 w-3 mr-1" />
                      Ilimitado
                    </Badge>
                  ) : (
                    <span className={`text-sm ${limitReached ? 'text-red-600' : 'text-gray-600'}`}>
                      {current} / {limit}
                    </span>
                  )}
                </div>
              </div>

              {limit !== -1 && (
                <>
                  <Progress 
                    value={percentage} 
                    className={`h-2 ${limitReached ? 'bg-red-100' : ''}`}
                  />
                  
                  {limitReached && (
                    <div className="flex items-center space-x-2 text-xs text-red-600">
                      <AlertTriangle className="h-3 w-3" />
                      <span>Limite atingido</span>
                    </div>
                  )}
                  
                  {percentage > 80 && percentage < 100 && (
                    <div className="flex items-center space-x-2 text-xs text-orange-600">
                      <AlertTriangle className="h-3 w-3" />
                      <span>Próximo do limite</span>
                    </div>
                  )}
                </>
              )}
            </div>
          )
        })}

        {planName === 'Gratuito' && (
          <div className="pt-4 border-t">
            <div className="bg-gradient-to-r from-[#FF723A]/10 to-[#E55A2B]/10 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Crown className="h-5 w-5 text-[#FF723A] mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">
                    Quer mais recursos?
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Faça upgrade para ter acesso ilimitado a todos os recursos e funcionalidades premium.
                  </p>
                  <Button 
                    size="sm" 
                    className="bg-[#FF723A] hover:bg-[#E55A2B]"
                    asChild
                  >
                    <Link href="/planos">
                      Ver Planos
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {planName !== 'Gratuito' && (
          <div className="pt-4 border-t">
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                Precisa de mais recursos?
              </p>
              <div className="flex space-x-2 justify-center">
                <Button 
                  variant="outline" 
                  size="sm"
                  asChild
                >
                  <Link href="/planos">
                    Comparar Planos
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  asChild
                >
                  <Link href="/dashboard/subscription">
                    Gerenciar Assinatura
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Componente para mostrar limite atingido
export function LimitReachedAlert({ 
  resourceType, 
  resourceName 
}: { 
  resourceType: string
  resourceName: string 
}) {
  const { getPlanName } = useSubscription()
  
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-medium text-red-900 mb-1">
            Limite atingido
          </h4>
          <p className="text-sm text-red-700 mb-3">
            Você atingiu o limite de {resourceName.toLowerCase()} do seu plano {getPlanName()}.
          </p>
          <Button 
            size="sm" 
            className="bg-[#FF723A] hover:bg-[#E55A2B]"
            asChild
          >
            <Link href="/planos">
              Fazer Upgrade
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}