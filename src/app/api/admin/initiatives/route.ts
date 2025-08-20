import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'pending', 'approved', 'all'

    const where: Prisma.InitiativeWhereInput = {}
    
    if (status === 'pending') {
      where.isApproved = false
    } else if (status === 'approved') {
      where.isApproved = true
    }

    const initiatives = await prisma.initiative.findMany({
      where,
      include: {
        author: {
          select: {
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
      { error: 'Une erreur est survenue lors de la récupération des initiatives' },
      { status: 500 }
    )
  }
}
