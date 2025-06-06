import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, price, imageUrl, categoryId, categoryName } = body;

    // Validate required fields
    if (!name || !price) {
      return NextResponse.json(
        { error: 'Name and price are required' },
        { status: 400 }
      );
    }

   

    let product;

    if (categoryId) {
      // Create product with existing category ID
      product = await prisma.product.create({
        data: {
          name,
          description,
          price: parseFloat(price),
          imageUrl,
          categoryId: parseInt(categoryId),
        },
        include: {
          category: true
        }
      });
    } else if (categoryName) {
      // Create product and connect/create category by name
      product = await prisma.product.create({
        data: {
          name,
          description,
          price: parseFloat(price),
          imageUrl,
          category: {
            connectOrCreate: {
              where: { name: categoryName },
              create: {
                name: categoryName,
                description: `${categoryName} products`
              }
            }
          }
        },
        include: {
          category: true
        }
      });
    } else {
      // Create product without category
      product = await prisma.product.create({
        data: {
          name,
          description,
          price: parseFloat(price),
          imageUrl,
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      product,
    }, { status: 201 });

  } catch (error: unknown) {
    console.error('Error creating product:', error);
    
    // Handle specific Prisma errors
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Product with this name already exists' },
        { status: 409 }
      );
    }
    
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Invalid category ID provided' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}