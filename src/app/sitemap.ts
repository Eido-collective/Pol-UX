import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://pol-ux-sigma.vercel.app'

  // Pages statiques
  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/forum`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tips`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/map`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/articles`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/dashboard`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/promotion`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ]

  try {
    // Récupérer les contenus dynamiques
    const [articles, forumPosts] = await Promise.all([
      prisma.article.findMany({
        where: { isPublished: true },
        select: { id: true, updatedAt: true },
        take: 100, // Limiter pour éviter un sitemap trop lourd
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.forumPost.findMany({
        where: { isPublished: true },
        select: { id: true, updatedAt: true },
        take: 100,
        orderBy: { updatedAt: 'desc' },
      }),
    ])

    const dynamicUrls: MetadataRoute.Sitemap = []

    // Ajouter les articles
    articles.forEach((article) => {
      dynamicUrls.push({
        url: `${baseUrl}/articles/${article.id}`,
        lastModified: article.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    })

    // Ajouter les posts de forum
    forumPosts.forEach((post) => {
      dynamicUrls.push({
        url: `${baseUrl}/forum/${post.id}`,
        lastModified: post.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.6,
      })
    })

    return [...staticUrls, ...dynamicUrls]

  } catch (error) {
    console.error('Erreur lors de la génération du sitemap:', error)
    // En cas d'erreur, retourner au moins les pages statiques
    return staticUrls
  }
}
