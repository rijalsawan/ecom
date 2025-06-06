import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

interface CartItem {
    id: string;
    name: string;
    price: string;
    quantity: string;
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-05-28.basil',
});

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature') as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    try {
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;
            
            console.log('Processing payment success for session:', session.id);
            console.log('Session metadata:', session.metadata);
            
            // Check if order already exists
            const existingOrder = await prisma.order.findUnique({
                where: { stripeSessionId: session.id }
            });

            if (existingOrder) {
                console.log('Order already exists for session:', session.id);
                return NextResponse.json({ received: true });
            }

            // Extract metadata
            const {
                customerEmail,
                customerPhone,
                customerAddress,
                cartItems: cartItemsString
            } = session.metadata || {};

            if (!cartItemsString) {
                console.error('No cart items found in session metadata');
                return NextResponse.json({ error: 'No cart items found' }, { status: 400 });
            }

            let cartItems;
            try {
                cartItems = JSON.parse(cartItemsString);
            } catch (parseError) {
                console.error('Error parsing cart items:', parseError);
                return NextResponse.json({ error: 'Invalid cart items format' }, { status: 400 });
            }

            // Create order in database
            const order = await prisma.order.create({
                data: {
                    name: `${customerEmail || 'Customer'}`,
                    stripeSessionId: session.id,
                    email: customerEmail || '',
                    phone: customerPhone || '',
                    shippingAddress: customerAddress || '',
                    total: (session.amount_total || 0) / 100, // Convert from cents
                    items: {
                        create: cartItems.map((item: CartItem) => ({
                            productId: parseInt(item.id),
                            name: item.name,
                            price: parseFloat(item.price),
                            quantity: parseInt(item.quantity),
                        }))
                    }
                },
                include: {
                    items: true
                }
            });

            console.log('Order created successfully:', order);
            localStorage.removeItem('cart'); // Clear cart after successful payment
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Error processing webhook:', error);
        return NextResponse.json(
            { error: 'Error processing webhook' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}