import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { stripe } from '@/lib/stripe/config'

export async function POST(request: NextRequest) {
  try {
    const { priceId, billingCycle, successUrl, cancelUrl } = await request.json()

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID é obrigatório' },
        { status: 400 }
      )
    }

    const supabase = createRouteHandlerClient({ cookies })
    
    // Verificar se o usuário está autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    // Buscar ou criar customer no Stripe
    let customerId: string

    // Verificar se já existe um customer
    const { data: existingSubscription } = await supabase
      .from('user_subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    if (existingSubscription?.stripe_customer_id) {
      customerId = existingSubscription.stripe_customer_id
    } else {
      // Criar novo customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id,
        },
      })
      customerId = customer.id
    }

    // Criar sessão de checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card', 'pix'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/planos`,
      metadata: {
        userId: user.id,
        billingCycle: billingCycle || 'monthly',
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          billingCycle: billingCycle || 'monthly',
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      locale: 'pt-BR',
    })

    return NextResponse.json({ 
      url: session.url,
      sessionId: session.id 
    })

  } catch (error) {
    console.error('Erro ao criar sessão de checkout:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}