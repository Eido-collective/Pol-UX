'use client'

import { useArticles } from '@/hooks/useArticles'
import { useTips } from '@/hooks/useTips'
import { useForumPosts } from '@/hooks/useForumPosts'

export default function TestDataPage() {
  const { articles, isLoading: articlesLoading, error: articlesError } = useArticles()
  const { tips, isLoading: tipsLoading, error: tipsError } = useTips()
  const { posts, isLoading: postsLoading, error: postsError } = useForumPosts()

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Test des données</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Articles */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Articles</h2>
          {articlesLoading ? (
            <p>Chargement...</p>
          ) : articlesError ? (
            <p className="text-red-500">Erreur: {articlesError.message}</p>
          ) : (
            <div>
              <p>Nombre d'articles: {articles.length}</p>
              {articles.slice(0, 3).map((article) => (
                <div key={article.id} className="mt-2 p-2 bg-gray-100 rounded">
                  <p className="font-medium">{article.title}</p>
                  <p className="text-sm text-gray-600">{article.author.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Conseils</h2>
          {tipsLoading ? (
            <p>Chargement...</p>
          ) : tipsError ? (
            <p className="text-red-500">Erreur: {tipsError.message}</p>
          ) : (
            <div>
              <p>Nombre de conseils: {tips.length}</p>
              {tips.slice(0, 3).map((tip) => (
                <div key={tip.id} className="mt-2 p-2 bg-gray-100 rounded">
                  <p className="font-medium">{tip.title}</p>
                  <p className="text-sm text-gray-600">{tip.author.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Forum Posts */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Posts Forum</h2>
          {postsLoading ? (
            <p>Chargement...</p>
          ) : postsError ? (
            <p className="text-red-500">Erreur: {postsError.message}</p>
          ) : (
            <div>
              <p>Nombre de posts: {posts.length}</p>
              {posts.slice(0, 3).map((post) => (
                <div key={post.id} className="mt-2 p-2 bg-gray-100 rounded">
                  <p className="font-medium">{post.title}</p>
                  <p className="text-sm text-gray-600">{post.author.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
