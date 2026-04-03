// src/app/api/invoices/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: {
        business: true,
        client: true,
        items: {
          orderBy: { sortOrder: 'asc' },
        },
        customFields: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('GET invoice error:', error);
    return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const { items, customFields, business, client, id: _id, createdAt, updatedAt, ...invoiceData } = data;

    // Remove fields that shouldn't be in the update
    delete invoiceData.id;

    // Delete existing items and custom fields
    await prisma.invoiceItem.deleteMany({ where: { invoiceId: params.id } });
    await prisma.customField.deleteMany({ where: { invoiceId: params.id } });

    const invoice = await prisma.invoice.update({
      where: { id: params.id },
      data: {
        invoiceNo: invoiceData.invoiceNo,
        invoiceDate: invoiceData.invoiceDate,
        dueDate: invoiceData.dueDate || null,
        status: invoiceData.status,
        currency: invoiceData.currency,
        currencySymbol: invoiceData.currencySymbol,
        subtotal: invoiceData.subtotal,
        taxRate: invoiceData.taxRate,
        taxAmount: invoiceData.taxAmount,
        discount: invoiceData.discount,
        discountType: invoiceData.discountType,
        additionalCharges: invoiceData.additionalCharges,
        total: invoiceData.total,
        amountPaid: invoiceData.amountPaid,
        showTotalInWords: invoiceData.showTotalInWords,
        notes: invoiceData.notes,
        terms: invoiceData.terms,
        businessId: invoiceData.businessId,
        clientId: invoiceData.clientId,
        items: {
          create: items.map((item: any, index: number) => ({
            name: item.name,
            description: item.description || null,
            quantity: parseFloat(item.quantity) || 1,
            rate: parseFloat(item.rate) || 0,
            amount: parseFloat(item.amount) || (parseFloat(item.quantity) || 1) * (parseFloat(item.rate) || 0),
            unit: item.unit || null,
            sortOrder: index,
          })),
        },
        customFields: customFields?.length
          ? {
              create: customFields
                .filter((cf: any) => cf.label && cf.value)
                .map((cf: any) => ({
                  label: cf.label,
                  value: cf.value,
                })),
            }
          : undefined,
      },
      include: {
        business: true,
        client: true,
        items: { orderBy: { sortOrder: 'asc' } },
        customFields: true,
      },
    });

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('UPDATE invoice error:', error);
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Delete items and custom fields first (cascade should handle it, but just in case)
    await prisma.invoiceItem.deleteMany({ where: { invoiceId: params.id } });
    await prisma.customField.deleteMany({ where: { invoiceId: params.id } });
    await prisma.invoice.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE invoice error:', error);
    return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 });
  }
}