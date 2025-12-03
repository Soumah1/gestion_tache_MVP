import { useEffect, useState } from 'react'
import { FiList, FiPlay } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { getProjects } from '../services/api'

interface Project {
  id: number
  name: string
}

const Tasks = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getProjects()
        setProjects(res.data || [])
      } catch (err) {
        console.error('Could not load projects for tasks page', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-sm text-gray-500">Quick access to project task boards and lists</p>
        </div>
        <div>
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg flex items-center gap-2">
            <FiPlay /> Start Timer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-500 mb-3">Your project boards</div>
          {loading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
            </div>
          ) : projects.length === 0 ? (
            <div className="text-sm text-gray-500">No projects yet. Create one from the Dashboard.</div>
          ) : (
            <div className="space-y-2">
              {projects.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2">
                  <div className="font-medium">{p.name}</div>
                  <div>
                    <button
                      onClick={() => navigate(`/project/${p.id}`)}
                      className="px-3 py-1 text-sm border rounded-md flex items-center gap-2"
                    >
                      <FiList /> Open
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-500 mb-3">Recent tasks</div>
          <div className="text-sm text-gray-500">This view will show recent tasks across your projects.</div>
        </div>
      </div>
    </div>
  )
}

export default Tasks
