import { useState, useRef, useEffect } from 'react'
import { FiEdit2, FiTrash2, FiCheck, FiCalendar } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import { DayPicker } from 'react-day-picker'
import { format, parseISO } from 'date-fns'
import 'react-day-picker/dist/style.css'

interface TaskItemProps {
    task: {
        id: number
        title: string
        description?: string
        status: 'todo' | 'in_progress' | 'done'
        due_date?: string
    }
    onUpdate: (taskId: number, updates: any) => void
    onDelete: (taskId: number) => void
}

const TaskItem = ({ task, onUpdate, onDelete }: TaskItemProps) => {
    const [showActions, setShowActions] = useState(false)
    const [showCalendar, setShowCalendar] = useState(false)
    const calendarRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
                setShowCalendar(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const getNextStatus = () => {
        switch (task.status) {
            case 'todo':
                return 'in_progress'
            case 'in_progress':
                return 'done'
            case 'done':
                return 'todo'
        }
    }

    const getStatusButton = () => {
        switch (task.status) {
            case 'todo':
                return { text: 'Start', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' }
            case 'in_progress':
                return { text: 'Complete', color: 'bg-green-100 text-green-700 hover:bg-green-200' }
            case 'done':
                return { text: 'Reopen', color: 'bg-gray-100 text-gray-700 hover:bg-gray-200' }
        }
    }

    const handleDateSelect = (date: Date | undefined) => {
        if (date) {
            onUpdate(task.id, { due_date: date.toISOString() })
            setShowCalendar(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow relative"
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
        >
            <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900 flex-1">{task.title}</h4>
                {task.due_date && (
                    <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${new Date(task.due_date) < new Date() && task.status !== 'done'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
            <FiCalendar className="w-3 h-3" />
                        {format(parseISO(task.due_date), 'MMM d')}
          </span>
                )}
            </div>

            {task.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
            )}

            <div className="flex items-center gap-2 mt-4 h-8">
                <AnimatePresence>
                    {showActions && (
                        <>
                            <motion.button
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                onClick={() => onUpdate(task.id, { status: getNextStatus() })}
                                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded ${getStatusButton().color} transition-colors flex items-center justify-center gap-1`}
                            >
                                <FiCheck className="w-3 h-3" />
                                {getStatusButton().text}
                            </motion.button>

                            <motion.div className="relative" ref={calendarRef}>
                                <motion.button
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setShowCalendar(!showCalendar)}
                                    className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                >
                                    <FiCalendar className="w-4 h-4" />
                                </motion.button>

                                {showCalendar && (
                                    <div className="absolute bottom-full left-0 mb-2 z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-2">
                                        <DayPicker
                                            mode="single"
                                            selected={task.due_date ? parseISO(task.due_date) : undefined}
                                            onSelect={handleDateSelect}
                                            modifiersClassNames={{
                                                selected: 'bg-primary-600 text-white hover:bg-primary-700'
                                            }}
                                        />
                                    </div>
                                )}
                            </motion.div>

                            <motion.button
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                onClick={() => onDelete(task.id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                                <FiTrash2 className="w-3 h-3" />
                            </motion.button>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    )
}

export default TaskItem

