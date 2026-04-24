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
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({});
    setSearchQuery('');
    setIsDropdownOpen(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      const payload = {
        cardNumber: formData.cardNumber || '',
        fullName: formData.fullName || '',
        email: formData.email || '',
        grade: formData.grade || '',
        dorm: formData.dorm || '',
        roomNumber: formData.roomNumber || ''
      };

      const res = await fetch(`${API_BASE_URL}/api/rooms`, {
        method: 'POST',
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
                <th>CARD NUMBER</th>
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
                assignments.map(a => (
                  <tr key={a._id}>
                    <td>
                      <span title={a.cardNumber} style={{ cursor: 'pointer', borderBottom: '1px dotted #888' }}>
                        {a.cardNumber}
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
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" role="button" aria-label="Actions" style={{ cursor: 'pointer', color: '#6b7280' }}><title>Actions</title><path d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
                      </div>
                    </td>
                  </tr>
                ))
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
              <h2>Assign Dorm</h2>
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
                        setSearchQuery(e.target.value);
                        setFormData({ ...formData, cardNumber: e.target.value });
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
                  <input type="text" placeholder="Enter full name..." value={formData.fullName || ''} onChange={e => setFormData({...formData, fullName: e.target.value})} required />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" placeholder="Enter email address..." value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} required />
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
                      <option value="" disabled>Select...</option>
                      <option value="North Hall">North Hall</option>
                      <option value="South Hall">South Hall</option>
                      <option value="East Wing">East Wing</option>
                      <option value="West Wing">West Wing</option>
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
                Save Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
