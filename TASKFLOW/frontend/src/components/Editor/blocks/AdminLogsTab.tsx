import { useState, useEffect } from 'react'
import api from '../services/api'

interface AdminLog {
    id: number
    admin_id: number
    action: string
    target_type: string
    target_id: number
    details: string | null
    created_at: string
}

export default function AdminLogsTab() {
    const [logs, setLogs] = useState<AdminLog[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const [per_page] = useState(50)
    console.debug('AdminLogsTab mounted')

    const fetchLogs = async () => {
        try {
            setLoading(true)
            const res = await api.get('/admin/logs', {
                params: { page, per_page }
            })
            setLogs(res.data.items)
            setTotal(res.data.total)
        } catch (err) {
            setError('Failed to load logs')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchLogs()
    }, [page])

    const actionColors: Record<string, string> = {
        'user_deleted': 'bg-red-100 text-red-700',
        'admin_toggle': 'bg-purple-100 text-purple-700',
        'suspend_toggle': 'bg-orange-100 text-orange-700',
        'password_reset': 'bg-blue-100 text-blue-700',
        'project_deleted': 'bg-red-100 text-red-700',
        'task_deleted': 'bg-orange-100 text-orange-700'
    }

    return (
        <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Audit Logs</h2>
                <p className="text-sm text-gray-600 mt-1">Track all admin actions</p>
            </div>

            {loading ? (
                <div className="p-12 text-center text-gray-500">Loading logs...</div>
            ) : error ? (
                <div className="p-4 bg-red-50 text-red-600 border border-red-200 m-4 rounded">{error}</div>
            ) : logs.length === 0 ? (
                <div className="p-12 text-center text-gray-500">No admin logs yet</div>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Action</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Target</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Details</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Timestamp</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {logs.map(log => (
                                <tr key={log.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          actionColors[log.action] || 'bg-gray-100 text-gray-700'
                      }`}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <div>
                                            <p className="font-medium">{log.target_type}</p>
                                            <p className="text-xs text-gray-500">ID: {log.target_id}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {log.details ? (
                                            <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                                                {log.details.substring(0, 50)}...
                                            </code>
                                        ) : (
                                            '-'
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {new Date(log.created_at).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            Showing {logs.length} of {total} logs
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
    )
}
