import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const requests = await prisma.roleRequest.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ requests })
  } catch (error) {
    console.error('Erreur lors de la récupération des demandes de rôle:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des demandes de rôle' },
      { status: 500 }
    )
  }
}
