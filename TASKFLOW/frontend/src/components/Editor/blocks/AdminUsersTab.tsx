import React, { useState, useEffect } from 'react'
import api from '../services/api'
import { FiTrash2, FiShield, FiLock, FiRefreshCw } from 'react-icons/fi'

interface User {
    id: number
    email: string
    full_name: string
    is_admin: boolean
    is_suspended: boolean
    created_at: string
}

export default function AdminUsersTab() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    console.debug('AdminUsersTab mounted')
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const [search, setSearch] = useState('')
    const [per_page] = useState(20)

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const res = await api.get('/admin/users', {
                params: { q: search, page, per_page }
            })
            setUsers(res.data.items)
            setTotal(res.data.total)
        } catch (err) {
            setError('Failed to load users')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [page, search])

    const handleToggleAdmin = async (userId: number, isAdmin: boolean) => {
        try {
            const res = await api.put(`/users/${userId}`, {
                is_admin: !isAdmin,
                role: !isAdmin ? 'admin' : 'user'
            })
            setUsers(users.map(u => (u.id === userId ? res.data : u)))
        } catch (err) {
            alert('Failed to toggle admin status')
            console.error(err)
        }
    }

    const handleSuspend = async (userId: number, isSuspended: boolean) => {
        try {
            const res = await api.put(`/users/${userId}`, {
                is_suspended: !isSuspended
            })
            setUsers(users.map(u => (u.id === userId ? res.data : u)))
        } catch (err) {
            alert('Failed to toggle suspension')
            console.error(err)
        }
    }

    const handleDelete = async (userId: number) => {
        if (!confirm('Are you sure you want to delete this user?')) return
        try {
            await api.delete(`/users/${userId}`)
            setUsers(users.filter(u => u.id !== userId))
        } catch (err) {
            alert('Failed to delete user')
            console.error(err)
        }
    }

    return (
        <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">User Management</h2>
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        placeholder="Search users by name or email..."
                        value={search}
                        onChange={e => {
                            setSearch(e.target.value)
                            setPage(1)
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={fetchUsers}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        <FiRefreshCw size={18} />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="p-12 text-center text-gray-500">Loading users...</div>
            ) : error ? (
                <div className="p-4 bg-red-50 text-red-600 border border-red-200 m-4 rounded">{error}</div>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">User</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Role</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Created</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                        {user.full_name || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.is_suspended
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {user.is_suspended ? 'Suspended' : 'Active'}
                      </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.is_admin
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {user.is_admin ? 'Admin' : 'User'}
                      </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => handleToggleAdmin(user.id, user.is_admin)}
                                                className="p-2 text-gray-600 hover:bg-gray-100 rounded transition"
                                                title={user.is_admin ? 'Remove Admin' : 'Make Admin'}
                                            >
                                                <FiShield size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleSuspend(user.id, user.is_suspended)}
                                                className="p-2 text-gray-600 hover:bg-gray-100 rounded transition"
                                                title={user.is_suspended ? 'Unsuspend' : 'Suspend'}
                                            >
                                                <FiLock size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                                                title="Delete User"
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
                            Showing {users.length} of {total} users
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
