import React from 'react'

export default function SettingsPage() {
  return (
    <div className="fade-in">
      <h1 className="hero-title">Settings</h1>
      <p className="hero-subtitle">Configure your Agileo experience</p>
      
      <div className="card" style={{ maxWidth: 600 }}>
        <h2 className="card-title" style={{ marginBottom: 16 }}>Preferences</h2>
        
        <div className="form-group">
          <label className="form-label">Display Name</label>
          <input className="form-input" defaultValue="Alice Martin" />
        </div>
        
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" defaultValue="alice.martin@agileo.app" disabled />
        </div>
        
        <div className="form-group">
          <label className="form-label">Theme</label>
          <select className="form-input">
            <option>Light</option>
            <option>Dark</option>
            <option>System</option>
          </select>
        </div>
        
        <button className="btn-primary">Save Changes</button>
      </div>
    </div>
  )
}