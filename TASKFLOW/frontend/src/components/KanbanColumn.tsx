import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface KanbanColumnProps {
    title: string
    color: string
    children: ReactNode
}

const KanbanColumn = ({ title, color, children }: KanbanColumnProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
            <div className={`p-4 ${color} border-b border-gray-200`}>
                <h3 className="font-semibold text-gray-800">{title}</h3>
            </div>
            <div className="p-4 min-h-[400px] space-y-3">
                {children}
            </div>
        </motion.div>
    )
}

export default KanbanColumn

