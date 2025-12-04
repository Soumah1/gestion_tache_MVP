import React, { useEffect, useState } from 'react'
import { FiCheckSquare, FiFileText, FiFolder, FiUsers } from 'react-icons/fi'
import AdminLogsTab from '../components/AdminLogsTab'
import AdminProjectsTab from '../components/AdminProjectsTab'
import AdminTasksTab from '../components/AdminTasksTab'
import AdminUsersTab from '../components/AdminUsersTab'
import CalendarView from '../components/CalendarView'
import api from '../services/api'

type TabType = 'dashboard' | 'users' | 'projects' | 'tasks' | 'logs'

interface AdminStats {
  total_users: number
  total_projects: number
  total_tasks: number
  recent_users: any[]
  recent_projects: any[]
  tasks_completed_today?: number
  tasks_due_today?: number
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Debug: confirm component mounted
  console.debug('AdminDashboard mounted, activeTab=', activeTab)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats')
        setStats(res.data)
      } catch (err: any) {
        if (err.response && err.response.status === 403) {
          window.location.href = '/dashboard'
          return
        }
        setError('Failed to load admin stats')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="sticky top-16 z-20 bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Manage users, workspaces, and content</p>
      </div>

      <div className="flex h-[calc(100vh-7rem)]">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                }`}
            >
              <FiFileText size={20} />
              <span className="font-medium">Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${activeTab === 'users' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                }`}
            >
              <FiUsers size={20} />
              <span className="font-medium">Users</span>
            </button>

            <button
              onClick={() => setActiveTab('projects')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${activeTab === 'projects' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                }`}
            >
              <FiFolder size={20} />
              <span className="font-medium">Workspaces</span>
            </button>

            <button
              onClick={() => setActiveTab('tasks')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${activeTab === 'tasks' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                }`}
            >
              <FiCheckSquare size={20} />
              <span className="font-medium">Tasks</span>
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${activeTab === 'logs' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                }`}
            >
              <FiFileText size={20} />
              <span className="font-medium">Audit Logs</span>
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && activeTab === 'dashboard' ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading stats...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && stats && (
                <>
                  <div>
                    <div className="grid grid-cols-4 gap-4 mb-8">
                      <StatCard
                        title="Total Users"
                        value={stats.total_users}
                        icon={<FiUsers size={24} />}
                        color="blue"
                      />
                      <StatCard
                        title="Total Workspaces"
                        value={stats.total_projects}
                        icon={<FiFolder size={24} />}
                        color="green"
                      />
                      <StatCard
                        title="Total Tasks"
                        value={stats.total_tasks}
                        icon={<FiCheckSquare size={24} />}
                        color="purple"
                      />
                      <StatCard
                        title="Admin Users"
                        value={stats.recent_users.filter(u => u.is_admin).length}
                        icon={<FiUsers size={24} />}
                        color="red"
                      />
                      <StatCard
                        title="Completed Today"
                        value={stats.tasks_completed_today || 0}
                        icon={<FiCheckSquare size={24} />}
                        color="green"
                      />
                      <StatCard
                        title="Due Today"
                        value={stats.tasks_due_today || 0}
                        icon={<FiFileText size={24} />}
                        color="purple"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      {/* Recent Users */}
                      <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h2>
                        <div className="space-y-3">
                          {stats.recent_users.slice(0, 5).map(user => (
                            <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                              <div>
                                <p className="font-medium text-gray-900">{user.full_name || user.email}</p>
                                <p className="text-sm text-gray-500">{user.email}</p>
                              </div>
                              <span className={`px-2 py-1 text-xs rounded font-medium ${user.is_admin ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-700'
                                }`}>
                                {user.is_admin ? 'Admin' : 'User'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Recent Workspaces */}
                      <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Workspaces</h2>
                        <div className="space-y-3">
                          {stats.recent_projects.slice(0, 5).map(proj => (
                            <div key={proj.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                              <div>
                                <p className="font-medium text-gray-900">{proj.name}</p>
                                <p className="text-sm text-gray-500">Owner: {proj.owner?.email || proj.owner_email || 'Unknown'}</p>
                              </div>
                              <span className="text-sm text-gray-600">ID: {proj.id}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8">
                    <CalendarView />
                  </div>
                </>
              )}

              {activeTab === 'users' && <AdminUsersTab />}
              {activeTab === 'projects' && <AdminProjectsTab />}
              {activeTab === 'tasks' && <AdminTasksTab />}
              {activeTab === 'logs' && <AdminLogsTab />}
            </>
          )}
        </div>
      </div>
      {/* Debug panel: toggle raw stats/error to help diagnose rendering issues */}
      <div className="fixed bottom-4 right-4">
        <DebugPanel stats={stats} error={error} />
      </div>
    </div>
  )
}

function DebugPanel({ stats, error }: { stats: AdminStats | null; error: string | null }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="w-80">
      <button
        onClick={() => setOpen(!open)}
        className="px-3 py-2 bg-gray-800 text-white rounded-lg shadow"
      >
        {open ? 'Hide Debug' : 'Show Debug'}
      </button>
      {open && (
        <div className="mt-2 p-3 bg-white rounded shadow max-h-64 overflow-auto text-xs">
          <div className="text-red-600 mb-2">{error}</div>
          <pre className="whitespace-pre-wrap">{JSON.stringify(stats, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}

interface StatCardProps {
  title: string
  value: number
  icon: React.ReactNode
  color: string
}

function StatCard({ title, value, icon, color }: StatCardProps) {
  const bgColors = {
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    purple: 'bg-purple-50',
    red: 'bg-red-50'
  }
  const textColors = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    red: 'text-red-600'
  }

  return (
    <div className={`${bgColors[color as keyof typeof bgColors]} rounded-lg p-6`}>
      <div className={`${textColors[color as keyof typeof textColors]} mb-2`}>{icon}</div>
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
    </div>
  )
}
