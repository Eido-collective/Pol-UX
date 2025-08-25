import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Marquer la demande comme rejetée
    await prisma.roleRequest.update({
      where: { id },
      data: { status: 'REJECTED' }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur lors du rejet de la demande:', error)
    return NextResponse.json(
      { error: 'Erreur lors du rejet de la demande' },
      { status: 500 }
    )
  }
}
