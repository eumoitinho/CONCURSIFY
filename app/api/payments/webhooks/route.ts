import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { createServerClient } from '@/lib/supabase'

const supabase = createServerClient()

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = (await headers()).get('stripe-signature')

  if (!signature) {
    return new NextResponse('Missing stripe-signature header', { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return new NextResponse('Invalid signature', { status: 400 })
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionCanceled(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new NextResponse('Success', { status: 200 })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return new NextResponse('Webhook processing failed', { status: 500 })
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string
  
  // Buscar assinatura existente
  const { data: existingSubscription } = await supabase
    .from('user_subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!existingSubscription) return

  // Buscar plano baseado no price_id
  const priceId = subscription.items.data[0]?.price.id
  const { data: plan } = await supabase
    .from('subscription_plans')
    .select('id')
    .eq('stripe_price_id', priceId)
    .single()

  if (!plan) return

  // Atualizar assinatura
  await supabase
    .from('user_subscriptions')
    .upsert({
      user_id: existingSubscription.user_id,
      plan_id: plan.id,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      status: subscription.status,
      current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
      current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
    }, {
      onConflict: 'user_id'
    })
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string

  // Atualizar status para cancelado
  await supabase
    .from('user_subscriptions')
    .update({ status: 'canceled' })
    .eq('stripe_customer_id', customerId)
    .eq('stripe_subscription_id', subscription.id)
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  const subscriptionId = (invoice as any).subscription as string

  // Buscar usuário
  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!subscription) return

  // Registrar pagamento bem-sucedido
  await supabase
    .from('payment_history')
    .insert({
      user_id: subscription.user_id,
      stripe_payment_intent_id: (invoice as any).payment_intent as string,
      amount_cents: invoice.amount_paid,
      currency: invoice.currency,
      status: 'succeeded',
      description: invoice.description || 'Assinatura Premium',
    })

  // Garantir que a assinatura está ativa
  await supabase
    .from('user_subscriptions')
    .update({ status: 'active' })
    .eq('stripe_customer_id', customerId)
    .eq('stripe_subscription_id', subscriptionId)
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  const subscriptionId = (invoice as any).subscription as string

  // Buscar usuário
  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!subscription) return

  // Registrar falha no pagamento
  await supabase
    .from('payment_history')
    .insert({
      user_id: subscription.user_id,
      stripe_payment_intent_id: (invoice as any).payment_intent as string,
      amount_cents: invoice.amount_due,
      currency: invoice.currency,
      status: 'failed',
      description: `Falha no pagamento: ${invoice.description || 'Assinatura Premium'}`,
    })

  // Marcar assinatura como past_due se aplicável
  await supabase
    .from('user_subscriptions')
    .update({ status: 'past_due' })
    .eq('stripe_customer_id', customerId)
    .eq('stripe_subscription_id', subscriptionId)
}