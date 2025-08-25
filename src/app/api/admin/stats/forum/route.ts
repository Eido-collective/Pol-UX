import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Compter tous les posts forum
    const forumPostCount = await prisma.forumPost.count()

    return NextResponse.json({ count: forumPostCount })
  } catch (error) {
    console.error('Erreur lors du comptage des posts forum:', error)
    return NextResponse.json(
      { error: 'Erreur lors du comptage des posts forum' },
      { status: 500 }
    )
  }
}
