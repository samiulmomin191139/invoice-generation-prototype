// src/app/api/invoices/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        business: true,
        client: true,
        items: {
          orderBy: { sortOrder: 'asc' },
        },
        customFields: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(invoices);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { items, customFields, ...invoiceData } = data;

    const invoice = await prisma.invoice.create({
      data: {
        ...invoiceData,
        items: {
          create: items.map((item: any, index: number) => ({
            name: item.name,
            description: item.description || null,
            quantity: parseFloat(item.quantity) || 1,
            rate: parseFloat(item.rate) || 0,
            amount: parseFloat(item.amount) || 0,
            unit: item.unit || null,
            sortOrder: index,
          })),
        },
        customFields: customFields?.length
          ? {
              create: customFields.map((cf: any) => ({
                label: cf.label,
                value: cf.value,
              })),
            }
          : undefined,
      },
      include: {
        business: true,
        client: true,
        items: true,
        customFields: true,
      },
    });

    // Update next invoice number
    const settings = await prisma.settings.findFirst();
    if (settings) {
      const currentNum = parseInt(invoiceData.invoiceNo.replace(/\D/g, ''));
      if (currentNum >= settings.nextInvoiceNumber) {
        await prisma.settings.update({
          where: { id: settings.id },
          data: { nextInvoiceNumber: currentNum + 1 },
        });
      }
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Create invoice error:', error);
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
  }
}