import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type TierId = 'single-listing' | 'verified-seller' | 'pro-subscription'

type Tier = {
  name: string
  description: string
  /** Amount in cents (USD). */
  unitAmount: number
  /** Monthly plans are billed as Stripe subscriptions. */
  recurring?: 'month'
}

const TIERS: Record<TierId, Tier> = {
  'single-listing': {
    name: 'Aether Market — Single Listing',
    description: '1 active listing for 3 months with AI staging and HD images.',
    unitAmount: 500,
  },
  'verified-seller': {
    name: 'Aether Market — Verified Seller',
    description: 'Verified Seller badge, unlimited service ads, and priority placement.',
    unitAmount: 1500,
    recurring: 'month',
  },
  'pro-subscription': {
    name: 'Aether Market — Pro Agency',
    description: 'Up to 50 verified listings, brand page, and featured placement.',
    unitAmount: 9900,
    recurring: 'month',
  },
}

function isTierId(value: unknown): value is TierId {
  return typeof value === 'string' && value in TIERS
}

export async function POST(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    return NextResponse.json({ error: 'Checkout is not configured yet.' }, { status: 503 })
  }

  let body: { tier?: unknown; priceId?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const tierId = body.tier ?? body.priceId
  if (!isTierId(tierId)) {
    return NextResponse.json({ error: 'Unknown pricing tier.' }, { status: 400 })
  }

  const tier = TIERS[tierId]
  const origin = request.headers.get('origin') ?? new URL(request.url).origin
  const stripe = new Stripe(secretKey)

  try {
    const session = await stripe.checkout.sessions.create({
      mode: tier.recurring ? 'subscription' : 'payment',
      // Cards plus direct stablecoin (USDC) payments from wallets such as
      // Phantom, MetaMask, and WalletConnect-compatible apps.
      payment_method_types: ['card', 'crypto'] as Stripe.Checkout.SessionCreateParams.PaymentMethodType[],
      currency: 'usd',
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: tier.unitAmount,
            product_data: { name: tier.name, description: tier.description },
            ...(tier.recurring ? { recurring: { interval: tier.recurring } } : {}),
          },
        },
      ],
      metadata: { tier: tierId },
      success_url: `${origin}/?success=true`,
      cancel_url: `${origin}/?canceled=true`,
    })

    if (!session.url) {
      return NextResponse.json({ error: 'Stripe did not return a checkout URL.' }, { status: 502 })
    }
    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout session creation failed', err)
    const message = err instanceof Stripe.errors.StripeError ? err.message : 'Unable to start checkout.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
