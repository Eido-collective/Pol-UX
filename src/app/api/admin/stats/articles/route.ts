import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Compter tous les articles
    const articleCount = await prisma.article.count()

    return NextResponse.json({ count: articleCount })
  } catch (error) {
    console.error('Erreur lors du comptage des articles:', error)
    return NextResponse.json(
      { error: 'Erreur lors du comptage des articles' },
      { status: 500 }
    )
  }
}
