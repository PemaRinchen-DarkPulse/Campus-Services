import React, { useState } from 'react';
import './ReportsPage.css';

const initialReports = [
  {
    id: 1,
    location: 'Classroom A102',
    description: 'Projector projector HDMI cable is broken',
    category: 'Electrical',
    status: 'Pending',
    image: 'https://via.placeholder.com/50',
  },
  {
    id: 2,
    location: 'Dorm Block B',
    description: 'Leaking pipe in the second-floor bathroom',
    category: 'Plumbing',
    status: 'In Progress',
    image: 'https://via.placeholder.com/50',
  },
  {
    id: 3,
    location: 'Faculty Housing',
    description: 'Broken chair needs replacement',
    category: 'Furniture',
    status: 'Resolved',
    image: 'https://via.placeholder.com/50',
  }
];

export default function ReportsPage({ openModal: openModalProp, onModalOpened }) {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  // Open modal when parent signals it (e.g. "Submit New Report" from dashboard)
  React.useEffect(() => {
    if (openModalProp) {
      setIsModalOpen(true);
      onModalOpened?.();
    }
  }, [openModalProp]);
  const [newReport, setNewReport] = useState({
    location: '',
    description: '',
    category: '',
    urgency: 'Low',
    status: 'Pending',
    attachment: null,
    imagePreview: null
  });

  const toggleDropdown = (id) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  React.useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/reports`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setReports(result.data);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReport((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const fileUrl = URL.createObjectURL(file);
        setNewReport((prev) => ({ ...prev, attachment: file, imagePreview: fileUrl }));
      } else {
        setNewReport((prev) => ({ ...prev, attachment: file, imagePreview: 'https://via.placeholder.com/50?text=DOC' }));
      }
    }
    // reset input value so you can trigger onChange again with the same file if needed
    e.target.value = null;
  };

  const removeAttachment = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (newReport.imagePreview && newReport.imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(newReport.imagePreview);
    }
    setNewReport((prev) => ({ ...prev, attachment: null, imagePreview: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('location', newReport.location);
    formData.append('category', newReport.category);
    formData.append('urgency', newReport.urgency);
    formData.append('description', newReport.description);
    formData.append('status', newReport.status);

    if (newReport.location === 'Classroom') {
      formData.append('classroomName', newReport.classroomName || '');
      formData.append('teacher', newReport.belongsTo || '');
    } else if (newReport.location === 'Dorm') {
      formData.append('dormName', newReport.dormName || '');
      formData.append('roomNumber', newReport.roomNumber || '');
    } else if (newReport.location === 'Faculty Housing') {
      formData.append('village', newReport.village || '');
      formData.append('facultyName', newReport.facultyName || '');
    } else if (newReport.location === 'Old Campus') {
      formData.append('oldCampusArea', newReport.oldCampusArea || '');
    }

    if (newReport.attachment) {
      formData.append('image', newReport.attachment);
    }

    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/reports`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        setReports([result.data, ...reports]);
        setNewReport({ location: '', description: '', category: '', urgency: 'Low', status: 'Pending', attachment: null, imagePreview: null });
        if (newReport.imagePreview && newReport.imagePreview.startsWith('blob:')) {
          URL.revokeObjectURL(newReport.imagePreview);
        }
        handleCloseModal();
      } else {
        alert(result.message || 'Failed to create report');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('An error occurred while submitting the report.');
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Pending':
        return 'status-pending';
      case 'In Progress':
        return 'status-progress';
      case 'Resolved':
        return 'status-resolved';
      default:
        return '';
    }
  };

  const getCategoryClass = (category) => {
    switch (category) {
      case 'Electrical':
        return 'td-badge badge-electrical';
      case 'Plumbing':
        return 'td-badge badge-plumbing';
      case 'Furniture':
        return 'td-badge badge-furniture';
      default:
        return 'td-badge badge-other';
    }
  };

  const getImageUrl = (image) => {
    if (!image) return 'https://via.placeholder.com/50';
    if (typeof image === 'string') return image;
    if (image.data && image.data.data) {
      const base64String = btoa(
        new Uint8Array(image.data.data).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );
      return `data:${image.contentType};base64,${base64String}`;
    }
    return 'https://via.placeholder.com/50';
  };

  const getSpecificArea = (report) => {
    switch (report.location) {
      case 'Classroom':
        if (report.classroomName && report.teacher) {
          return (
            <>
              <div>{report.classroomName}</div>
              <div style={{ fontSize: '0.9em', color: '#64748b', marginTop: '2px' }}>Belongs to: {report.teacher}</div>
            </>
          );
        }
        return report.classroomName || report.classroom || 'N/A';
      case 'Dorm':
        if (report.dormName && report.roomNumber) {
          return (
            <>
              <div>{report.dormName}</div>
              <div style={{ fontSize: '0.9em', color: '#64748b', marginTop: '2px' }}>Room: {report.roomNumber}</div>
            </>
          );
        }
        return report.dormName || report.classroom || 'N/A';
      case 'Faculty Housing':
        if (report.village && report.facultyName) {
          return (
            <>
              <div>{report.village}</div>
              <div style={{ fontSize: '0.9em', color: '#64748b', marginTop: '2px' }}>Faculty: {report.facultyName}</div>
            </>
          );
        }
        return report.village || report.classroom || 'N/A';
      case 'Old Campus':
        return report.oldCampusArea || report.classroom || 'N/A';
      default:
        return report.classroom || 'N/A';
    }
  };

  return (
    <div className="reports-page-container">
      <div className="reports-header">
        <div>
          <h1 className="reports-title">My Reports</h1>
          <p className="reports-subtitle">View and manage all your reports here</p>
        </div>
        <button className="btn-new-report" onClick={handleOpenModal}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none"><line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2"/><line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2"/></svg>
          New Report
        </button>
      </div>

      <div className="reports-card">
        <div className="table-responsive" style={{ overflow: 'visible' }}>
          <table className="reports-table" style={{ width: '100%', tableLayout: 'fixed' }}>
            <thead>
              <tr>
                <th style={{ width: '8%', textAlign: 'left', paddingLeft: '16px' }}>Image</th>
                <th style={{ width: '12%', textAlign: 'left' }}>Location</th>
                <th style={{ width: '15%', textAlign: 'left' }}>Specific Area</th>
                <th style={{ width: '10%', textAlign: 'left' }}>Category</th>
                <th style={{ width: '25%', textAlign: 'left' }}>Description</th>
                <th style={{ width: '8%', textAlign: 'left' }}>Urgency</th>
                <th style={{ width: '8%', textAlign: 'left' }}>Status</th>
                <th style={{ width: '8%', textAlign: 'left' }}>Date</th>
                <th style={{ width: '6%', textAlign: 'right', paddingRight: '16px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={`skeleton-${index}`}>
                    <td style={{ textAlign: 'left', paddingLeft: '16px' }}>
                      <div className="skeleton-box" style={{ width: '40px', height: '40px', borderRadius: '4px' }}></div>
                    </td>
                    <td style={{ textAlign: 'left' }}><div className="skeleton-box" style={{ width: '80%', height: '20px', borderRadius: '4px' }}></div></td>
                    <td style={{ textAlign: 'left' }}>
                      <div className="skeleton-box" style={{ width: '90%', height: '20px', borderRadius: '4px', marginBottom: '4px' }}></div>
                      <div className="skeleton-box" style={{ width: '60%', height: '14px', borderRadius: '4px' }}></div>
                    </td>
                    <td style={{ textAlign: 'left' }}><div className="skeleton-box" style={{ width: '60%', height: '24px', borderRadius: '12px' }}></div></td>
                    <td style={{ textAlign: 'left' }}><div className="skeleton-box" style={{ width: '100%', height: '20px', borderRadius: '4px' }}></div></td>
                    <td style={{ textAlign: 'left' }}><div className="skeleton-box" style={{ width: '50%', height: '20px', borderRadius: '4px' }}></div></td>
                    <td style={{ textAlign: 'left' }}><div className="skeleton-box" style={{ width: '60%', height: '24px', borderRadius: '12px' }}></div></td>
                    <td style={{ textAlign: 'left' }}><div className="skeleton-box" style={{ width: '80%', height: '20px', borderRadius: '4px' }}></div></td>
                    <td style={{ textAlign: 'right', paddingRight: '16px' }}>
                      <div className="skeleton-box" style={{ width: '20px', height: '20px', borderRadius: '50%', margin: '0 0 0 auto' }}></div>
                    </td>
                  </tr>
                ))
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan="9" className="empty-state" style={{ textAlign: 'center' }}>No reports found. Create one to get started.</td>
                </tr>
              ) : (
                reports.map((report, index) => (
                  <tr key={report._id || report.id}>
                    <td style={{ textAlign: 'left', paddingLeft: '16px' }}>
                      <img src={getImageUrl(report.image)} alt="Report Thumbnail" className="report-thumb" />
                    </td>
                  <td className="fw-medium" style={{ textAlign: 'left' }}>{report.location}</td>
                  <td style={{ textAlign: 'left' }}>{getSpecificArea(report)}</td>
                  <td style={{ textAlign: 'left' }}>
                    <span className={getCategoryClass(report.category)}>{report.category}</span>
                  </td>
                  <td className="description-cell" style={{ textAlign: 'left' }}>{report.description}</td>
                  <td style={{ textAlign: 'left' }}>
                    <span style={{ 
                      fontWeight: '500', 
                      color: report.urgency === 'High' ? '#ef4444' : report.urgency === 'Medium' ? '#f97316' : '#64748b' 
                    }}>
                      {report.urgency || 'Low'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'left' }}>
                    <span className={`status-badge ${getStatusClass(report.status)}`}>
                      {report.status}
                    </span>
                  </td>
                  <td style={{ color: '#64748b', fontSize: '13px', textAlign: 'left' }}>
                    {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td style={{ textAlign: 'right', paddingRight: '16px', position: 'relative' }}>
                    <div style={{ position: 'relative', display: 'inline-block', textAlign: 'left' }}>
                      <button 
                        onClick={() => toggleDropdown(report._id || report.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: '#666' }}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="5" cy="12" r="1.5"></circle>
                          <circle cx="12" cy="12" r="1.5"></circle>
                          <circle cx="19" cy="12" r="1.5"></circle>
                        </svg>
                      </button>
                      {openDropdownId === (report._id || report.id) && (
                        <div style={{
                          position: 'absolute',
                          right: '0',
                          top: (reports.length <= 2 || index >= reports.length - 2) ? 'auto' : 'calc(100% + 4px)',
                          bottom: (reports.length <= 2 || index >= reports.length - 2) ? 'calc(100% + 4px)' : 'auto',
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
                            onClick={() => toggleDropdown(report._id || report.id)}
                            style={{ padding: '8px 16px', border: 'none', borderBottom: '1px solid #f1f5f9', background: 'white', textAlign: 'left', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center', color: '#334155', fontSize: '14px' }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            Edit
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
          <div className="offcanvas-content" onClick={(e) => e.stopPropagation()}>
            <div className="offcanvas-header">
              <h2>Report Details</h2>
              <div className="offcanvas-header-actions">
                <button className="btn-close" onClick={handleCloseModal}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            </div>
            
            <div className="offcanvas-body">
              <form onSubmit={handleSubmit} id="new-report-form">
                <div className="form-group">
                  <label>Location</label>
                  <select 
                    name="location" 
                    value={newReport.location} 
                    onChange={handleInputChange} 
                    required
                  >
                    <option value="" disabled>Select Location</option>
                    <option value="Classroom">Classroom</option>
                    <option value="Dorm">Dorm</option>
                    <option value="Faculty Housing">Faculty Housing</option>
                    <option value="Old Campus">Old Campus</option>
                  </select>
                </div>

                {newReport.location === 'Classroom' && (
                  <div className="form-row-split">
                    <div className="form-group form-col-35">
                      <label>Classroom Name</label>
                      <input 
                        type="text"
                        name="classroomName" 
                        value={newReport.classroomName || ''} 
                        onChange={handleInputChange} 
                        placeholder="e.g., Classroom A"
                        required
                      />
                    </div>
                    <div className="form-group form-col-65">
                      <label>Belongs To</label>
                      <input 
                        type="text"
                        name="belongsTo" 
                        value={newReport.belongsTo || ''} 
                        onChange={handleInputChange} 
                        placeholder="e.g., Pema"
                        required
                      />
                    </div>
                  </div>
                )}

                {newReport.location === 'Dorm' && (
                  <div className="form-row-split">
                    <div className="form-group form-col-60">
                      <label>Dorm Name</label>
                      <select 
                        name="dormName" 
                        value={newReport.dormName || ''} 
                        onChange={handleInputChange} 
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
                    <div className="form-group form-col-40">
                      <label>Room Number</label>
                      <input 
                        type="text"
                        name="roomNumber" 
                        value={newReport.roomNumber || ''} 
                        onChange={handleInputChange} 
                        placeholder="e.g., 101"
                        required
                      />
                    </div>
                  </div>
                )}

                {newReport.location === 'Faculty Housing' && (
                  <div className="form-row-split">
                    <div className="form-group form-col-50">
                      <label>Village</label>
                      <select 
                        name="village" 
                        value={newReport.village || ''} 
                        onChange={handleInputChange} 
                        required
                      >
                        <option value="" disabled>Select Village</option>
                        <option value="Village 1">Village 1</option>
                        <option value="Village 2">Village 2</option>
                        <option value="Village 3">Village 3</option>
                      </select>
                    </div>
                    <div className="form-group form-col-50">
                      <label>Name of the Faculty</label>
                      <input 
                        type="text"
                        name="facultyName" 
                        value={newReport.facultyName || ''} 
                        onChange={handleInputChange} 
                        placeholder="e.g., John Doe"
                        required
                      />
                    </div>
                  </div>
                )}

                {newReport.location === 'Old Campus' && (
                  <div className="form-group">
                    <label>Specific Area</label>
                    <select 
                      name="oldCampusArea" 
                      value={newReport.oldCampusArea || ''} 
                      onChange={handleInputChange} 
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
                )}

                <div className="form-group">
                  <label>Category</label>
                  <select 
                    name="category" 
                    value={newReport.category} 
                    onChange={handleInputChange} 
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
                  <div className="urgency-toggle">
                    {['Low', 'Medium', 'High'].map((level) => (
                      <button
                        key={level}
                        type="button"
                        className={`urgency-btn urgency-${level.toLowerCase()} ${newReport.urgency === level ? 'active' : ''}`}
                        onClick={() => setNewReport((prev) => ({ ...prev, urgency: level }))}
                      >
                        <span className="urgency-dot" />
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    Description 
                    <svg className="icon-help" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                  </label>
                  <textarea 
                    name="description" 
                    value={newReport.description} 
                    onChange={handleInputChange} 
                    placeholder="Add a few notes to help you later..." 
                    rows="4"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Attachment</label>
                  <div className={`attachment-dropzone ${newReport.attachment ? 'has-file' : ''}`}>
                    <label htmlFor="file-upload" style={{ display: 'block', width: '100%', height: '100%', cursor: 'pointer' }}>
                      <input 
                        id="file-upload"
                        type="file" 
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                      />
                      {!newReport.attachment && (
                        <div style={{ padding: '32px 20px' }}>
                          <svg className="attachment-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                          <div className="attachment-text">Click to upload or drag and drop</div>
                          <div className="attachment-subtext">PDF, JPG, JPEG, PNG less than 10MB.<br/>Ensure your document is in good condition and readable</div>
                        </div>
                      )}
                    </label>

                    {newReport.attachment && (
                      <div className="attachment-preview-container">
                        <button className="remove-attachment-btn" onClick={removeAttachment}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                        {newReport.attachment.type?.startsWith('image/') ? (
                          <img 
                            src={newReport.imagePreview} 
                            alt="Attachment preview" 
                            className="attachment-image-full"
                          />
                        ) : (
                          <div className="document-preview">
                            <svg className="attachment-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><path d="M22 11.08V12a10 10 10 0 1-5.93 9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                            <div className="attachment-text" style={{ color: '#22c55e', marginTop: '8px'}}>{newReport.attachment.name}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </div>
            
            <div className="offcanvas-footer">
              <button type="submit" form="new-report-form" className="btn-primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}