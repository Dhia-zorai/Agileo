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
      const data = await fetch('http://localhost:8000/api/projects').then(r => r.json())
      setProjects(data)
    } catch (e) {
      console.error(e)
    }
  }
  
  const openSlidePanel = (content) => setSlidePanel({ open: true, content })
  const closeSlidePanel = () => setSlidePanel({ open: false, content: null })
  
  // CRUD: Projects
  const handleProjectCreate = async (data) => {
    await fetch('http://localhost:8000/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, status: 'ACTIVE', members: [], sprint_ids: [] })
    })
    fetchProjects()
    closeSlidePanel()
  }
  
  const handleProjectEdit = async (id, data) => {
    await fetch(`http://localhost:8000/api/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    fetchProjects()
    if (selectedProject?.id === id) {
      setSelectedProject({ ...selectedProject, ...data })
    }
    closeSlidePanel()
  }
  
  const handleProjectDelete = async (id) => {
    if (!confirm(t('project.deleteConfirm'))) return
    await fetch(`http://localhost:8000/api/projects/${id}`, { method: 'DELETE' })
    fetchProjects()
    setSelectedProject(null)
    setView('dashboard')
  }
  
  // CRUD: Tasks
  const handleTaskCreate = async (projectId, sprintId, data) => {
    await fetch(`http://localhost:8000/api/sprints/${sprintId}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, project_id: projectId, sprint_id: sprintId })
    })
    closeSlidePanel()
  }
  
  const handleTaskEdit = async (taskId, data) => {
    await fetch(`http://localhost:8000/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    closeSlidePanel()
  }
  
  const handleTaskDelete = async (taskId) => {
    await fetch(`http://localhost:8000/api/tasks/${taskId}`, { method: 'DELETE' })
    closeSlidePanel()
  }
  
  // CRUD: Members
  const handleInviteMember = async (projectId, userId) => {
    await fetch(`http://localhost:8000/api/projects/${projectId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId })
    })
    closeSlidePanel()
  }
  
  const handleRemoveMember = async (projectId, userId) => {
    await fetch(`http://localhost:8000/api/projects/${projectId}/members/${userId}`, {
      method: 'DELETE'
    })
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
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: 24 }}>
        
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
            onEdit={(p) => openSlidePanel({ type: 'projectForm', onSave: (data) => handleProjectEdit(p.id, data), editData: p })}
            onDelete={(id) => handleProjectDelete(id)}
          />
        )}
        
        {view === 'project' && selectedProject && (
          <ProjectDetailView 
            project={selectedProject}
            onBack={() => { setView('dashboard'); setSelectedProject(null) }}
            onTaskCreate={(projectId, sprintId, data) => handleTaskCreate(projectId, sprintId, data)}
            onTaskEdit={(task) => openSlidePanel({ type: 'taskForm', onSave: (data) => handleTaskEdit(task.id, data), editData: task })}
            onTaskDelete={(taskId) => handleTaskDelete(taskId)}
            onInviteMember={(projectId, userId) => handleInviteMember(projectId, userId)}
            onRemoveMember={(projectId, userId) => handleRemoveMember(projectId, userId)}
            openSlidePanel={openSlidePanel}
          />
        )}
        
        {view === 'my-tasks' && <MyTasksView />}
        {view === 'team' && <TeamView />}
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
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>{t('app.title')}</h1>
        <p style={{ fontSize: 14, color: '#6b7280' }}>{t('app.subtitle')}</p>
      </div>
      
      <div style={{ display: 'flex', gap: 8, background: '#fff', padding: 6, borderRadius: 999, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
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
    fetch('http://localhost:8000/api/tasks').then(r => r.json()).then(setTasks)
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard value={stats.myTasks} label={t('stats.myTasks')} />
        <StatCard value={stats.inProgress} label={t('stats.inProgress')} color="#f97316" />
        <StatCard value={stats.completed} label={t('stats.completed')} color="#10b981" />
      </div>
      
      {/* Projects */}
      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>{t('project.members')}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {projects.map(p => (
          <div 
            key={p.id}
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
  
  useEffect(() => {
    fetch(`http://localhost:8000/api/projects/${project.id}/sprints`).then(r => r.json()).then(setSprints)
    fetch(`http://localhost:8000/api/projects/${project.id}/members`).then(r => r.json()).then(setMembers)
  }, [project.id])
  
  const activeSprint = sprints.find(s => s.status === 'ACTIVE')
  
  useEffect(() => {
    if (activeSprint) {
      fetch(`http://localhost:8000/api/sprints/${activeSprint.id}/tasks`)
        .then(r => r.json())
        .then(setTasks)
    }
  }, [activeSprint])
  
  const handleDragEnd = async (taskId, newStatus) => {
    await fetch(`http://localhost:8000/api/tasks/${taskId}/status`, {
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
      onSave: (data) => onTaskCreate(project.id, activeSprint?.id, data)
    })
  }
  
  const handleInvite = () => {
    openSlidePanel({
      type: 'inviteMember',
      projectId: project.id,
      currentMembers: members,
      onSave: (userId) => onInviteMember(project.id, userId)
    })
  }
  
  const handleRemoveMember = (userId) => {
    if (confirm(t('project.deleteConfirm'))) {
      onRemoveMember(project.id, userId)
    }
  }
  
  const tabs = [
    { id: 'board', label: t('tabs.board') },
    { id: 'backlog', label: t('tabs.backlog') },
    { id: 'members', label: t('tabs.members') }
  ]
  
  const columns = [
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
          columns={columns} 
          onDragEnd={handleDragEnd}
          onAddTask={handleAddTask}
          onTaskEdit={onTaskEdit}
          onTaskDelete={onTaskDelete}
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
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
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
    fetch(`http://localhost:8000/api/projects/${projectId}/stories`)
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
            <div style={{ fontWeight: 500, marginBottom: 4 }}>As a {story.as_a}, I want {story.i_want}, so that {story.so_that}</div>
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
    fetch('http://localhost:8000/api/tasks?assignee_id=user-alice').then(r => r.json()).then(setTasks)
    fetch('http://localhost:8000/api/projects').then(r => r.json()).then(setProjects)
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

function TeamView() {
  const [members, setMembers] = useState([])
  
  useEffect(() => {
    fetch('http://localhost:8000/api/users').then(r => r.json()).then(setMembers)
  }, [])
  
  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>{t('nav.team')}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {members.map(member => (
          <div key={member.id} style={{ padding: 20, borderRadius: 20, background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', textAlign: 'center' }}>
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
      fetch('http://localhost:8000/api/users').then(r => r.json()).then(setUsers)
    }
    if (content?.type === 'taskForm' && content.editData) {
      setTaskForm(content.editData)
    }
  }, [content])
  
  if (!isOpen) return null
  
  const handleSubmit = () => {
    if (content?.type === 'taskForm') {
      content.onSave(taskForm)
    } else if (content?.type === 'inviteMember') {
      content.onSave(formData.user_id)
    }
  }
  
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', zIndex: 999 }} />
      <div style={{ position: 'fixed', top: 0, right: 0, width: 420, height: '100vh', background: '#fff', zIndex: 1000, padding: 24, overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>
            {content?.type === 'projectForm' ? content?.editData ? t('project.edit') : t('project.new') : 
             content?.type === 'taskForm' ? content?.editData ? t('task.edit') : t('task.new') : 
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
                value={formData.name || content?.editData?.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('project.name')}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#6b7280', marginBottom: 4 }}>{t('project.description')}</label>
              <textarea 
                className="form-input"
                value={formData.description || content?.editData?.description || ''}
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
                      border: formData.color === color || (content?.editData?.color === color && !formData.color) ? '3px solid #111827' : 'none',
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
                value={formData.icon || content?.editData?.icon || ''}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value.toUpperCase().slice(0, 2) })}
                placeholder="AP"
                maxLength={2}
              />
            </div>
            <button 
              onClick={() => content.onSave({ ...formData, ...content?.editData })}
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
                value={taskForm.priority}
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
                value={taskForm.due_date || ''}
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
      `}</style>
    </>
  )
}