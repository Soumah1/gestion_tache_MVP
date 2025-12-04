import { format, getDay, parseISO, startOfWeek } from 'date-fns'
import enUS from 'date-fns/locale/en-US'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import api from '../services/api'
import { updateTask, deleteTask } from '../services/api'


const locales = { 'en-US': enUS }
const localizer = dateFnsLocalizer({ format, parse: (str: string, _fmt: any) => parseISO(str), startOfWeek, getDay, locales })

interface CalendarViewProps {
    projectId?: number
    tasks?: Array<{
        id: number
        title: string
        status?: string
        due_date?: string
        scheduled_day?: string
        created_at: string
    }>
    title?: string
}

interface TaskEvent {
    id: number
    title: string
    start: Date
    end: Date
    allDay?: boolean
    resource?: any
}

export default function CalendarView({ projectId, tasks: providedTasks, title = 'Calendar' }: CalendarViewProps) {
    const [events, setEvents] = useState<TaskEvent[]>([])
    const [loading, setLoading] = useState(!providedTasks)
    const [selectedTask, setSelectedTask] = useState<any | null>(null)
    const [editForm, setEditForm] = useState<{ title: string; description: string; status: string; due_date: string }>({
        title: '',
        description: '',
        status: 'todo',
        due_date: ''
    })
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (providedTasks) {
            setEvents(mapTasksToEvents(providedTasks))
            setLoading(false)
        }
    }, [providedTasks])

    useEffect(() => {
        if (!providedTasks) {
            fetchTasks()
        }
    }, [projectId, providedTasks])

    const mapTasksToEvents = (items: any[]) => {
        return items.map((t: any) => {
            const startDate = t.due_date || t.scheduled_day || t.created_at
            const start = new Date(startDate)
            const end = t.due_date ? new Date(t.due_date) : new Date(start)
            return {
                id: t.id,
                title: t.title,
                start,
                end,
                resource: t
            }
        })
    }

    const fetchTasks = async () => {
        try {
            setLoading(true)
            if (projectId) {
                const res = await api.get(`/tasks/project/${projectId}`)
                setEvents(mapTasksToEvents(res.data))
                return
            }

            // Try admin endpoint first (admins)
            try {
                const res = await api.get('/admin/tasks', { params: { per_page: 1000 } })
                const items = res.data?.items || []
                setEvents(mapTasksToEvents(items))
                return
            } catch (adminErr) {
                // If admin endpoint fails (non-admin), fall back to user-owned projects
                console.debug('Admin tasks fetch failed, falling back to user projects', adminErr)
            }

            const projectsRes = await api.get('/projects/')
            const projects = projectsRes.data || []
            const tasksArrays = await Promise.all(
                projects.map((p: any) => api.get(`/tasks/project/${p.id}`).then((r) => r.data).catch(() => []))
            )
            const allTasks = tasksArrays.flat()
            setEvents(mapTasksToEvents(allTasks))
        } catch (err) {
            console.error('Failed to load calendar tasks', err)
        } finally {
            setLoading(false)
        }
    }

    const eventStyleGetter = (event: any) => {
        const status = event.resource?.status || 'todo'
        const bg = status === 'done' ? '#D1FAE5' : status === 'in_progress' ? '#E0E7FF' : '#FEF3C7'
        const color = status === 'done' ? '#065F46' : status === 'in_progress' ? '#3730A3' : '#92400E'
        return { style: { backgroundColor: bg, color, borderRadius: 12, padding: '4px 8px', border: 'none' } }
    }

    const onSelectEvent = (event: any) => {
        const t = event.resource
        setSelectedTask(t)
        setError(null)
        setEditForm({
            title: t.title || '',
            description: t.description || '',
            status: t.status || 'todo',
            due_date: t.due_date ? toInputDate(t.due_date) : ''
        })
    }

    const toInputDate = (dateString: string) => {
        const d = new Date(dateString)
        return d.toISOString().slice(0, 16)
    }

    const handleUpdate = async () => {
        if (!selectedTask) return
        setSaving(true)
        setError(null)
        try {
            await updateTask(selectedTask.id, {
                title: editForm.title,
                description: editForm.description,
                status: editForm.status,
                due_date: editForm.due_date ? new Date(editForm.due_date).toISOString() : null as any
            })
            await fetchTasks()
            setSelectedTask(null)
        } catch (err) {
            console.error('Failed to update task', err)
            setError('Failed to update task')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!selectedTask) return
        if (!confirm('Delete this task?')) return
        setSaving(true)
        setError(null)
        try {
            await deleteTask(selectedTask.id)
            await fetchTasks()
            setSelectedTask(null)
        } catch (err) {
            console.error('Failed to delete task', err)
            setError('Failed to delete task')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="bg-white rounded-2xl shadow p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{title}</h3>
            </div>
            {loading ? (
                <div className="text-sm text-gray-500">Loading calendar...</div>
            ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Calendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: 600 }}
                        views={[Views.MONTH, Views.WEEK, Views.DAY]}
                        onSelectEvent={onSelectEvent}
                        eventPropGetter={eventStyleGetter}
                    />
                </motion.div>
            )}

            {selectedTask && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg mx-4"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h4 className="text-xl font-semibold text-gray-900">Edit Task</h4>
                                <p className="text-sm text-gray-500">Update details or delete this task from the calendar.</p>
                            </div>
                            <button
                                onClick={() => setSelectedTask(null)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={editForm.title}
                                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        value={editForm.status}
                                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                    >
                                        <option value="todo">To Do</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="done">Done</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                                    <input
                                        type="datetime-local"
                                        value={editForm.due_date}
                                        onChange={(e) => setEditForm({ ...editForm, due_date: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                    />
                                </div>
                            </div>

                            {error && <div className="text-sm text-red-600">{error}</div>}

                            <div className="flex items-center gap-3 mt-2">
                                <button
                                    onClick={handleUpdate}
                                    disabled={saving}
                                    className={`flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {saving ? 'Saving...' : 'Save changes'}
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={saving}
                                    className="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                                >
                                    Delete
                                </button>
                                <button
                                    onClick={() => setSelectedTask(null)}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
