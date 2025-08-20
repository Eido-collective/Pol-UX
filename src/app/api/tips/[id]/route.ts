import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tip = await prisma.tip.findUnique({
      where: {
        id: params.id,
        isPublished: true
      },
      include: {
        author: {
          select: {
            name: true,
            username: true
          }
        },
        votes: true,
        _count: {
          select: {
            votes: true
          }
        }
      }
    })

    if (!tip) {
      return NextResponse.json(
        { error: 'Conseil non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json({ tip })

  } catch (error) {
    console.error('Erreur lors de la récupération du conseil:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération du conseil' },
      { status: 500 }
    )
  }
}
