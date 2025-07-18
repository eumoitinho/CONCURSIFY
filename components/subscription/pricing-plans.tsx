'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { createCheckoutSession } from '@/app/actions/subscription'
import { 
  Check, 
  Star, 
  Zap, 
  Crown,
  Loader2,
  Gift
} from 'lucide-react'

interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price_monthly: number
  price_yearly: number
  stripe_price_id_monthly?: string
  stripe_price_id_yearly?: string
  features: Record<string, any>
  limits: Record<string, any>
  is_popular: boolean
  sort_order: number
}

interface PricingPlansProps {
  plans: SubscriptionPlan[]
}

export function PricingPlans({ plans }: PricingPlansProps) {
  const [isYearly, setIsYearly] = useState(false)
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const { toast } = useToast()

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (plan.price_monthly === 0) {
      // Plano gratuito - redirecionar para cadastro
      window.location.href = '/cadastro'
      return
    }

    setLoadingPlan(plan.id)

    try {
      const priceId = isYearly ? plan.stripe_price_id_yearly : plan.stripe_price_id_monthly
      
      if (!priceId) {
        toast({
          title: 'Erro',
          description: 'ID do preço não configurado para este plano',
          variant: 'destructive'
        })
        return
      }

      const result = await createCheckoutSession({
        priceId,
        billingCycle: isYearly ? 'yearly' : 'monthly'
      })

      if (result.success && result.url) {
        window.location.href = result.url
      } else {
        toast({
          title: 'Erro',
          description: result.error || 'Erro ao criar sessão de checkout',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Erro ao processar assinatura:', error)
      toast({
        title: 'Erro',
        description: 'Erro interno. Tente novamente.',
        variant: 'destructive'
      })
    } finally {
      setLoadingPlan(null)
    }
  }

  const formatPrice = (monthly: number, yearly: number) => {
    const price = isYearly ? yearly / 12 : monthly
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    }).format(price)
  }

  const getYearlySavings = (monthly: number, yearly: number) => {
    const monthlyCost = monthly * 12
    const savings = monthlyCost - yearly
    const percentage = Math.round((savings / monthlyCost) * 100)
    return { savings, percentage }
  }

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'gratuito':
        return <Gift className="h-6 w-6" />
      case 'estudante':
        return <Zap className="h-6 w-6" />
      case 'profissional':
        return <Crown className="h-6 w-6" />
      default:
        return <Star className="h-6 w-6" />
    }
  }

  const getFeatureList = (plan: SubscriptionPlan) => {
    const features = []
    
    // Cronogramas
    if (plan.limits.cronogramas === -1) {
      features.push('Cronogramas ilimitados')
    } else {
      features.push(`${plan.limits.cronogramas} cronograma${plan.limits.cronogramas > 1 ? 's' : ''}`)
    }

    // Simulados
    if (plan.limits.simulados === -1) {
      features.push('Simulados ilimitados')
    } else {
      features.push(`${plan.limits.simulados} simulados por mês`)
    }

    // Notas
    if (plan.limits.notas === -1) {
      features.push('Notas ilimitadas')
    } else {
      features.push(`${plan.limits.notas} notas`)
    }

    // Fórum
    if (plan.limits.forum_posts === -1) {
      features.push('Posts ilimitados no fórum')
    } else {
      features.push(`${plan.limits.forum_posts} posts no fórum por mês`)
    }

    // Pomodoro
    if (plan.limits.pomodoro_sessions === -1) {
      features.push('Sessões Pomodoro ilimitadas')
    } else {
      features.push(`${plan.limits.pomodoro_sessions} sessões Pomodoro por mês`)
    }

    // Spotify
    if (plan.limits.spotify_playlists === -1) {
      features.push('Playlists Spotify ilimitadas')
    } else if (plan.limits.spotify_playlists > 0) {
      features.push(`${plan.limits.spotify_playlists} playlists Spotify`)
    }

    // Recursos especiais
    if (plan.limits.pdf_export) {
      features.push('Exportação PDF')
    }

    if (plan.limits.backup) {
      features.push('Backup automático')
    }

    if (plan.limits.priority_support) {
      features.push('Suporte prioritário')
    }

    // Suporte
    if (plan.name.toLowerCase() === 'gratuito') {
      features.push('Suporte da comunidade')
    } else if (plan.name.toLowerCase() === 'estudante') {
      features.push('Suporte por email')
    } else if (plan.name.toLowerCase() === 'profissional') {
      features.push('Suporte prioritário')
    }

    return features
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Billing Toggle */}
      <div className="flex items-center justify-center space-x-4 mb-12">
        <span className={`text-sm font-medium ${!isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
          Mensal
        </span>
        <Switch
          checked={isYearly}
          onCheckedChange={setIsYearly}
          className="data-[state=checked]:bg-orange-500"
        />
        <span className={`text-sm font-medium ${isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
          Anual
        </span>
        {isYearly && (
          <Badge className="bg-orange-500 text-white border-2 border-gray-800 shadow-[2px_2px_0px_0px_#2d2d2d]">
            <Gift className="h-3 w-3 mr-1" />
            2 meses grátis
          </Badge>
        )}
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const features = getFeatureList(plan)
          const savings = plan.price_yearly > 0 ? getYearlySavings(plan.price_monthly, plan.price_yearly) : null
          const isLoading = loadingPlan === plan.id

          return (
            <Card 
              key={plan.id} 
              className={`relative transition-all duration-300 ${
                plan.is_popular 
                  ? 'border-orange-500 border-4 scale-105 bg-gradient-to-br from-orange-50 to-orange-100' 
                  : 'hover:bg-orange-50'
              }`}
            >
              {plan.is_popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-orange-500 text-white px-4 py-2 border-2 border-gray-800 shadow-[3px_3px_0px_0px_#2d2d2d] font-bold">
                    <Star className="h-4 w-4 mr-1" />
                    Mais popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className={`mx-auto p-4 rounded-full w-fit border-2 border-gray-800 ${
                  plan.is_popular ? 'bg-orange-500 text-white shadow-[3px_3px_0px_0px_#2d2d2d]' : 'bg-white text-gray-600 shadow-[3px_3px_0px_0px_#2d2d2d]'
                }`}>
                  {getPlanIcon(plan.name)}
                </div>
                
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {plan.name}
                </CardTitle>
                
                <p className="text-gray-600 text-sm">
                  {plan.description}
                </p>
                
                <div className="pt-4">
                  <div className="text-4xl font-bold text-gray-900">
                    {formatPrice(plan.price_monthly, plan.price_yearly)}
                    <span className="text-lg font-normal text-gray-500">/mês</span>
                  </div>
                  
                  {isYearly && plan.price_yearly > 0 && savings && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(plan.price_yearly)} cobrado anualmente
                      </p>
                      <Badge variant="outline" className="mt-1 text-orange-500 border-orange-500 border-2 shadow-[2px_2px_0px_0px_#2d2d2d] font-semibold">
                        Economize {savings.percentage}%
                      </Badge>
                    </div>
                  )}
                  
                  {plan.price_monthly === 0 && (
                    <p className="text-sm text-gray-500 mt-2">
                      Para sempre gratuito
                    </p>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <Button
                  onClick={() => handleSubscribe(plan)}
                  disabled={isLoading}
                  className="w-full mb-6"
                  variant={plan.is_popular ? 'default' : 'outline'}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      {plan.price_monthly === 0 ? 'Começar grátis' : 'Assinar agora'}
                    </>
                  )}
                </Button>

                <ul className="space-y-3">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                        <Check className="h-3 w-3 text-white font-bold" />
                      </div>
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.name.toLowerCase() === 'profissional' && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Crown className="h-4 w-4 text-orange-500" />
                      <span>Acesso antecipado a novos recursos</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Additional Info */}
      <div className="mt-12 text-center">
        <p className="text-sm text-gray-500 mb-4">
          Todos os planos incluem teste grátis de 7 dias • Cancele a qualquer momento
        </p>
        <div className="flex items-center justify-center space-x-8 text-xs text-gray-400">
          <span>✓ Sem compromisso</span>
          <span>✓ Dados seguros</span>
          <span>✓ Suporte brasileiro</span>
        </div>
      </div>
    </div>
  )
}