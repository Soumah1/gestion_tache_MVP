import { useEffect, useState } from 'react'
import { FiEdit, FiTrash2 } from 'react-icons/fi'
import { deleteUser, getAllUsers, updateUser } from '../services/api'

interface UserItem {
  id: number
  email: string
  full_name?: string
}

const Admin = () => {
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<UserItem | null>(null)
  const [form, setForm] = useState({ email: '', full_name: '', password: '' })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await getAllUsers()
      // Backend returns a paginated object: { items: [...], total, page, per_page }
      // Ensure we set the users array to the `items` field when present.
      console.debug('Admin.fetchUsers response:', res.data)
      setUsers(res.data?.items || res.data || [])
      setError(null)
    } catch (err) {
      console.error('Error fetching users', err)
      if (err?.response?.status === 403) setError('Admin access required. Set ADMIN_EMAIL on the backend or login as the admin.')
      else setError('Could not fetch users')
    } finally {
      setLoading(false)
    }
  }

  const onEdit = (u: UserItem) => {
    setEditing(u)
    setForm({ email: u.email, full_name: u.full_name || '', password: '' })
  }

  const save = async () => {
    if (!editing) return
    try {
      await updateUser(editing.id, { email: form.email, full_name: form.full_name, password: form.password || undefined })
      setEditing(null)
      setForm({ email: '', full_name: '', password: '' })
      fetchUsers()
    } catch (err) {
      console.error('Error updating user', err)
      alert('Failed to update user')
    }
  }

  const doDelete = async (id: number) => {
    if (!confirm('Delete this user? This action cannot be undone.')) return
    try {
      await deleteUser(id)
      fetchUsers()
    } catch (err) {
      console.error('Error deleting user', err)
      alert('Failed to delete user')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin — Users</h1>
          <p className="text-sm text-gray-500">View and manage users (admin only)</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        {loading ? (
          <div className="text-sm text-gray-500">Loading...</div>
        ) : error ? (
          <div className="text-sm text-red-500">{error}</div>
        ) : users.length === 0 ? (
          <div className="text-sm text-gray-500">No users</div>
        ) : (
          <div className="divide-y">
            {users.map((u) => (
              <div className="py-3 flex items-center justify-between" key={u.id}>
                <div>
                  <div className="font-medium">{u.full_name || u.email}</div>
                  <div className="text-xs text-gray-500">{u.email}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => onEdit(u)} className="px-3 py-1 border rounded-md flex items-center gap-2"><FiEdit /> Edit</button>
                  <button onClick={() => doDelete(u.id)} className="px-3 py-1 border rounded-md text-red-600 flex items-center gap-2"><FiTrash2 /> Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-3">Edit user</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600 block mb-1">Email</label>
                <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Full name</label>
                <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Password (leave blank to keep)</label>
                <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} type="password" className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setEditing(null)} className="px-4 py-2 border rounded-md">Cancel</button>
                <button onClick={save} className="px-4 py-2 bg-primary-600 text-white rounded-md">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Admin
