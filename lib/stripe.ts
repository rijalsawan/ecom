import Stripe from 'stripe'
import { loadStripe, Stripe as StripeJS } from '@stripe/stripe-js'

// Server-side Stripe
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// Client-side Stripe
let stripePromise: Promise<StripeJS | null>

export const getStripe = (): Promise<StripeJS | null> => {
    if (!stripePromise) {
        stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
    }
    return stripePromise
}