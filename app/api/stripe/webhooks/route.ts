import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe, STRIPE_CONFIG } from '@/lib/stripe/config'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = headers().get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Assinatura Stripe ausente' },
        { status: 400 }
      )
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        STRIPE_CONFIG.webhookSecret
      )
    } catch (err) {
      console.error('Erro na verificação do webhook:', err)
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      )
    }

    // Verificar se já processamos este evento
    const { data: existingEvent } = await supabase
      .from('stripe_webhooks')
      .select('id')
      .eq('stripe_event_id', event.id)
      .single()

    if (existingEvent) {
      return NextResponse.json({ received: true })
    }

    // Salvar evento no banco
    await supabase
      .from('stripe_webhooks')
      .insert({
        stripe_event_id: event.id,
        event_type: event.type,
        data: event.data,
        processed: false
      })

    // Processar evento baseado no tipo
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
        console.log(`Evento não tratado: ${event.type}`)
    }

    // Marcar evento como processado
    await supabase
      .from('stripe_webhooks')
      .update({ 
        processed: true, 
        processed_at: new Date().toISOString() 
      })
      .eq('stripe_event_id', event.id)

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Erro no webhook:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId
  
  if (!userId || !session.subscription) {
    console.error('Dados insuficientes no checkout completed')
    return
  }

  const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
  await updateUserSubscription(subscription, userId)
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId
  
  if (!userId) {
    console.error('User ID não encontrado nos metadados da subscription')
    return
  }

  await updateUserSubscription(subscription, userId)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const { error } = await supabase
    .from('user_subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.id)

  if (error) {
    console.error('Erro ao cancelar subscription:', error)
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return

  const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
  const userId = subscription.metadata?.userId

  if (!userId) return

  // Registrar pagamento no histórico
  await supabase
    .from('payment_history')
    .insert({
      user_id: userId,
      stripe_payment_intent_id: invoice.payment_intent as string,
      amount: (invoice.amount_paid / 100), // Converter de centavos
      currency: invoice.currency,
      status: 'succeeded',
      description: `Pagamento da assinatura - ${invoice.description || 'Concursify'}`
    })

  // Atualizar subscription se necessário
  await updateUserSubscription(subscription, userId)
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return

  const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
  const userId = subscription.metadata?.userId

  if (!userId) return

  // Registrar falha no histórico
  await supabase
    .from('payment_history')
    .insert({
      user_id: userId,
      stripe_payment_intent_id: invoice.payment_intent as string,
      amount: (invoice.amount_due / 100),
      currency: invoice.currency,
      status: 'failed',
      description: `Falha no pagamento - ${invoice.description || 'Concursify'}`
    })

  // Atualizar status da subscription
  await supabase
    .from('user_subscriptions')
    .update({
      status: 'past_due',
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.id)
}

async function updateUserSubscription(subscription: Stripe.Subscription, userId: string) {
  const priceId = subscription.items.data[0]?.price.id
  
  // Buscar o plano baseado no price ID
  const { data: plan } = await supabase
    .from('subscription_plans')
    .select('*')
    .or(`stripe_price_id_monthly.eq.${priceId},stripe_price_id_yearly.eq.${priceId}`)
    .single()

  if (!plan) {
    console.error('Plano não encontrado para price ID:', priceId)
    return
  }

  const billingCycle = subscription.items.data[0]?.price.recurring?.interval === 'year' ? 'yearly' : 'monthly'

  const subscriptionData = {
    user_id: userId,
    plan_id: plan.id,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: subscription.customer as string,
    status: subscription.status,
    billing_cycle: billingCycle,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
    cancel_at_period_end: subscription.cancel_at_period_end,
    canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
    trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
    updated_at: new Date().toISOString()
  }

  // Upsert da subscription
  const { error } = await supabase
    .from('user_subscriptions')
    .upsert(subscriptionData, {
      onConflict: 'user_id'
    })

  if (error) {
    console.error('Erro ao atualizar subscription:', error)
  }
}