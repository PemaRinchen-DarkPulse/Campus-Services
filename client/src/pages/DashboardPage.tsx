import React, { useState } from 'react';
import './DashboardPage.css';
import ReportsPage from './ReportsPage';
import AllIssuesPage from './AllIssuesPage';
import ManageUsersPage from './ManageUsersPage';
import BookingsPage from './BookingsPage';
import InventoryPage from './InventoryPage';
import OrderHistoryPage from './OrderHistoryPage';
import MyWorkPage from './MyWorkPage';
import WorkHistoryPage from './WorkHistoryPage';
import RoomsPage from './RoomsPage';
import DashboardHome from './DashboardHome';

export default function DashboardPage({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [openReportModal, setOpenReportModal] = useState(false);

  const handleNewReport = () => {
    setActiveTab('reports');
    setOpenReportModal(true);
  };

  const displayName = user?.name || 'Campus User';
  const displayEmail = user?.email || 'user@example.com';
  const role = user?.role?.toLowerCase();
  const isAdmin = role === 'admin';
  const isReporter = role === 'reporter' || role === 'dormparent';
  const isDormParent = role === 'dormparent';
  const isMaintenanceWorker = role === 'maintenance' || role === 'maintiance';
  const isStoreManager = role === 'storemanager' || role === 'store manger';

  return (
    <div className="dashboard-container">
      
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="logo-section">
          <div className="logo-text">
            <strong>Manage Campus</strong>
            <span>Maintenance made simple</span>
          </div>
        </div>

        <div className="nav-section" style={{ display: isAdmin ? 'block' : 'none' }}>
          <div className="nav-section-title">ADMIN</div>
          <a href="#" className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); }}>
            <svg viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" rx="1" /><rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" rx="1" /><rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" rx="1" /><rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" rx="1" /></svg>
            Dashboard
          </a>
          <a href="#" className={`nav-item ${activeTab === 'manage-users' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('manage-users'); }}>
            <svg viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 0 0-4-4H5c-2.2 0-4 1.8-4 4v2" stroke="currentColor" strokeWidth="2"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/><path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="2"/><path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2"/></svg>
            Manage User
          </a>
          <a href="#" className={`nav-item ${activeTab === 'bookings' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('bookings'); }}>
            <svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/><line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/><line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/><line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/></svg>
            Booking Request
          </a>
          <a href="#" className={`nav-item ${activeTab === 'all-issues' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('all-issues'); }}>
            <svg viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2"/><polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2"/><line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2"/><line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2"/></svg>
            All Issues
          </a>
        </div>

        <div className="nav-section" style={{ display: isReporter ? 'block' : 'none' }}>
          <div className="nav-section-title">REPORTER</div>
          <a href="#" className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); }}>
            <svg viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" rx="1" /><rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" rx="1" /><rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" rx="1" /><rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" rx="1" /></svg>
            Dashboard
          </a>
          <a href="#" className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('reports'); }}>
            <svg viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2"/><polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2"/><line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2"/><line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2"/></svg>
            My Report
          </a>
          <a href="#" className={`nav-item ${activeTab === 'all-issues' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('all-issues'); }}>
            <svg viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2"/><polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2"/><line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2"/><line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2"/></svg>
            All Issues
          </a>
          {isDormParent && (
            <a href="#" className={`nav-item ${activeTab === 'rooms' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('rooms'); }}>
              <svg viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2"/><polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" strokeWidth="2"/></svg>
              Rooms
            </a>
          )}
        </div>

        <div className="nav-section" style={{ display: isMaintenanceWorker ? 'block' : 'none' }}>
          <div className="nav-section-title">MAINTENANCE</div>
          <a href="#" className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); }}>
            <svg viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" rx="1" /><rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" rx="1" /><rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" rx="1" /><rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" rx="1" /></svg>
            Dashboard
          </a>
          <a href="#" className={`nav-item ${activeTab === 'all-issues' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('all-issues'); }}>
            <svg viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2"/><polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2"/><line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2"/><line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2"/></svg>
            All Issues
          </a>
          <a href="#" className={`nav-item ${activeTab === 'my-work' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('my-work'); }}>
            <svg viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 0 0-4-4H5c-2.2 0-4 1.8-4 4v2" stroke="currentColor" strokeWidth="2"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/></svg>
            My Work
          </a>
          <a href="#" className={`nav-item ${activeTab === 'work-history' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('work-history'); }}>
            <svg viewBox="0 0 24 24" fill="none"><path d="M12 8v5l3 3" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/></svg>
            Work History
          </a>
        </div>

        <div className="nav-section" style={{ display: isStoreManager ? 'block' : 'none' }}>
          <div className="nav-section-title">STORE MANAGER</div>
          <a href="#" className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); }}>
            <svg viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" rx="1" /><rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" rx="1" /><rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" rx="1" /><rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" rx="1" /></svg>
            Dashboard
          </a>
          <a href="#" className={`nav-item ${activeTab === 'inventory' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('inventory'); }}>
            <svg viewBox="0 0 24 24" fill="none"><path d="M3 6h18" stroke="currentColor" strokeWidth="2"/><path d="M3 12h18" stroke="currentColor" strokeWidth="2"/><path d="M3 18h18" stroke="currentColor" strokeWidth="2"/></svg>
            Inventory
          </a>
          <a href="#" className={`nav-item ${activeTab === 'order-history' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('order-history'); }}>
            <svg viewBox="0 0 24 24" fill="none"><path d="M12 8v5l3 3" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/></svg>
            Order History
          </a>
        </div>

        <div className="nav-section" style={{ display: !isAdmin && !isReporter && !isMaintenanceWorker && !isStoreManager ? 'block' : 'none' }}>
          <div className="nav-section-title">OVERVIEW</div>
          <a href="#" className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); }}>
            <svg viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" rx="1" /><rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2" rx="1" /><rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" rx="1" /><rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2" rx="1" /></svg>
            Dashboard
          </a>
        </div>

        <div className="nav-section" style={{ display: !isAdmin && !isReporter && !isMaintenanceWorker && !isStoreManager ? 'block' : 'none' }}>
          <div className="nav-section-title">RECRUITMENT</div>
          <a href="#" className="nav-item">
            <svg viewBox="0 0 24 24" fill="none"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="currentColor" strokeWidth="2"/><polyline points="3.27 6.96 12 12.01 20.73 6.96" stroke="currentColor" strokeWidth="2"/><line x1="12" y1="22.08" x2="12" y2="12" stroke="currentColor" strokeWidth="2"/></svg>
            Jobs
          </a>
          <a href="#" className="nav-item">
            <svg viewBox="0 0 24 24" fill="none"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" stroke="currentColor" strokeWidth="2"/></svg>
            Job offers
          </a>
          <a href="#" className="nav-item">
            <svg viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2"/><polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2"/><line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2"/><line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2"/><polyline points="10 9 9 9 8 9" stroke="currentColor" strokeWidth="2"/></svg>
            Screening Questions
          </a>
        </div>

        <div className="nav-section" style={{ display: !isAdmin && !isReporter && !isMaintenanceWorker && !isStoreManager ? 'block' : 'none' }}>
          <div className="nav-section-title">PROCESS</div>
          <a href="#" className="nav-item">
            <svg viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/><line x1="3" y1="9" x2="21" y2="9" stroke="currentColor" strokeWidth="2"/><line x1="9" y1="21" x2="9" y2="9" stroke="currentColor" strokeWidth="2"/></svg>
            Workflows
          </a>
          <a href="#" className="nav-item">
            <svg viewBox="0 0 24 24" fill="none"><path d="M16 21v-2a4 4 0 0 0-4-4H5c-2.2 0-4 1.8-4 4v2" stroke="currentColor" strokeWidth="2"/><circle cx="8.5" cy="7" r="4" stroke="currentColor" strokeWidth="2"/><polyline points="17 11 19 13 23 9" stroke="currentColor" strokeWidth="2"/></svg>
            Onboarding
          </a>
        </div>

        <div className="nav-section" style={{ display: !isAdmin && !isReporter && !isMaintenanceWorker && !isStoreManager ? 'block' : 'none' }}>
          <div className="nav-section-title">OTHERS</div>
          <a href="#" className="nav-item">
            <svg viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 0 0-4-4H5c-2.2 0-4 1.8-4 4v2" stroke="currentColor" strokeWidth="2"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/><path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="2"/><path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2"/></svg>
            Team
          </a>
          <a href="#" className="nav-item">
            <svg viewBox="0 0 24 24" fill="none"><line x1="18" y1="20" x2="18" y2="10" stroke="currentColor" strokeWidth="2"/><line x1="12" y1="20" x2="12" y2="4" stroke="currentColor" strokeWidth="2"/><line x1="6" y1="20" x2="6" y2="14" stroke="currentColor" strokeWidth="2"/></svg>
            Analytics
          </a>
        </div>

        <div className="nav-section sidebar-common">
          <a href="#" className="nav-item">
            <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="2"/></svg>
            Settings & Integrations
          </a>
          <a href="#" className="nav-item">
            <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="currentColor" strokeWidth="2"/><line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2"/></svg>
            Help
          </a>
        </div>

        <div className="user-profile">
          <div className="user-profile-info">
            <img src="https://i.pravatar.cc/150?u=campus-user" alt={displayName} className="user-avatar" />
            <div className="user-texts">
              <strong>{displayName}</strong>
              <span>{displayEmail}</span>
            </div>
          </div>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </div>
      </aside>

      {/* MAIN LAYOUT */}
      <main className="main-wrapper">
        
        {/* HEADER */}
        <header className="header">
          <div className="header-title">{
            activeTab === 'dashboard' ? 'Dashboard' :
            activeTab === 'manage-users' ? 'Manage Users' :
            activeTab === 'bookings' ? 'Booking Requests' :
            activeTab === 'all-issues' ? 'All Issues' :
            activeTab === 'reports' ? 'My Reports' :
            activeTab === 'rooms' ? 'Room Assignments' :
            activeTab === 'my-work' ? 'My Work' :
            activeTab === 'work-history' ? 'Work History' :
            activeTab === 'inventory' ? 'Inventory' :
            activeTab === 'order-history' ? 'Order History' :
            'Dashboard'
          }</div>
          <div className="header-actions">
            <svg className="header-icon" viewBox="0 0 24 24" fill="none"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2"/><polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2"/></svg>
            
            <div style={{ position: 'relative' }}>
              <svg className="header-icon" viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2"/><path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2"/></svg>
              <div style={{ position: 'absolute', top: '-1px', right: '-1px', width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%', border: '2px solid white' }}></div>
            </div>

            <button className="btn-invite" onClick={onLogout}>
              Logout
            </button>
          </div>
        </header>

        {/* BODY */}
        {activeTab === 'dashboard' ? (
          <DashboardHome user={user} setActiveTab={setActiveTab} onNewReport={handleNewReport} />
        ) : activeTab === 'dashboard-UNUSED' ? (
          <div className="content-body">
            <div className="content-left">
              
              {/* STATS */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-card-header">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none"><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/><line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2"/></svg>
                  Active Jobs
                </div>
                <div className="stat-card-value">
                  <h2>05</h2>
                  <a href="#" className="stat-link">See details <svg viewBox="0 0 24 24" width="10" height="10" fill="none"><polyline points="9 18 15 12 9 6" stroke="currentColor" strokeWidth="2"/></svg></a>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-card-header">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none"><path d="M17 21v-2a4 4 0 0 0-4-4H5c-2.2 0-4 1.8-4 4v2" stroke="currentColor" strokeWidth="2"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/><line x1="19" y1="8" x2="19" y2="14" stroke="currentColor" strokeWidth="2"/><line x1="22" y1="11" x2="16" y2="11" stroke="currentColor" strokeWidth="2"/></svg>
                  New Applicants
                </div>
                <div className="stat-card-value">
                  <h2>143</h2>
                  <a href="#" className="stat-link">See details <svg viewBox="0 0 24 24" width="10" height="10" fill="none"><polyline points="9 18 15 12 9 6" stroke="currentColor" strokeWidth="2"/></svg></a>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-card-header">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/><line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/><line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/><line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/></svg>
                  Interviews Scheduled
                </div>
                <div className="stat-card-value">
                  <h2>24</h2>
                  <a href="#" className="stat-link">See details <svg viewBox="0 0 24 24" width="10" height="10" fill="none"><polyline points="9 18 15 12 9 6" stroke="currentColor" strokeWidth="2"/></svg></a>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-card-header">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/><line x1="3" y1="9" x2="21" y2="9" stroke="currentColor" strokeWidth="2"/><line x1="9" y1="21" x2="9" y2="9" stroke="currentColor" strokeWidth="2"/></svg>
                  Offer Sent
                </div>
                <div className="stat-card-value">
                  <h2>15</h2>
                  <a href="#" className="stat-link">See details <svg viewBox="0 0 24 24" width="10" height="10" fill="none"><polyline points="9 18 15 12 9 6" stroke="currentColor" strokeWidth="2"/></svg></a>
                </div>
              </div>
            </div>

            {/* CHARTS */}
            <div className="charts-grid">
              
              {/* DONUT CHART */}
              <div className="chart-card">
                <div className="card-title">Applicants by stage</div>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'space-around' }}>
                  
                  <div style={{position: 'relative'}}>
                     <span style={{position:'absolute', top: '10px', left: '-20px', fontSize: '11px', color: '#6b7280'}}>8 <span>(4%)</span></span>
                     <span style={{position:'absolute', top: '10px', right: '-20px', fontSize: '11px', color: '#6b7280'}}>23 <span>(12%)</span></span>
                     <span style={{position:'absolute', bottom: '20px', right: '-25px', fontSize: '11px', color: '#6b7280'}}>17 <span>(8%)</span></span>
                     <span style={{position:'absolute', bottom: '20px', left: '-30px', fontSize: '11px', color: '#6b7280'}}>72 <span>(76%)</span></span>
                    
                    <div className="donut-container">
                      <div className="donut">
                        <div className="donut-inner">
                          <span>Total Applicant</span>
                          <strong>120</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
                <div className="donut-legend">
                  <span className="legend-item"><div className="dot dot-pink"></div> Screening</span>
                  <span className="legend-item"><div className="dot dot-green"></div> Interview</span>
                  <span className="legend-item"><div className="dot dot-yellow"></div> Offer Sent</span>
                  <span className="legend-item"><div className="dot dot-blue"></div> Onboarding</span>
                </div>
              </div>

              {/* BAR CHART */}
              <div className="chart-card">
                <div className="card-title" style={{marginBottom: '0'}}>Job level</div>
                <div style={{marginTop: '10px', marginBottom: '10px'}}>
                  <span className="job-level-total">112</span> 
                  <span className="job-level-sub">Total Employees</span>
                </div>
                
                <div className="stacked-bar">
                  <div className="stacked-bar-segment lvl-bg-pink" style={{width: '48%'}}>48%</div>
                  <div className="stacked-bar-segment lvl-bg-green" style={{width: '32%'}}>32%</div>
                  <div className="stacked-bar-segment lvl-bg-orange" style={{width: '12%'}}>12%</div>
                  <div className="stacked-bar-segment lvl-bg-blue" style={{width: '8%'}}>8%</div>
                </div>

                <div className="job-level-list">
                  <div className="list-item">
                    <div className="list-item-left"><div className="dot dot-pink"></div> Full time</div>
                    <div className="list-item-right">72</div>
                  </div>
                  <div className="list-item">
                    <div className="list-item-left"><div className="dot dot-green"></div> Freelancer</div>
                    <div className="list-item-right">23</div>
                  </div>
                  <div className="list-item">
                    <div className="list-item-left"><div className="dot dot-yellow"></div> Part time</div>
                    <div className="list-item-right">12</div>
                  </div>
                  <div className="list-item">
                    <div className="list-item-left"><div className="dot dot-blue"></div> Internship</div>
                    <div className="list-item-right">8</div>
                  </div>
                </div>
              </div>

            </div>

            {/* TABLE */}
            <div className="table-card">
              <div className="card-header-flex">
                <div className="card-title" style={{marginBottom: 0}}>Recent Job Posts</div>
                <a href="#" className="view-all">View all <svg viewBox="0 0 24 24" width="12" height="12" fill="none"><polyline points="9 18 15 12 9 6" stroke="currentColor" strokeWidth="2"/></svg></a>
              </div>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th className="td-no">#No</th>
                    <th><svg viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/><line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2"/></svg> Job Title</th>
                    <th>Posted Date</th>
                    <th><svg viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 0 0-4-4H5c-2.2 0-4 1.8-4 4v2" stroke="currentColor" strokeWidth="2"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/><line x1="19" y1="8" x2="19" y2="14" stroke="currentColor" strokeWidth="2"/><line x1="22" y1="11" x2="16" y2="11" stroke="currentColor" strokeWidth="2"/></svg> Vacancy</th>
                    <th><svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/><line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/><line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/><line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/></svg> Job Type</th>
                    <th><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><polyline points="12 6 12 12 16 14" stroke="currentColor" strokeWidth="2"/></svg> Experience</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="td-no">#01</td>
                    <td className="td-title">Senior Frontend Developer</td>
                    <td>1 Feb, 25</td>
                    <td>1</td>
                    <td><span className="td-badge badge-part"><div className="dot" style={{width:'4px',height:'4px',backgroundColor:'#db2777'}}></div> Part time</span></td>
                    <td>1</td>
                    <td className="td-action">$8 <span style={{marginLeft:'20px'}}>⋮</span></td>
                  </tr>
                  <tr>
                    <td className="td-no">#02</td>
                    <td className="td-title">Product Manager</td>
                    <td>2 Feb, 25</td>
                    <td>2</td>
                    <td><span className="td-badge badge-full"><div className="dot" style={{width:'4px',height:'4px',backgroundColor:'#2563eb'}}></div> Full time</span></td>
                    <td>2</td>
                    <td className="td-action">$3 <span style={{marginLeft:'20px'}}>⋮</span></td>
                  </tr>
                  <tr>
                    <td className="td-no">#03</td>
                    <td className="td-title">UX Designer</td>
                    <td>15 Feb, 25</td>
                    <td>5</td>
                    <td><span className="td-badge badge-intern"><div className="dot" style={{width:'4px',height:'4px',backgroundColor:'#d97706'}}></div> Internship</span></td>
                    <td>5</td>
                    <td className="td-action">$5 <span style={{marginLeft:'20px'}}>⋮</span></td>
                  </tr>
                  <tr>
                    <td className="td-no">#04</td>
                    <td className="td-title">UI Designer</td>
                    <td>15 Feb, 25</td>
                    <td>1</td>
                    <td><span className="td-badge badge-full"><div className="dot" style={{width:'4px',height:'4px',backgroundColor:'#2563eb'}}></div> Full time</span></td>
                    <td>1</td>
                    <td className="td-action">$1 <span style={{marginLeft:'20px'}}>⋮</span></td>
                  </tr>
                  <tr>
                    <td className="td-no">#05</td>
                    <td className="td-title">Content Strategist</td>
                    <td>23 Feb, 25</td>
                    <td>2</td>
                    <td><span className="td-badge badge-part"><div className="dot" style={{width:'4px',height:'4px',backgroundColor:'#db2777'}}></div> Part time</span></td>
                    <td>2</td>
                    <td className="td-action">$3 <span style={{marginLeft:'20px'}}>⋮</span></td>
                  </tr>
                  <tr>
                    <td className="td-no">#06</td>
                    <td className="td-title">Marketing Coordinator</td>
                    <td>25 Feb, 25</td>
                    <td>5</td>
                    <td><span className="td-badge badge-full"><div className="dot" style={{width:'4px',height:'4px',backgroundColor:'#2563eb'}}></div> Full time</span></td>
                    <td>5</td>
                    <td className="td-action">$8 <span style={{marginLeft:'20px'}}>⋮</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* TIME TO HIRE TREND */}
            <div className="chart-time">
              <div className="chart-time-header">
                <div className="card-title" style={{marginBottom: 0}}>Time to Hire-Trend</div>
                <div className="chart-legend">
                  <span><div className="dot" style={{backgroundColor: '#ef4444'}}></div> This year</span>
                  <span><div className="dot" style={{backgroundColor: '#d1d5db'}}></div> Previous year</span>
                </div>
                <div className="chart-filters">
                  <span>Today</span>
                  <span style={{display:'flex', alignItems:'center', gap:'2px', cursor:'pointer'}}>&lt; 2025 &gt;</span>
                  <span>Weekly</span>
                  <span>Monthly</span>
                  <span className="filter-active">Yearly</span>
                </div>
              </div>
              <div className="chart-body">
                <div className="mock-line-area"></div>
                <div className="mock-line-dashed"></div>
                <div className="y-axis">
                  <span>100</span>
                  <span>80</span>
                  <span>60</span>
                  <span>40</span>
                  <span>20</span>
                  <span>0</span>
                </div>
                <div className="x-axis">
                  <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jul</span><span>Aug</span><span>Jun</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                </div>
              </div>
            </div>

          </div>

          <div className="content-right">
            
            {/* MEETING SCHEDULE */}
            <div className="right-section">
              <div className="card-header-flex">
                <div className="card-title" style={{marginBottom: 0}}>Meeting Schedule</div>
                <a href="#" className="view-all">View all <svg viewBox="0 0 24 24" width="12" height="12" fill="none"><polyline points="9 18 15 12 9 6" stroke="currentColor" strokeWidth="2"/></svg></a>
              </div>
              
              <div className="calendar-widget">
                <div className="calendar-header">
                  <svg className="calendar-nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                  <span style={{display: 'flex', alignItems: 'center', gap: '6px'}}><svg viewBox="0 0 24 24" width="14" height="14" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/><line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/><line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/><line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/></svg> October, 2025</span>
                  <svg className="calendar-nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </div>
                
                <div className="calendar-days">
                  <svg className="calendar-nav-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                  <div className="cal-day">Sun<div className="cal-date">11</div></div>
                  <div className="cal-day">Mon<div className="cal-date">12</div></div>
                  <div className="cal-day">Tue<div className="cal-date active">13</div></div>
                  <div className="cal-day">Wed<div className="cal-date">14</div></div>
                  <div className="cal-day">Thu<div className="cal-date">15</div></div>
                  <svg className="calendar-nav-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </div>
              </div>

              <div className="meeting-card">
                <div className="meeting-card-title">
                  <span style={{display: 'flex', alignItems: 'center'}}>
                    Meeting with Jane Doe
                  </span>
                  <span style={{color: '#9ca3af', cursor:'pointer'}}>⋮</span>
                </div>
                <div className="meeting-time">Today • 1:00 PM - 01:30 PM</div>
                <div className="meeting-note">Joining options will be visible 10 minutes before it starts.</div>
                <div className="meeting-footer">
                  <span><div className="dot" style={{backgroundColor: '#10b981', width:'4px', height:'4px'}}></div> Interview Call</span>
                  <span><svg viewBox="0 0 24 24" width="12" height="12" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/></svg> 4 invited</span>
                </div>
              </div>

              <div className="meeting-card" style={{marginTop: '12px'}}>
                <div className="meeting-card-title">
                  <span style={{display: 'flex', alignItems: 'center'}}>
                    Meeting with Jane Doe
                  </span>
                  <span style={{color: '#9ca3af', cursor:'pointer'}}>⋮</span>
                </div>
                <div className="meeting-time">Today • 1:00 PM - 01:30 PM</div>
                <div className="meeting-note">Joining options will be visible 10 minutes before it starts.</div>
                <div className="meeting-footer">
                  <span><div className="dot" style={{backgroundColor: '#10b981', width:'4px', height:'4px'}}></div> Interview Call</span>
                  <span><svg viewBox="0 0 24 24" width="12" height="12" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/></svg> 4 invited</span>
                </div>
              </div>
            </div>

            {/* RECENT APPLICANTS */}
            <div className="right-section">
              <div className="card-header-flex">
                <div className="card-title" style={{marginBottom: 0}}>Recent Applicants</div>
                <a href="#" className="view-all">View all <svg viewBox="0 0 24 24" width="12" height="12" fill="none"><polyline points="9 18 15 12 9 6" stroke="currentColor" strokeWidth="2"/></svg></a>
              </div>

              <div className="applicants-tabs">
                <div className="a-tab active">All (130)</div>
                <div className="a-tab">Shortlisted (56)</div>
                <div className="a-tab">Screened (32)</div>
              </div>

              <div className="applicant-list">
                <div className="applicant-list-header">
                  <div className="ah-no">#NO</div>
                  <div className="ah-name">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/></svg>
                    Applicant name
                  </div>
                  <div className="ah-date">Applic...</div>
                </div>

                <div className="applicant-row">
                  <div className="ar-no">#01</div>
                  <div className="ar-info">
                    <img src="https://i.pravatar.cc/150?u=a" alt="av" className="ar-avatar" />
                    <div className="ar-details">
                      <strong>Savannah Nguyen</strong>
                      <span>naguyen@234.com</span>
                    </div>
                  </div>
                  <div className="ar-date">1 Feb, 2...</div>
                </div>
                
                <div className="applicant-row">
                  <div className="ar-no">#02</div>
                  <div className="ar-info">
                    <img src="https://i.pravatar.cc/150?u=b" alt="av" className="ar-avatar" />
                    <div className="ar-details">
                      <strong>Kathryn Murphy</strong>
                      <span>kathryn@114.com</span>
                    </div>
                  </div>
                  <div className="ar-date">2 Feb, 2...</div>
                </div>

                <div className="applicant-row">
                  <div className="ar-no">#03</div>
                  <div className="ar-info">
                    <img src="https://i.pravatar.cc/150?u=c" alt="av" className="ar-avatar" />
                    <div className="ar-details">
                      <strong>Courtney Henry</strong>
                      <span>henry@courtney.com</span>
                    </div>
                  </div>
                  <div className="ar-date">15 Feb...</div>
                </div>

                <div className="applicant-row">
                  <div className="ar-no">#04</div>
                  <div className="ar-info">
                    <img src="https://i.pravatar.cc/150?u=d" alt="av" className="ar-avatar" />
                    <div className="ar-details">
                      <strong>Kristin Watson</strong>
                      <span>kristin@gmail.com</span>
                    </div>
                  </div>
                  <div className="ar-date">15 Feb...</div>
                </div>

                <div className="applicant-row">
                  <div className="ar-no">#05</div>
                  <div className="ar-info">
                    <img src="https://i.pravatar.cc/150?u=e" alt="av" className="ar-avatar" />
                    <div className="ar-details">
                      <strong>Theresa Webb</strong>
                      <span>webb@gmail.com</span>
                    </div>
                  </div>
                  <div className="ar-date">23 Feb...</div>
                </div>

                <div className="applicant-row">
                  <div className="ar-no">#06</div>
                  <div className="ar-info">
                    <img src="https://i.pravatar.cc/150?u=f" alt="av" className="ar-avatar" />
                    <div className="ar-details">
                      <strong>Brooklyn Simmons</strong>
                      <span>brooklyn@mons.com</span>
                    </div>
                  </div>
                  <div className="ar-date">25 Feb...</div>
                </div>

                <div className="applicant-row">
                  <div className="ar-no">#07</div>
                  <div className="ar-info">
                    <img src="https://i.pravatar.cc/150?u=g" alt="av" className="ar-avatar" />
                    <div className="ar-details">
                      <strong>Ralph Edwards</strong>
                      <span>ralph@edwards.com</span>
                    </div>
                  </div>
                  <div className="ar-date">25 Feb...</div>
                </div>

                <div className="applicant-row">
                  <div className="ar-no">#08</div>
                  <div className="ar-info">
                    <img src="https://i.pravatar.cc/150?u=a" alt="av" className="ar-avatar" />
                    <div className="ar-details">
                      <strong>Savannah Nguyen</strong>
                      <span>naguyen@234.com</span>
                    </div>
                  </div>
                  <div className="ar-date">4 Mar, ...</div>
                </div>

                <div className="applicant-row">
                  <div className="ar-no">#09</div>
                  <div className="ar-info">
                    <img src="https://i.pravatar.cc/150?u=h" alt="av" className="ar-avatar" />
                    <div className="ar-details">
                      <strong>Wade Warren</strong>
                      <span>naguyen@warren.com</span>
                    </div>
                  </div>
                  <div className="ar-date">16 Mar...</div>
                </div>

              </div>
            </div>

          </div>
        </div>
        ) : activeTab === 'rooms' ? (
          <RoomsPage />
        ) : activeTab === 'reports' ? (
          <ReportsPage openModal={openReportModal} onModalOpened={() => setOpenReportModal(false)} />
        ) : activeTab === 'all-issues' ? (
          <AllIssuesPage user={user} />
        ) : activeTab === 'manage-users' ? (
          <ManageUsersPage isAdmin={isAdmin} />
        ) : activeTab === 'bookings' ? (
          <BookingsPage />
        ) : activeTab === 'inventory' ? (
          <InventoryPage user={user} />
        ) : activeTab === 'order-history' ? (
          <OrderHistoryPage user={user} />
        ) : activeTab === 'my-work' ? (
          <MyWorkPage />
        ) : activeTab === 'work-history' ? (
          <WorkHistoryPage />
        ) : null}

      </main>
    </div>
  );
}
