import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { isPublished } = await request.json()
    const { id } = await params

    const tip = await prisma.tip.update({
      where: { id },
      data: { isPublished }
    })

    return NextResponse.json({ tip })
  } catch (error) {
    console.error('Erreur lors de la modification de la publication:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la modification de la publication' },
      { status: 500 }
    )
  }
}
