import { useState, useEffect } from 'react'
import { RoleSelection } from './components/RoleSelection/RoleSelection'
import { UsersManagement } from './components/UsersManagement/UsersManagement'
import './App.css'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: string
  specialization?: string
}

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // On mount, check if there's a saved token and validate it
  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')

    if (token && savedUser) {
      // Validate the token by calling /api/auth/me
      fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (res.ok) return res.json()
          throw new Error('Invalid token')
        })
        .then((data) => {
          setUser(data.user)
          setLoading(false)
        })
        .catch(() => {
          // Token is invalid, clear storage
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  const handleLogin = (userData: User, token: string) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  // Show a brief loading state while checking for existing session
  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F3F4F6', color: '#6B7280', fontSize: '15px' }}>
        Loading…
      </div>
    )
  }

  // If user is logged in → show the new Owlee-like Dashboard
  if (user) {
    return <DashboardLayout user={user} onLogout={handleLogout} />
  }

  return <RoleSelection onLogin={handleLogin} />
}

export default App

// --- Dashboard Implementation ---

const DUMMY_STUDENTS = [
  { id: '447', name: 'Robert Fox', gender: 'Male', age: 17, class: '1A', grade: '9.3', missing: 0 },
  { id: '877', name: 'Marvin McKinney', gender: 'Male', age: 6, class: '1B', grade: '-', missing: 0 },
  { id: '556', name: 'Darrell Steward', gender: 'Female', age: 10, class: '4C', grade: '8.6', missing: 6 },
  { id: '432', name: 'Savannah Nguyen', gender: 'Male', age: 11, class: '4C', grade: '7.2', missing: 6 },
  { id: '536', name: 'Dianne Russell', gender: 'Female', age: 16, class: '11B', grade: '8.2', missing: 10 },
  { id: '703', name: 'Cody Fisher', gender: 'Female', age: 11, class: '4A', grade: '5.2', missing: 20 },
  { id: '922', name: 'Leslie Alexander', gender: 'Female', age: 12, class: '5A', grade: '6.5', missing: 0 },
  { id: '540', name: 'Albert Flores', gender: 'Male', age: 14, class: '7B', grade: '7.5', missing: 0 },
  { id: '426', name: 'Ralph Edwards', gender: 'Male', age: 17, class: '11C', grade: '9.5', missing: 1 },
  { id: '883', name: 'Darlene Robertson', gender: 'Female', age: 18, class: '1A', grade: '10', missing: 0 },
];

