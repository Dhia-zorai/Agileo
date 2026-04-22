import React from 'react'
import { useState, useEffect } from 'react'

export default function DashboardPage() {
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [projectsRes, tasksRes, membersRes] = await Promise.all([
        fetch('/api/projects').then(r => r.json()),
        fetch('/api/tasks').then(r => r.json()),
        fetch('/api/users').then(r => r.json())
      ])
      setProjects(projectsRes)
      setTasks(tasksRes)
      setMembers(membersRes)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  const myTasks = tasks.filter(t => t.assignee_id && t.status !== 'DONE')
  const completedTasks = tasks.filter(t => t.status === 'DONE').length
  const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS').length

  const projectStats = projects.map(p => {
    const projectTasks = tasks.filter(t => t.project_id === p.id)
    return {
      ...p,
      totalTasks: projectTasks.length,
      doneTasks: projectTasks.filter(t => t.status === 'DONE').length,
      inProgress: projectTasks.filter(t => t.status === 'IN_PROGRESS').length
    }
  })

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 4 }}>Project Dashboard</h1>
        <p style={{ color: '#6b7280' }}>Manage and track your projects</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 36, fontWeight: 700 }}>{myTasks.length}</div>
          <div style={{ fontSize: 12, color: '#9ca3af' }}>My Tasks</div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 36, fontWeight: 700, color: '#f97316' }}>{inProgressTasks}</div>
          <div style={{ fontSize: 12, color: '#9ca3af' }}>In Progress</div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 36, fontWeight: 700, color: '#10b981' }}>{completedTasks}</div>
          <div style={{ fontSize: 12, color: '#9ca3af' }}>Completed</div>
        </div>
      </div>

      {/* Projects Overview */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>Projects Overview</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {projectStats.map(project => (
            <div key={project.id} style={{
              padding: 16,
              borderRadius: 16,
              background: project.color + '10',
              borderLeft: `4px solid ${project.color}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: project.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 600
                }}>
                  {project.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>{project.name}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{project.members?.length || 0} members</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 18 }}>{project.totalTasks}</div>
                  <div style={{ color: '#9ca3af' }}>Total</div>
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 18, color: '#f97316' }}>{project.inProgress}</div>
                  <div style={{ color: '#9ca3af' }}>Active</div>
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 18, color: '#10b981' }}>{project.doneTasks}</div>
                  <div style={{ color: '#9ca3af' }}>Done</div>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ marginTop: 12 }}>
                <div style={{ height: 6, background: '#e5e7eb', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${project.totalTasks ? (project.doneTasks / project.totalTasks * 100) : 0}%`,
                    background: project.color,
                    borderRadius: 999,
                    transition: 'width 0.3s ease'
                  }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* My Tasks */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>My Tasks</h2>
          <span style={{
            padding: '4px 10px',
            borderRadius: 999,
            fontSize: 12,
            background: '#f5f3ff',
            color: '#7c3aed'
          }}>
            {myTasks.length} ongoing
          </span>
        </div>

        <div style={{ display: 'grid', gap: 12 }}>
          {myTasks.slice(0, 6).map(task => (
            <div key={task.id} style={{
              padding: 12,
              borderRadius: 14,
              borderLeft: `3px solid ${task.priority === 'HIGH' ? '#ef4444' :
                  task.priority === 'MEDIUM' ? '#f97316' : '#3b82f6'
                }`,
              background: '#fff',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
            }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{task.title}</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>{task.description}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: 999,
                  fontSize: 11,
                  background: task.status === 'DONE' ? '#f0fdf4' :
                    task.status === 'IN_PROGRESS' ? '#fff7ed' : '#eff6ff',
                  color: task.status === 'DONE' ? '#10b981' :
                    task.status === 'IN_PROGRESS' ? '#f97316' : '#3b82f6'
                }}>
                  {task.status}
                </span>
                {task.due_date && (
                  <span style={{ fontSize: 12, color: '#9ca3af' }}>
                    Due: {new Date(task.due_date).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))}

          {myTasks.length === 0 && (
            <div style={{ textAlign: 'center', padding: 24, color: '#9ca3af' }}>
              All caught up! No pending tasks.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}