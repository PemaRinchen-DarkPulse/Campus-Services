import React, { useState, useEffect } from 'react';
import './ReportsPage.css';

export default function WorkHistoryPage() {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE_URL}/api/reports/history`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setHistory(result.data);
      }
    } catch (error) {
      console.error('Error fetching work history:', error);
    } finally {
      setIsLoading(false);
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

  return (
    <div className="reports-page-container">
      <div className="reports-header">
        <div>
          <h1 className="reports-title">Work History</h1>
          <p className="reports-subtitle">Review your past completed maintenance tasks</p>
        </div>
      </div>

      <div className="reports-card">
        <div className="table-responsive">
          <table className="reports-table">
            <thead>
              <tr>
                <th>Date Completed</th>
                <th>Location</th>
                <th>Specific Area</th>
                <th>Category</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={`skeleton-${index}`}>
                    <td style={{ textAlign: 'left', paddingLeft: '16px' }}><div className="skeleton-box" style={{ width: '80px', height: '20px', borderRadius: '4px' }}></div></td>
                    <td style={{ textAlign: 'left' }}><div className="skeleton-box" style={{ width: '100px', height: '20px', borderRadius: '4px' }}></div></td>
                    <td style={{ textAlign: 'left' }}><div className="skeleton-box" style={{ width: '120px', height: '20px', borderRadius: '4px' }}></div></td>
                    <td style={{ textAlign: 'left' }}><div className="skeleton-box" style={{ width: '80px', height: '24px', borderRadius: '12px' }}></div></td>
                    <td style={{ textAlign: 'left' }}><div className="skeleton-box" style={{ width: '200px', height: '20px', borderRadius: '4px' }}></div></td>
                  </tr>
                ))
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No work history found.</td>
                </tr>
              ) : (
                history.map((record) => (
                  <tr key={record._id}>
                    <td>{new Date(record.updatedAt).toLocaleDateString()}</td>
                    <td className="fw-medium">{record.location}</td>
                    <td className="fw-medium">{getSpecificArea(record)}</td>
                    <td>
                      <span className={getCategoryClass(record.category)}>{record.category}</span>
                    </td>
                    <td className="description-cell">{record.description}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
