import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import './ReportsPage.css';

const ROLES = ['Admin', 'Store Manager', 'Reporter', 'Maintenance', 'Dorm Parent'];
const apiRoleMap = {
  'Admin': 'admin',
  'Store Manager': 'storemanager',
  'Reporter': 'reporter',
  'Maintenance': 'maintenance',
  'Dorm Parent': 'dormparent',
};

const emptyBulkRow = () => ({ id: Date.now() + Math.random(), name: '', email: '', phone: '', password: '', role: 'Reporter', specialization: '' });

const bulkInputStyle = {
  width: '100%',
  padding: '7px 10px',
  border: '1px solid #e2e8f0',
  borderRadius: '6px',
  fontSize: '13px',
  outline: 'none',
  boxSizing: 'border-box',
  background: 'white',
  color: '#1e293b',
};

export default function ManageUsersPage({ isAdmin = false }) {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userMode, setUserMode] = useState('single'); // 'single' | 'bulk'
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'Reporter',
    specialization: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [bulkRows, setBulkRows] = useState([emptyBulkRow()]);
  const [bulkError, setBulkError] = useState('');
  const [excelFileName, setExcelFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/auth/users`);
      const data = await response.json();
      if (data.success) {
        setUsers(data.data.map(u => ({
          id: u._id,
          name: u.name,
          email: u.email,
          phone: u.phone || 'N/A',
          role: formatBackendRole(u.role),
          status: 'Active', // Mock status or adjust if backend has one
          lastUpdated: new Date(u.updatedAt || u.createdAt || Date.now()).toISOString().split('T')[0]
        })));
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatBackendRole = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'Admin';
      case 'storemanager': return 'Store Manager';
      case 'reporter': return 'Reporter';
      case 'maintenance': return 'Maintenance';
      case 'dormparent': return 'Dorm Parent';
      default: return 'Reporter';
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenModal = (user = null) => {
    if (user && user.id) {
      setIsEditing(true);
      setEditingUserId(user.id);
      setNewUser({
        name: user.name,
        email: user.email,
        phone: user.phone === 'N/A' ? '' : user.phone,
        password: '',
        role: user.role,
        specialization: user.specialization || ''
      });
    } else {
      setIsEditing(false);
      setEditingUserId(null);
      setNewUser({ name: '', email: '', phone: '', password: '', role: 'Reporter', specialization: '' });
    }
    setFormError('');
    setBulkRows([emptyBulkRow()]);
    setBulkError('');
    setExcelFileName('');
    setUserMode('single');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setEditingUserId(null);
    setNewUser({ name: '', email: '', phone: '', password: '', role: 'Reporter', specialization: '' });
    setFormError('');
    setBulkRows([emptyBulkRow()]);
    setBulkError('');
    setExcelFileName('');
  };

  const toggleDropdown = (id) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setFormError('');
    
    try {
      const payload = {
        ...newUser,
        role: apiRoleMap[newUser.role] || 'reporter'
      };

      if (isEditing && !payload.password) {
        delete payload.password;
      }

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      
      const url = isEditing 
        ? `${API_BASE_URL}/api/auth/users/${editingUserId}` 
        : `${API_BASE_URL}/api/auth/register`;
        
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        await fetchUsers();
        handleCloseModal();
      } else {
        setFormError(data.message || (isEditing ? 'Failed to update user' : 'Failed to add user'));
      }
    } catch (error) {
      setFormError(`An error occurred while ${isEditing ? 'updating' : 'adding'} the user`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/api/auth/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchUsers();
      } else {
        alert(data.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('An error occurred while deleting the user');
    }
  };

  const handleBulkChange = (rowId, field, value) => {
    setBulkRows(prev => prev.map(r => r.id === rowId ? { ...r, [field]: value } : r));
  };

  const handleAddBulkRow = () => {
    setBulkRows(prev => [...prev, emptyBulkRow()]);
  };

  const handleRemoveBulkRow = (rowId) => {
    setBulkRows(prev => prev.length > 1 ? prev.filter(r => r.id !== rowId) : prev);
  };

  const handleExcelUpload = (file) => {
    if (!file) return;
    const allowed = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
    if (!allowed.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
      setBulkError('Please upload a valid Excel file (.xlsx or .xls).');
      return;
    }
    setBulkError('');
    setExcelFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target.result, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        if (rows.length === 0) { setBulkError('The Excel file is empty.'); return; }
        const findVal = (row, ...names) => {
          const key = Object.keys(row).find(k => names.some(n => k.trim().toLowerCase() === n.toLowerCase()));
          return key ? String(row[key]).trim() : '';
        };
        const mapped = rows.map(row => ({
          id: Date.now() + Math.random(),
          name: findVal(row, 'name', 'full name', 'student name'),
          email: findVal(row, 'email', 'email address'),
          phone: findVal(row, 'phone', 'phone number', 'mobile'),
          password: findVal(row, 'password', 'pass'),
          role: findVal(row, 'role') || 'Reporter',
          specialization: findVal(row, 'specialization', 'spec'),
        }));
        setBulkRows(mapped.length > 0 ? mapped : [emptyBulkRow()]);
      } catch {
        setBulkError('Failed to read the Excel file. Please check the format.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    const hasEmpty = bulkRows.some(r => !r.name.trim() || !r.email.trim() || !r.password.trim());
    if (hasEmpty) {
      setBulkError('Please fill in Name, Email, and Password for every row.');
      return;
    }
    setIsSaving(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      const payload = bulkRows.map(r => ({
        name: r.name.trim(),
        email: r.email.trim(),
        phone: r.phone.trim(),
        password: r.password.trim(),
        role: apiRoleMap[r.role] || 'reporter',
        specialization: r.specialization.trim(),
      }));
      const res = await fetch(`${API_BASE_URL}/api/auth/bulk-register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ users: payload }),
      });
      const data = await res.json();
      if (!res.ok) { setBulkError(data.message || 'Failed to save.'); return; }
      await fetchUsers();
      handleCloseModal();
    } catch {
      setBulkError('Could not connect to the server.');
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleClass = (role) => {
    switch (role) {
      case 'Admin':
        return 'td-badge badge-electrical';
      case 'Store Manager':
      case 'Reporter':
      case 'Dorm Parent':
        return 'td-badge badge-plumbing';
      case 'Maintenance':
        return 'td-badge badge-furniture';
      default:
        return 'td-badge badge-other';
    }
  };

  const getStatusClass = (status) => {
    return status === 'Active' ? 'status-resolved' : 'status-pending';
  };

  return (
    <div className="reports-page-container">
      <div className="reports-header">
        <div>
          <h1 className="reports-title">Manage Users</h1>
          <p className="reports-subtitle">Overview of all system users and roles</p>
        </div>
        <button className="btn-new-report" onClick={handleOpenModal}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none"><line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2"/><line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2"/></svg>
          Add User
        </button>
      </div>

      <div className="reports-card">
        <div className="table-responsive">
          <table className="reports-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ width: '15%', paddingLeft: '16px', textAlign: 'left' }}>Name</th>
                <th style={{ width: '20%', textAlign: 'left' }}>Email</th>
                <th style={{ width: '15%', textAlign: 'left' }}>Phone</th>
                <th style={{ width: '15%', textAlign: 'left' }}>Role</th>
                <th style={{ width: '10%', textAlign: 'left' }}>Status</th>
                <th style={{ width: '15%', textAlign: 'left' }}>Last Updated</th>
                <th style={{ width: '10%', paddingRight: '16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={`skeleton-${index}`}>
                    <td style={{ paddingLeft: '16px', textAlign: 'left' }}>
                      <div className="skeleton-box" style={{ width: '60%', height: '20px', borderRadius: '4px' }}></div>
                    </td>
                    <td style={{ textAlign: 'left' }}><div className="skeleton-box" style={{ width: '80%', height: '20px', borderRadius: '4px' }}></div></td>
                    <td style={{ textAlign: 'left' }}><div className="skeleton-box" style={{ width: '60%', height: '20px', borderRadius: '4px' }}></div></td>
                    <td style={{ textAlign: 'left' }}><div className="skeleton-box" style={{ width: '60%', height: '24px', borderRadius: '12px' }}></div></td>
                    <td style={{ textAlign: 'left' }}><div className="skeleton-box" style={{ width: '50%', height: '24px', borderRadius: '12px' }}></div></td>
                    <td style={{ textAlign: 'left' }}><div className="skeleton-box" style={{ width: '70%', height: '20px', borderRadius: '4px' }}></div></td>
                    <td style={{ textAlign: 'right', paddingRight: '16px' }}>
                      <div className="skeleton-box" style={{ width: '20px', height: '20px', borderRadius: '50%', margin: '0 0 0 auto' }}></div>
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-state" style={{ textAlign: 'center' }}>No users found.</td>
                </tr>
              ) : (
                users.map((user, index) => (
                  <tr key={user.id}>
                    <td style={{ paddingLeft: '16px', textAlign: 'left' }}>
                      <span className="fw-medium">{user.name}</span>
                    </td>
                  <td className="description-cell" style={{ textAlign: 'left' }}>{user.email}</td>
                  <td className="description-cell" style={{ textAlign: 'left' }}>{user.phone}</td>
                  <td style={{ textAlign: 'left' }}>
                    <span className={getRoleClass(user.role)}>{user.role}</span>
                  </td>
                  <td style={{ textAlign: 'left' }}>
                    <span className={`status-badge ${getStatusClass(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="description-cell" style={{ textAlign: 'left' }}>{user.lastUpdated}</td>
                  <td style={{ textAlign: 'right', paddingRight: '16px', position: 'relative' }}>
                    <div style={{ position: 'relative', display: 'inline-block', textAlign: 'left' }}>
                      <button 
                        onClick={() => toggleDropdown(user.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: '#666' }}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="5" cy="12" r="1.5"></circle>
                          <circle cx="12" cy="12" r="1.5"></circle>
                          <circle cx="19" cy="12" r="1.5"></circle>
                        </svg>
                      </button>
                      {openDropdownId === user.id && (
                        <div style={{
                          position: 'absolute',
                          right: '0',
                          top: (users.length <= 2 || index >= users.length - 2) ? 'auto' : 'calc(100% + 4px)',
                          bottom: (users.length <= 2 || index >= users.length - 2) ? 'calc(100% + 4px)' : 'auto',
                          background: 'white',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                          zIndex: 10,
                          display: 'flex',
                          flexDirection: 'column',
                          minWidth: '120px',
                          overflow: 'hidden'
                        }}>
                          <button 
                            onClick={() => {
                              toggleDropdown(user.id);
                              handleOpenModal(user);
                            }}
                            style={{ padding: '8px 16px', border: 'none', borderBottom: '1px solid #f1f5f9', background: 'white', textAlign: 'left', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center', color: '#334155', fontSize: '14px' }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            Edit
                          </button>
                          <button 
                            onClick={() => {
                              toggleDropdown(user.id);
                              handleDeleteUser(user.id);
                            }}
                            style={{ padding: '8px 16px', border: 'none', background: 'white', textAlign: 'left', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center', color: '#ef4444', fontSize: '14px' }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="offcanvas-overlay" onClick={handleCloseModal}>
          <div className="offcanvas-content" onClick={(e) => e.stopPropagation()} style={{ width: (!isEditing && userMode === 'bulk') ? '720px' : undefined }}>
            <div className="offcanvas-header">
              <h2>{isEditing ? 'Edit User' : 'Add User'}</h2>
              <button className="btn-close" onClick={handleCloseModal}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Mode Tabs — only shown when adding and user is admin */}
            {!isEditing && isAdmin && (
              <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid #e2e8f0', padding: '0 24px' }}>
                {[
                  { mode: 'single', label: 'Single User', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a6 6 0 0 1 12 0v2"/></svg> },
                  { mode: 'bulk', label: 'Bulk Upload', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
                ].map(({ mode, label, icon }) => {
                  const isActive = userMode === mode;
                  return (
                    <button
                      key={mode}
                      onClick={() => { setUserMode(mode); setFormError(''); setBulkError(''); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '12px 18px', background: 'none', border: 'none',
                        borderBottom: isActive ? '2px solid #6366f1' : '2px solid transparent',
                        color: isActive ? '#6366f1' : '#64748b',
                        fontWeight: isActive ? '600' : '500',
                        fontSize: '13px', cursor: 'pointer',
                        marginBottom: '-1px', transition: 'all 0.15s'
                      }}
                    >
                      {icon}{label}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="offcanvas-body">
              {/* ── SINGLE USER ── */}
              {(userMode === 'single' || isEditing) && (
                <form onSubmit={handleSubmit} id="new-user-form">
                  {formError && (
                    <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '6px', padding: '10px 12px', marginBottom: '16px', color: '#dc2626', fontSize: '13px' }}>
                      {formError}
                    </div>
                  )}
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" name="name" value={newUser.name} onChange={handleInputChange} placeholder="e.g., John Doe" required />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" name="email" value={newUser.email} onChange={handleInputChange} placeholder="e.g., john@example.com" required disabled={isEditing} style={isEditing ? { backgroundColor: '#f1f5f9', cursor: 'not-allowed', color: '#64748b' } : {}} />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input type="text" name="phone" value={newUser.phone} onChange={handleInputChange} placeholder="e.g., (555) 123-4567" />
                  </div>
                  <div className="form-group">
                    <label>Password {isEditing && <span style={{ fontSize: '12px', fontWeight: 'normal', color: '#64748b' }}>(Leave blank to keep current)</span>}</label>
                    <input type="password" name="password" value={newUser.password || ''} onChange={handleInputChange} placeholder="Enter temporary password" required={!isEditing} />
                  </div>
                  <div className="form-group">
                    <label>Role</label>
                    <select name="role" value={newUser.role} onChange={handleInputChange} required>
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  {newUser.role === 'Maintenance' && (
                    <div className="form-group">
                      <label>Specialization</label>
                      <select name="specialization" value={newUser.specialization} onChange={handleInputChange} required>
                        <option value="">Select Specialization...</option>
                        <option value="Plumbing">Plumbing</option>
                        <option value="Electrical">Electrical</option>
                        <option value="Furniture/Carpentry">Furniture/Carpentry</option>
                        <option value="HVAC">HVAC</option>
                        <option value="General">General Maintenance</option>
                      </select>
                    </div>
                  )}
                </form>
              )}

              {/* ── BULK UPLOAD ── */}
              {userMode === 'bulk' && !isEditing && (
                <form onSubmit={handleBulkSubmit} id="bulk-user-form">
                  {bulkError && (
                    <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '6px', padding: '10px 12px', marginBottom: '16px', color: '#dc2626', fontSize: '13px' }}>
                      {bulkError}
                    </div>
                  )}

                  {/* Excel Upload Drop Zone */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleExcelUpload(e.dataTransfer.files[0]); }}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: `2px dashed ${isDragging ? '#6366f1' : '#cbd5e1'}`,
                      borderRadius: '10px', padding: '20px', textAlign: 'center',
                      cursor: 'pointer', background: isDragging ? '#eef2ff' : '#f8fafc',
                      marginBottom: '16px', transition: 'all 0.15s',
                    }}
                  >
                    <input ref={fileInputRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={(e) => handleExcelUpload(e.target.files[0])} />
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={isDragging ? '#6366f1' : '#94a3b8'} strokeWidth="1.5">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="12" y1="18" x2="12" y2="12"/>
                        <polyline points="9 15 12 12 15 15"/>
                      </svg>
                      {excelFileName ? (
                        <>
                          <span style={{ fontSize: '13px', fontWeight: '600', color: '#6366f1' }}>{excelFileName}</span>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>File loaded — rows populated below. Click to replace.</span>
                        </>
                      ) : (
                        <>
                          <span style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>Drop your Excel file here or click to upload</span>
                          <span style={{ fontSize: '12px', color: '#94a3b8' }}>.xlsx or .xls &nbsp;·&nbsp; Columns: <strong>Name</strong>, <strong>Email</strong>, <strong>Phone</strong>, <strong>Password</strong>, <strong>Role</strong>, <strong>Specialization</strong></span>
                        </>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                    <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500', whiteSpace: 'nowrap' }}>OR FILL IN MANUALLY</span>
                    <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {bulkRows.map((row, idx) => (
                      <div key={row.id} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 16px', background: '#fafafa', position: 'relative' }}>
                        {/* Row number + remove */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                          <span style={{ fontSize: '11px', fontWeight: '600', color: '#94a3b8', letterSpacing: '0.05em' }}>USER {String(idx + 1).padStart(2, '0')}</span>
                          <button type="button" onClick={() => handleRemoveBulkRow(row.id)} disabled={bulkRows.length === 1}
                            style={{ background: 'none', border: 'none', cursor: bulkRows.length === 1 ? 'not-allowed' : 'pointer', color: bulkRows.length === 1 ? '#cbd5e1' : '#ef4444', padding: '2px', display: 'flex', alignItems: 'center' }} title="Remove">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                          </button>
                        </div>
                        {/* Row 1: Name + Email */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                          <input type="text" value={row.name} onChange={(e) => handleBulkChange(row.id, 'name', e.target.value)} placeholder="Full name *" style={bulkInputStyle} />
                          <input type="email" value={row.email} onChange={(e) => handleBulkChange(row.id, 'email', e.target.value)} placeholder="Email address *" style={bulkInputStyle} />
                        </div>
                        {/* Row 2: Phone + Password */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                          <input type="text" value={row.phone} onChange={(e) => handleBulkChange(row.id, 'phone', e.target.value)} placeholder="Phone (optional)" style={bulkInputStyle} />
                          <input type="password" value={row.password} onChange={(e) => handleBulkChange(row.id, 'password', e.target.value)} placeholder="Password *" style={bulkInputStyle} />
                        </div>
                        {/* Row 3: Role + Specialization */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          <select value={row.role} onChange={(e) => handleBulkChange(row.id, 'role', e.target.value)} style={bulkInputStyle}>
                            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                          <input type="text" value={row.specialization} onChange={(e) => handleBulkChange(row.id, 'specialization', e.target.value)} placeholder="Specialization (if Maintenance)" style={bulkInputStyle} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddBulkRow}
                    style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: '1.5px dashed #cbd5e1', borderRadius: '8px', padding: '8px 14px', color: '#6366f1', fontSize: '13px', fontWeight: '500', cursor: 'pointer', width: '100%', justifyContent: 'center' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.background = '#eef2ff'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = 'none'; }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Add Another Row
                  </button>
                </form>
              )}
            </div>

            <div className="offcanvas-footer">
              {(userMode === 'single' || isEditing) && (
                <button type="submit" form="new-user-form" className="btn-primary" disabled={isSaving}>
                  {isSaving ? 'Saving…' : isEditing ? (
                    <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>Update User</>
                  ) : (
                    <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>Add User</>
                  )}
                </button>
              )}
              {userMode === 'bulk' && !isEditing && (
                <button type="submit" form="bulk-user-form" className="btn-primary" disabled={isSaving}>
                  {isSaving ? 'Saving…' : (
                    <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>Add {bulkRows.length} User{bulkRows.length !== 1 ? 's' : ''}</>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}