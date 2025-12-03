import { useEffect, useState } from 'react'
import { getCurrentUser } from '../services/api'

interface UserSummary {
  id: number
  email: string
  full_name?: string
}

const Users = () => {
  const [me, setMe] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getCurrentUser()
        setMe(res.data)
      } catch (err) {
        console.error('Could not load current user', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Placeholder sample users until a users list endpoint is available
  const sampleUsers: UserSummary[] = [
    { id: 1, email: 'alice@example.com', full_name: 'Alice' },
    { id: 2, email: 'bob@example.com', full_name: 'Bob' },
    { id: 3, email: 'carol@example.com', full_name: 'Carol' },
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500">Manage and view users in your workspace</p>
        </div>
        <div>
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg">Invite user</button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="text-sm text-gray-500 mb-4">Current account</div>
        {loading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-4 bg-gray-200 rounded w-1/4" />
          </div>
        ) : me ? (
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">{me.full_name?.[0] ?? me.email[0]}</div>
            <div>
              <div className="font-medium">{me.full_name ?? me.email}</div>
              <div className="text-sm text-gray-500">{me.email}</div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500">Not signed in</div>
        )}
      </div>

      <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
        <div className="text-sm text-gray-500 mb-3">All users</div>
        <div className="divide-y">
          {sampleUsers.map((u) => (
            <div key={u.id} className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">{u.full_name?.[0]}</div>
                <div>
                  <div className="font-medium">{u.full_name}</div>
                  <div className="text-xs text-gray-500">{u.email}</div>
                </div>
              </div>
              <div>
                <button className="px-3 py-1 text-sm border rounded-md">Manage</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Users
