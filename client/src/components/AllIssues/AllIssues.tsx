import React, { useState, useEffect } from 'react';
import './AllIssues.css';

interface ReportItem {
  id: string;
  image: string | null;
  location: string;
  specificArea: string;
  category: string;
  description: string;
  reportedBy: string;
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed' | 'Pending';
  date: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function AllIssues() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [dropdownOpenId, setDropdownOpenId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const isTeacher = user?.role === 'teacher';

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/reports/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success && Array.isArray(data.data)) {
        const arrayBufferToBase64 = (buffer: number[]) => {
          let binary = '';
          const bytes = new Uint8Array(buffer);
          const len = bytes.byteLength;
          for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          return window.btoa(binary);
        };

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
          reportedBy: r.reportedBy ? r.reportedBy.name : 'Unknown',
          urgency: r.urgency || 'Medium',
          status: r.status || 'Pending',
          date: r.createdAt ? new Date(r.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        }));
        setReports(formattedReports);
      }
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const toggleDropdown = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDropdownOpenId(dropdownOpenId === id ? null : id);
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
      case 'Open': 
      case 'Pending': return 'status-chip active';
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
          <h1>All Issues</h1>
          <p>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            Total Issues: {reports.length}
          </p>
        </div>
      </div>

      <div className="table-box">
        <div className="data-table-container" style={{ borderRadius: '12px' }}>
          <table>
            <thead>
              <tr>
                <th>LOCATION</th>
                <th>SPECIFIC AREA</th>
                <th>CATEGORY</th>
                <th>DESCRIPTION</th>
                <th>REPORTED BY</th>
                <th>URGENCY</th>
                <th>STATUS</th>
                <th>DATE</th>
                {!isTeacher && <th style={{ textAlign: 'right' }}>ACTIONS</th>}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={`skeleton-${index}`}>
                    <td><div className="skeleton-line short"></div></td>
                    <td><div className="skeleton-line medium"></div></td>
                    <td><div className="skeleton-chip"></div></td>
                    <td><div className="skeleton-line long"></div></td>
                    <td><div className="skeleton-line medium"></div></td>
                    <td><div className="skeleton-chip"></div></td>
                    <td><div className="skeleton-chip"></div></td>
                    <td><div className="skeleton-line short"></div></td>
                    {!isTeacher && (
                      <td>
                        <div className="row-actions" style={{ justifyContent: 'flex-end' }}>
                          <div className="skeleton-icon"></div>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={isTeacher ? 8 : 9} style={{ textAlign: 'center', padding: '24px' }}>No issues found.</td>
                </tr>
              ) : (
                reports.map((r) => (
                  <tr key={r.id}>
                    <td><span style={{ fontWeight: 500 }}>{r.location}</span></td>
                    <td>{r.specificArea}</td>
                    <td><span className="role-chip">{r.category}</span></td>
                    <td>
                      <div className="report-description" title={r.description}>
                        {r.description.length > 40 ? r.description.substring(0, 40) + '...' : r.description}
                      </div>
                    </td>
                    <td>
                      {r.reportedBy}
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
                    {!isTeacher && (
                      <td style={{ position: 'relative' }}>
                        <div className="row-actions" style={{ justifyContent: 'flex-end' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" title="Actions" onClick={(e) => { if (r.id) toggleDropdown(r.id, e); }}><path d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
                        </div>
                        {r.id && dropdownOpenId === r.id && (
                          <div className="dropdown-menu">
                            <div className="dropdown-item">
                               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 13l4 4L19 7" /></svg>
                               Mark as Resolved
                            </div>
                            <div className="dropdown-item">
                               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                               Mark In Progress
                            </div>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="pagination">
            <span>1 to {reports.length} of {reports.length}</span>
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
    </div>
  );
}
