import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const productIdString = searchParams.get('id');

        if (!productIdString) {
            return NextResponse.json(
                { error: 'Product ID is required' },
                { status: 400 }
            );
        }

        const productId = parseInt(productIdString, 10);
        if (isNaN(productId)) {
            return NextResponse.json(
                { error: 'Invalid Product ID' },
                { status: 400 }
            );
        }

        // Check if product exists before deletion
        const product = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        // Delete from Prisma database
        await prisma.product.delete({
            where: { id: productId }
        });

        return NextResponse.json({
            success: true,
            message: 'Product deleted successfully'
        });

    } catch (error: unknown) {
        console.error('Delete product error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'An error occurred' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
