import { useState, useEffect } from 'react';
import './UsersManagement.css';

interface UserData {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: string;
  status?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function UsersManagement() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [dropdownOpenId, setDropdownOpenId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [formData, setFormData] = useState<Partial<UserData>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/auth/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.data.map((u: any) => ({ ...u, id: u._id, status: u.status || 'Active' })));
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleDropdown = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDropdownOpenId(dropdownOpenId === id ? null : id);
  };

  const handleOpenModal = (user?: UserData) => {
    if (user) {
      setEditingUser(user);
      setFormData(user);
    } else {
      setEditingUser(null);
      setFormData({ role: 'student', status: 'Active' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({});
    setActiveTab('single');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    try {
      if (editingUser && editingUser.id) {
        const res = await fetch(`${API_BASE_URL}/api/auth/users/${editingUser.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });
        if (res.ok) {
          fetchUsers();
        }
      } else {
        const res = await fetch(`${API_BASE_URL}/api/auth/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ ...formData, password: 'password123' }) // Default password for new users
        });
        if (res.ok) {
          fetchUsers();
        } else {
          const errData = await res.json();
          alert(errData.message || 'Error creating user');
        }
      }
    } catch (err) {
      console.error('Error saving user:', err);
    }
    
    handleCloseModal();
  };

  const handleDelete = async (id: string) => {
    if (!id) return;
    if (confirm('Are you sure you want to delete this user?')) {
      setDropdownOpenId(null);
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/users/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          setUsers(users.filter(u => u.id !== id));
        } else {
          alert('Error deleting user');
        }
      } catch (err) {
        console.error('Error deleting user:', err);
      }
    }
  };

  return (
    <div onClick={() => setDropdownOpenId(null)}>
      <div className="page-header">
        <div className="page-title">
          <h1>User Management</h1>
          <p>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            Total Users: {users.length}
          </p>
        </div>
        <div className="header-buttons">
          <button className="btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            Export data
          </button>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            Add New User
          </button>
        </div>
      </div>

      <div className="table-box">
        <div className="data-table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>NAME</th>
                <th>EMAIL</th>
                <th>ROLE</th>
                <th>STATUS</th>
                <th style={{ textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>
                    <span title={u.id} style={{ cursor: 'pointer', borderBottom: '1px dotted #888' }}>
                      {u.id?.slice(-5)}
                    </span>
                  </td>
                  <td>
                    <div className="student-cell">
                      <img className="student-avatar" src={`https://ui-avatars.com/api/?name=${u.name}&background=random`} alt={u.name} />
                      {u.name}
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td><span className="role-chip">{u.role}</span></td>
                  <td>
                    {u.status && <span className={`status-chip ${u.status.toLowerCase()}`}>{u.status}</span>}
                  </td>
                  <td style={{ position: 'relative' }}>
                    <div className="row-actions" style={{ justifyContent: 'flex-end' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" title="Actions" onClick={(e) => { if (u.id) toggleDropdown(u.id, e); }}><path d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
                    </div>
                    {u.id && dropdownOpenId === u.id && (
                      <div className="dropdown-menu">
                        <div className="dropdown-item" onClick={(e) => { e.stopPropagation(); handleOpenModal(u); }}>
                           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg>
                           Edit User
                        </div>
                        <div className="dropdown-item danger" onClick={(e) => { e.stopPropagation(); handleDelete(u.id!); }}>
                           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                           Delete User
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            <span>1 to {users.length} of {users.length}</span>
            <div className="pagination-controls">
              <div className="page-arrows">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{opacity:0.3}}><path d="M11 17l-5-5 5-5M18 17l-5-5 5-5" /></svg>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{opacity:0.6}}><path d="M15 19l-7-7 7-7" /></svg>
              </div>
              <span>Page 1 of 1</span>
              <div className="page-arrows">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{opacity:0.3}}><path d="M9 5l7 7-7 7" /></svg>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{opacity:0.3}}><path d="M13 7l5 5-5 5M6 7l5 5-5 5" /></svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="drawer-overlay" onClick={handleCloseModal}>
          <div className="drawer-content" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <h2>{editingUser ? 'Edit User' : 'Add User'}</h2>
              <button className="drawer-close" onClick={handleCloseModal}>×</button>
            </div>
            
            {!editingUser && (
              <div className="drawer-tabs">
                <div 
                  className={`drawer-tab ${activeTab === 'single' ? 'active' : ''}`}
                  onClick={() => setActiveTab('single')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  Single User
                </div>
                <div 
                  className={`drawer-tab ${activeTab === 'bulk' ? 'active' : ''}`}
                  onClick={() => setActiveTab('bulk')}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 4v16m8-8H4" /></svg>
                  Bulk Upload
                </div>
              </div>
            )}

            <div className="drawer-body">
              {activeTab === 'single' || editingUser ? (
              <form id="user-form" onSubmit={handleSave}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g., John Doe"
                    value={formData.name || ''} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    required 
                    placeholder="e.g., john@example.com"
                    value={formData.email || ''} 
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="form-group" style={{ width: '45%' }}>
                  <label>Role</label>
                  <select 
                    value={formData.role || 'student'} 
                    onChange={e => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="admin">Admin</option>
                    <option value="staff">Staff</option>
                    <option value="student">Student</option>
                    <option value="Reporter">Reporter</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input 
                    type="password" 
                    placeholder={editingUser ? "Leave blank to keep current" : "Enter temporary password"}
                    /* Password state handled backend-side in current mocked context */
                  />
                </div>
              </form>
              ) : (
                <div className="bulk-upload-section">
                  <div className="bulk-instructions">
                    <p>Upload a CSV file containing user details. Ensure your file has the following column headers: <strong>Name, Email, Role</strong>.</p>
                  </div>
                  
                  <div className="upload-box">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5"><path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                    <p className="upload-title"><strong>Click to upload</strong> or drag and drop</p>
                    <p className="upload-subtitle">CSV (max. 5MB)</p>
                    <input type="file" accept=".csv" className="file-input" />
                  </div>
                  
                  <a href="#" className="download-template-link">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    Download CSV Template
                  </a>
                </div>
              )}
            </div>
            
            <div className="drawer-footer">
              {activeTab === 'single' || editingUser ? (
              <button type="submit" form="user-form" className="btn btn-primary full-width">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                {editingUser ? 'Save Changes' : 'Add User'}
              </button>
              ) : (
              <button type="button" className="btn btn-primary full-width">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                Upload and Import
              </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}