'use client'

import { useState, useEffect } from 'react'
import { Users, FileText, MessageSquare, Lightbulb, CheckCircle, XCircle, Eye, Shield, UserPlus } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  username: string
  role: string
  createdAt: string
}

interface Initiative {
  id: string
  title: string
  type: string
  city: string
  isApproved: boolean
  createdAt: string
  author: {
    name: string
  }
}

interface ForumPost {
  id: string
  title: string
  category: string
  isApproved: boolean
  createdAt: string
  author: {
    name: string
  }
}

interface Tip {
  id: string
  title: string
  category: string
  isApproved: boolean
  createdAt: string
  author: {
    name: string
  }
}

interface RoleRequest {
  id: string
  status: string
  reason: string
  createdAt: string
  adminNotes?: string
  user: {
    name: string
    username: string
    role: string
  }
  requestedRole: string
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('users')
  const [roleRequests, setRoleRequests] = useState<RoleRequest[]>([])
  const [loadingRequests, setLoadingRequests] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [initiatives, setInitiatives] = useState<Initiative[]>([])
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [tips, setTips] = useState<Tip[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (activeTab === 'role-requests') {
      fetchRoleRequests()
    }
  }, [activeTab])

  const fetchData = async () => {
    try {
      // Récupérer les utilisateurs
      const usersResponse = await fetch('/api/admin/users')
      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setUsers(usersData.users)
      }

      // Récupérer les initiatives en attente
      const initiativesResponse = await fetch('/api/admin/initiatives')
      if (initiativesResponse.ok) {
        const initiativesData = await initiativesResponse.json()
        setInitiatives(initiativesData.initiatives)
      }

      // Récupérer les posts en attente
      const postsResponse = await fetch('/api/admin/posts')
      if (postsResponse.ok) {
        const postsData = await postsResponse.json()
        setPosts(postsData.posts)
      }

      // Récupérer les conseils en attente
      const tipsResponse = await fetch('/api/admin/tips')
      if (tipsResponse.ok) {
        const tipsData = await tipsResponse.json()
        setTips(tipsData.tips)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (type: string, id: string) => {
    try {
      const response = await fetch(`/api/admin/${type}/${id}/approve`, {
        method: 'PUT'
      })
      if (response.ok) {
        fetchData() // Recharger les données
      }
    } catch (error) {
      console.error('Erreur lors de l\'approbation:', error)
    }
  }

  const handleReject = async (type: string, id: string) => {
    try {
      const response = await fetch(`/api/admin/${type}/${id}/reject`, {
        method: 'DELETE'
      })
      if (response.ok) {
        fetchData() // Recharger les données
      }
    } catch (error) {
      console.error('Erreur lors du rejet:', error)
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      })
      if (response.ok) {
        fetchData() // Recharger les données
      }
    } catch (error) {
      console.error('Erreur lors du changement de rôle:', error)
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'EXPLORER': return 'Explorateur'
      case 'CONTRIBUTOR': return 'Contributeur'
      case 'ADMIN': return 'Administrateur'
      default: return role
    }
  }

  const fetchRoleRequests = async () => {
    setLoadingRequests(true)
    try {
      const response = await fetch('/api/role-requests')
      if (response.ok) {
        const data = await response.json()
        setRoleRequests(data.roleRequests)
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des demandes de promotion:', error)
    } finally {
      setLoadingRequests(false)
    }
  }

  const handleProcessRoleRequest = async (requestId: string, action: 'approve' | 'reject', adminNotes?: string) => {
    try {
      const response = await fetch(`/api/role-requests/${requestId}/process`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action, adminNotes })
      })
      if (response.ok) {
        fetchRoleRequests()
        fetchData() // Recharger les utilisateurs aussi
      }
    } catch (error) {
      console.error('Erreur lors du traitement de la demande:', error)
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'EVENT': return 'Événement'
      case 'PROJECT': return 'Projet'
      case 'ASSOCIATION': return 'Association'
      case 'COMPANY': return 'Entreprise'
      default: return type
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50">
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Administration</h1>
              <p className="text-gray-600">Gestion des utilisateurs et des contenus</p>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-green-600" />
              <span className="text-sm text-gray-500">Administrateur</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Onglets */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Utilisateurs ({users.length})
                </div>
              </button>
              <button
                onClick={() => setActiveTab('initiatives')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'initiatives'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Initiatives ({initiatives.filter(i => !i.isApproved).length})
                </div>
              </button>
              <button
                onClick={() => setActiveTab('posts')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'posts'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Posts ({posts.filter(p => !p.isApproved).length})
                </div>
              </button>
              <button
                onClick={() => setActiveTab('tips')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'tips'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Conseils ({tips.filter(t => !t.isApproved).length})
                </div>
              </button>
              <button
                onClick={() => setActiveTab('role-requests')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'role-requests'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Demandes de Promotion ({roleRequests.filter((r: RoleRequest) => r.status === 'PENDING').length})
                </div>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Contenu des onglets */}
            {activeTab === 'users' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Gestion des utilisateurs</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Utilisateur
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rôle
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date d&apos;inscription
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              value={user.role}
                              onChange={(e) => handleRoleChange(user.id, e.target.value)}
                              className="text-sm border border-gray-300 rounded px-2 py-1"
                            >
                              <option value="EXPLORER">Explorateur</option>
                              <option value="CONTRIBUTOR">Contributeur</option>
                              <option value="ADMIN">Administrateur</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(user.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-green-600 hover:text-green-900 mr-3">
                              <Eye className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'initiatives' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Initiatives en attente d&apos;approbation</h3>
                <div className="space-y-4">
                  {initiatives.filter(i => !i.isApproved).map((initiative) => (
                    <div key={initiative.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{initiative.title}</h4>
                          <p className="text-sm text-gray-500">
                            {getTypeLabel(initiative.type)} • {initiative.city} • Par {initiative.author.name}
                          </p>
                          <p className="text-xs text-gray-400">{formatDate(initiative.createdAt)}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove('initiatives', initiative.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                          >
                            <CheckCircle className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleReject('initiatives', initiative.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <XCircle className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {initiatives.filter(i => !i.isApproved).length === 0 && (
                    <p className="text-gray-500 text-center py-8">Aucune initiative en attente d&apos;approbation</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'posts' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Posts en attente d&apos;approbation</h3>
                <div className="space-y-4">
                  {posts.filter(p => !p.isApproved).map((post) => (
                    <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{post.title}</h4>
                          <p className="text-sm text-gray-500">
                            {post.category} • Par {post.author.name}
                          </p>
                          <p className="text-xs text-gray-400">{formatDate(post.createdAt)}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove('posts', post.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                          >
                            <CheckCircle className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleReject('posts', post.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <XCircle className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {posts.filter(p => !p.isApproved).length === 0 && (
                    <p className="text-gray-500 text-center py-8">Aucun post en attente d&apos;approbation</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'tips' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Conseils en attente d&apos;approbation</h3>
                <div className="space-y-4">
                  {tips.filter(t => !t.isApproved).map((tip) => (
                    <div key={tip.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{tip.title}</h4>
                          <p className="text-sm text-gray-500">
                            {tip.category} • Par {tip.author.name}
                          </p>
                          <p className="text-xs text-gray-400">{formatDate(tip.createdAt)}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove('tips', tip.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                          >
                            <CheckCircle className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleReject('tips', tip.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <XCircle className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {tips.filter(t => !t.isApproved).length === 0 && (
                    <p className="text-gray-500 text-center py-8">Aucun conseil en attente d&apos;approbation</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'role-requests' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Demandes de promotion</h3>
                {loadingRequests ? (
                  <div className="text-center py-8">
                    <div className="text-gray-500">Chargement...</div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {roleRequests.map((request: RoleRequest) => (
                      <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="text-sm font-medium text-gray-900">
                                {request.user.name} ({request.user.username})
                              </h4>
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {getRoleLabel(request.user.role)} → {getRoleLabel(request.requestedRole)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              <strong>Raison :</strong> {request.reason}
                            </p>
                            <p className="text-xs text-gray-400">
                              Demande créée le {formatDate(request.createdAt)}
                            </p>
                            {request.status === 'PENDING' && (
                              <div className="mt-3">
                                <textarea
                                  placeholder="Note optionnelle pour l'utilisateur..."
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                                  rows={2}
                                  id={`notes-${request.id}`}
                                />
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2 ml-4">
                            {request.status === 'PENDING' ? (
                              <>
                                <button
                                  onClick={() => {
                                    const notes = (document.getElementById(`notes-${request.id}`) as HTMLTextAreaElement)?.value
                                    handleProcessRoleRequest(request.id, 'approve', notes)
                                  }}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                  title="Approuver"
                                >
                                  <CheckCircle className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => {
                                    const notes = (document.getElementById(`notes-${request.id}`) as HTMLTextAreaElement)?.value
                                    handleProcessRoleRequest(request.id, 'reject', notes)
                                  }}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                  title="Rejeter"
                                >
                                  <XCircle className="h-5 w-5" />
                                </button>
                              </>
                            ) : (
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                request.status === 'APPROVED' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {request.status === 'APPROVED' ? 'Approuvée' : 'Rejetée'}
                              </span>
                            )}
                          </div>
                        </div>
                        {request.adminNotes && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                            <strong>Note de l&apos;admin :</strong> {request.adminNotes}
                          </div>
                        )}
                      </div>
                    ))}
                    {roleRequests.length === 0 && (
                      <p className="text-gray-500 text-center py-8">Aucune demande de promotion</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
