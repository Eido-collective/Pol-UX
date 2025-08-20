import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'
import { authOptions } from '@/lib/auth'

// GET - Récupérer la checklist de l'utilisateur
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

    // Vérifier les accomplissements
    const userStats = await prisma.$transaction([
      prisma.initiative.count({ where: { authorId: userId } }),
      prisma.forumPost.count({ where: { authorId: userId } }),
      prisma.tip.count({ where: { authorId: userId } }),
      prisma.forumComment.count({ where: { authorId: userId } }),
      prisma.vote.count({ 
        where: { 
          postId: { not: null },
          post: { authorId: userId }
        }
      }),
      prisma.vote.count({ 
        where: { 
          commentId: { not: null },
          comment: { authorId: userId }
        }
      })
    ])

    const [initiativesCount, postsCount, tipsCount, commentsCount, postVotes, commentVotes] = userStats
    const totalVotes = postVotes + commentVotes

    // Définir les tâches avec leurs conditions de complétion
    const checklist = [
      {
        id: 'explore-map',
        title: 'Explorer la carte des initiatives',
        description: 'Découvrez les initiatives écologiques près de chez vous',
        completed: true, // Toujours complété car accessible
        link: '/map',
        icon: 'map-pin'
      },
      {
        id: 'participate-forum',
        title: 'Participer au forum',
        description: 'Créez votre premier post ou commentaire',
        completed: postsCount > 0 || commentsCount > 0,
        link: '/forum',
        icon: 'message-square'
      },
      {
        id: 'discover-tips',
        title: 'Découvrir les conseils écologiques',
        description: 'Consultez les conseils pour un mode de vie plus vert',
        completed: true, // Toujours complété car accessible
        link: '/tips',
        icon: 'lightbulb'
      },
      {
        id: 'create-initiative',
        title: 'Créer votre première initiative',
        description: 'Partagez une initiative écologique',
        completed: initiativesCount > 0,
        link: '/map',
        icon: 'plus-circle',
        requiresRole: 'CONTRIBUTOR'
      },
      {
        id: 'share-tip',
        title: 'Partager un conseil',
        description: 'Contribuez avec vos propres conseils écologiques',
        completed: tipsCount > 0,
        link: '/tips',
        icon: 'share',
        requiresRole: 'CONTRIBUTOR'
      },
      {
        id: 'receive-votes',
        title: 'Recevoir vos premiers votes',
        description: 'Obtenez des votes positifs sur vos contributions',
        completed: totalVotes > 0,
        link: '/forum',
        icon: 'thumbs-up'
      },
      {
        id: 'request-promotion',
        title: 'Demander une promotion de rôle',
        description: 'Accédez à plus de fonctionnalités',
        completed: session.user.role !== 'EXPLORER',
        link: '/promotion',
        icon: 'user-plus',
        requiresRole: 'EXPLORER'
      },
      {
        id: 'complete-profile',
        title: 'Compléter votre profil',
        description: 'Ajoutez une photo et complétez vos informations',
        completed: !!(session.user.name && session.user.username),
        link: '/dashboard',
        icon: 'user'
      }
    ]

    return NextResponse.json({ checklist })

  } catch (error) {
    console.error('Erreur lors de la récupération de la checklist:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération de la checklist' },
      { status: 500 }
    )
  }
}