function DashboardLayout({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<string>(user.role === 'admin' ? 'Users' : 'Students');
  const [dropdownOpenId, setDropdownOpenId] = useState<string | null>(null);

  const toggleDropdown = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDropdownOpenId(dropdownOpenId === id ? null : id);
  };

  return (
    <div className="dashboard-layout" onClick={() => setDropdownOpenId(null)}>
      {/* Sidebar */}
      <div className="sidebar">
        <div className="logo-container">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect width="24" height="24" rx="6" fill="#1f2937" />
            <circle cx="12" cy="12" r="5" fill="#facc15" />
          </svg>
          <span>Owlee</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: 'auto', cursor: 'pointer' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </div>

        {user.role === 'admin' ? (
          <>
            <div className="sidebar-section">
              <div className="sidebar-title">MAIN MENU</div>
              <SidebarItem icon="home" label="Overview" active={activeTab === 'Overview'} onClick={() => setActiveTab('Overview')} />
            </div>

            <div className="sidebar-section">
              <div className="sidebar-title">MODULES</div>
              <SidebarItem icon="coffee" label="Cafe" active={activeTab === 'Cafe'} onClick={() => setActiveTab('Cafe')} />
              <SidebarItem icon="library" label="Library" active={activeTab === 'Library'} onClick={() => setActiveTab('Library')} />
              <SidebarItem icon="tool" label="Maintenance" active={activeTab === 'Maintenance'} onClick={() => setActiveTab('Maintenance')} />
              <SidebarItem icon="shopping-bag" label="Store" active={activeTab === 'Store'} onClick={() => setActiveTab('Store')} />
            </div>

            <div className="sidebar-section">
              <div className="sidebar-title">ADMINISTRATION</div>
              <SidebarItem icon="users" label="Users" active={activeTab === 'Users'} onClick={() => setActiveTab('Users')} />
              <SidebarItem icon="bar-chart" label="Reports & Analytics" active={activeTab === 'Reports & Analytics'} onClick={() => setActiveTab('Reports & Analytics')} />
              <SidebarItem icon="settings" label="System" active={activeTab === 'System'} onClick={() => setActiveTab('System')} />
            </div>
          </>
        ) : (
          <>
            <div className="sidebar-section">
              <div className="sidebar-title">MAIN MENU</div>
              <SidebarItem icon="home" label="Home" active={activeTab === 'Home'} onClick={() => setActiveTab('Home')} />
              <SidebarItem icon="users" label="Students" active={activeTab === 'Students'} onClick={() => setActiveTab('Students')} />
              <SidebarItem icon="book-open" label="Classes" active={activeTab === 'Classes'} onClick={() => setActiveTab('Classes')} />
              <SidebarItem icon="users-group" label="Groups" active={activeTab === 'Groups'} onClick={() => setActiveTab('Groups')} />
            </div>

            <div className="sidebar-section">
              <div className="sidebar-title">ADMINISTRATION</div>
              <SidebarItem icon="book" label="Subjects" chevron active={activeTab === 'Subjects'} onClick={() => setActiveTab('Subjects')} />
              <SidebarItem icon="clipboard" label="Assignment" badge="2" active={activeTab === 'Assignment'} onClick={() => setActiveTab('Assignment')} />
              <SidebarItem icon="library" label="Library" active={activeTab === 'Library'} onClick={() => setActiveTab('Library')} />
            </div>

            <div className="sidebar-section">
              <div className="sidebar-title">TEACHERS</div>
              {['Svetlana Kozakova', 'Olga Melnichenko', 'Dmitriy Berbatov', 'Ekaterina Baranova', 'Oleg Gerasimov'].map(t => (
                <div key={t} className="teacher-item">
                  <div className="teacher-avatar"></div>
                  <span>{t}</span>
                </div>
              ))}
              <div className="add-member">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
                Add a member
              </div>
            </div>
          </>
        )}

        <div className="feedback-btn" onClick={onLogout}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          Log Out
        </div>
      </div>

      {/* Main Column */}
      <div className="main-content">
        {/* Top Header */}
        <div className="top-header">
          <div className="search-bar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder="Search for students, classes, groups etc." />
          </div>

          <div className="header-actions">
            <button className="icon-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
            <button className="icon-btn has-notification">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            </button>
            <div className="user-profile">
              <div className="user-info">
                <span className="user-name">Anna Mironova</span>
                <span className="user-role">Teacher</span>
              </div>
              <div className="teacher-avatar" style={{background: '#1f2937'}}></div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"><path d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>

        {/* Dynamic Page Content */}
        <div className="page-content">
          {activeTab === 'Users' ? (
            <UsersManagement />
          ) : (
            <>
              <div className="page-header">
                <div className="page-title">
                  <h1>Students</h1>
              <p>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                Total: 2,000
              </p>
            </div>
            <div className="header-buttons">
              <button className="btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                Export data
              </button>
              <button className="btn btn-primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                Add student
              </button>
            </div>
          </div>

          <div className="table-box">
            <div className="table-actions-bar">
              <div className="filters">
                <select className="filter-select"><option>Classes</option></select>
                <select className="filter-select"><option>Age</option></select>
                <select className="filter-select"><option>Avg. grade</option></select>
                <button className="filter-btn">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                  All filters
                </button>
              </div>
              <div className="action-icons">
                <button className="action-icon-btn active">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5Modular" /></svg>
                </button>
                <button className="action-icon-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                </button>
                <button className="action-icon-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                </button>
                <button className="action-icon-btn" style={{color: '#ff4d4f'}}>
                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>

            <div className="data-table-container">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>STUDENT</th>
                    <th>GENDER</th>
                    <th>AGE</th>
                    <th>CLASS</th>
                    <th>AVG. GRADE</th>
                    <th>MISSING DAYS</th>
                    <th style={{ textAlign: 'right' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {DUMMY_STUDENTS.map((s) => (
                    <tr key={s.id}>
                      <td>{s.id}</td>
                      <td>
                        <div className="student-cell">
                          <img className="student-avatar" src={`https://ui-avatars.com/api/?name=${s.name}&background=random`} alt={s.name} />
                          {s.name}
                        </div>
                      </td>
                      <td>{s.gender}</td>
                      <td>{s.age}</td>
                      <td>{s.class}</td>
                      <td>{s.grade}</td>
                      <td>{s.missing}</td>
                      <td style={{ position: 'relative' }}>
                        <div className="row-actions" style={{ justifyContent: 'flex-end' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" title="Actions" onClick={(e) => toggleDropdown(s.id, e)}><path d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
                        </div>
                        {dropdownOpenId === s.id && (
                          <div className="dropdown-menu">
                            <div className="dropdown-item">
                               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg>
                               Edit
                            </div>
                            <div className="dropdown-item">
                               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                               Enroll training
                            </div>
                            <div className="dropdown-item">
                               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                               Add to group
                            </div>
                            <div className="dropdown-item danger">
                               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                               Delete
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="pagination">
                <span>1 to 10 of 2000</span>
                <div className="pagination-controls">
                  <div className="page-arrows">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{opacity:0.3}}><path d="M11 17l-5-5 5-5M18 17l-5-5 5-5" /></svg>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{opacity:0.6}}><path d="M15 19l-7-7 7-7" /></svg>
                  </div>
                  <span>Page 1 of 200</span>
                  <div className="page-arrows">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5l7 7-7 7" /></svg>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 7l5 5-5 5M6 7l5 5-5 5" /></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function SidebarItem({ icon, label, active, badge, chevron, onClick }: { icon: string, label: string, active?: boolean, badge?: string, chevron?: boolean, onClick?: () => void }) {
  const getIcon = () => {
    switch (icon) {
      case 'home': return <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />;
      case 'users': return <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />;
      case 'book-open': return <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />;
      case 'users-group': return <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />;
      case 'book': return <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />;
      case 'clipboard': return <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />;
      case 'library': return <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />;
      case 'coffee': return <path strokeLinecap="round" strokeLinejoin="round" d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z M6 1v3M10 1v3M14 1v3" />;
      case 'tool': return <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />;
      case 'shopping-bag': return <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />;
      case 'bar-chart': return <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />;
      case 'settings': return <><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></>;
      default: return null;
    }
  };

  return (
    <div className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        {getIcon()}
      </svg>
      {label}
      {badge && <span className="badge">{badge}</span>}
      {chevron && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginLeft: 'auto'}}>
          <path d="M19 9l-7 7-7-7" />
        </svg>
      )}
    </div>
  );
}
