import React, { useEffect, useState } from 'react'
import api from '../api/client'

export default function MyTasksPage() {
  const [tasks, setTasks] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    loadMyTasks()
  }, [filter])
  
  const loadMyTasks = async () => {
    setLoading(true)
    try {
      const res = await api.get('/tasks', { 
        params: { assignee_id: 'user-alice' } 
      })
      let filtered = res.data
      
      const today = new Date().toISOString().split('T')[0]
      if (filter === 'today') {
        filtered = filtered.filter(t => t.due_date === today)
      } else if (filter === 'week') {
        const weekEnd = new Date()
        weekEnd.setDate(weekEnd.getDate() + 7)
        filtered = filtered.filter(t => t.due_date && t.due_date <= weekEnd.toISOString().split('T')[0] && t.due_date >= today)
      } else if (filter === 'overdue') {
        filtered = filtered.filter(t => t.due_date && t.due_date < today && t.status !== 'DONE')
      }
      
      setTasks(filtered)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }
  
  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'overdue', label: 'Overdue' },
  ]
  
  return (
    <div className="fade-in">
      <h1 className="hero-title">Mes tâches</h1>
      <p className="hero-subtitle">Tasks assigned to you</p>
      
      <div className="filter-tabs" style={{ marginBottom: 24 }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`pill-tab ${filter === tab.id ? 'active' : ''}`}
            onClick={() => setFilter(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {loading ? (
        <div className="empty-state">
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {tasks.map(task => (
            <div key={task.id} className={`task-card priority-${task.priority.toLowerCase()}`}>
              <div className="task-title">{task.title}</div>
              <div className="task-description">{task.description}</div>
              <div className="task-meta">
                <span className={`badge badge-${
                  task.status === 'DONE' ? 'emerald' : 
                  task.status === 'IN_PROGRESS' ? 'orange' : 
                  task.status === 'IN_REVIEW' ? 'blue' : 'violet'
                }`}>
                  {task.status}
                </span>
                {task.due_date && (
                  <span style={{ fontSize: 12, color: '#9ca3af' }}>
                    Due: {new Date(task.due_date).toLocaleDateString()}
                  </span>
                )}
                <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 'auto' }}>
                  {task.project_id}
                </span>
              </div>
            </div>
          ))}
          {tasks.length === 0 && (
            <div className="empty-state">
              <p>No tasks found</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}