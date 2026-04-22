import React, { useState, useEffect } from 'react'
import { t, getCurrentLang, toggleLang, setStoredLang } from './i18n/index.js'

export default function App() {
  const [view, setView] = useState('dashboard')
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [slidePanel, setSlidePanel] = useState({ open: false, content: null })
  const [, forceUpdate] = useState(0)

  useEffect(() => {
    fetchProjects()
  }, [])

  const refreshLang = () => forceUpdate(n => n + 1)

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects')
      const data = await res.json()
      if (Array.isArray(data)) {
        setProjects(data)
      } else {
        console.error('Invalid projects data:', data)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const openSlidePanel = (content) => setSlidePanel({ open: true, content })
  const closeSlidePanel = () => setSlidePanel({ open: false, content: null })

  // CRUD: Projects
  const handleProjectCreate = async (data) => {
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name || 'New Project',
          description: data.description || '',
          color: data.color || '#7c3aed',
          icon: data.icon || 'PJ',
          status: 'ACTIVE',
          members: [],
          sprint_ids: []
        })
      })
      if (!res.ok) throw new Error(await res.text())
      await fetchProjects()
      closeSlidePanel()
    } catch (err) {
      console.error(err)
      alert('Error creating project: ' + err.message)
    }
  }

  const handleProjectUpdate = async (id, data) => {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error(await res.text())
      await fetchProjects()
      if (selectedProject?.id === id) {
        setSelectedProject({ ...selectedProject, ...data })
      }
      closeSlidePanel()
    } catch (err) {
      console.error(err)
      alert('Error updating project: ' + err.message)
    }
  }

  const handleProjectDelete = async (id) => {
    if (!confirm(t('project.deleteConfirm'))) return
    await fetch(`/api/projects/${id}`, { method: 'DELETE' })
    fetchProjects()
    setSelectedProject(null)
    setView('dashboard')
  }

  // CRUD: Tasks
  const handleTaskCreate = async (projectId, sprintId, data) => {
    try {
      const res = await fetch(`/api/sprints/${sprintId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, project_id: projectId, sprint_id: sprintId })
      })
      if (!res.ok) throw new Error(await res.text())
      await fetchProjects()
      closeSlidePanel()
    } catch (err) {
      console.error(err)
      alert('Error creating task: ' + err.message)
    }
  }

  const handleTaskUpdate = async (id, data) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error(await res.text())
      await fetchProjects()
      closeSlidePanel()
    } catch (err) {
      console.error(err)
      alert('Error updating task: ' + err.message)
    }
  }

  const handleTaskDelete = async (id) => {
    if (confirm(t('task.deleteConfirm'))) {
      await fetch(`/api/tasks/${id}`, {
        method: 'DELETE'
      })
      await fetchProjects()
    }
  }

  // CRUD: Members
  const handleInviteMember = async (projectId, userId) => {
    await fetch(`/api/projects/${projectId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId })
    })
    fetchProjects() // Refresh global project member counts
    closeSlidePanel()
  }

  const handleRemoveMember = async (projectId, userId) => {
    await fetch(`/api/projects/${projectId}/members/${userId}`, {
      method: 'DELETE'
    })
    fetchProjects() // Refresh global project member counts
    closeSlidePanel()
  }

  // Language toggle
  const handleLangToggle = () => {
    toggleLang()
    refreshLang()
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#e8e8ed',
      fontFamily: "'Plus Jakarta Sans', sans-serif"
    }}>
      <div className="container" style={{ maxWidth: 1400, margin: '0 auto', padding: '16px 24px' }}>

        {/* Header */}
        <Header
          view={view}
          setView={setView}
          onNewProject={() => openSlidePanel({ type: 'projectForm', onSave: handleProjectCreate })}
          onLangToggle={handleLangToggle}
        />

        {/* Main Content */}
        {view === 'dashboard' && (
          <DashboardView
            projects={projects}
            onProjectClick={(p) => { setSelectedProject(p); setView('project') }}
            onNewProject={() => openSlidePanel({ type: 'projectForm', onSave: handleProjectCreate })}
            onEdit={(p) => openSlidePanel({ type: 'projectForm', onSave: (data) => handleProjectUpdate(p.id, data), editData: p })}
            onDelete={(id) => handleProjectDelete(id)}
          />
        )}

        {view === 'project' && selectedProject && (
          <ProjectDetailView
            project={selectedProject}
            onBack={() => { setView('dashboard'); setSelectedProject(null) }}
            onTaskCreate={(projectId, sprintId, data) => handleTaskCreate(projectId, sprintId, data)}
            onTaskEdit={async (task) => openSlidePanel({
              type: 'taskForm',
              editData: task,
              onSave: async (data) => {
                await handleTaskUpdate(task.id, data)
                // The ProjectDetailView will refetch due to its own logic or we can trigger it
              }
            })}
            onTaskDelete={handleTaskDelete}
            onInviteMember={(projectId, userId) => handleInviteMember(projectId, userId)}
            onRemoveMember={(projectId, userId) => handleRemoveMember(projectId, userId)}
            openSlidePanel={openSlidePanel}
          />
        )}

        {view === 'my-tasks' && <MyTasksView />}
        {view === 'team' && (
          <TeamView
            openSlidePanel={openSlidePanel}
            onDelete={async (id) => {
              if (confirm(t('project.deleteConfirm'))) {
                await fetch(`/api/users/${id}`, { method: 'DELETE' })
                forceUpdate(n => n + 1)
              }
            }}
            onEdit={(user) => openSlidePanel({
              type: 'userForm',
              editData: user,
              onSave: async (data) => {
                await fetch(`/api/users/${user.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(data)
                })
                closeSlidePanel()
                forceUpdate(n => n + 1)
              }
            })}
            onAdd={() => openSlidePanel({
              type: 'userForm',
              onSave: async (data) => {
                await fetch('/api/users', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(data)
                })
                closeSlidePanel()
                forceUpdate(n => n + 1)
              }
            })}
          />
        )}
      </div>

      {/* Slide Panel */}
      <SlidePanel
        isOpen={slidePanel.open}
        onClose={closeSlidePanel}
        content={slidePanel.content}
        projects={projects}
      />
    </div>
  )
}

function Header({ view, setView, onNewProject, onLangToggle }) {
  return (
    <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
      <div>
        <h1 style={{ fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: 700, marginBottom: 4 }}>{t('app.title')}</h1>
        <p style={{ fontSize: 13, color: '#6b7280' }}>{t('app.subtitle')}</p>
      </div>

      <div className="nav-tabs" style={{ display: 'flex', gap: 4, background: '#fff', padding: 4, borderRadius: 999, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflowX: 'auto' }}>
        {[
          { id: 'dashboard', label: t('nav.dashboard') },
          { id: 'my-tasks', label: t('nav.myTasks') },
          { id: 'team', label: t('nav.team') }
        ].map(v => (
          <button
            key={v.id}
            onClick={() => setView(v.id)}
            style={{
              padding: '8px 16px',
              borderRadius: 999,
              border: 'none',
              background: view === v.id ? '#111827' : 'transparent',
              color: view === v.id ? '#fff' : '#6b7280',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'inherit'
            }}>
            {v.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={onLangToggle}
          title="Langue / Language"
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: '1px solid #e5e7eb',
            background: '#fff',
            fontSize: 16,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {getCurrentLang() === 'fr' ? '🇫🇷' : '🇬🇧'}
        </button>
        <button
          onClick={onNewProject}
          style={{
            padding: '10px 16px',
            borderRadius: 999,
            background: '#111827',
            color: '#fff',
            border: 'none',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer'
          }}
        >
          + {t('project.new')}
        </button>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 600 }}>
          AM
        </div>
      </div>
    </div>
  )
}

function DashboardView({ projects, onProjectClick, onNewProject, onEdit, onDelete }) {
  const [stats, setStats] = useState({ myTasks: 0, inProgress: 0, completed: 0 })
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    fetch('/api/tasks')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTasks(data)
        } else {
          console.error('Invalid tasks data:', data)
        }
      })
      .catch(e => console.error(e))
  }, [])

  useEffect(() => {
    const my = tasks.filter(t => t.assignee_id && t.status !== 'DONE')
    const inP = tasks.filter(t => t.status === 'IN_PROGRESS').length
    const done = tasks.filter(t => t.status === 'DONE').length
    setStats({ myTasks: my.length, inProgress: inP, completed: done })
  }, [tasks])

  if (projects.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}>{t('welcome.title')}</h2>
        <p style={{ color: '#6b7280', marginBottom: 24 }}>{t('welcome.noProjects')}</p>
        <button
          onClick={onNewProject}
          style={{
            padding: '12px 24px',
            borderRadius: 999,
            background: '#111827',
            color: '#fff',
            border: 'none',
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          + {t('project.new')}
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Stats */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard value={stats.myTasks} label={t('stats.myTasks')} />
        <StatCard value={stats.inProgress} label={t('stats.inProgress')} color="#f97316" />
        <StatCard value={stats.completed} label={t('stats.completed')} color="#10b981" />
      </div>

      {/* Projects */}
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>{t('project.members')}</h2>
      <div className="projects-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        {projects.map(p => (
          <div
            key={p.id}
            onClick={() => onProjectClick(p)}
            style={{
              padding: 20,
              borderRadius: 20,
              background: '#fff',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              cursor: 'pointer',
              transition: 'transform 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>
                {p.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 18 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{p.members?.length || 0} {t('nav.team').toLowerCase()}</div>
              </div>
              {/* Edit/Delete buttons */}
              <div style={{ display: 'flex', gap: 4 }}>
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(p); }}
                  style={{ padding: 6, borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontSize: 12 }}
                  title={t('actions.edit')}
                >
                  ✏️
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(p.id); }}
                  style={{ padding: 6, borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontSize: 12 }}
                  title={t('actions.delete')}
                >
                  🗑️
                </button>
              </div>
            </div>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>{p.description}</p>
            <ProjectProgress projectId={p.id} tasks={tasks} />
          </div>
        ))}
      </div>
    </div>
  )
}

function StatCard({ value, label, color = '#111827' }) {
  return (
    <div style={{ padding: 20, borderRadius: 20, background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
      <div style={{ fontSize: 36, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 12, color: '#9ca3af' }}>{label}</div>
    </div>
  )
}

function ProjectProgress({ projectId, tasks }) {
  const projectTasks = tasks.filter(t => t.project_id === projectId)
  const total = projectTasks.length
  const done = projectTasks.filter(t => t.status === 'DONE').length
  const percent = total ? (done / total) * 100 : 0

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
        <span style={{ color: '#9ca3af' }}>{done}/{total} {t('filter.done').toLowerCase()}</span>
        <span style={{ color: '#6b7280' }}>{Math.round(percent)}%</span>
      </div>
      <div style={{ height: 6, background: '#e5e7eb', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${percent}%`, background: '#10b981', borderRadius: 999, transition: 'width 0.3s ease' }}></div>
      </div>
    </div>
  )
}

function ProjectDetailView({ project, onBack, onTaskCreate, onTaskEdit, onTaskDelete, onInviteMember, onRemoveMember, openSlidePanel }) {
  const [sprints, setSprints] = useState([])
  const [tasks, setTasks] = useState([])
  const [members, setMembers] = useState([])
  const [activeTab, setActiveTab] = useState('board')

  const fetchMembers = () => {
    fetch(`/api/projects/${project.id}/members`).then(r => r.json()).then(setMembers)
  }

  useEffect(() => {
    fetch(`/api/projects/${project.id}/sprints`).then(r => r.json()).then(setSprints)
    fetchMembers()
  }, [project.id])

  const activeSprint = sprints.find(s => s.status === 'ACTIVE')

  const fetchTasks = () => {
    if (activeSprint) {
      fetch(`/api/sprints/${activeSprint.id}/tasks`)
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data)) {
            setTasks(data)
          } else {
            console.error('Invalid sprint tasks data:', data)
          }
        })
        .catch(e => console.error(e))
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [activeSprint])

  const handleTaskAction = async (action, ...args) => {
    await action(...args)
    fetchTasks()
  }

  const handleDragEnd = async (taskId, newStatus) => {
    await fetch(`/api/tasks/${taskId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
  }

  const handleAddTask = (columnId) => {
    openSlidePanel({
      type: 'taskForm',
      sprintId: activeSprint?.id,
      projectId: project.id,
      column: columnId,
      onSave: async (data) => {
        await onTaskCreate(project.id, activeSprint?.id, data)
        if (activeSprint) {
          fetch(`/api/sprints/${activeSprint.id}/tasks`).then(r => r.json()).then(setTasks)
        }
      }
    })
  }

  const handleInvite = () => {
    openSlidePanel({
      type: 'inviteMember',
      projectId: project.id,
      currentMembers: members,
      onSave: async (userId) => {
        await onInviteMember(project.id, userId)
        fetchMembers()
      }
    })
  }

  const handleRemoveMember = async (userId) => {
    if (confirm(t('project.deleteConfirm'))) {
      await onRemoveMember(project.id, userId)
      fetchMembers()
    }
  }

  const tabs = [
    { id: 'board', label: t('tabs.board') },
    { id: 'backlog', label: t('tabs.backlog') },
    { id: 'members', label: t('tabs.members') }
  ]

  const KANBAN_COLUMNS = [
    { id: 'TODO', label: t('status.TODO'), color: '#9ca3af' },
    { id: 'IN_PROGRESS', label: t('status.IN_PROGRESS'), color: '#f97316' },
    { id: 'IN_REVIEW', label: t('status.IN_REVIEW'), color: '#3b82f6' },
    { id: 'DONE', label: t('status.DONE'), color: '#10b981' }
  ]

  return (
    <div>
      <button onClick={onBack} style={{ marginBottom: 16, padding: '8px 16px', borderRadius: 999, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer' }}>
        ← {t('actions.back')}
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: project.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 18 }}>
          {project.icon}
        </div>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>{project.name}</h1>
          <p style={{ fontSize: 14, color: '#6b7280' }}>{project.description}</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: '#fff', padding: 4, borderRadius: 999, width: 'fit-content' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 16px',
              borderRadius: 999,
              border: 'none',
              background: activeTab === tab.id ? '#111827' : 'transparent',
              color: activeTab === tab.id ? '#fff' : '#6b7280',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'inherit'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'board' && (
        <KanbanBoard
          tasks={tasks}
          columns={KANBAN_COLUMNS}
          onDragEnd={handleDragEnd}
          onAddTask={handleAddTask}
          onTaskEdit={(task) => handleTaskAction(onTaskEdit, task)}
          onTaskDelete={(taskId) => handleTaskAction(onTaskDelete, taskId)}
        />
      )}

      {activeTab === 'backlog' && (
        <BacklogView projectId={project.id} />
      )}

      {activeTab === 'members' && (
        <MembersView
          members={members}
          onInvite={handleInvite}
          onRemove={handleRemoveMember}
        />
      )}
    </div>
  )
}

function KanbanBoard({ tasks, columns, onDragEnd, onAddTask, onTaskEdit, onTaskDelete }) {
  const [draggedTask, setDraggedTask] = useState(null)
  const [dragOverColumn, setDragOverColumn] = useState(null)

  const handleDragStart = (task) => setDraggedTask(task)
  const handleDragOver = (e, columnId) => {
    e.preventDefault()
    setDragOverColumn(columnId)
  }
  const handleDrop = (columnId) => {
    if (draggedTask && draggedTask.status !== columnId) {
      onDragEnd(draggedTask.id, columnId)
    }
    setDraggedTask(null)
    setDragOverColumn(null)
  }

  return (
    <div className="kanban-wrapper" style={{ overflowX: 'auto', paddingBottom: 16, margin: '0 -24px', padding: '0 24px' }}>
      <div className="kanban-board" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(280px, 1fr))', gap: 16, minWidth: 1100 }}>
        {columns.map(col => (
          <div
            key={col.id}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDrop={() => handleDrop(col.id)}
            style={{
              background: dragOverColumn === col.id ? '#f3f4f6' : '#f9fafb',
              borderRadius: 16,
              padding: 16,
              minHeight: 400,
              transition: 'background 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: col.color }}></span>
                <span style={{ fontWeight: 600 }}>{col.label}</span>
              </div>
              <span style={{ padding: '2px 8px', borderRadius: 999, fontSize: 12, background: '#f3f4f6', color: '#6b7280' }}>
                {tasks.filter(t => t.status === col.id).length}
              </span>
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              {tasks.filter(t => t.status === col.id).map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onDragStart={handleDragStart}
                  isDragging={draggedTask?.id === task.id}
                  onEdit={onTaskEdit}
                  onDelete={onTaskDelete}
                />
              ))}
            </div>

            {col.id === 'TODO' && (
              <button
                onClick={() => onAddTask(col.id)}
                className="add-task-btn"
                style={{
                  width: '100%',
                  marginTop: 12,
                  padding: '12px 16px',
                  borderRadius: 12,
                  border: 'none',
                  background: '#111827',
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}
              >
                + {t('task.add')}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function TaskCard({ task, onDragStart, isDragging, onEdit, onDelete }) {
  const getPriorityColor = (p) => {
    return p === 'HIGH' ? '#ef4444' : p === 'MEDIUM' ? '#f97316' : '#3b82f6'
  }

  const getPriorityLabel = (p) => {
    return p === 'HIGH' ? t('priority.high') : p === 'MEDIUM' ? t('priority.medium') : t('priority.low')
  }

  return (
    <div
      draggable
      onDragStart={() => onDragStart(task)}
      style={{
        padding: 12,
        borderRadius: 12,
        background: '#fff',
        borderLeft: `3px solid ${getPriorityColor(task.priority)}`,
        boxShadow: isDragging ? '0 8px 24px rgba(0,0,0,0.15)' : '0 2px 12px rgba(0,0,0,0.06)',
        cursor: 'grab',
        opacity: isDragging ? 0.5 : 1,
        transform: isDragging ? 'rotate(2deg)' : 'none',
        transition: 'box-shadow 0.15s ease, transform 0.15s ease'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 14, flex: 1 }}>{task.title}</div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(task); }}
            style={{ padding: 4, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 12 }}
            title={t('actions.edit')}
          >
            ✏️
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
            style={{ padding: 4, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 12 }}
            title={t('actions.delete')}
          >
            🗑️
          </button>
        </div>
      </div>
      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>{task.description}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, color: '#9ca3af' }}>
          {task.due_date ? new Date(task.due_date).toLocaleDateString() : ''}
        </span>
        <span style={{ padding: '2px 8px', borderRadius: 999, fontSize: 11, background: getPriorityColor(task.priority) + '20', color: getPriorityColor(task.priority) }}>
          {getPriorityLabel(task.priority)}
        </span>
      </div>
    </div>
  )
}

function BacklogView({ projectId }) {
  const [stories, setStories] = useState([])

  useEffect(() => {
    fetch(`/api/projects/${projectId}/stories`)
      .then(r => r.json())
      .then(setStories)
  }, [projectId])

  return (
    <div style={{ padding: 20, borderRadius: 20, background: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600 }}>{t('tabs.backlog')}</h3>
        <button style={{ padding: '8px 16px', borderRadius: 999, background: '#111827', color: '#fff', border: 'none', cursor: 'pointer' }}>
          + {t('story.add')}
        </button>
      </div>
      <div style={{ display: 'grid', gap: 12 }}>
        {stories.map(story => (
          <div key={story.id} style={{ padding: 12, borderRadius: 12, background: '#f9fafb', borderLeft: '3px solid #7c3aed' }}>
            <div style={{ fontWeight: 500, marginBottom: 4 }}>{t('story.asA')} {story.as_a}, {t('story.iWant')} {story.i_want}, {t('story.soThat')} {story.so_that}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <span style={{ padding: '2px 8px', borderRadius: 999, fontSize: 11, background: story.priority === 'MUST' ? '#fef2f2' : '#fff7ed', color: story.priority === 'MUST' ? '#ef4444' : '#f97316' }}>
                {t(`priority.${story.priority.toLowerCase()}`)}
              </span>
              <span style={{ padding: '2px 8px', borderRadius: 999, fontSize: 11, background: '#f3f4f6', color: '#6b7280' }}>
                {story.story_points} pts
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function MembersView({ members, onInvite, onRemove }) {
  return (
    <div style={{ padding: 20, borderRadius: 20, background: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600 }}>{t('tabs.members')}</h3>
        <button
          onClick={onInvite}
          style={{
            padding: '8px 16px',
            borderRadius: 999,
            background: '#111827',
            color: '#fff',
            border: 'none',
            fontSize: 14,
            cursor: 'pointer'
          }}
        >
          + {t('actions.invite')}
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {members.map(member => (
          <div key={member.id} style={{ padding: 16, borderRadius: 16, background: '#f9fafb', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: member.avatar_color, margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 18 }}>
              {member.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div style={{ fontWeight: 600 }}>{member.name}</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>{member.role}</div>
            <button
              onClick={() => onRemove(member.id)}
              style={{ marginTop: 8, padding: '4px 8px', borderRadius: 6, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontSize: 11 }}
            >
              {t('actions.delete')}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function MyTasksView() {
  const [tasks, setTasks] = useState([])
  const [filter, setFilter] = useState('all')
  const [projects, setProjects] = useState([])

  useEffect(() => {
    fetch('/api/tasks?assignee_id=user-alice').then(r => r.json()).then(setTasks)
    fetch('/api/projects').then(r => r.json()).then(setProjects)
  }, [])

  const getProjectName = (id) => projects.find(p => p.id === id)?.name || id

  const filtered = filter === 'all' ? tasks :
    filter === 'today' ? tasks.filter(t => t.due_date === new Date().toISOString().split('T')[0]) :
      filter === 'week' ? tasks.filter(t => {
        const due = new Date(t.due_date)
        const now = new Date()
        const week = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        return due <= week && due >= now
      }) :
        filter === 'done' ? tasks.filter(t => t.status === 'DONE') :
          tasks

  const statusColors = {
    'TODO': ['#f3f4f6', '#6b7280'],
    'IN_PROGRESS': ['#fff7ed', '#f97316'],
    'IN_REVIEW': ['#eff6ff', '#3b82f6'],
    'DONE': ['#f0fdf4', '#10b981']
  }

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>{t('nav.myTasks')}</h2>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, background: '#fff', padding: 4, borderRadius: 999, width: 'fit-content' }}>
        {[{ id: 'all', label: t('filter.all') }, { id: 'today', label: t('filter.today') }, { id: 'week', label: t('filter.week') }, { id: 'done', label: t('filter.done') }].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            style={{
              padding: '8px 16px',
              borderRadius: 999,
              border: 'none',
              background: filter === f.id ? '#111827' : 'transparent',
              color: filter === f.id ? '#fff' : '#6b7280',
              fontSize: 14,
              cursor: 'pointer',
              fontFamily: 'inherit'
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        {filtered.map(task => (
          <div key={task.id} style={{ padding: 16, borderRadius: 14, background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontWeight: 600 }}>{task.title}</span>
              <span style={{ padding: '2px 10px', borderRadius: 999, fontSize: 12, background: statusColors[task.status][0], color: statusColors[task.status][1] }}>
                {t(`status.${task.status}`)}
              </span>
            </div>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8 }}>{task.description}</div>
            <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#9ca3af' }}>
              <span>{getProjectName(task.project_id)}</span>
              <span>{t(`priority.${task.priority}`)}</span>
              {task.due_date && <span>{t('task.dueDate')}: {new Date(task.due_date).toLocaleDateString()}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TeamView({ openSlidePanel, onAdd, onEdit, onDelete }) {
  const [members, setMembers] = useState([])

  useEffect(() => {
    fetch('/api/users').then(r => r.json()).then(setMembers)
  }, [])

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600 }}>{t('nav.team')}</h2>
        <button
          onClick={onAdd}
          style={{
            padding: '8px 16px',
            borderRadius: 999,
            background: '#111827',
            color: '#fff',
            border: 'none',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer'
          }}
        >
          + {t('actions.invite')}
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {members.map(member => (
          <div key={member.id} style={{ padding: 20, borderRadius: 20, background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', textAlign: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 4 }}>
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(member); }}
                style={{ padding: 4, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 12 }}
              >
                ✏️
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(member.id); }}
                style={{ padding: 4, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 12 }}
              >
                🗑️
              </button>
            </div>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: member.avatar_color, margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 20 }}>
              {member.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div style={{ fontWeight: 600 }}>{member.name}</div>
            <div style={{ fontSize: 13, color: '#6b7280' }}>{member.role}</div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>{member.email}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SlidePanel({ isOpen, onClose, content, projects }) {
  const [formData, setFormData] = useState({})
  const [users, setUsers] = useState([])
  const [taskForm, setTaskForm] = useState({ priority: 'MEDIUM', status: 'TODO' })

  useEffect(() => {
    if (content?.type === 'inviteMember') {
      fetch('/api/users').then(r => r.json()).then(setUsers)
    }
    if (content?.type === 'taskForm' && content.editData) {
      setTaskForm(content.editData)
    } else if (content?.type === 'taskForm') {
      setTaskForm({ priority: 'MEDIUM', status: 'TODO' })
    }
    
    if ((content?.type === 'userForm' || content?.type === 'projectForm') && content.editData) {
      setFormData(content.editData)
    } else if (!content?.editData) {
      setFormData({})
    }
  }, [content])

  if (!isOpen) return null

  const handleSubmit = () => {
    if (content?.type === 'taskForm') {
      content.onSave(taskForm)
    } else if (content?.type === 'inviteMember') {
      content.onSave(formData.user_id)
    } else if (content?.type === 'userForm' || content?.type === 'projectForm') {
      content.onSave(formData)
    }
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', zIndex: 999, opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none', transition: 'opacity 0.25s ease' }} />
      <div className="slide-panel" style={{ position: 'fixed', top: 0, right: 0, width: '420px', maxWidth: '100%', height: '100vh', background: '#fff', zIndex: 1000, padding: 24, overflowY: 'auto', boxShadow: '-4px 0 24px rgba(0,0,0,0.1)', transform: isOpen ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.25s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>
            {content?.type === 'projectForm' ? content?.editData ? t('project.edit') : t('project.new') :
              content?.type === 'taskForm' ? content?.editData ? t('task.edit') : t('task.new') :
                content?.type === 'userForm' ? content?.editData ? t('actions.edit') : t('actions.invite') :
                  t('project.invite')}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer' }}>×</button>
        </div>

        {/* Project Form */}
        {content?.type === 'projectForm' && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6b7280', marginBottom: 4 }}>{t('project.name')}</label>
              <input
                className="form-input"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('project.name')}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6b7280', marginBottom: 4 }}>{t('project.description')}</label>
              <textarea
                className="form-input"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t('project.description')}
                rows={3}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6b7280', marginBottom: 4 }}>{t('colorPicker')}</label>
              <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 8 }}>{t('projectColor.violet')}</p>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                {['#7c3aed', '#3b82f6', '#f97316', '#10b981'].map(color => (
                  <button
                    key={color}
                    onClick={() => setFormData({ ...formData, color })}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: color,
                      border: formData.color === color ? '3px solid #111827' : 'none',
                      cursor: 'pointer'
                    }}
                  />
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6b7280', marginBottom: 4 }}>Icon (2 lettres)</label>
              <input
                className="form-input"
                value={formData.icon || ''}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value.toUpperCase().slice(0, 2) })}
                placeholder="AP"
                maxLength={2}
              />
            </div>
            <button
              onClick={handleSubmit}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 12,
                background: '#111827',
                color: '#fff',
                border: 'none',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {content?.editData ? t('actions.save') : t('project.create')}
            </button>
          </div>
        )}

        {/* Task Form */}
        {content?.type === 'taskForm' && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6b7280', marginBottom: 4 }}>{t('task.title')}</label>
              <input
                className="form-input"
                value={taskForm.title || ''}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                placeholder={t('task.title')}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6b7280', marginBottom: 4 }}>{t('task.description')}</label>
              <textarea
                className="form-input"
                value={taskForm.description || ''}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                placeholder={t('task.description')}
                rows={3}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6b7280', marginBottom: 4 }}>{t('task.priority')}</label>
              <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 8 }}>{t('priority.HIGH')}</p>
              <select
                className="form-input"
                value={taskForm.priority || 'MEDIUM'}
                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
              >
                <option value="HIGH">{t('priority.high')}</option>
                <option value="MEDIUM">{t('priority.medium')}</option>
                <option value="LOW">{t('priority.low')}</option>
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6b7280', marginBottom: 4 }}>{t('task.dueDate')}</label>
              <input
                type="date"
                className="form-input"
                value={taskForm.due_date ? taskForm.due_date.substring(0, 10) : ''}
                onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
              />
            </div>
            <button
              onClick={handleSubmit}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 12,
                background: '#111827',
                color: '#fff',
                border: 'none',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {content?.editData ? t('actions.save') : t('task.create')}
            </button>
          </div>
        )}

        {/* User Form */}
        {content?.type === 'userForm' && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6b7280', marginBottom: 4 }}>{t('project.members')}</label>
              <input
                className="form-input"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Name"
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6b7280', marginBottom: 4 }}>Email</label>
              <input
                className="form-input"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Email"
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6b7280', marginBottom: 4 }}>Role</label>
              <select
                className="form-input"
                value={formData.role || 'DEVELOPER'}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="SCRUM_MASTER">Scrum Master</option>
                <option value="PRODUCT_OWNER">Product Owner</option>
                <option value="DEVELOPER">Developer</option>
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6b7280', marginBottom: 4 }}>Color</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {['#7c3aed', '#3b82f6', '#f97316', '#10b981', '#ec4899'].map(color => (
                  <button
                    key={color}
                    onClick={() => setFormData({ ...formData, avatar_color: color })}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: color,
                      border: formData.avatar_color === color ? '3px solid #111827' : 'none',
                      cursor: 'pointer'
                    }}
                  />
                ))}
              </div>
            </div>
            <button
              onClick={handleSubmit}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 12,
                background: '#111827',
                color: '#fff',
                border: 'none',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {content?.editData ? t('actions.save') : t('actions.invite')}
            </button>
          </div>
        )}

        {/* Invite Member */}
        {content?.type === 'inviteMember' && (
          <div>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>{t('project.invite')}:</div>
            {users.filter(u => !content.currentMembers?.find(m => m.id === u.id)).map(user => (
              <div
                key={user.id}
                onClick={() => content.onSave(user.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: 12,
                  borderRadius: 12,
                  background: '#f9fafb',
                  marginBottom: 8,
                  cursor: 'pointer'
                }}
              >
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: user.avatar_color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 600 }}>
                  {user.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div style={{ fontWeight: 500 }}>{user.name}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>{user.role}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`
        .form-input {
          width: 100%;
          padding: 10px 14px;
          border: 1.5px solid #e5e7eb;
          border-radius: 12px;
          font-size: 14px;
          font-family: inherit;
          outline: none;
        }
        .form-input:focus {
          border-color: #111827;
        }
        @media (max-width: 768px) {
          .header {
            flex-direction: column;
            align-items: flex-start !important;
          }
          .nav-tabs {
            width: 100%;
            justify-content: space-between;
          }
          .stats-grid {
            grid-template-columns: 1fr !important;
          }
          .projects-grid {
            grid-template-columns: 1fr !important;
          }
          .slide-panel {
            width: 100% !important;
          }
        }
        /* Custom scrollbar for horizontal Kanban */
        .kanban-wrapper::-webkit-scrollbar {
          height: 6px;
        }
        .kanban-wrapper::-webkit-scrollbar-track {
          background: #e5e7eb;
          border-radius: 999px;
        }
        .kanban-wrapper::-webkit-scrollbar-thumb {
          background: #9ca3af;
          border-radius: 999px;
        }
      `}</style>
    </>
  )
}