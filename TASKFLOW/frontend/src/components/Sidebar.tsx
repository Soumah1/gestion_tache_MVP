import { useState, useEffect } from 'react'
import { FiHome, FiUsers, FiList, FiSettings, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { NavLink } from 'react-router-dom'
import { getCurrentUser } from '../services/api'

const itemsBase = [
    { name: 'Dashboard', to: '/dashboard', icon: <FiHome /> },
    { name: 'Users', to: '/users', icon: <FiUsers /> },
    { name: 'Tasks', to: '/tasks', icon: <FiList /> },
    { name: 'Settings', to: '/settings', icon: <FiSettings /> },
]

const Sidebar = () => {
    const [collapsed, setCollapsed] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)

    useEffect(() => {
        let mounted = true
        const load = async () => {
            try {
                const res = await getCurrentUser()
                if (mounted) setIsAdmin(!!res.data?.is_admin)
            } catch (err) {
                // ignore - likely not authenticated or endpoint failed
            }
        }
        load()
        return () => {
            mounted = false
        }
    }, [])

    return (
        <aside
            className={`bg-white border-r border-gray-200 h-[calc(100vh-64px)] pt-6 transition-all duration-200 ${
                collapsed ? 'w-16' : 'w-64'
            } hidden md:block`}
        >
            <div className="flex flex-col h-full">
                <div className="px-3">
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-100"
                        aria-label="Toggle sidebar"
                    >
                        {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
                        {!collapsed && <span className="font-semibold">Menu</span>}
                    </button>
                </div>

                <nav className="mt-6 flex-1 px-2 space-y-1">
                    {itemsBase.map((it) => (
                        <NavLink
                            key={it.name}
                            to={it.to}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors ${
                                    isActive ? 'bg-primary-50 border-l-4 border-primary-600 text-primary-700' : 'text-gray-600'
                                }`}
                        >
                            <div className="w-5 h-5">{it.icon}</div>
                            {!collapsed && <span className="text-sm font-medium">{it.name}</span>}
                        </NavLink>
                    ))}

                    {isAdmin && (
                        <NavLink
                            to="/admin"
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors ${
                                    isActive ? 'bg-primary-50 border-l-4 border-primary-600 text-primary-700' : 'text-gray-600'
                                }`}
                        >
                            <div className="w-5 h-5"><FiUsers /></div>
                            {!collapsed && <span className="text-sm font-medium">Admin</span>}
                        </NavLink>
                    )}

                    {isAdmin && (
                        <NavLink
                            to="/admin-dashboard"
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors ${
                                    isActive ? 'bg-purple-50 border-l-4 border-purple-600 text-purple-700' : 'text-gray-600'
                                }`}
                        >
                            <div className="w-5 h-5"><FiUsers /></div>
                            {!collapsed && <span className="text-sm font-medium">Dashboard</span>}
                        </NavLink>
                    )}
                </nav>

                <div className="px-4 pb-6">
                    {!collapsed ? (
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">U</div>
                            <div>
                                <div className="font-medium">You</div>
                                <div className="text-xs text-gray-400">Member</div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">U</div>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    )
}

export default Sidebar
