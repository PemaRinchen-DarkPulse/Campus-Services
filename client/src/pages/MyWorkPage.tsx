import React, { useState, useEffect } from 'react';
import './ReportsPage.css';

export default function MyWorkPage() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  // Completion Offcanvas State
  const [isCompletionOffcanvasOpen, setIsCompletionOffcanvasOpen] = useState(false);
  const [selectedTaskForCompletion, setSelectedTaskForCompletion] = useState(null);
  const [completionForm, setCompletionForm] = useState({
    actionTaken: '',
    rootCause: '',
    materialsUsed: '',
    costDetail: '',
    notesAndRemarks: '',
    proofOfWork: null,
    imagePreview: null
  });

  useEffect(() => {
    fetchMyWork();
  }, []);

  const fetchMyWork = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/reports/assigned`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setTasks(result.data);
      }
    } catch (error) {
      console.error('Error fetching my work:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDropdown = (id) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Pending':
        return 'status-pending';
      case 'In Progress':
        return 'status-progress';
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

  const getPriorityColor = (priority) => {
    // Map urgency to priority color
    switch (priority) {
      case 'High': return '#ef4444';
      case 'Medium': return '#f59e0b';
      case 'Low': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const openCompletionOffcanvas = (task) => {
    setSelectedTaskForCompletion(task);
    setIsCompletionOffcanvasOpen(true);
  };

  const closeCompletionOffcanvas = () => {
    setIsCompletionOffcanvasOpen(false);
    setSelectedTaskForCompletion(null);
    setCompletionForm({
      actionTaken: '',
      rootCause: '',
      materialsUsed: '',
      costDetail: '',
      notesAndRemarks: '',
      proofOfWork: null,
      imagePreview: null
    });
  };

  const handleCompletionFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert("File size exceeds 10MB limit.");
        return;
      }

      setCompletionForm(prev => {
        const newState = { ...prev, proofOfWork: file };
        
        if (file.type.startsWith('image/')) {
          if (prev.imagePreview) {
            URL.revokeObjectURL(prev.imagePreview);
          }
          newState.imagePreview = URL.createObjectURL(file);
        } else {
          newState.imagePreview = null;
        }
        
        return newState;
      });
    }
  };

  const removeCompletionAttachment = () => {
    setCompletionForm(prev => {
      if (prev.imagePreview) {
        URL.revokeObjectURL(prev.imagePreview);
      }
      return {
        ...prev,
        proofOfWork: null,
        imagePreview: null
      };
    });
  };

  const handleCompletionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTaskForCompletion) return;

    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      const formData = new FormData();
      formData.append('actionTaken', completionForm.actionTaken);
      formData.append('rootCause', completionForm.rootCause);
      formData.append('materialsUsed', completionForm.materialsUsed);
      formData.append('costDetail', completionForm.costDetail);
      formData.append('notesAndRemarks', completionForm.notesAndRemarks);
      if (completionForm.proofOfWork) {
        formData.append('proofOfWork', completionForm.proofOfWork);
      }

      const response = await fetch(`${API_BASE_URL}/api/reports/${selectedTaskForCompletion._id}/resolve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const result = await response.json();
      if (result.success) {
        closeCompletionOffcanvas();
        fetchMyWork();
      } else {
        console.error('Failed to mark task as done:', result.message);
      }
    } catch (error) {
      console.error('Error marking task as done:', error);
    }
  };

  const getSpecificArea = (issue) => {
    switch (issue.location) {
      case 'Classroom':
        if (issue.classroomName && issue.teacher) {
          return `${issue.classroomName} (${issue.teacher})`;
        }
        return issue.classroomName || issue.classroom || 'Classroom';
      case 'Dorm':
        if (issue.dormName && issue.roomNumber) {
          return `${issue.dormName} - Room ${issue.roomNumber}`;
        }
        return issue.dormName || 'Dorm';
      case 'Faculty Housing':
        if (issue.village && issue.facultyName) {
          return `${issue.village} (${issue.facultyName})`;
        }
        return issue.village || 'Faculty Housing';
      case 'Old Campus':
        return issue.oldCampusArea || 'Old Campus';
      default:
        return issue.location || 'N/A';
    }
  };

  return (
    <div className="reports-page-container">
      <div className="reports-header">
        <div>
          <h1 className="reports-title">My Work</h1>
          <p className="reports-subtitle">Manage your currently assigned active tasks</p>
        </div>
      </div>

      <div className="reports-card">
        <div className="table-responsive" style={{ overflow: 'visible' }}>
          <table className="reports-table">
            <thead>
              <tr>
                <th>Priority</th>
                <th>Location</th>
                <th>Category</th>
                <th>Description</th>
                <th>Assigned Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right', paddingRight: '16px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={`skeleton-${index}`}>
                    <td style={{ textAlign: 'left', paddingLeft: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div className="skeleton-box" style={{ width: '8px', height: '8px', borderRadius: '50%' }}></div>
                        <div className="skeleton-box" style={{ width: '40px', height: '16px', borderRadius: '4px' }}></div>
                      </div>
                    </td>
                    <td style={{ textAlign: 'left' }}>
                      <div className="skeleton-box" style={{ width: '80%', height: '20px', borderRadius: '4px', marginBottom: '4px' }}></div>
                      <div className="skeleton-box" style={{ width: '60%', height: '14px', borderRadius: '4px' }}></div>
                    </td>
                    <td style={{ textAlign: 'left' }}><div className="skeleton-box" style={{ width: '60%', height: '24px', borderRadius: '12px' }}></div></td>
                    <td style={{ textAlign: 'left' }}><div className="skeleton-box" style={{ width: '100%', height: '20px', borderRadius: '4px' }}></div></td>
                    <td style={{ textAlign: 'left' }}><div className="skeleton-box" style={{ width: '80%', height: '20px', borderRadius: '4px' }}></div></td>
                    <td style={{ textAlign: 'left' }}><div className="skeleton-box" style={{ width: '60%', height: '24px', borderRadius: '12px' }}></div></td>
                    <td style={{ textAlign: 'right', paddingRight: '16px' }}>
                      <div className="skeleton-box" style={{ width: '20px', height: '20px', borderRadius: '50%', margin: '0 0 0 auto' }}></div>
                    </td>
                  </tr>
                ))
              ) : tasks.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-state" style={{ textAlign: 'center' }}>No active tasks. You're all caught up!</td>
                </tr>
              ) : tasks.map((task, index) => (
                <tr key={task._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ 
                        width: '8px', 
                        height: '8px', 
                        borderRadius: '50%', 
                        backgroundColor: getPriorityColor(task.urgency) 
                      }}></span>
                      {task.urgency || 'Low'}
                    </div>
                  </td>
                  <td className="fw-medium">
                    <div>{task.location}</div>
                    <div style={{ fontSize: '0.85em', color: '#64748b' }}>{getSpecificArea(task)}</div>
                  </td>
                  <td>
                    <span className={getCategoryClass(task.category)}>{task.category}</span>
                  </td>
                  <td className="description-cell">{task.description}</td>
                  <td>{task.assignedAt ? new Date(task.assignedAt).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(task.status)}`}>
                      {task.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', paddingRight: '16px', position: 'relative' }}>
                    <div style={{ position: 'relative', display: 'inline-block', textAlign: 'left' }}>
                      <button 
                        onClick={() => toggleDropdown(task._id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: '#666' }}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="5" cy="12" r="1.5"></circle>
                          <circle cx="12" cy="12" r="1.5"></circle>
                          <circle cx="19" cy="12" r="1.5"></circle>
                        </svg>
                      </button>
                      {openDropdownId === task._id && (
                        <div style={{
                          position: 'absolute',
                          right: '0',
                          top: (tasks.length <= 2 || index >= tasks.length - 2) ? 'auto' : 'calc(100% + 4px)',
                          bottom: (tasks.length <= 2 || index >= tasks.length - 2) ? 'calc(100% + 4px)' : 'auto',
                          background: 'white',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                          zIndex: 10,
                          display: 'flex',
                          flexDirection: 'column',
                          minWidth: '130px',
                          overflow: 'hidden'
                        }}>
                          <button 
                            onClick={() => {
                              toggleDropdown(task._id);
                              openCompletionOffcanvas(task);
                            }}
                            style={{ padding: '8px 16px', border: 'none', borderBottom: '1px solid #f1f5f9', background: 'white', textAlign: 'left', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center', color: '#16a34a', fontSize: '14px', whiteSpace: 'nowrap' }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f0fdf4'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            Mark Done
                          </button>
                          <button 
                            onClick={async () => {
                              toggleDropdown(task._id);
                              // Using the decline task route to unassign
                              try {
                                const token = localStorage.getItem('token');
                                const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                                await fetch(`${API_BASE_URL}/api/reports/${task._id}/decline`, {
                                  method: 'PUT',
                                  headers: { 'Authorization': `Bearer ${token}` }
                                });
                                fetchMyWork();
                              } catch (err) {
                                console.error('Error unassigning task:', err);
                              }
                            }}
                            style={{ padding: '8px 16px', border: 'none', background: 'white', textAlign: 'left', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center', color: '#dc2626', fontSize: '14px', whiteSpace: 'nowrap' }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                            Unassign task
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isCompletionOffcanvasOpen && selectedTaskForCompletion && (
        <>
          <div className="offcanvas-overlay" onClick={closeCompletionOffcanvas}></div>
          <div className="offcanvas-content">
            <div className="offcanvas-header">
              <h2>Complete Task</h2>
              <button className="btn-close" onClick={closeCompletionOffcanvas}>&times;</button>
            </div>
            <div className="offcanvas-body" style={{ overflowY: 'auto', padding: '24px' }}>
              <form onSubmit={handleCompletionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px', color: '#374151' }}>Action Taken <span style={{ color: '#ef4444' }}>*</span></label>
                  <textarea
                    required
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', minHeight: '80px', fontFamily: 'inherit' }}
                    value={completionForm.actionTaken}
                    onChange={(e) => setCompletionForm(prev => ({ ...prev, actionTaken: e.target.value }))}
                    placeholder="Describe what was done to resolve the issue"
                  />
                </div>
                
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px', color: '#374151' }}>Root Cause</label>
                  <input
                    type="text"
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px' }}
                    value={completionForm.rootCause}
                    onChange={(e) => setCompletionForm(prev => ({ ...prev, rootCause: e.target.value }))}
                    placeholder="What caused the issue?"
                  />
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px', color: '#374151' }}>Materials and Resources Used</label>
                  <textarea
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', minHeight: '60px', fontFamily: 'inherit' }}
                    value={completionForm.materialsUsed}
                    onChange={(e) => setCompletionForm(prev => ({ ...prev, materialsUsed: e.target.value }))}
                    placeholder="List the parts, tools, or resources used"
                  />
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px', color: '#374151' }}>Cost Detail (if applicable)</label>
                  <input
                    type="text"
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px' }}
                    value={completionForm.costDetail}
                    onChange={(e) => setCompletionForm(prev => ({ ...prev, costDetail: e.target.value }))}
                    placeholder="e.g. $50 for new piping"
                  />
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px', color: '#374151' }}>Proof of Work (Optional)</label>
                  <div className={`attachment-dropzone ${completionForm.proofOfWork ? 'has-file' : ''}`}>
                    <label htmlFor="proof-upload" style={{ display: 'block', width: '100%', height: '100%', cursor: 'pointer' }}>
                      <input 
                        id="proof-upload"
                        type="file" 
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleCompletionFileChange}
                        style={{ display: 'none' }}
                      />
                      {!completionForm.proofOfWork && (
                        <div style={{ padding: '32px 20px' }}>
                          <svg className="attachment-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                          <div className="attachment-text">Click to upload or drag and drop</div>
                          <div className="attachment-subtext">PDF, JPG, JPEG, PNG less than 10MB.<br/>Ensure your document is in good condition and readable</div>
                        </div>
                      )}
                    </label>

                    {completionForm.proofOfWork && (
                      <div className="attachment-preview-container">
                        <button type="button" className="remove-attachment-btn" onClick={removeCompletionAttachment}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                        {completionForm.proofOfWork.type?.startsWith('image/') ? (
                          <img 
                            src={completionForm.imagePreview} 
                            alt="Attachment preview" 
                            className="attachment-image-full"
                          />
                        ) : (
                          <div className="pdf-preview-full">
                            <svg className="pdf-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                            <div className="pdf-name">{completionForm.proofOfWork.name}</div>
                            <div className="pdf-size">{(completionForm.proofOfWork.size / 1024 / 1024).toFixed(2)} MB</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px', color: '#374151' }}>Notes and Remarks</label>
                  <textarea
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', minHeight: '80px', fontFamily: 'inherit' }}
                    value={completionForm.notesAndRemarks}
                    onChange={(e) => setCompletionForm(prev => ({ ...prev, notesAndRemarks: e.target.value }))}
                    placeholder="Any additional information, follow-ups needed, etc."
                  />
                </div>
              </form>
            </div>
            <div className="offcanvas-footer">
              <button type="submit" onClick={handleCompletionSubmit} className="btn-primary" style={{ backgroundColor: '#16a34a' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Submit & Mark Done
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
