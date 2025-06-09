import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request) {
    try {
        const body = await request.json();
        const { name, email, phone, subject, message } = body;

        // Validate required fields
        if (!name || !email || !subject || !message) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Create contact entry in database
        const contact = await prisma.contact.create({
            data: {
                name,
                email,
                phone: phone || null,
                subject,
                message,
                createdAt: new Date(),
            },
        });

        return NextResponse.json(
            { message: 'Contact form submitted successfully', id: contact.id },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating contact:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}