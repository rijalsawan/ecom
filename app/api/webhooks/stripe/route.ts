import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-05-28.basil',
});

export async function GET() {
    return NextResponse.json({ 
        message: 'Stripe webhook endpoint is working!',
        timestamp: new Date().toISOString()
    });
}

export async function POST(request: NextRequest) {
    console.log('🔥 Webhook received at:', new Date().toISOString());
    
    try {
        // Get the raw body
        const body = await request.text();
        const signature = request.headers.get('stripe-signature');

        console.log('📝 Request details:');
        console.log('- Body length:', body.length);
        console.log('- Has signature:', !!signature);
        console.log('- Content-Type:', request.headers.get('content-type'));
        console.log('- User-Agent:', request.headers.get('user-agent'));

        if (!signature) {
            console.error('❌ No signature provided');
            return NextResponse.json({ error: 'No signature provided' }, { status: 400 });
        }

        if (!process.env.STRIPE_WEBHOOK_SECRET) {
            console.error('❌ No webhook secret configured');
            return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
        }

        let event: Stripe.Event;

        try {
            // Verify the webhook signature
            event = stripe.webhooks.constructEvent(
                body,
                signature,
                process.env.STRIPE_WEBHOOK_SECRET
            );
            console.log('✅ Webhook signature verified successfully');
            console.log('📧 Event type:', event.type);
            console.log('🆔 Event ID:', event.id);
        } catch (err) {
            console.error('❌ Webhook signature verification failed:', err);
            console.error('🔍 Debug info:');
            console.error('- Webhook secret prefix:', process.env.STRIPE_WEBHOOK_SECRET?.substring(0, 10) + '...');
            console.error('- Signature:', signature);
            console.error('- Body preview:', body.substring(0, 100) + '...');
            
            return NextResponse.json({ 
                error: 'Invalid signature',
                debug: {
                    hasSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
                    hasSignature: !!signature,
                    bodyLength: body.length
                }
            }, { status: 400 });
        }

        // Process the event
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;
            
            console.log('💳 Processing checkout session:', session.id);
            console.log('💰 Amount total:', session.amount_total);
            console.log('📋 Session metadata:', session.metadata);

            // Check if order already exists
            const existingOrder = await prisma.order.findUnique({
                where: { stripeSessionId: session.id }
            });

            if (existingOrder) {
                console.log('⚠️ Order already exists:', existingOrder.id);
                return NextResponse.json({ received: true, orderId: existingOrder.id });
            }

            // Extract metadata
            const {
                customerName,
                customerEmail,
                customerPhone,
                customerAddress,
                orderId
            } = session.metadata || {};

            console.log('👤 Customer info:', {
                name: customerName,
                email: customerEmail,
                phone: customerPhone,
                address: customerAddress,
                orderId: orderId
            });

            if (!orderId) {
                console.error('❌ No order ID found in session metadata');
                console.log('📋 Available metadata keys:', Object.keys(session.metadata || {}));
                return NextResponse.json({ error: 'No order ID found' }, { status: 400 });
            }

            // Update the existing order status to COMPLETED
            console.log('� Updating order status in database...');
            const order = await prisma.order.update({
                where: { id: parseInt(orderId) },
                data: { 
                    status: 'COMPLETED'
                },
                include: {
                    items: true
                }
            });

            console.log('✅ Order created successfully:', {
                id: order.id,
                total: order.total,
                itemCount: order.items.length
            });

            return NextResponse.json({ 
                received: true, 
                orderId: order.id,
                message: 'Order created successfully'
            });
        } else {
            console.log('ℹ️ Event type not processed:', event.type);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('❌ Error processing webhook:', error);
        return NextResponse.json(
            { 
                error: 'Error processing webhook', 
                details: error instanceof Error ? error.message : 'Unknown error' 
            },
            { status: 500 }
        );
    }
}