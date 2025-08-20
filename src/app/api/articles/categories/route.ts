import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Récupérer les catégories qui ont des articles publiés
    const categories = await prisma.article.groupBy({
      by: ['category'],
      where: {
        isPublished: true
      },
      _count: {
        category: true
      }
    })

    // Formater les résultats
    const availableCategories = categories.map(cat => ({
      value: cat.category,
      label: cat.category,
      count: cat._count.category
    }))

    return NextResponse.json({
      categories: availableCategories
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des catégories' },
      { status: 500 }
    )
  }
}
