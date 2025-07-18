import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
})

export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  secretKey: process.env.STRIPE_SECRET_KEY!,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  currency: 'brl',
  country: 'BR',
} as const

export const SUBSCRIPTION_PLANS = {
  GRATUITO: {
    name: 'Gratuito',
    priceMonthly: 0,
    priceYearly: 0,
    features: [
      '1 cronograma',
      '5 simulados por mês',
      '10 notas',
      '5 posts no fórum',
      '10 sessões Pomodoro',
      'Suporte da comunidade'
    ],
    limits: {
      cronogramas: 1,
      simulados: 5,
      notas: 10,
      forum_posts: 5,
      pomodoro_sessions: 10,
      spotify_playlists: 0
    }
  },
  ESTUDANTE: {
    name: 'Estudante',
    priceMonthly: 29.90,
    priceYearly: 299.00,
    stripePriceIdMonthly: process.env.STRIPE_PRICE_ESTUDANTE_MONTHLY,
    stripePriceIdYearly: process.env.STRIPE_PRICE_ESTUDANTE_YEARLY,
    features: [
      'Cronogramas ilimitados',
      'Simulados ilimitados',
      'Notas ilimitadas',
      'Posts ilimitados no fórum',
      'Pomodoro avançado',
      '10 playlists Spotify',
      'Exportação PDF',
      'Suporte por email'
    ],
    limits: {
      cronogramas: -1,
      simulados: -1,
      notas: -1,
      forum_posts: -1,
      pomodoro_sessions: -1,
      spotify_playlists: 10
    }
  },
  PROFISSIONAL: {
    name: 'Profissional',
    priceMonthly: 59.90,
    priceYearly: 599.00,
    stripePriceIdMonthly: process.env.STRIPE_PRICE_PROFISSIONAL_MONTHLY,
    stripePriceIdYearly: process.env.STRIPE_PRICE_PROFISSIONAL_YEARLY,
    features: [
      'Todos os recursos do Estudante',
      'Playlists Spotify ilimitadas',
      'Analytics avançados',
      'Backup automático',
      'Suporte prioritário',
      'Acesso antecipado a novos recursos'
    ],
    limits: {
      cronogramas: -1,
      simulados: -1,
      notas: -1,
      forum_posts: -1,
      pomodoro_sessions: -1,
      spotify_playlists: -1
    }
  }
} as const

export type SubscriptionPlanKey = keyof typeof SUBSCRIPTION_PLANS
export type SubscriptionPlan = typeof SUBSCRIPTION_PLANS[SubscriptionPlanKey]