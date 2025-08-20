import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Vous devez être connecté' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Compter les initiatives
    const initiativesCount = await prisma.initiative.count({
      where: { authorId: userId }
    })

    // Compter les posts forum
    const postsCount = await prisma.forumPost.count({
      where: { authorId: userId }
    })

    // Compter les conseils
    const tipsCount = await prisma.tip.count({
      where: { authorId: userId }
    })

    // Compter les votes reçus (sur les posts et commentaires)
    const postsVotes = await prisma.vote.count({
      where: {
        postId: { not: null },
        post: { authorId: userId }
      }
    })

    const commentsVotes = await prisma.vote.count({
      where: {
        commentId: { not: null },
        comment: { authorId: userId }
      }
    })

    const totalVotesReceived = postsVotes + commentsVotes

    // Compter les commentaires
    const commentsCount = await prisma.forumComment.count({
      where: { authorId: userId }
    })

    // Activité récente (derniers 7 jours)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentActivity = await prisma.$transaction([
      // Initiatives récentes
      prisma.initiative.findMany({
        where: {
          authorId: userId,
          createdAt: { gte: sevenDaysAgo }
        },
        select: {
          id: true,
          title: true,
          createdAt: true,
          type: true
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      // Posts récents
      prisma.forumPost.findMany({
        where: {
          authorId: userId,
          createdAt: { gte: sevenDaysAgo }
        },
        select: {
          id: true,
          title: true,
          createdAt: true,
          category: true
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      // Conseils récents
      prisma.tip.findMany({
        where: {
          authorId: userId,
          createdAt: { gte: sevenDaysAgo }
        },
        select: {
          id: true,
          title: true,
          createdAt: true,
          category: true
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      // Commentaires récents
      prisma.forumComment.findMany({
        where: {
          authorId: userId,
          createdAt: { gte: sevenDaysAgo }
        },
        select: {
          id: true,
          content: true,
          createdAt: true,
          post: {
            select: {
              id: true,
              title: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ])

    const [recentInitiatives, recentPosts, recentTips, recentComments] = recentActivity

    // Combiner et trier l'activité récente
    const allRecentActivity = [
      ...recentInitiatives.map(item => ({ ...item, type: 'initiative' })),
      ...recentPosts.map(item => ({ ...item, type: 'post' })),
      ...recentTips.map(item => ({ ...item, type: 'tip' })),
      ...recentComments.map(item => ({ ...item, type: 'comment' }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({
      stats: {
        initiatives: initiativesCount,
        posts: postsCount,
        tips: tipsCount,
        votesReceived: totalVotesReceived,
        comments: commentsCount
      },
      recentActivity: allRecentActivity.slice(0, 10) // Top 10 activités récentes
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des statistiques' },
      { status: 500 }
    )
  }
}
