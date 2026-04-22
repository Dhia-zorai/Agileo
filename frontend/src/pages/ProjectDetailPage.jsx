import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProjectStore, useTaskStore, useSprintStore } from '../store/index.js'
import api from '../api/client'
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core'
import { useDraggable } from '@dnd-kit/core'
import KanbanColumn from '../components/board/KanbanColumn'

export default function ProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentProject, fetchProjects } = useProjectStore()
  const { tasks, fetchTasks, updateTaskStatus } = useTaskStore()
  const { sprints, fetchSprints } = useSprintStore()
  const [activeTab, setActiveTab] = useState('board')
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    loadProjectData()
  }, [id])
  
  const loadProjectData = async () => {
    setLoading(true)
    try {
      const [projRes, sprintsRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/projects/${id}/sprints`),
      ])
      await fetchSprints(id)
      const activeSprint = sprintsRes.data.find(s => s.status === 'ACTIVE')
      if (activeSprint) {
        await fetchTasks(activeSprint.id)
      }
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }
  
  const handleDragEnd = async (event) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      await updateTaskStatus(active.id, over.id)
    }
  }
  
  const tabs = [
    { id: 'board', label: 'Board' },
    { id: 'backlog', label: 'Backlog' },
    { id: 'sprints', label: 'Sprints' },
    { id: 'members', label: 'Members' },
    { id: 'chat', label: 'Chat' },
    { id: 'reports', label: 'Reports' },
  ]
  
  const columns = [
    { id: 'TODO', label: 'To Do' },
    { id: 'IN_PROGRESS', label: 'In Progress' },
    { id: 'IN_REVIEW', label: 'In Review' },
    { id: 'DONE', label: 'Done' },
  ]

  if (loading) {
    return (
      <div className="empty-state">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <span 
          style={{ 
            width: 32, 
            height: 32, 
            borderRadius: 8, 
            background: currentProject?.color || '#7c3aed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 600,
            color: '#fff'
          }}
        >
          {currentProject?.icon || 'AP'}
        </span>
        <div>
          <h1 className="hero-title">{currentProject?.name || 'Project'}</h1>
          <p style={{ fontSize: 14, color: '#6b7280' }}>{currentProject?.description}</p>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="filter-tabs" style={{ marginBottom: 24 }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`pill-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Board View */}
      {activeTab === 'board' && (
        <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
          <div className="kanban-board">
            {columns.map(col => (
              <KanbanColumn 
                key={col.id} 
                id={col.id} 
                title={col.label} 
                tasks={tasks.filter(t => t.status === col.id)}
              />
            ))}
          </div>
        </DndContext>
      )}
      
      {/* Backlog View */}
      {activeTab === 'backlog' && (
        <BacklogView projectId={id} />
      )}
      
      {/* Sprints View */}
      {activeTab === 'sprints' && (
        <SprintsView projectId={id} sprints={sprints} />
      )}
      
      {/* Members View */}
      {activeTab === 'members' && (
        <MembersView projectId={id} />
      )}
      
      {/* Chat View */}
      {activeTab === 'chat' && (
        <ChatView projectId={id} />
      )}
      
      {/* Reports View */}
      {activeTab === 'reports' && (
        <ReportsView projectId={id} />
      )}
    </div>
  )
}

function BacklogView({ projectId }) {
  const [stories, setStories] = useState([])
  
  useEffect(() => {
    api.get(`/projects/${projectId}/stories`).then(r => setStories(r.data))
  }, [projectId])
  
  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Product Backlog</h2>
        <button className="btn-primary">+ Add Story</button>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Story</th>
            <th>Priority</th>
            <th>Points</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {stories.map(story => (
            <tr key={story.id}>
              <td>
                <div style={{ fontWeight: 500 }}>As a {story.as_a}, I want {story.i_want}, so that {story.so_that}</div>
              </td>
              <td>
                <span className={`badge badge-${story.priority === 'MUST' ? 'red' : story.priority === 'SHOULD' ? 'orange' : 'blue'}`}>
                  {story.priority}
                </span>
              </td>
              <td>{story.story_points}</td>
              <td>{story.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SprintsView({ projectId, sprints }) {
  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Sprints</h2>
        <button className="btn-primary">+ New Sprint</button>
      </div>
      <div style={{ display: 'grid', gap: 12 }}>
        {sprints.map(sprint => (
          <div key={sprint.id} style={{ padding: 16, border: '1px solid var(--border)', borderRadius: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>{sprint.name}</span>
              <span className={`badge badge-${sprint.status === 'ACTIVE' ? 'emerald' : sprint.status === 'COMPLETED' ? 'blue' : 'orange'}`}>
                {sprint.status}
              </span>
            </div>
            <p style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{sprint.goal}</p>
            <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 8 }}>
              {sprint.start_date} - {sprint.end_date}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function MembersView({ projectId }) {
  const [members, setMembers] = useState([])
  
  useEffect(() => {
    api.get(`/projects/${projectId}/members`).then(r => setMembers(r.data))
  }, [projectId])
  
  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Team Members</h2>
        <button className="btn-primary">+ Invite</button>
      </div>
      <div style={{ display: 'grid', gap: 12 }}>
        {members.map(member => (
          <div key={member.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="avatar" style={{ background: member.avatar_color }}>
              {member.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div style={{ fontWeight: 500 }}>{member.name}</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>{member.email}</div>
            </div>
            <span className="badge badge-violet" style={{ marginLeft: 'auto' }}>{member.role}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ChatView({ projectId }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  
  useEffect(() => {
    loadMessages()
    const interval = setInterval(loadMessages, 5000)
    return () => clearInterval(interval)
  }, [projectId])
  
  const loadMessages = () => {
    api.get(`/projects/${projectId}/messages`).then(r => setMessages(r.data))
  }
  
  const sendMessage = async () => {
    if (!input.trim()) return
    await api.post(`/projects/${projectId}/messages`, {
      user_id: 'user-alice',
      content: input
    })
    setInput('')
    loadMessages()
  }
  
  return (
    <div className="card" style={{ height: 500, display: 'flex', flexDirection: 'column' }}>
      <div className="card-header">
        <h2 className="card-title">Team Chat</h2>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ marginBottom: 12 }}>
            <span style={{ fontWeight: 500, fontSize: 12 }}>{msg.user_id}</span>
            <p style={{ background: '#f3f4f6', padding: 8, borderRadius: 8, marginTop: 4 }}>{msg.content}</p>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input 
          className="form-input" 
          placeholder="Type a message..." 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button className="btn-primary" onClick={sendMessage}>Send</button>
      </div>
    </div>
  )
}

function ReportsView({ projectId }) {
  const [burndown, setBurndown] = useState([])
  
  useEffect(() => {
    api.get('/sprints/sprint-agileo-1/burndown').then(r => setBurndown(r.data)).catch(() => {})
  }, [projectId])
  
  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Sprint Burndown</h2>
      </div>
      {burndown.length > 0 ? (
        <div style={{ height: 200, display: 'flex', alignItems: 'flex-end', gap: 4 }}>
          {burndown.map((point, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ height: `${(point.actual / (burndown[0]?.ideal || 1)) * 100}%`, width: '100%', background: '#3b82f6', borderRadius: 4 }}></div>
              <span style={{ fontSize: 8, marginTop: 4 }}>{point.day?.slice(5)}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>No burndown data available</p>
        </div>
      )}
    </div>
  )
}