import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const posts = await prisma.forumPost.findMany({
      select: {
        id: true,
        title: true,
        content: true,
        category: true,
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

    return NextResponse.json({ posts })
  } catch (error) {
    console.error('Erreur lors de la récupération des posts forum:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des posts forum' },
      { status: 500 }
    )
  }
}
