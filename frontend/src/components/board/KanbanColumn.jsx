import React from 'react'
import { Draggable } from '@dnd-kit/core'

export default function KanbanColumn({ id, title, tasks }) {
  return (
    <div className="kanban-column">
      <div className="kanban-column-header">
        <span className="kanban-column-title">{title}</span>
        <span className={`kanban-count ${tasks.length > 5 ? 'warning' : ''}`}>
          {tasks.length}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {tasks.map(task => (
          <DraggableTask key={task.id} id={task.id} task={task} />
        ))}
      </div>
      {id === 'TODO' && (
        <button 
          className="btn-primary" 
          style={{ width: '100%', marginTop: 12, background: 'transparent', color: '#6b7280', border: '1px dashed #e5e7eb' }}
        >
          + Add Task
        </button>
      )}
    </div>
  )
}

function DraggableTask({ id, task }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id })
  
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined
  
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'HIGH': return '#ef4444'
      case 'MEDIUM': return '#f97316'
      case 'LOW': return '#3b82f6'
      default: return '#9ca3af'
    }
  }
  
  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`task-card priority-${task.priority.toLowerCase()}`}
    >
      <div className="task-title">{task.title}</div>
      <div className="task-description">{task.description}</div>
      <div className="task-meta">
        <div 
          className="avatar" 
          style={{ width: 24, height: 24, fontSize: 10, background: '#7c3aed' }}
        >
          {task.assignee_id?.slice(-2) || '?'}
        </div>
        <span style={{ fontSize: 12, color: '#9ca3af' }}>
          {task.story_points} pts
        </span>
        {task.due_date && (
          <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 'auto' }}>
            {new Date(task.due_date).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  )
}