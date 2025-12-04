import { useState, useEffect } from 'react'
import api from '../services/api'
import { FiTrash2 } from 'react-icons/fi'

interface Task {
    id: number
    title: string
    description: string
    status: string
    project_id: number
    created_at: string
}

interface Project {
    id: number
    name: string
}

export default function AdminTasksTab() {
    const [tasks, setTasks] = useState<Task[]>([])
    const [projects, setProjects] = useState<Project[]>([])
    console.debug('AdminTasksTab mounted')
    const [loading, setLoading] = useState(false)
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null)
    const [error, setError] = useState<string | null>(null)

    const fetchProjects = async () => {
        try {
            const res = await api.get('/admin/projects', {
                params: { per_page: 100 }
            })
            setProjects(res.data.items.map((p: any) => ({ id: p.id, name: p.name })))
            if (res.data.items.length > 0) {
                setSelectedProjectId(res.data.items[0].id)
            }
        } catch (err) {
            console.error('Failed to load projects', err)
        }
    }

    useEffect(() => {
        fetchProjects()
    }, [])

    const fetchTasks = async () => {
        if (!selectedProjectId) return
        try {
            setLoading(true)
            const res = await api.get(
                `/admin/projects/${selectedProjectId}/tasks`
            )
            setTasks(res.data.items)
            setError(null)
        } catch (err) {
            setError('Failed to load tasks')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (selectedProjectId) {
            fetchTasks()
        }
    }, [selectedProjectId])

    const handleDeleteTask = async (taskId: number) => {
        if (!confirm('Delete this task?')) return
        try {
            await api.delete(`/admin/tasks/${taskId}`)
            setTasks(tasks.filter(t => t.id !== taskId))
        } catch (err) {
            alert('Failed to delete task')
            console.error(err)
        }
    }

    const statusColors: Record<string, string> = {
        'todo': 'bg-gray-100 text-gray-700',
        'in_progress': 'bg-blue-100 text-blue-700',
        'done': 'bg-green-100 text-green-700'
    }

    return (
        <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Tasks Management</h2>
                <select
                    value={selectedProjectId || ''}
                    onChange={e => setSelectedProjectId(Number(e.target.value))}
                    className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Select a workspace...</option>
                    {projects.map(p => (
                        <option key={p.id} value={p.id}>
                            {p.name}
                        </option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="p-12 text-center text-gray-500">Loading tasks...</div>
            ) : error ? (
                <div className="p-4 bg-red-50 text-red-600 border border-red-200 m-4 rounded">{error}</div>
            ) : tasks.length === 0 ? (
                <div className="p-12 text-center text-gray-500">No tasks in this workspace</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Title</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Created</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {tasks.map(task => (
                            <tr key={task.id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4">
                                    <div>
                                        <p className="font-medium text-gray-900">{task.title}</p>
                                        <p className="text-sm text-gray-600">{task.description}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        statusColors[task.status] || 'bg-gray-100 text-gray-700'
                    }`}>
                      {task.status.replace('_', ' ')}
                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {new Date(task.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-sm">
                                    <button
                                        onClick={() => handleDeleteTask(task.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                                        title="Delete Task"
                                    >
                                        <FiTrash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
