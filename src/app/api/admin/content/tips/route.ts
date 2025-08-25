import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const tips = await prisma.tip.findMany({
      select: {
        id: true,
        title: true,
        content: true,
        category: true,
        source: true,
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

    return NextResponse.json({ tips })
  } catch (error) {
    console.error('Erreur lors de la récupération des conseils:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des conseils' },
      { status: 500 }
    )
  }
}
