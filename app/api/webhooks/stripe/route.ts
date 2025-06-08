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

// Add GET method for testing
export async function GET() {
    return NextResponse.json({ 
        message: 'Stripe webhook endpoint is working!',
        timestamp: new Date().toISOString()
    });
}

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
        console.error('❌ Webhook signature verification failed:', err);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    try {
        console.log('🔍 Processing event type:', event.type);
        
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;
            
            // Check if order already exists
            console.log('🔍 Checking if order already exists...');
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

            console.log('👤 Extracted customer info:');
            console.log('- Name:', customerName);
            console.log('- Email:', customerEmail);
            console.log('- Phone:', customerPhone);
            console.log('- Address:', customerAddress);
            console.log('- Cart items string length:', cartItemsString?.length);

            if (!cartItemsString) {
                console.error('❌ No cart items found in session metadata');
                return NextResponse.json({ error: 'No cart items found' }, { status: 400 });
            }

            let cartItems;
            try {
                cartItems = JSON.parse(cartItemsString);
                
            } catch (parseError) {
                console.error('❌ Error parsing cart items:', parseError);
                return NextResponse.json({ error: 'Invalid cart items format' }, { status: 400 });
            }

            // Validate cart items
            if (!Array.isArray(cartItems) || cartItems.length === 0) {
                console.error('❌ Cart items is not a valid array or is empty');
                return NextResponse.json({ error: 'Invalid cart items' }, { status: 400 });
            }

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

            console.log('📝 Order data to create:', JSON.stringify(orderData, null, 2));

            const order = await prisma.order.create({
                data: orderData,
                include: {
                    items: true
                }
            });

            console.log('✅ Order created successfully!');
            console.log('🆔 Order ID:', order.id);
            console.log('💰 Order total:', order.total);
            console.log('📦 Order items count:', order.items.length);
            console.log('📋 Full order:', JSON.stringify(order, null, 2));

            return NextResponse.json({ 
                received: true, 
                orderId: order.id,
                message: 'Order created successfully'
            });
        } else {
            console.log('ℹ️ Event type not processed:', event.type);
        }

        return NextResponse.json({ received: true, message: 'Event processed' });
    } catch (error) {
        console.error('❌ Error processing webhook:', error);
        console.error('📍 Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        return NextResponse.json(
            { error: 'Error processing webhook', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}