import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Récupérer les vraies statistiques de la base de données
    const [
      initiativesCount,
      articlesCount,
      tipsCount,
      forumPostsCount,
      usersCount
    ] = await Promise.all([
      prisma.initiative.count({
        where: { isPublished: true }
      }),
      prisma.article.count({
        where: { isPublished: true }
      }),
      prisma.tip.count({
        where: { isPublished: true }
      }),
      prisma.forumPost.count({
        where: { isPublished: true }
      }),
      prisma.user.count()
    ])

    return NextResponse.json({
      initiatives: initiativesCount,
      articles: articlesCount,
      tips: tipsCount,
      forumPosts: forumPostsCount,
      users: usersCount
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    )
  }
}
