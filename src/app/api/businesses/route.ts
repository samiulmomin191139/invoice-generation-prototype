// src/app/api/businesses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const businesses = await prisma.business.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(businesses);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch businesses' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    if (data.isDefault) {
      await prisma.business.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }
    
    const business = await prisma.business.create({ data });
    return NextResponse.json(business);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create business' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;
    
    if (updateData.isDefault) {
      await prisma.business.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }
    
    const business = await prisma.business.update({
      where: { id },
      data: updateData,
    });
    return NextResponse.json(business);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update business' }, { status: 500 });
  }
}