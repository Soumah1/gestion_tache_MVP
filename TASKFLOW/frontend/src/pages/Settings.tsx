import { useEffect, useState } from 'react'
import { getCurrentUser, updateCurrentUser } from '../services/api'

const Settings = () => {
  const [me, setMe] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getCurrentUser()
        setMe(res.data)
        setFormData(prev => ({
          ...prev,
          full_name: res.data.full_name || '',
          email: res.data.email || ''
        }))
      } catch (err) {
        console.error('Could not load current user', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password && formData.password !== formData.confirmPassword) {
      alert("Passwords don't match")
      return
    }

    setSaving(true)
    try {
      const updates: any = {
        full_name: formData.full_name,
        email: formData.email
      }
      if (formData.password) {
        updates.password = formData.password
      }

      const res = await updateCurrentUser(updates)
      setMe(res.data)
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }))
      alert('Profile updated successfully')
    } catch (err: any) {
      console.error('Failed to update profile', err)
      alert(err.response?.data?.detail || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const saveSettings = () => {
    localStorage.setItem('theme', theme)
    alert('Preferences saved')
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
      <p className="text-sm text-gray-500 mb-6">Manage your account and application preferences</p>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="font-medium mb-4">Profile</h2>
        {loading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-4 bg-gray-200 rounded w-1/4" />
          </div>
        ) : me ? (
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="text-sm text-gray-600 block mb-1">Display Name</label>
              <input
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 outline-none"
                required
              />
            </div>
            <div className="pt-2 border-t mt-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Change Password</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600 block mb-1">New Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="Leave blank to keep current"
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Confirm Password</label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className={`px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors ${saving ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
              >
                {saving ? 'Saving...' : 'Update Profile'}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-sm text-gray-500">Not signed in</div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="font-medium mb-3">Preferences</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Theme</div>
              <div className="text-xs text-gray-500">Choose light or dark UI</div>
            </div>
            <select value={theme} onChange={(e) => setTheme(e.target.value)} className="px-3 py-2 border rounded-md">
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          <div className="flex justify-end">
            <button onClick={saveSettings} className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md transition-colors">Save Preferences</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
