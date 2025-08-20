import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const initiatives = await prisma.initiative.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        city: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 3
    })

    return NextResponse.json({ initiatives })
  } catch (error) {
    console.error('Erreur lors de la récupération des initiatives récentes:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des initiatives récentes' },
      { status: 500 }
    )
  }
}
