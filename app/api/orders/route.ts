import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('sessionId');

        if (!sessionId) {
            return NextResponse.json(
                { error: 'Session ID is required' },
                { status: 400 }
            );
        }

        console.log('Looking for order with sessionId:', sessionId);

        const order = await prisma.order.findUnique({
            where: {
                stripeSessionId: sessionId
            },
            include: {
                items: {
                    include: {
                        product: true // Include product details
                    }
                }
            }
        });

        if (!order) {
            console.log('Order not found for sessionId:', sessionId);
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        console.log('Order found:', order);
        return NextResponse.json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        return NextResponse.json(
            { error: 'Failed to fetch order' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}

// Add this function to get all orders (for debugging)
export async function POST() {
    try {
        const orders = await prisma.order.findMany({
            include: {
                items: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(orders);
    } catch (error) {
        console.error('Error fetching all orders:', error);
        return NextResponse.json(
            { error: 'Failed to fetch orders' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}