import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.initiative.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'initiative:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'initiative' },
      { status: 500 }
    )
  }
}
