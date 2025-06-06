import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    try {
        const { name, description, amount, userId } = await req.json();

        // 1. Create a Product
        const product = await stripe.products.create({
            name,
            description,
        });

        // 2. Create a Price
        const price = await stripe.prices.create({
            product: product.id,
            unit_amount: amount,
            currency: 'usd'
        });

        // 3. Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: price.id,
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${req.headers.get('origin')}/success`,
            cancel_url: `${req.headers.get('origin')}/cancel`,
            metadata: {
                userId: userId,
                productName: name,
                amount: amount.toString()
            }
        });
        console.log("this",session);
        

        // 4. Save order details to database
        const saveOrder = await prisma.order.create({
            data: {
                stripeSessionId: session.id,
                name: name,
                description: description,
                total: amount,
                email: session.customer_email || '',
            }
        });
        if (!saveOrder) {
            throw new Error('Failed to save order details');
        }

        return NextResponse.json({ id: session.id });
        
        
    } catch (err: unknown) {
        return NextResponse.json({ error: err instanceof Error ? err.message : 'An error occurred' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
