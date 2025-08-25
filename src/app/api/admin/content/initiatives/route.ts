import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const initiatives = await prisma.initiative.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        city: true,
        isPublished: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ initiatives })
  } catch (error) {
    console.error('Erreur lors de la récupération des initiatives:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des initiatives' },
      { status: 500 }
    )
  }
}
