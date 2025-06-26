import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-05-28.basil',
});

export async function POST(request: NextRequest) {
    let tempOrder: { id: number } | null = null;
    
    try {
        const { amount, currency, name, description, customerInfo, cartItems } = await request.json();

        // Create a temporary order record to store cart items
        tempOrder = await prisma.order.create({
            data: {
                total: amount / 100, // Convert from cents to dollars
                email: customerInfo.email,
                name: customerInfo.name,
                phone: customerInfo.phone,
                shippingAddress: customerInfo.address,
                status: 'PENDING',
                items: {
                    create: cartItems.map((item: { id: number; name: string; price: number; quantity: number }) => ({
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                        productId: item.id
                    }))
                }
            }
        });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: currency || 'usd',
                        product_data: {
                            name,
                            description,
                        },
                        unit_amount: amount,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `https://ecom-eta-mauve.vercel.app/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `https://ecom-eta-mauve.vercel.app/checkout`,
            metadata: {
                customerName: customerInfo.name,
                customerEmail: customerInfo.email,
                customerPhone: customerInfo.phone,
                customerAddress: customerInfo.address,
                orderId: tempOrder.id.toString() // Reference to order instead of full cart data
            },
        });

        // Update the order with the Stripe session ID
        await prisma.order.update({
            where: { id: tempOrder.id },
            data: { stripeSessionId: session.id }
        });

        return NextResponse.json({ id: session.id });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        
        // Clean up the temporary order if it was created but session failed
        if (tempOrder?.id) {
            try {
                await prisma.order.delete({
                    where: { id: tempOrder.id }
                });
            } catch (cleanupError) {
                console.error('Error cleaning up temporary order:', cleanupError);
            }
        }
        
        return NextResponse.json(
            { error: 'Error creating checkout session' },
            { status: 500 }
        );
    }
}