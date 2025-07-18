'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { stripe } from '@/lib/stripe/config'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const CreateCheckoutSchema = z.object({
  priceId: z.string().min(1, 'Price ID é obrigatório'),
  billingCycle: z.enum(['monthly', 'yearly']).default('monthly'),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional()
})

const CancelSubscriptionSchema = z.object({
  immediately: z.boolean().default(false)
})

export async function createCheckoutSession(input: z.infer<typeof CreateCheckoutSchema>) {
  try {
    const validatedInput = CreateCheckoutSchema.parse(input)
    const supabase = createServerActionClient({ cookies })
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { 
        error: 'Usuário não autenticado', 
        success: false 
      }
    }

    // Verificar se já tem assinatura ativa
    const { data: existingSubscription } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (existingSubscription) {
      return {
        error: 'Você já possui uma assinatura ativa',
        success: false
      }
    }

    // Chamar API para criar checkout
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/stripe/create-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedInput),
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        error: data.error || 'Erro ao criar sessão de checkout',
        success: false
      }
    }

    return {
      url: data.url,
      sessionId: data.sessionId,
      success: true
    }

  } catch (error) {
    console.error('Erro na criação do checkout:', error)
    return {
      error: 'Erro interno do servidor',
      success: false
    }
  }
}

export async function getUserSubscription() {
  try {
    const supabase = createServerActionClient({ cookies })
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { 
        subscription: null, 
        error: 'Usuário não autenticado' 
      }
    }

    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plans (*)
      `)
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Erro ao buscar subscription:', error)
      return { 
        subscription: null, 
        error: 'Erro ao buscar assinatura' 
      }
    }

    return { 
      subscription, 
      error: null 
    }

  } catch (error) {
    console.error('Erro na busca da subscription:', error)
    return {
      subscription: null,
      error: 'Erro interno do servidor'
    }
  }
}

export async function cancelSubscription(input: z.infer<typeof CancelSubscriptionSchema>) {
  try {
    const validatedInput = CancelSubscriptionSchema.parse(input)
    const supabase = createServerActionClient({ cookies })
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { 
        error: 'Usuário não autenticado', 
        success: false 
      }
    }

    // Buscar subscription ativa
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select('stripe_subscription_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (subError || !subscription) {
      return {
        error: 'Assinatura ativa não encontrada',
        success: false
      }
    }

    // Cancelar no Stripe
    if (validatedInput.immediately) {
      await stripe.subscriptions.cancel(subscription.stripe_subscription_id)
    } else {
      await stripe.subscriptions.update(subscription.stripe_subscription_id, {
        cancel_at_period_end: true
      })
    }

    // Atualizar no banco
    await supabase
      .from('user_subscriptions')
      .update({
        cancel_at_period_end: !validatedInput.immediately,
        canceled_at: validatedInput.immediately ? new Date().toISOString() : null,
        status: validatedInput.immediately ? 'canceled' : 'active',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)

    revalidatePath('/dashboard')
    revalidatePath('/planos')

    return {
      success: true,
      message: validatedInput.immediately 
        ? 'Assinatura cancelada imediatamente' 
        : 'Assinatura será cancelada no final do período atual'
    }

  } catch (error) {
    console.error('Erro ao cancelar subscription:', error)
    return {
      error: 'Erro interno do servidor',
      success: false
    }
  }
}

export async function reactivateSubscription() {
  try {
    const supabase = createServerActionClient({ cookies })
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { 
        error: 'Usuário não autenticado', 
        success: false 
      }
    }

    // Buscar subscription marcada para cancelamento
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select('stripe_subscription_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .eq('cancel_at_period_end', true)
      .single()

    if (subError || !subscription) {
      return {
        error: 'Assinatura elegível para reativação não encontrada',
        success: false
      }
    }

    // Reativar no Stripe
    await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: false
    })

    // Atualizar no banco
    await supabase
      .from('user_subscriptions')
      .update({
        cancel_at_period_end: false,
        canceled_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)

    revalidatePath('/dashboard')
    revalidatePath('/planos')

    return {
      success: true,
      message: 'Assinatura reativada com sucesso'
    }

  } catch (error) {
    console.error('Erro ao reativar subscription:', error)
    return {
      error: 'Erro interno do servidor',
      success: false
    }
  }
}

export async function getSubscriptionPlans() {
  try {
    const supabase = createServerActionClient({ cookies })
    
    const { data: plans, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')

    if (error) {
      console.error('Erro ao buscar planos:', error)
      return { 
        plans: [], 
        error: 'Erro ao buscar planos' 
      }
    }

    return { 
      plans, 
      error: null 
    }

  } catch (error) {
    console.error('Erro na busca dos planos:', error)
    return {
      plans: [],
      error: 'Erro interno do servidor'
    }
  }
}

export async function getUserUsage() {
  try {
    const supabase = createServerActionClient({ cookies })
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { 
        usage: {}, 
        error: 'Usuário não autenticado' 
      }
    }

    const { data: usage, error } = await supabase
      .from('user_usage')
      .select('*')
      .eq('user_id', user.id)

    if (error) {
      console.error('Erro ao buscar uso:', error)
      return { 
        usage: {}, 
        error: 'Erro ao buscar dados de uso' 
      }
    }

    // Converter array para objeto indexado por resource_type
    const usageObj = usage.reduce((acc, item) => {
      acc[item.resource_type] = item.usage_count
      return acc
    }, {} as Record<string, number>)

    return { 
      usage: usageObj, 
      error: null 
    }

  } catch (error) {
    console.error('Erro na busca do uso:', error)
    return {
      usage: {},
      error: 'Erro interno do servidor'
    }
  }
}

export async function checkUsageLimit(resourceType: string, increment: number = 1) {
  try {
    const supabase = createServerActionClient({ cookies })
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { 
        allowed: false, 
        error: 'Usuário não autenticado' 
      }
    }

    const { data, error } = await supabase
      .rpc('check_usage_limit', {
        p_user_id: user.id,
        p_resource_type: resourceType,
        p_increment: increment
      })

    if (error) {
      console.error('Erro ao verificar limite:', error)
      return { 
        allowed: false, 
        error: 'Erro ao verificar limite de uso' 
      }
    }

    return { 
      allowed: data, 
      error: null 
    }

  } catch (error) {
    console.error('Erro na verificação do limite:', error)
    return {
      allowed: false,
      error: 'Erro interno do servidor'
    }
  }
}

export async function incrementUsage(resourceType: string, amount: number = 1) {
  try {
    const supabase = createServerActionClient({ cookies })
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { 
        success: false, 
        error: 'Usuário não autenticado' 
      }
    }

    const { data, error } = await supabase
      .rpc('increment_usage', {
        p_user_id: user.id,
        p_resource_type: resourceType,
        p_amount: amount
      })

    if (error) {
      console.error('Erro ao incrementar uso:', error)
      return { 
        success: false, 
        error: 'Erro ao registrar uso' 
      }
    }

    if (!data) {
      return {
        success: false,
        error: 'Limite de uso atingido'
      }
    }

    return { 
      success: true, 
      error: null 
    }

  } catch (error) {
    console.error('Erro no incremento do uso:', error)
    return {
      success: false,
      error: 'Erro interno do servidor'
    }
  }
}