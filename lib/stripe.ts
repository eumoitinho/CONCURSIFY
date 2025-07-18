import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
})

// Configuração dos planos
export const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Gratuito',
    price: 0,
    priceId: null,
    limits: {
      cronogramas: 1, // por mês
      notas: 10,
      pomodoro_sessions: 5, // por dia
      forum_posts: 3, // por mês
      spotify_playlists: 1,
      simulados: 3, // por mês
      pdf_export: false,
      backup: false,
      priority_support: false
    }
  },
  premium: {
    name: 'Premium',
    price: 3990, // R$ 39,90 em centavos
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID,
    limits: {
      cronogramas: 'unlimited',
      notas: 'unlimited',
      pomodoro_sessions: 'unlimited',
      forum_posts: 'unlimited',
      spotify_playlists: 'unlimited',
      simulados: 'unlimited',
      pdf_export: true,
      backup: true,
      priority_support: true,
      vip_forum_access: true,
      advanced_analytics: true
    }
  }
} as const

export type PlanType = keyof typeof SUBSCRIPTION_PLANS