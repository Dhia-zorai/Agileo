import React, { useState } from 'react'
import { Search, Bell } from 'lucide-react'
import { useProjectStore } from '../../store/index.js'

const tabs = ['Today', 'This Week', 'This Month', 'Reports']

export default function TopBar() {
  const [activeTab, setActiveTab] = useState('This Week')
  const [search, setSearch] = useState('')
  const { projects } = useProjectStore()
  const currentUser = { name: 'Alice Martin', avatar_color: '#7c3aed' }
  
  const getInitials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase()

  return (
    <header className="top-bar">
      <div className="filter-tabs">
        {tabs.map(tab => (
          <button
            key={tab}
            className={`pill-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      
      <div className="header-right">
        <div className="search-bar">
          <Search size={16} color="#9ca3af" />
          <input 
            type="text" 
            placeholder="Search..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <button className="notification-btn">
          <Bell size={18} />
        </button>
        
        <div 
          className="avatar" 
          style={{ background: currentUser.avatar_color }}
          title={currentUser.name}
        >
          {getInitials(currentUser.name)}
        </div>
      </div>
    </header>
  )
}