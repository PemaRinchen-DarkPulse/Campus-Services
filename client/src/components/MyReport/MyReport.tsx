import React, { useState, useEffect } from 'react';
import './MyReport.css';

interface ReportItem {
  id: string;
  image: string;
  location: string;
  specificArea: string;
  category: string;
  description: string;
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  date: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function MyReport() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [dropdownOpenId, setDropdownOpenId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Form State
  const [location, setLocation] = useState('');
  const [specificArea, setSpecificArea] = useState('');
  const [classroomName, setClassroomName] = useState('');
  const [belongsTo, setBelongsTo] = useState('');
  const [dormName, setDormName] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [village, setVillage] = useState('');
  const [facultyName, setFacultyName] = useState('');
  const [category, setCategory] = useState('');
  const [urgency, setUrgency] = useState('Low');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fetchReports = async () => {
    setIsFetching(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/reports`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        // Safe buffer to base64 converter for browser
        const arrayBufferToBase64 = (buffer: number[]) => {
          let binary = '';
          const bytes = new Uint8Array(buffer);
          const len = bytes.byteLength;
          for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          return window.btoa(binary);
        };

        // Map backend report data to the ReportItem frontend structure
        const formattedReports = data.data.map((r: any) => ({
          id: r._id || `temp-${Math.random()}`,
          image: r.image?.data?.data ? `data:${r.image.contentType};base64,${arrayBufferToBase64(r.image.data.data)}` : null,
          location: r.location || 'Unknown',
          specificArea: r.location === 'Classroom' ? `${r.classroomName} (${r.teacher})` 
                        : r.location === 'Dorm' ? `${r.dormName} - ${r.roomNumber}`
                        : r.location === 'Faculty Housing' ? `${r.village} - ${r.facultyName}`
                        : r.location === 'Old Campus' ? r.oldCampusArea || 'N/A'
                        : r.classroom || r.specificArea || 'N/A',
          category: r.category || 'Other',
          description: r.description || 'No description provided.',
          urgency: r.urgency || 'Low',
          status: r.status || 'Open',
          date: r.createdAt ? new Date(r.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        }));
        setReports(formattedReports);
      }
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('location', location);
      formData.append('category', category);
      formData.append('urgency', urgency);
      formData.append('description', description);

      if (location === 'Classroom') {
        formData.append('classroomName', classroomName);
        formData.append('teacher', belongsTo);
      } else if (location === 'Dorm') {
        formData.append('dormName', dormName);
        formData.append('roomNumber', roomNumber);
      } else if (location === 'Faculty Housing') {
        formData.append('village', village);
        formData.append('facultyName', facultyName);
      } else if (location === 'Old Campus') {
        formData.append('oldCampusArea', specificArea);
      } else {
        formData.append('classroom', specificArea);
      }

      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await fetch(`${API_BASE_URL}/api/reports`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        setIsDrawerOpen(false);
        // Reset form
        setLocation('');
        setSpecificArea('');
        setClassroomName('');
        setBelongsTo('');
        setDormName('');
        setRoomNumber('');
        setVillage('');
        setFacultyName('');
        setCategory('');
        setUrgency('Low');
        setDescription('');
        setImageFile(null);
        setImagePreview(null);
        
        // Refresh the list
        fetchReports();
      } else {
        alert(data.message || 'Error submitting report');
      }
    } catch (err) {
      console.error(err);
      alert('Error submitting report');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDropdown = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDropdownOpenId(dropdownOpenId === id ? null : id);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setImageFile(null);
    setImagePreview(null);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'Critical': return '#ef4444'; // red
      case 'High': return '#f97316'; // orange
      case 'Medium': return '#eab308'; // yellow
      case 'Low': return '#3b82f6'; // blue
      default: return '#6b7280';
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Open': return 'status-chip active';
      case 'In Progress': return 'status-chip pending';
      case 'Resolved': return 'status-chip success';
      case 'Closed': return 'status-chip inactive';
      default: return 'status-chip';
    }
  };

  return (
    <div className="my-report-container" onClick={() => setDropdownOpenId(null)}>
      <div className="page-header">
        <div className="page-title">
          <h1>My Reports</h1>
          <p>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            Total Issues: {reports.length}
          </p>
        </div>
        <div className="header-buttons">
          <button className="btn btn-primary" onClick={() => setIsDrawerOpen(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            Submit New Report
          </button>
        </div>
      </div>

      <div className="table-box">
        <div className="data-table-container" style={{ borderRadius: '12px' }}>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>LOCATION</th>
                <th>SPECIFIC AREA</th>
                <th>CATEGORY</th>
                <th>DESCRIPTION</th>
                <th>URGENCY</th>
                <th>STATUS</th>
                <th>DATE</th>
                <th style={{ textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isFetching ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={`skeleton-${index}`}>
                    <td><div className="skeleton-line short"></div></td>
                    <td><div className="skeleton-line medium"></div></td>
                    <td><div className="skeleton-line medium"></div></td>
                    <td><div className="skeleton-chip"></div></td>
                    <td><div className="skeleton-line long"></div></td>
                    <td><div className="skeleton-chip"></div></td>
                    <td><div className="skeleton-chip"></div></td>
                    <td><div className="skeleton-line short"></div></td>
                    <td>
                      <div className="row-actions" style={{ justifyContent: 'flex-end' }}>
                        <div className="skeleton-icon"></div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '24px' }}>
                    No reports submitted yet.
                  </td>
                </tr>
              ) : (
                reports.map((r) => (
                  <tr key={r.id}>
                  <td>
                    <span title={r.id} style={{ cursor: 'pointer', borderBottom: '1px dotted #888' }}>
                      {r.id.slice(-5).toUpperCase()}
                    </span>
                  </td>
                  <td><span style={{ fontWeight: 500 }}>{r.location}</span></td>
                  <td>{r.specificArea}</td>
                  <td><span className="role-chip">{r.category}</span></td>
                  <td>
                    <div className="report-description" title={r.description}>
                      {r.description.length > 40 ? r.description.substring(0, 40) + '...' : r.description}
                    </div>
                  </td>
                  <td>
                    <div className="urgency-badge" style={{ color: getUrgencyColor(r.urgency), borderColor: getUrgencyColor(r.urgency) }}>
                      <span className="urgency-dot" style={{ backgroundColor: getUrgencyColor(r.urgency) }}></span>
                      {r.urgency}
                    </div>
                  </td>
                  <td>
                    <span className={getStatusClass(r.status)}>{r.status}</span>
                  </td>
                  <td><span className="date-text">{r.date}</span></td>
                  <td style={{ position: 'relative' }}>
                    <div className="row-actions" style={{ justifyContent: 'flex-end' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" onClick={(e) => { if (r.id) toggleDropdown(r.id, e); }}><path d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
                    </div>
                    {r.id && dropdownOpenId === r.id && (
                      <div className="dropdown-menu">
                        <div className="dropdown-item">
                           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg>
                           Edit Report
                        </div>
                        <div className="dropdown-item danger">
                           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                           Delete Report
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="pagination">
            <span>1 to {reports.length} of {reports.length}</span>
            <div className="pagination-controls">
              <div className="page-arrows" style={{ opacity: 0.5, pointerEvents: 'none' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{opacity:0.3}}><path d="M11 17l-5-5 5-5M18 17l-5-5 5-5" /></svg>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{opacity:0.6}}><path d="M15 19l-7-7 7-7" /></svg>
              </div>
              <span>Page 1 of 1</span>
              <div className="page-arrows" style={{ opacity: 0.5, pointerEvents: 'none' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{opacity:0.3}}><path d="M9 5l7 7-7 7" /></svg>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{opacity:0.3}}><path d="M13 7l5 5-5 5M6 7l5 5-5 5" /></svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isDrawerOpen && (
        <div className="drawer-overlay" onClick={() => setIsDrawerOpen(false)}>
          <div className="drawer-content" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <h2>Report Details</h2>
              <button className="drawer-close" onClick={() => setIsDrawerOpen(false)}>×</button>
            </div>
            
            <div className="drawer-body">
              <form id="report-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Location</label>
                  <select 
                    value={location} 
                    onChange={e => setLocation(e.target.value)}
                    required
                  >
                    <option value="" disabled>Select Location</option>
                    <option value="Classroom">Classroom</option>
                    <option value="Dorm">Dorm</option>
                    <option value="Faculty Housing">Faculty Housing</option>
                    <option value="Old Campus">Old Campus</option>
                  </select>
                </div>

                {location === 'Classroom' ? (
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                    <div className="form-group" style={{ flex: '0 0 40%', marginBottom: 0 }}>
                      <label>Classroom name</label>
                      <input 
                        type="text" 
                        placeholder="e.g., 4A"
                        value={classroomName}
                        onChange={e => setClassroomName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group" style={{ flex: '1', marginBottom: 0 }}>
                      <label>Belongs to</label>
                      <input 
                        type="text" 
                        placeholder="e.g., Teacher Name or Department"
                        value={belongsTo}
                        onChange={e => setBelongsTo(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                ) : location === 'Dorm' ? (
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                    <div className="form-group" style={{ flex: '1', marginBottom: 0 }}>
                      <label>Dorm Name</label>
                      <select
                        value={dormName}
                        onChange={e => setDormName(e.target.value)}
                        required
                      >
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
                    <div className="form-group" style={{ flex: '1', marginBottom: 0 }}>
                      <label>Room Number</label>
                      <input 
                        type="text" 
                        placeholder="e.g., 101"
                        value={roomNumber}
                        onChange={e => setRoomNumber(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                ) : location === 'Faculty Housing' ? (
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                    <div className="form-group" style={{ flex: '1', marginBottom: 0 }}>
                      <label>Village</label>
                      <select
                        value={village}
                        onChange={e => setVillage(e.target.value)}
                        required
                      >
                        <option value="" disabled>Select Village</option>
                        <option value="Village 1">Village 1</option>
                        <option value="Village 2">Village 2</option>
                        <option value="Village 3">Village 3</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ flex: '1', marginBottom: 0 }}>
                      <label>Name of the Faculty</label>
                      <input 
                        type="text" 
                        placeholder="e.g., John Doe"
                        value={facultyName}
                        onChange={e => setFacultyName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                ) : location === 'Old Campus' ? (
                  <div className="form-group">
                    <label>Specific Area</label>
                    <select
                      value={specificArea}
                      onChange={e => setSpecificArea(e.target.value)}
                      required
                    >
                      <option value="" disabled>Select Area</option>
                      <optgroup label="Classrooms">
                        <option value="Classroom 1">Classroom 1</option>
                        <option value="Classroom 2">Classroom 2</option>
                        <option value="Classroom 3">Classroom 3</option>
                        <option value="Classroom 4">Classroom 4</option>
                        <option value="Classroom 5">Classroom 5</option>
                        <option value="Classroom 6">Classroom 6</option>
                      </optgroup>
                      <optgroup label="Hostels">
                        <option value="Hostel A">Hostel A</option>
                        <option value="Hostel B">Hostel B</option>
                        <option value="Hostel C">Hostel C</option>
                        <option value="Hostel D">Hostel D</option>
                      </optgroup>
                      <optgroup label="Other">
                        <option value="Library">Library</option>
                        <option value="Dining">Dining</option>
                      </optgroup>
                    </select>
                  </div>
                ) : (
                  <div className="form-group">
                    <label>Specific Area</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Room 302, Lab A"
                      value={specificArea}
                      onChange={e => setSpecificArea(e.target.value)}
                      required
                    />
                  </div>
                )}
                
                <div className="form-group">
                  <label>Category</label>
                  <select 
                    value={category} 
                    onChange={e => setCategory(e.target.value)}
                    required
                  >
                    <option value="" disabled>Select Category</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Urgency</label>
                  <div className="urgency-selector">
                    <button 
                      type="button" 
                      className={`urgency-btn low ${urgency === 'Low' ? 'active' : ''}`}
                      onClick={() => setUrgency('Low')}
                    >
                      <span className="urgency-dot"></span> Low
                    </button>
                    <button 
                      type="button" 
                      className={`urgency-btn medium ${urgency === 'Medium' ? 'active' : ''}`}
                      onClick={() => setUrgency('Medium')}
                    >
                      <span className="urgency-dot"></span> Medium
                    </button>
                    <button 
                      type="button" 
                      className={`urgency-btn high ${urgency === 'High' ? 'active' : ''}`}
                      onClick={() => setUrgency('High')}
                    >
                      <span className="urgency-dot"></span> High
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    Description 
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: '4px', verticalAlign: 'middle', color: '#9ca3af' }}><circle cx="12" cy="12" r="10" /><path d="M12 16v-4m0-4h.01" /></svg>
                  </label>
                  <textarea 
                    rows={4}
                    placeholder="Add a few notes to help you later..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    required
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>Attachment</label>
                  <label 
                    htmlFor="file-upload" 
                    className={`image-drop-zone ${imagePreview ? 'has-image' : ''}`}
                    style={{ 
                      backgroundImage: imagePreview ? `url(${imagePreview})` : 'none',
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      textAlign: 'center', 
                      cursor: 'pointer', 
                      padding: imagePreview ? '0' : '32px 16px',
                      height: imagePreview ? '180px' : 'auto',
                      border: '2px dashed #d1d5db',
                      borderRadius: '8px',
                      backgroundColor: '#f9fafb',
                      position: 'relative',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      overflow: 'hidden'
                    }}
                  >
                    <input 
                      id="file-upload" 
                      type="file" 
                      accept="image/*" 
                      style={{ display: 'none' }}
                      onChange={handleImageUpload}
                    />
                    {!imagePreview ? (
                      <>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" style={{ marginBottom: '8px' }}>
                          <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <div style={{ color: '#111827', fontWeight: 500, marginBottom: '8px' }}>
                          <strong>Click to upload</strong> or drag and drop
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          SVG, PNG, JPG or GIF (max. 5MB)
                        </div>
                      </>
                    ) : (
                      <div className="image-overlay" style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0,
                        transition: 'opacity 0.2s'
                      }}>
                        <button 
                          type="button" 
                          onClick={removeImage}
                          style={{
                            background: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: '#ef4444'
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </label>
                </div>
              </form>
            </div>

            <div className="drawer-footer">
              <button form="report-form" type="submit" disabled={isLoading} className="btn full-width" style={{ backgroundColor: '#2563eb', color: 'white', opacity: isLoading ? 0.7 : 1 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 13l4 4L19 7" /></svg>
                {isLoading ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
