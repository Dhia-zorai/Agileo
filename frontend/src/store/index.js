import { create } from 'zustand'
import api from '../api/client'

export const useProjectStore = create((set, get) => ({
  projects: [],
  currentProject: null,
  loading: false,
  error: null,

  fetchProjects: async () => {
    set({ loading: true, error: null })
    try {
      const res = await api.get('/projects')
      set({ projects: res.data, loading: false })
    } catch (e) {
      set({ error: e.message, loading: false })
    }
  },

  setCurrentProject: (project) => set({ currentProject: project }),

  createProject: async (data) => {
    const res = await api.post('/projects', data)
    set((s) => ({ projects: [...s.projects, res.data] }))
    return res.data
  },

  updateProject: async (id, data) => {
    const res = await api.put(`/projects/${id}`, data)
    set((s) => ({
      projects: s.projects.map((p) => (p.id === id ? res.data : p)),
    }))
    return res.data
  },

  deleteProject: async (id) => {
    await api.delete(`/projects/${id}`)
    set((s) => ({
      projects: s.projects.filter((p) => p.id !== id),
      currentProject: s.currentProject?.id === id ? null : s.currentProject,
    }))
  },
}))

export const useTaskStore = create((set, get) => ({
  tasks: [],
  loading: false,
  error: null,

  fetchTasks: async (sprintId) => {
    set({ loading: true, error: null })
    try {
      const res = await api.get(`/sprints/${sprintId}/tasks`)
      set({ tasks: res.data, loading: false })
    } catch (e) {
      set({ error: e.message, loading: false })
    }
  },

  fetchMyTasks: async (assigneeId) => {
    set({ loading: true })
    try {
      const res = await api.get('/tasks', { params: { assignee_id: assigneeId } })
      set({ tasks: res.data, loading: false })
    } catch (e) {
      set({ error: e.message, loading: false })
    }
  },

  createTask: async (sprintId, data) => {
    const res = await api.post(`/sprints/${sprintId}/tasks`, data)
    set((s) => ({ tasks: [...s.tasks, res.data] }))
    return res.data
  },

  updateTask: async (id, data) => {
    const res = await api.put(`/tasks/${id}`, data)
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? res.data : t)),
    }))
    return res.data
  },

  deleteTask: async (id) => {
    await api.delete(`/tasks/${id}`)
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }))
  },

  updateTaskStatus: async (id, status) => {
    const res = await api.patch(`/tasks/${id}/status`, { status })
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? res.data : t)),
    }))
    return res.data
  },
}))

export const useSprintStore = create((set) => ({
  sprints: [],
  currentSprint: null,
  loading: false,

  fetchSprints: async (projectId) => {
    set({ loading: true })
    try {
      const res = await api.get(`/projects/${projectId}/sprints`)
      set({ sprints: res.data, loading: false })
    } catch (e) {
      set({ loading: false })
    }
  },

  setCurrentSprint: (sprint) => set({ currentSprint: sprint }),

  createSprint: async (projectId, data) => {
    const res = await api.post(`/projects/${projectId}/sprints`, data)
    set((s) => ({ sprints: [...s.sprints, res.data] }))
    return res.data
  },

  startSprint: async (id) => {
    const res = await api.patch(`/sprints/${id}/start`)
    set((s) => ({
      sprints: s.sprints.map((sp) => (sp.id === id ? res.data : sp)),
    }))
    return res.data
  },

  completeSprint: async (id) => {
    const res = await api.patch(`/sprints/${id}/complete`)
    set((s) => ({
      sprints: s.sprints.map((sp) => (sp.id === id ? res.data : sp)),
    }))
    return res.data
  },
}))

export const useUIStore = create((set) => ({
  activeProject: null,
  activeSprint: null,
  sidebarOpen: true,
  slidePanelOpen: false,
  slidePanelContent: null,

  setActiveProject: (project) => set({ activeProject: project }),
  setActiveSprint: (sprint) => set({ activeSprint: sprint }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  openSlidePanel: (content) => set({ slidePanelOpen: true, slidePanelContent: content }),
  closeSlidePanel: () => set({ slidePanelOpen: false, slidePanelContent: null }),
}))

export const useToastStore = create((set) => ({
  toasts: [],

  addToast: (message, type = 'info') => {
    const id = Date.now()
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }))
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
    }, 3000)
  },

  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))