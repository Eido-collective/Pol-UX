'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Leaf, MapPin, MessageSquare, Lightbulb, User, Calendar, TrendingUp, CheckCircle, PlusCircle, Share, ThumbsUp, UserPlus, Plus, X, Edit3, Trash2, AlertTriangle } from 'lucide-react'

interface DashboardStats {
  initiatives: number
  posts: number
  tips: number
  votesReceived: number
  comments: number
}

interface RecentActivity {
  id: string
  title: string
  createdAt: string
  type: 'initiative' | 'post' | 'tip' | 'comment'
  category?: string
  content?: string
  post?: {
    id: string
    title: string
  }
}

interface UserTask {
  id: string
  title: string
  description: string | null
  completed: boolean
  createdAt: string
  updatedAt: string
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    initiatives: 0,
    posts: 0,
    tips: 0,
    votesReceived: 0,
    comments: 0
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [userTasks, setUserTasks] = useState<UserTask[]>([])
  const [loading, setLoading] = useState(true)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState<UserTask | null>(null)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDescription, setNewTaskDescription] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<UserTask | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchDashboardData()
    }
  }, [status, router])

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, tasksResponse] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/user-tasks')
      ])

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData.stats)
        setRecentActivity(statsData.recentActivity)
      }

      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json()
        setUserTasks(tasksData.tasks)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'Administrateur'
      case 'CONTRIBUTOR': return 'Contributeur'
      case 'EXPLORER': return 'Explorateur'
      default: return role
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800'
      case 'CONTRIBUTOR': return 'bg-blue-100 text-blue-800'
      case 'EXPLORER': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'initiative': return <MapPin className="h-4 w-4 text-green-600" />
      case 'post': return <MessageSquare className="h-4 w-4 text-blue-600" />
      case 'tip': return <Lightbulb className="h-4 w-4 text-yellow-600" />
      case 'comment': return <MessageSquare className="h-4 w-4 text-purple-600" />
      default: return <Calendar className="h-4 w-4 text-gray-600" />
    }
  }

  const getActivityText = (activity: RecentActivity) => {
    switch (activity.type) {
      case 'initiative':
        return `Créé l'initiative "${activity.title}"`
      case 'post':
        return `Créé le post "${activity.title}"`
      case 'tip':
        return `Partagé le conseil "${activity.title}"`
      case 'comment':
        return `Commenté sur "${activity.post?.title || 'un post'}"`
      default:
        return activity.title
    }
  }



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Fonctions pour gérer les tâches
  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) return

    try {
      const response = await fetch('/api/user-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTaskTitle,
          description: newTaskDescription
        })
      })

      if (response.ok) {
        const data = await response.json()
        setUserTasks([...userTasks, data.task])
        setNewTaskTitle('')
        setNewTaskDescription('')
        setShowTaskForm(false)
      } else {
        const errorData = await response.json()
        alert(errorData.error)
      }
    } catch (error) {
      console.error('Erreur lors de la création de la tâche:', error)
      alert('Erreur lors de la création de la tâche')
    }
  }

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    try {
      const response = await fetch(`/api/user-tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed })
      })

      if (response.ok) {
        const data = await response.json()
        setUserTasks(userTasks.map(task => 
          task.id === taskId ? data.task : task
        ))
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la tâche:', error)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/user-tasks/${taskId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setUserTasks(userTasks.filter(task => task.id !== taskId))
        setShowDeleteModal(false)
        setTaskToDelete(null)
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de la tâche:', error)
    }
  }

  const confirmDelete = () => {
    if (taskToDelete) {
      handleDeleteTask(taskToDelete.id)
    }
  }

  const cancelDelete = () => {
    setShowDeleteModal(false)
    setTaskToDelete(null)
  }

  const openDeleteModal = (task: UserTask) => {
    setTaskToDelete(task)
    setShowDeleteModal(true)
  }

  const handleEditTask = async () => {
    if (!editingTask || !newTaskTitle.trim()) return

    try {
      const response = await fetch(`/api/user-tasks/${editingTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTaskTitle,
          description: newTaskDescription
        })
      })

      if (response.ok) {
        const data = await response.json()
        setUserTasks(userTasks.map(task => 
          task.id === editingTask.id ? data.task : task
        ))
        setEditingTask(null)
        setNewTaskTitle('')
        setNewTaskDescription('')
      }
    } catch (error) {
      console.error('Erreur lors de la modification de la tâche:', error)
    }
  }

  const startEditTask = (task: UserTask) => {
    setEditingTask(task)
    setNewTaskTitle(task.title)
    setNewTaskDescription(task.description || '')
  }

  const cancelEdit = () => {
    setEditingTask(null)
    setNewTaskTitle('')
    setNewTaskDescription('')
    setShowTaskForm(false)
  }

  const openCreateModal = () => {
    setShowTaskForm(true)
    setEditingTask(null)
    setNewTaskTitle('')
    setNewTaskDescription('')
  }

  return (
    <div className="bg-gray-50">
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
              <p className="text-gray-600">Bienvenue sur votre espace personnel</p>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-6 w-6 text-green-600" />
              <span className="text-sm text-gray-500">
                {session?.user?.name || session?.user?.username || 'Utilisateur'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Informations utilisateur */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Profil utilisateur
              </h2>
              <div className="space-y-2">
                <p className="text-gray-600">
                  <span className="font-medium">Nom :</span> {session?.user?.name || 'Non renseigné'}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Email :</span> {session?.user?.email || 'Non renseigné'}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Nom d'utilisateur :</span> {session?.user?.username || 'Non renseigné'}
                </p>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-600">Rôle :</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(session?.user?.role || 'EXPLORER')}`}>
                    {getRoleLabel(session?.user?.role || 'EXPLORER')}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600 mb-1">
                <Leaf className="h-8 w-8" />
              </div>
              <p className="text-sm text-gray-500">Pol-UX</p>
            </div>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <MapPin className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Initiatives</p>
                <p className="text-2xl font-bold text-gray-900">{stats.initiatives}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Posts Forum</p>
                <p className="text-2xl font-bold text-gray-900">{stats.posts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Lightbulb className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Conseils</p>
                <p className="text-2xl font-bold text-gray-900">{stats.tips}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Votes reçus</p>
                <p className="text-2xl font-bold text-gray-900">{stats.votesReceived}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Commentaires</p>
                <p className="text-2xl font-bold text-gray-900">{stats.comments}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
            <div className="space-y-3">
              <button 
                onClick={() => router.push('/map')}
                disabled={session?.user?.role === 'EXPLORER'}
                className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
              >
                <MapPin className="h-4 w-4" />
                <span className="truncate">
                  {session?.user?.role === 'EXPLORER' ? 'Créer une initiative (Contributeur requis)' : 'Créer une initiative'}
                </span>
              </button>
              <button 
                onClick={() => router.push('/forum')}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <MessageSquare className="h-4 w-4" />
                <span className="truncate">Nouveau post forum</span>
              </button>
              <button 
                onClick={() => router.push('/tips')}
                disabled={session?.user?.role === 'EXPLORER'}
                className="w-full flex items-center justify-center gap-2 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm"
              >
                <Lightbulb className="h-4 w-4" />
                <span className="truncate">
                  {session?.user?.role === 'EXPLORER' ? 'Partager un conseil (Contributeur requis)' : 'Partager un conseil'}
                </span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité récente</h3>
            <div className="space-y-3">
              {recentActivity.length === 0 ? (
                <div className="text-sm text-gray-500">
                  Aucune activité récente
                </div>
              ) : (
                recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50">
                    <div className="mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate">
                        {getActivityText(activity)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(activity.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Mes tâches personnelles</h3>
              <button
                onClick={openCreateModal}
                disabled={userTasks.length >= 5}
                className="flex items-center gap-1 text-sm bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="h-4 w-4" />
                Ajouter ({userTasks.length}/5)
              </button>
            </div>

            {/* Liste des tâches */}
            <div className="space-y-3">
              {userTasks.length === 0 ? (
                <div className="text-sm text-gray-500 text-center py-8">
                  Aucune tâche créée. Cliquez sur "Ajouter" pour créer votre première tâche !
                </div>
              ) : (
                userTasks.map((task) => (
                  <div 
                    key={task.id} 
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                      task.completed 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <button
                      onClick={() => handleToggleTask(task.id, task.completed)}
                      className="mt-1 flex-shrink-0"
                    >
                      {task.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-gray-300 hover:border-green-500 transition-colors"></div>
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${
                        task.completed ? 'text-green-800 line-through' : 'text-gray-900'
                      }`}>
                        {task.title}
                      </p>
                      {task.description && (
                        <p className={`text-xs mt-1 ${
                          task.completed ? 'text-green-600 line-through' : 'text-gray-500'
                        }`}>
                          {task.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        Créée le {formatDate(task.createdAt)}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => startEditTask(task)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Modifier"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(task)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Section Promotion (si pas admin) */}
        {session?.user?.role !== 'ADMIN' && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
              <User className="h-5 w-5" />
              Demande de Promotion
            </h3>
            <p className="text-blue-700 mb-4">
              Souhaitez-vous accéder à plus de fonctionnalités ? Demandez une promotion de rôle pour créer des initiatives, conseils et articles.
            </p>
            <button 
              onClick={() => router.push('/promotion')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Demander une promotion
            </button>
          </div>
        )}

        {/* Section Admin (si admin) */}
        {session?.user?.role === 'ADMIN' && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
              <Leaf className="h-5 w-5" />
              Espace Administrateur
            </h3>
            <p className="text-red-700 mb-4">
              En tant qu'administrateur, vous avez accès à des fonctionnalités de modération et de gestion.
            </p>
            <button 
              onClick={() => router.push('/admin')}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Accéder à l'administration
            </button>
          </div>
        )}

        {/* Modale de création/modification de tâche */}
        {(showTaskForm || editingTask) && (
          <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl max-w-md w-full mx-4 border border-gray-200/50">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {editingTask ? 'Modifier la tâche' : 'Nouvelle tâche'}
                  </h3>
                  <button
                    onClick={cancelEdit}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Titre *
                    </label>
                    <input
                      type="text"
                      placeholder="Titre de la tâche"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      maxLength={100}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {newTaskTitle.length}/100 caractères
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      placeholder="Description optionnelle"
                      value={newTaskDescription}
                      onChange={(e) => setNewTaskDescription(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={editingTask ? handleEditTask : handleCreateTask}
                    disabled={!newTaskTitle.trim()}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                  >
                    {editingTask ? 'Modifier' : 'Créer'}
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modale de suppression */}
        {showDeleteModal && taskToDelete && (
          <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl max-w-md w-full mx-4 border border-gray-200/50">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Supprimer la tâche
                    </h3>
                    <p className="text-sm text-gray-600">
                      Cette action est irréversible
                    </p>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Tâche :</span> {taskToDelete.title}
                  </p>
                  {taskToDelete.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {taskToDelete.description}
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={confirmDelete}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    Supprimer
                  </button>
                  <button
                    onClick={cancelDelete}
                    className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
