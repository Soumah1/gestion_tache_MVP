import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { FiPlus } from 'react-icons/fi'
import { useNavigate, useParams } from 'react-router-dom'
import CalendarView from '../components/CalendarView'
import KanbanColumn from '../components/KanbanColumn'
import TaskItem from '../components/TaskItem'
import { createTask, deleteTask, getProject, getTasks, updateTask } from '../services/api'

interface Project {
  id: number
  name: string
  description?: string
}

interface Task {
  id: number
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'done'
  created_at: string
  due_date?: string
  scheduled_day?: string
}

const ProjectView = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDesc, setNewTaskDesc] = useState('')
  const [newTaskDueDate, setNewTaskDueDate] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (id) {
      fetchData()
    }
  }, [id])

  const fetchData = async () => {
    try {
      const projectRes = await getProject(parseInt(id!))
      setProject(projectRes.data)

      const tasksRes = await getTasks(parseInt(id!))
      setTasks(tasksRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return

    setIsCreating(true)
    try {
      await createTask(
        parseInt(id!),
        newTaskTitle,
        newTaskDesc,
        newTaskDueDate ? new Date(newTaskDueDate).toISOString() : undefined
      )
      setNewTaskTitle('')
      setNewTaskDesc('')
      setNewTaskDueDate('')
      setShowModal(false)
      await fetchData() // Ensure data is refreshed before closing loading state
    } catch (error) {
      console.error('Error creating task:', error)
      alert('Failed to create task. Please try again.') // Simple feedback for now
    } finally {
      setIsCreating(false)
    }
  }

  const handleUpdateTask = async (taskId: number, updates: Partial<Task>) => {
    try {
      await updateTask(taskId, updates)
      fetchData()
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const handleDeleteTask = async (taskId: number) => {
    try {
      await deleteTask(taskId)
      fetchData()
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const columns = [
    { id: 'todo', title: 'To Do', color: 'bg-gray-100' },
    { id: 'in_progress', title: 'In Progress', color: 'bg-blue-100' },
    { id: 'done', title: 'Done', color: 'bg-green-100' },
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-primary-600 hover:text-primary-700 mb-4"
        >
          ← Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{project?.name}</h1>
        {project?.description && (
          <p className="text-gray-600">{project.description}</p>
        )}
      </div>

      <div className="flex justify-end mb-6">
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <FiPlus className="w-5 h-5" />
          Add Task
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((column, index) => (
          <KanbanColumn
            key={column.id}
            title={column.title}
            color={column.color}
          >
            {tasks
              .filter((task) => task.status === column.id)
              .map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onUpdate={handleUpdateTask}
                  onDelete={handleDeleteTask}
                />
              ))}
          </KanbanColumn>
        ))}
      </div>

      <div className="mt-10">
        <CalendarView
          title="Project Calendar"
          projectId={project?.id}
          tasks={tasks}
        />
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full mx-4"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Create New Task</h2>
            <form onSubmit={handleCreateTask}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task Title
                </label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="Complete feature..."
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  rows={3}
                  placeholder="Task details..."
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deadline (optional)
                </label>
                <input
                  type="datetime-local"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Pick when this task should be finished to see it on the calendar.</p>
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className={`flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors ${isCreating ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                  {isCreating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default ProjectView
