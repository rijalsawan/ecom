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
                cartItems: cartItemsString
            } = session.metadata || {};

            console.log('👤 Customer info:', {
                name: customerName,
                email: customerEmail,
                phone: customerPhone,
                address: customerAddress,
                cartItemsLength: cartItemsString?.length
            });

            if (!cartItemsString) {
                console.error('❌ No cart items found in session metadata');
                console.log('📋 Available metadata keys:', Object.keys(session.metadata || {}));
                return NextResponse.json({ error: 'No cart items found' }, { status: 400 });
            }

            let cartItems;
            try {
                cartItems = JSON.parse(cartItemsString);
                console.log('🛒 Parsed cart items:', cartItems);
            } catch (parseError) {
                console.error('❌ Error parsing cart items:', parseError);
                console.log('📝 Raw cart items string:', cartItemsString);
                return NextResponse.json({ error: 'Invalid cart items format' }, { status: 400 });
            }

            // Validate cart items
            if (!Array.isArray(cartItems) || cartItems.length === 0) {
                console.error('❌ Invalid cart items array:', cartItems);
                return NextResponse.json({ error: 'Invalid cart items' }, { status: 400 });
            }

            // Create order
            console.log('💾 Creating order in database...');
            const orderData = {
                name: customerName || `Order for ${customerEmail}` || 'Customer',
                stripeSessionId: session.id,
                email: customerEmail || '',
                phone: customerPhone || '',
                shippingAddress: customerAddress || '',
                total: (session.amount_total || 0) / 100,
                status: 'COMPLETED',
                items: {
                    create: cartItems.map((item: CartItem) => ({
                        productId: parseInt(item.id),
                        name: item.name,
                        price: parseFloat(item.price),
                        quantity: parseInt(item.quantity),
                    }))
                }
            };

            const order = await prisma.order.create({
                data: orderData,
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
    } finally {
        await prisma.$disconnect();
    }
}