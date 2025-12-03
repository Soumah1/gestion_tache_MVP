import { useState, useEffect } from 'react'
import api from '../services/api'
import { FiTrash2, FiEye } from 'react-icons/fi'

interface Project {
    id: number
    name: string
    description: string
    owner_id: number
    owner: { email: string; full_name: string }
    task_count: number
    created_at: string
}

export default function AdminProjectsTab() {
    const [projects, setProjects] = useState<Project[]>([])
    const [loading, setLoading] = useState(true)
    console.debug('AdminProjectsTab mounted')
    const [error, setError] = useState<string | null>(null)
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const [per_page] = useState(20)
    const [selectedProject, setSelectedProject] = useState<Project | null>(null)

    const fetchProjects = async () => {
        try {
            setLoading(true)
            const res = await api.get('/admin/projects', {
                params: { page, per_page }
            })
            setProjects(res.data.items)
            setTotal(res.data.total)
        } catch (err) {
            setError('Failed to load projects')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProjects()
    }, [page])

    const handleDelete = async (projectId: number) => {
        if (!confirm('Are you sure you want to delete this workspace and all its tasks?')) return
        try {
            await api.delete(`/admin/projects/${projectId}`)
            setProjects(projects.filter(p => p.id !== projectId))
        } catch (err) {
            alert('Failed to delete project')
            console.error(err)
        }
    }

    return (
        <div className="grid grid-cols-3 gap-6">
            {/* Projects List */}
            <div className="col-span-2 bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Workspaces</h2>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-gray-500">Loading workspaces...</div>
                ) : error ? (
                    <div className="p-4 bg-red-50 text-red-600 border border-red-200 m-4 rounded">{error}</div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Owner</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Tasks</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Created</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                {projects.map(project => (
                                    <tr key={project.id} className="hover:bg-gray-50 transition cursor-pointer"
                                        onClick={() => setSelectedProject(project)}
                                    >
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{project.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{project.owner.email}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{project.task_count}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(project.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm" onClick={e => e.stopPropagation()}>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => setSelectedProject(project)}
                                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded transition"
                                                    title="View Details"
                                                >
                                                    <FiEye size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(project.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                                                    title="Delete Workspace"
                                                >
                                                    <FiTrash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                                Showing {projects.length} of {total} workspaces
                            </p>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setPage(Math.max(1, page - 1))}
                                    disabled={page === 1}
                                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <span className="text-sm text-gray-600">Page {page}</span>
                                <button
                                    onClick={() => setPage(page + 1)}
                                    disabled={page * per_page >= total}
                                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Details Panel */}
            <div className="bg-white rounded-lg shadow p-6 h-fit sticky top-20">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Details</h3>
                {selectedProject ? (
                    <div className="space-y-4 text-sm">
                        <div>
                            <p className="text-gray-600">Name</p>
                            <p className="font-medium text-gray-900">{selectedProject.name}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Description</p>
                            <p className="font-medium text-gray-900">{selectedProject.description || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Owner</p>
                            <p className="font-medium text-gray-900">{selectedProject.owner.email}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Tasks</p>
                            <p className="font-medium text-gray-900">{selectedProject.task_count}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Created</p>
                            <p className="font-medium text-gray-900">
                                {new Date(selectedProject.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-500 text-center py-8">Select a workspace to view details</p>
                )}
            </div>
        </div>
    )
}
