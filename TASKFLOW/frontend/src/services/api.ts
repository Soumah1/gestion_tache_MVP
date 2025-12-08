import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  // Debug: log outgoing requests
  try {
    // eslint-disable-next-line no-console
    console.debug('[api] Request:', config.method, config.url)
  } catch (e) {}
  return config
})

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Debug: log errors and responses
    try {
      // eslint-disable-next-line no-console
      console.debug('[api] Response error:', error?.response?.status, error?.config?.url)
    } catch (e) {}
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth
export const login = (email: string, password: string) => {
  const formData = new URLSearchParams()
  formData.append('username', email)
  formData.append('password', password)
  return api.post('/users/login', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
}

export const register = (email: string, password: string, fullName?: string) => {
  return api.post('/users/register', { email, password, full_name: fullName })
}

export const getCurrentUser = () => {
  return api.get('/users/me')
}

// Projects
export const getProjects = () => {
  return api.get('/projects/')
}

export const createProject = (name: string, description?: string) => {
  return api.post('/projects/', { name, description })
}

export const getProject = (id: number) => {
  return api.get(`/projects/${id}`)
}

export const updateProject = (id: number, data: { name?: string; description?: string }) => {
  return api.put(`/projects/${id}`, data)
}

export const deleteProject = (id: number) => {
  return api.delete(`/projects/${id}`)
}

// Tasks
export const getTasks = (projectId: number) => {
  return api.get(`/tasks/project/${projectId}`)
}

export const createTask = (projectId: number, title: string, description?: string) => {
  return api.post('/tasks/', { 
    project_id: projectId, 
    title, 
    description,
    status: 'todo'
  })
}

export const updateTask = (id: number, data: { title?: string; description?: string; status?: string }) => {
  return api.put(`/tasks/${id}`, data)
}

export const deleteTask = (id: number) => {
  return api.delete(`/tasks/${id}`)
}

// Progress
export const getProgress = (projectId: number) => {
  return api.get(`/progress/project/${projectId}`)
}

// Admin / Users (admin-only endpoints)
export const getAllUsers = (params?: { q?: string; page?: number; per_page?: number }) => {
  return api.get('/users/', { params })
}

export const updateUser = (id: number, data: { email?: string; full_name?: string; password?: string; is_admin?: boolean }) => {
  return api.put(`/users/${id}`, data)
}

export const deleteUser = (id: number) => {
  return api.delete(`/users/${id}`)
}

export const exportUsersCsv = () => {
  return api.get('/users/export', { responseType: 'blob' })
}

export default api

