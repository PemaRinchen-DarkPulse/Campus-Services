import React, { useState, useEffect } from 'react';
import './MyDorm.css';

interface RoomAssignment {
  _id?: string;
  cardNumber: string;
  fullName: string;
  email: string;
  grade: string;
  dorm: string;
  roomNumber: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function MyDorm() {
  const [assignments, setAssignments] = useState<RoomAssignment[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<RoomAssignment>>({});
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/rooms`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAssignments(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/api/auth/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        console.log("All users from DB:", data.data);
        if (data.success && Array.isArray(data.data)) {
          const fetchedStudents = data.data.filter((u: any) => 
            typeof u.role === 'string' && u.role.toLowerCase() === 'student' && u.cardNumber && String(u.cardNumber).trim() !== ''
          );
          setStudents(fetchedStudents);
        }
      } catch (err) {
        console.error('Error fetching students:', err);
      }
    };
    fetchStudents();
  }, []);

  const handleOpenModal = () => {
    setFormData({});
    setEditId(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({});
    setSearchQuery('');
    setIsDropdownOpen(false);
    setEditId(null);
  };

  const handleEdit = (assignment: RoomAssignment) => {
    setFormData({ ...assignment });
    setEditId(assignment._id || null);
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id || !window.confirm('Are you sure you want to delete this assignment?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/rooms/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        fetchAssignments();
      } else {
        alert(data.message || 'Failed to delete');
      }
    } catch (e) {
      console.error(e);
      alert('Error deleting assignment');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      const payload = {
        cardNumber: formData.cardNumber || '',
        fullName: formData.fullName || '',
        email: formData.email || '',
        grade: formData.grade || '7',
        dorm: formData.dorm || '',
        roomNumber: formData.roomNumber || ''
      };

      const url = editId ? `${API_BASE_URL}/api/rooms/${editId}` : `${API_BASE_URL}/api/rooms`;
      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (data.success) {
        handleCloseModal();
        fetchAssignments();
      } else {
        alert(data.message || 'Failed to save');
      }
    } catch (e) {
      console.error(e);
      alert('Error saving dorm assignment');
    }
  };

  return (
    <div className="my-mentees-container">
      <div className="page-header">
        <div className="page-title">
          <h1>Dorm Assignments</h1>
          <p>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            Total Dormers: {assignments.length}
          </p>
        </div>
        <div className="header-buttons">
          <button className="btn btn-primary" onClick={handleOpenModal}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            Assign Dorm
          </button>
        </div>
      </div>

      <div className="table-box">
        <div className="data-table-container" style={{ borderRadius: '12px' }}>
          <table>
            <thead>
              <tr>
                <th>USER ID</th>
                <th>FULL NAME</th>
                <th>EMAIL</th>
                <th>GRADE</th>
                <th>DORM</th>
                <th>ROOM #</th>
                <th style={{ textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={`skeleton-${index}`}>
                    <td><div className="skeleton-line short"></div></td>
                    <td><div className="skeleton-line medium"></div></td>
                    <td><div className="skeleton-line long"></div></td>
                    <td><div className="skeleton-chip"></div></td>
                    <td><div className="skeleton-chip"></div></td>
                    <td><div className="skeleton-chip"></div></td>
                    <td>
                      <div className="row-actions" style={{ justifyContent: 'flex-end' }}>
                        <div className="skeleton-icon"></div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : assignments.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '24px' }}>No dormers assigned yet.</td>
                </tr>
              ) : (
                assignments.map(a => {
                  const student = students.find(s => String(s.cardNumber) === String(a.cardNumber));
                  const fullId = student ? (student._id || student.id) : a.cardNumber;
                  const displayId = fullId ? String(fullId).slice(-5).toUpperCase() : '';
                  
                  return (
                  <tr key={a._id}>
                    <td>
                      <span title={fullId} style={{ cursor: 'pointer', borderBottom: '1px dotted #888' }}>
                        {displayId}
                      </span>
                    </td>
                    <td>
                      <div className="student-cell" style={{ display: 'inline-flex', padding: 0, alignItems: 'center' }}>
                        <img className="student-avatar" src={`https://ui-avatars.com/api/?name=${a.fullName}&background=random`} alt={a.fullName} style={{ width: '32px', height: '32px', borderRadius: '50%', marginRight: '8px' }} />
                        {a.fullName}
                      </div>
                    </td>
                    <td>{a.email}</td>
                    <td><span className="role-chip">{a.grade}</span></td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{a.dorm}</span>
                    </td>
                    <td><span className="role-badge role-teacher">{a.roomNumber}</span></td>
                    <td style={{ position: 'relative' }}>
                      <div className="row-actions" style={{ justifyContent: 'flex-end' }}>
                        <svg 
                          width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" 
                          role="button" aria-label="Actions" style={{ cursor: 'pointer', color: '#6b7280' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === a._id ? null : (a._id || null));
                          }}
                        >
                          <title>Actions</title>
                          <path d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                        </svg>
                        
                        {activeMenuId === a._id && (
                          <div className="actions-dropdown" style={{
                            position: 'absolute',
                            right: '30px',
                            top: '20px',
                            background: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            zIndex: 10,
                            minWidth: '120px',
                            overflow: 'hidden'
                          }}>
                            <div 
                              className="action-item" 
                              style={{ padding: '8px 16px', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                              onClick={() => handleEdit(a)}
                              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f9fafb'}
                              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                              Update
                            </div>
                            <div 
                              className="action-item" 
                              style={{ padding: '8px 16px', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444' }}
                              onClick={() => { setActiveMenuId(null); handleDelete(a._id); }}
                              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fef2f2'}
                              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              Delete
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )})
              )}
            </tbody>
          </table>
          
          <div className="pagination">
            <span>1 to {isLoading ? 0 : assignments.length} of {isLoading ? 0 : assignments.length}</span>
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
              <h2>{editId ? 'Update Dorm Assignment' : 'Assign Dorm'}</h2>
              <button className="drawer-close" onClick={handleCloseModal}>×</button>
            </div>
            
            <div className="drawer-tabs">
              <div className="drawer-tab active">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                Single Dormer
              </div>
            </div>
            
            <div className="drawer-body">
              <form id="mentee-form" onSubmit={handleSave}>
                <div className="form-group" style={{ position: 'relative' }}>
                  <label>Card Number</label>
                  <div 
                    className="select-search-container" 
                    style={{ position: 'relative' }}
                  >
                    <input 
                      type="text" 
                      required 
                      placeholder="Search or select card number..."
                      value={isDropdownOpen ? searchQuery : (formData.cardNumber || '')} 
                      onChange={e => {
                        const val = e.target.value;
                        setSearchQuery(val);
                        
                        const matchedStudent = students.find(s => String(s.cardNumber) === val);
                        setFormData({ 
                          ...formData, 
                          cardNumber: val,
                          ...(matchedStudent ? { 
                            fullName: matchedStudent.name, 
                            email: matchedStudent.email,
                            grade: matchedStudent.grade || '7'
                          } : {})
                        });
                        
                        setIsDropdownOpen(true);
                      }}
                      onFocus={() => {
                        setIsDropdownOpen(true);
                        setSearchQuery(formData.cardNumber || '');
                      }}
                      onBlur={() => {
                        // Delay hiding so onMouseDown on the items can fire
                        setTimeout(() => setIsDropdownOpen(false), 200);
                      }}
                      style={{ paddingRight: '30px' }}
                    />
                    <div 
                      className="dropdown-arrow" 
                      style={{ 
                        position: 'absolute', 
                        right: '12px', 
                        top: '50%', 
                        transform: 'translateY(-50%)', 
                        pointerEvents: 'none',
                        color: '#6b7280'
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 9l-7 7-7-7" /></svg>
                    </div>

                    {isDropdownOpen && (
                      <div 
                        className="custom-dropdown-menu"
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          background: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          zIndex: 10,
                          maxHeight: '200px',
                          overflowY: 'auto',
                          marginTop: '4px'
                        }}
                      >
                        {students.filter(s => {
                          const query = String(searchQuery || '').toLowerCase();
                          return String(s.cardNumber || '').toLowerCase().includes(query) || 
                                 String(s.name || '').toLowerCase().includes(query);
                        }).length === 0 ? (
                          <div style={{ padding: '8px 12px', color: '#6b7280', fontSize: '14px' }}>No matches found</div>
                        ) : (
                          students.filter(s => {
                            const query = String(searchQuery || '').toLowerCase();
                            return String(s.cardNumber || '').toLowerCase().includes(query) || 
                                   String(s.name || '').toLowerCase().includes(query);
                          }).map((student) => (
                            <div 
                              key={student.id} 
                              style={{ 
                                padding: '8px 12px', 
                                cursor: 'pointer',
                                fontSize: '14px',
                                borderBottom: '1px solid #f3f4f6'
                              }}
                              onMouseDown={() => {
                                setFormData({
                                  ...formData, 
                                  cardNumber: student.cardNumber,
                                  fullName: student.name,
                                  email: student.email,
                                  grade: student.grade || '7',
                                });
                                setIsDropdownOpen(false);
                                setSearchQuery('');
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f9fafb' }}
                              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                            >
                              <div><strong>{student.cardNumber}</strong></div>
                              <div style={{ fontSize: '12px', color: '#6b7280' }}>{student.name}</div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" placeholder="Enter full name..." value={formData.fullName || ''} onChange={e => setFormData({...formData, fullName: e.target.value})} required readOnly />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" placeholder="Enter email address..." value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} required readOnly />
                </div>

                <div className="form-row" style={{ display: 'flex', gap: '16px' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Grade</label>
                    <select value={formData.grade || '7'} onChange={e => setFormData({...formData, grade: e.target.value})} required>
                      <option value="7">7</option>
                      <option value="8">8</option>
                      <option value="9">9</option>
                      <option value="10">10</option>
                      <option value="11">11</option>
                      <option value="12">12</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Select Dorm</label>
                    <select value={formData.dorm || ''} onChange={e => setFormData({...formData, dorm: e.target.value})} required>
                      <option value="" disabled>Select Dorm</option>
                      <optgroup label="Boys Dorm">
                        <option value="Boys Dorm A">Boys Dorm A</option>
                        <option value="Boys Dorm B">Boys Dorm B</option>
                        <option value="Boys Dorm C">Boys Dorm C</option>
                      </optgroup>
                      <optgroup label="Girls Dorm">
                        <option value="Girls Dorm A">Girls Dorm A</option>
                        <option value="Girls Dorm B">Girls Dorm B</option>
                        <option value="Girls Dorm C">Girls Dorm C</option>
                      </optgroup>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Room Number</label>
                  <input type="text" placeholder="e.g. 101A" value={formData.roomNumber || ''} onChange={e => setFormData({...formData, roomNumber: e.target.value})} required />
                </div>
              </form>
            </div>
            
            <div className="drawer-footer">
              <button type="submit" form="mentee-form" className="btn btn-primary full-width">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                {editId ? 'Update Assignment' : 'Save Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
