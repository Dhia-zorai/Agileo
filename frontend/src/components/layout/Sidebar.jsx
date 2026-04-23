import React from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, FolderKanban, ListTodo, Users, BarChart2, Settings } from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/my-tasks', icon: ListTodo, label: 'Mes tâches' },
  { to: '/members', icon: Users, label: 'Members' },
  { to: '/reports', icon: BarChart2, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <span className="sidebar-logo">agileo</span>
      {navItems.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => `sidebar-icon ${isActive ? 'active' : ''}`}
          title={item.label}
        >
          <item.icon size={20} />
        </NavLink>
      ))}
    </aside>
  )
}