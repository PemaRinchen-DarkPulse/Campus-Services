import React, { useState, useEffect } from 'react';
import './ReportsPage.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function formatTimeRange(timeFrom, durationHours, durationMins) {
  if (!timeFrom) return '';
  const [hourStr, minuteStr] = timeFrom.split(':');
  let startH = parseInt(hourStr, 10);
  let startM = parseInt(minuteStr, 10);
  const totalMins = startH * 60 + startM + (Number(durationHours) || 0) * 60 + (Number(durationMins) || 0);
  const endH = Math.floor(totalMins / 60) % 24;
  const endM = totalMins % 60;
  const fmt = (h, m) => {
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
  };
  return `${fmt(startH, startM)} - ${fmt(endH, endM)}`;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/bookings`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to fetch bookings');
        setBookings(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const [actionLoading, setActionLoading] = useState(null);

  const updateStatus = async (id, status) => {
    setActionLoading(id);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/bookings/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update status');
      setBookings((prev) => prev.map((b) => (b._id === id ? { ...b, status } : b)));
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(null);
      setOpenDropdownId(null);
    }
  };

  const toggleDropdown = (id) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Approved':
        return 'status-resolved';
      case 'Pending':
        return 'status-pending';
      default:
        return ''; // Custom inline style for Rejected
    }
  };

  return (
    <div className="reports-page-container">
      <div className="reports-header">
        <div>
          <h1 className="reports-title">Booking Requests</h1>
          <p className="reports-subtitle">Manage venue and facility booking requests</p>
        </div>
      </div>

      <div className="reports-card">
        {loading && (
          <div className="table-responsive" style={{ overflow: 'visible' }}>
            <table className="reports-table" style={{ width: '100%', tableLayout: 'fixed' }}>
              <thead>
                <tr>
                  <th style={{ width: '20%', textAlign: 'left', paddingLeft: '16px' }}>Venue</th>
                  <th style={{ width: '15%', textAlign: 'left' }}>Requester</th>
                  <th style={{ width: '25%', textAlign: 'left' }}>Purpose</th>
                  <th style={{ width: '20%', textAlign: 'left' }}>Date & Time</th>
                  <th style={{ width: '12%', textAlign: 'left' }}>Status</th>
                  <th style={{ width: '8%', textAlign: 'right', paddingRight: '16px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, index) => (
                  <tr key={`skeleton-${index}`}>
                    <td style={{ paddingLeft: '16px' }}><div className="skeleton-box" style={{ width: '75%', height: '20px', borderRadius: '4px' }}></div></td>
                    <td><div className="skeleton-box" style={{ width: '80%', height: '20px', borderRadius: '4px' }}></div></td>
                    <td><div className="skeleton-box" style={{ width: '90%', height: '20px', borderRadius: '4px' }}></div></td>
                    <td>
                      <div className="skeleton-box" style={{ width: '70%', height: '20px', borderRadius: '4px', marginBottom: '4px' }}></div>
                      <div className="skeleton-box" style={{ width: '55%', height: '14px', borderRadius: '4px' }}></div>
                    </td>
                    <td><div className="skeleton-box" style={{ width: '60%', height: '24px', borderRadius: '12px' }}></div></td>
                    <td style={{ textAlign: 'right', paddingRight: '16px' }}><div className="skeleton-box" style={{ width: '20px', height: '20px', borderRadius: '50%', margin: '0 0 0 auto' }}></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {error && <p style={{ padding: '16px', color: '#ef4444' }}>{error}</p>}
        {!loading && !error && (
        <div className="table-responsive" style={{ overflow: 'visible' }}>
          <table className="reports-table" style={{ width: '100%', tableLayout: 'fixed' }}>
            <thead>
              <tr>
                <th style={{ width: '20%', textAlign: 'left', paddingLeft: '16px' }}>Venue</th>
                <th style={{ width: '15%', textAlign: 'left' }}>Requester</th>
                <th style={{ width: '25%', textAlign: 'left' }}>Purpose</th>
                <th style={{ width: '20%', textAlign: 'left' }}>Date & Time</th>
                <th style={{ width: '12%', textAlign: 'left' }}>Status</th>
                <th style={{ width: '8%', textAlign: 'right', paddingRight: '16px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking, index) => (
                <tr key={booking._id}>
                  <td className="fw-medium" style={{ textAlign: 'left', paddingLeft: '16px' }}>{booking.spaceName}</td>
                  <td style={{ textAlign: 'left' }}>{booking.fullName}</td>
                  <td className="description-cell" style={{ textAlign: 'left' }}>{booking.purpose}</td>
                  <td style={{ textAlign: 'left' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span>{booking.date}</span>
                      <span className="description-cell" style={{ fontSize: '11px', marginTop: '2px' }}>{formatTimeRange(booking.timeFrom, booking.durationHours, booking.durationMins)}</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'left' }}>
                    <span 
                      className={`status-badge ${getStatusClass(booking.status)}`}
                      style={booking.status === 'Rejected' ? { color: '#ef4444' } : {}}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', paddingRight: '16px', position: 'relative' }}>
                    <div style={{ position: 'relative', display: 'inline-block', textAlign: 'left' }}>
                      <button 
                        onClick={() => toggleDropdown(booking._id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: '#666' }}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="5" cy="12" r="1.5"></circle>
                          <circle cx="12" cy="12" r="1.5"></circle>
                          <circle cx="19" cy="12" r="1.5"></circle>
                        </svg>
                      </button>
                      {openDropdownId === booking._id && (
                        <div style={{
                          position: 'absolute',
                          right: '0',
                          top: (bookings.length <= 2 || index >= bookings.length - 2) ? 'auto' : 'calc(100% + 4px)',
                          bottom: (bookings.length <= 2 || index >= bookings.length - 2) ? 'calc(100% + 4px)' : 'auto',
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
                            onClick={() => updateStatus(booking._id, 'Approved')}
                            disabled={actionLoading === booking._id || booking.status === 'Approved'}
                            style={{ padding: '8px 16px', border: 'none', background: 'white', textAlign: 'left', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center', color: '#16a34a', fontSize: '14px', opacity: booking.status === 'Approved' ? 0.4 : 1 }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f0fdf4'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            Accept
                          </button>
                          <button 
                            onClick={() => updateStatus(booking._id, 'Rejected')}
                            disabled={actionLoading === booking._id || booking.status === 'Rejected'}
                            style={{ padding: '8px 16px', border: 'none', background: 'white', textAlign: 'left', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center', color: '#ef4444', fontSize: '14px', opacity: booking.status === 'Rejected' ? 0.4 : 1 }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan="6" className="empty-state" style={{ textAlign: 'center' }}>No booking requests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  );
}