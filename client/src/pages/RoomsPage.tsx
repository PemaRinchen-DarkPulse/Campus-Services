import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import './ReportsPage.css';

const API = 'http://localhost:5000/api/rooms';
const authHeader = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` });

const DORMS = ['Girls Dorm A', 'Girls Dorm B', 'Girls Dorm C', 'Boys Dorm A', 'Boys Dorm B', 'Boys Dorm C'];

const DORM_COLORS = [
  { color: '#ec4899', bg: '#fdf2f8' },
  { color: '#f97316', bg: '#fff7ed' },
  { color: '#8b5cf6', bg: '#f5f3ff' },
  { color: '#3b82f6', bg: '#eff6ff' },
  { color: '#10b981', bg: '#f0fdf4' },
  { color: '#f59e0b', bg: '#fffbeb' },
];

const getDormColor = (dorm) => {
  const i = DORMS.indexOf(dorm);
  return i >= 0 ? DORM_COLORS[i] : { color: '#64748b', bg: '#f1f5f9' };
};

const emptyForm = { studentName: '', dorm: '', roomNumber: '' };
const emptyBulkRow = () => ({ id: Date.now() + Math.random(), studentName: '', dorm: '', roomNumber: '' });

export default function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [dormFilter, setDormFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [assignMode, setAssignMode] = useState('single'); // 'single' | 'bulk'
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [bulkRows, setBulkRows] = useState([emptyBulkRow()]);
  const [bulkError, setBulkError] = useState('');
  const [excelFileName, setExcelFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchRooms = async () => {
      setIsLoading(true);
      setFetchError('');
      try {
        const res = await fetch(API, { headers: authHeader() });
        const data = await res.json();
        if (data.success) {
          setRooms(data.data.map(r => ({ ...r, id: r._id })));
        } else {
          setFetchError(data.message || 'Failed to load room assignments.');
        }
      } catch {
        setFetchError('Could not connect to the server.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const filtered = rooms.filter((r) => {
    const matchSearch =
      r.studentName.toLowerCase().includes(search.toLowerCase()) ||
      r.roomNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.dorm.toLowerCase().includes(search.toLowerCase());
    const matchDorm = dormFilter ? r.dorm === dormFilter : true;
    return matchSearch && matchDorm;
  });

  const handleOpenAdd = () => {
    setIsEditing(false);
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
    setBulkRows([emptyBulkRow()]);
    setBulkError('');
    setAssignMode('single');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (room) => {
    setIsEditing(true);
    setEditingId(room._id || room.id);
    setForm({ studentName: room.studentName, dorm: room.dorm, roomNumber: room.roomNumber });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setForm(emptyForm);
    setFormError('');
    setBulkRows([emptyBulkRow()]);
    setBulkError('');
    setExcelFileName('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.studentName.trim() || !form.dorm.trim() || !form.roomNumber.trim()) {
      setFormError('All fields are required.');
      return;
    }
    setIsSaving(true);
    try {
      if (isEditing) {
        const res = await fetch(`${API}/${editingId}`, {
          method: 'PUT',
          headers: authHeader(),
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) { setFormError(data.message || 'Failed to update.'); return; }
        setRooms(prev => prev.map(r => (r._id || r.id) === editingId ? { ...data.data, id: data.data._id } : r));
      } else {
        const res = await fetch(API, {
          method: 'POST',
          headers: authHeader(),
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) { setFormError(data.message || 'Failed to save.'); return; }
        setRooms(prev => [{ ...data.data, id: data.data._id }, ...prev]);
      }
      handleClose();
    } catch {
      setFormError('Could not connect to the server.');
    } finally {
      setIsSaving(false);
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
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i)) {
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
        const mapped = rows.map((row) => {
          // Accept common column name variations (case-insensitive)
          const keys = Object.keys(row);
          const findVal = (...names) => {
            const key = keys.find(k => names.some(n => k.trim().toLowerCase() === n.toLowerCase()));
            return key ? String(row[key]).trim() : '';
          };
          return {
            id: Date.now() + Math.random(),
            studentName: findVal('studentName', 'student name', 'name', 'student'),
            dorm: findVal('dorm', 'dormitory', 'building'),
            roomNumber: findVal('roomNumber', 'room number', 'room no', 'room no.', 'room'),
          };
        });
        setBulkRows(mapped.length > 0 ? mapped : [emptyBulkRow()]);
      } catch {
        setBulkError('Failed to read the Excel file. Please check the format.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    const hasEmpty = bulkRows.some(r => !r.studentName.trim() || !r.dorm.trim() || !r.roomNumber.trim());
    if (hasEmpty) {
      setBulkError('Please fill in all fields for every row.');
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch(`${API}/bulk`, {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({ assignments: bulkRows.map(r => ({ studentName: r.studentName.trim(), dorm: r.dorm.trim(), roomNumber: r.roomNumber.trim() })) }),
      });
      const data = await res.json();
      if (!res.ok) { setBulkError(data.message || 'Failed to save.'); return; }
      setRooms(prev => [...data.data.map(r => ({ ...r, id: r._id })), ...prev]);
      handleClose();
    } catch {
      setBulkError('Could not connect to the server.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this room assignment? This cannot be undone.')) return;
    try {
      const res = await fetch(`${API}/${id}`, { method: 'DELETE', headers: authHeader() });
      if (res.ok) {
        setRooms(prev => prev.filter(r => (r._id || r.id) !== id));
      }
    } catch {
      // silently fail — item stays in list
    }
    setOpenDropdownId(null);
  };

  const dormCounts = rooms.reduce((acc, r) => {
    acc[r.dorm] = (acc[r.dorm] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="reports-page-container">
      {/* HEADER */}
      <div className="reports-header">
        <div>
          <h1 className="reports-title">Rooms</h1>
          <p className="reports-subtitle">View and manage student dorm room assignments</p>
        </div>
        <button className="btn-new-report" onClick={handleOpenAdd}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
            <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" />
            <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" />
          </svg>
          Assign Room
        </button>
      </div>

      {/* SUMMARY CHIPS */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {DORMS.map((dorm, i) => {
          const { color, bg } = DORM_COLORS[i % DORM_COLORS.length];
          const count = dormCounts[dorm] || 0;
          const isActive = dormFilter === dorm;
          return (
            <button
              key={dorm}
              onClick={() => setDormFilter(isActive ? '' : dorm)}
              style={{
                ...chipStyle(color, bg),
                cursor: 'pointer',
                border: `1px solid ${isActive ? color : color + '22'}`,
                boxShadow: isActive ? `0 2px 8px ${color}33` : 'none',
                fontWeight: isActive ? 700 : 500,
                outline: 'none',
              }}
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke={color} strokeWidth="2" />
                <polyline points="9 22 9 12 15 12 15 22" stroke={color} strokeWidth="2" />
              </svg>
              <span>{dorm} &nbsp;<strong>({count})</strong></span>
            </button>
          );
        })}
      </div>


      {/* TABLE */}
      <div className="reports-card">
        <div className="table-responsive">
          <table className="reports-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ width: '5%', paddingLeft: '16px', textAlign: 'left' }}>#</th>
                <th style={{ width: '40%', textAlign: 'left' }}>Student Name</th>
                <th style={{ width: '35%', textAlign: 'left' }}>Dorm</th>
                <th style={{ width: '10%', textAlign: 'left' }}>Room No.</th>
                <th style={{ width: '10%', paddingRight: '16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="5" className="empty-state" style={{ textAlign: 'center' }}>Loading room assignments…</td></tr>
              ) : fetchError ? (
                <tr><td colSpan="5" className="empty-state" style={{ textAlign: 'center', color: '#ef4444' }}>{fetchError}</td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-state" style={{ textAlign: 'center' }}>No room assignments found.</td>
                </tr>
              ) : (
                filtered.map((room, index) => (
                  <tr key={room._id || room.id}>
                    <td style={{ paddingLeft: '16px', color: '#9ca3af', fontSize: '13px' }}>
                      {String(index + 1).padStart(2, '0')}
                    </td>
                    <td style={{ textAlign: 'left' }}>
                      <span style={{ fontWeight: 500, color: '#1e293b', fontSize: '14px' }}>{room.studentName}</span>
                    </td>
                    <td style={{ textAlign: 'left' }}>
                      {(() => { const { color, bg } = getDormColor(room.dorm); return (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '20px', background: bg, color: color, fontSize: '12px', fontWeight: 600, border: `1px solid ${color}33` }}>
                          <svg viewBox="0 0 24 24" width="12" height="12" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke={color} strokeWidth="2"/><polyline points="9 22 9 12 15 12 15 22" stroke={color} strokeWidth="2"/></svg>
                          {room.dorm}
                        </span>
                      ); })()}
                    </td>
                    <td style={{ textAlign: 'left', fontWeight: 600, color: '#334155', fontSize: '14px' }}>
                      {room.roomNumber}
                    </td>
                    <td style={{ textAlign: 'right', paddingRight: '16px', position: 'relative' }}>
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <button
                          onClick={() => setOpenDropdownId(openDropdownId === (room._id || room.id) ? null : (room._id || room.id))}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: '#666' }}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="5" cy="12" r="1.5" />
                            <circle cx="12" cy="12" r="1.5" />
                            <circle cx="19" cy="12" r="1.5" />
                          </svg>
                        </button>
                        {openDropdownId === (room._id || room.id) && (
                          <div style={dropdownStyle}>
                            <button
                              onClick={() => { setOpenDropdownId(null); handleOpenEdit(room); }}
                              style={dropdownBtnStyle}
                              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(room._id || room.id)}
                              style={{ ...dropdownBtnStyle, borderBottom: 'none', color: '#ef4444' }}
                              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="offcanvas-overlay" onClick={handleClose}>
          <div className="offcanvas-content" onClick={(e) => e.stopPropagation()} style={{ width: assignMode === 'bulk' ? '680px' : undefined }}>
            <div className="offcanvas-header">
              <h2>{isEditing ? 'Edit Room Assignment' : 'Assign Room'}</h2>
              <button className="btn-close" onClick={handleClose}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Mode Tabs — only shown when adding (not editing) */}
            {!isEditing && (
              <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid #e2e8f0', padding: '0 24px' }}>
                {['single', 'bulk'].map((mode) => {
                  const label = mode === 'single' ? 'Single Assignment' : 'Bulk Assignment';
                  const icon = mode === 'single'
                    ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a6 6 0 0 1 12 0v2"/></svg>
                    : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
                  const isActive = assignMode === mode;
                  return (
                    <button
                      key={mode}
                      onClick={() => { setAssignMode(mode); setFormError(''); setBulkError(''); }}
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
              {/* ── SINGLE ASSIGNMENT ── */}
              {(assignMode === 'single' || isEditing) && (
                <form onSubmit={handleSubmit} id="room-form">
                  {formError && (
                    <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '6px', padding: '10px 12px', marginBottom: '16px', color: '#dc2626', fontSize: '13px' }}>
                      {formError}
                    </div>
                  )}
                  <div className="form-group">
                    <label>Student Name</label>
                    <input type="text" name="studentName" value={form.studentName} onChange={handleChange} placeholder="e.g., John Doe" required />
                  </div>
                  <div className="form-group">
                    <label>Dorm</label>
                    <select name="dorm" value={form.dorm} onChange={handleChange} required>
                      <option value="">Select Dorm…</option>
                      {DORMS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Room Number</label>
                    <input type="text" name="roomNumber" value={form.roomNumber} onChange={handleChange} placeholder="e.g., 101" required />
                  </div>
                </form>
              )}

              {/* ── BULK ASSIGNMENT ── */}
              {assignMode === 'bulk' && !isEditing && (
                <form onSubmit={handleBulkSubmit} id="bulk-form">
                  {bulkError && (
                    <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '6px', padding: '10px 12px', marginBottom: '16px', color: '#dc2626', fontSize: '13px' }}>
                      {bulkError}
                    </div>
                  )}

                  {/* Excel Upload Zone */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleExcelUpload(e.dataTransfer.files[0]); }}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: `2px dashed ${isDragging ? '#6366f1' : '#cbd5e1'}`,
                      borderRadius: '10px',
                      padding: '20px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: isDragging ? '#eef2ff' : '#f8fafc',
                      marginBottom: '16px',
                      transition: 'all 0.15s',
                    }}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls"
                      style={{ display: 'none' }}
                      onChange={(e) => handleExcelUpload(e.target.files[0])}
                    />
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
                          <span style={{ fontSize: '12px', color: '#94a3b8' }}>.xlsx or .xls &nbsp;·&nbsp; Columns: <strong>Student Name</strong>, <strong>Dorm</strong>, <strong>Room Number</strong></span>
                        </>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                    <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500', whiteSpace: 'nowrap' }}>OR FILL IN MANUALLY</span>
                    <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc' }}>
                          <th style={bulkThStyle}>#</th>
                          <th style={bulkThStyle}>Student Name</th>
                          <th style={bulkThStyle}>Dorm</th>
                          <th style={bulkThStyle}>Room No.</th>
                          <th style={{ ...bulkThStyle, width: '40px' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {bulkRows.map((row, idx) => (
                          <tr key={row.id}>
                            <td style={bulkTdStyle}>
                              <span style={{ color: '#9ca3af', fontSize: '12px' }}>{String(idx + 1).padStart(2, '0')}</span>
                            </td>
                            <td style={bulkTdStyle}>
                              <input
                                type="text"
                                value={row.studentName}
                                onChange={(e) => handleBulkChange(row.id, 'studentName', e.target.value)}
                                placeholder="Student name"
                                style={bulkInputStyle}
                              />
                            </td>
                            <td style={bulkTdStyle}>
                              <select
                                value={row.dorm}
                                onChange={(e) => handleBulkChange(row.id, 'dorm', e.target.value)}
                                style={bulkInputStyle}
                              >
                                <option value="">Select…</option>
                                {DORMS.map((d) => <option key={d} value={d}>{d}</option>)}
                              </select>
                            </td>
                            <td style={bulkTdStyle}>
                              <input
                                type="text"
                                value={row.roomNumber}
                                onChange={(e) => handleBulkChange(row.id, 'roomNumber', e.target.value)}
                                placeholder="e.g. 101"
                                style={bulkInputStyle}
                              />
                            </td>
                            <td style={{ ...bulkTdStyle, textAlign: 'center' }}>
                              <button
                                type="button"
                                onClick={() => handleRemoveBulkRow(row.id)}
                                disabled={bulkRows.length === 1}
                                style={{ background: 'none', border: 'none', cursor: bulkRows.length === 1 ? 'not-allowed' : 'pointer', color: bulkRows.length === 1 ? '#cbd5e1' : '#ef4444', padding: '4px' }}
                                title="Remove row"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddBulkRow}
                    style={{
                      marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px',
                      background: 'none', border: '1.5px dashed #cbd5e1', borderRadius: '8px',
                      padding: '8px 14px', color: '#6366f1', fontSize: '13px', fontWeight: '500',
                      cursor: 'pointer', width: '100%', justifyContent: 'center'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.background = '#eef2ff'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = 'none'; }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Add Another Row
                  </button>
                </form>
              )}
            </div>

            <div className="offcanvas-footer">
              {(assignMode === 'single' || isEditing) && (
                <button type="submit" form="room-form" className="btn-primary" disabled={isSaving}>
                  {isSaving ? 'Saving…' : isEditing ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      Update Assignment
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                      Assign Room
                    </>
                  )}
                </button>
              )}
              {assignMode === 'bulk' && !isEditing && (
                <button type="submit" form="bulk-form" className="btn-primary" disabled={isSaving}>
                  {isSaving ? 'Saving…' : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                      Assign {bulkRows.length} Room{bulkRows.length !== 1 ? 's' : ''}
                    </>
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

/* ── inline style helpers ── */
function chipStyle(color, bg) {
  return {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '6px 12px', borderRadius: '20px',
    background: bg, color: color,
    fontSize: '13px', fontWeight: 500,
    border: `1px solid ${color}22`,
  };
}

const searchInputStyle = {
  width: '100%', padding: '8px 12px 8px 34px',
  border: '1px solid #e2e8f0', borderRadius: '6px',
  fontSize: '13px', outline: 'none',
  color: '#334155', background: 'white',
  boxSizing: 'border-box',
};

const selectStyle = {
  padding: '8px 12px', border: '1px solid #e2e8f0',
  borderRadius: '6px', fontSize: '13px',
  color: '#334155', background: 'white', cursor: 'pointer',
  minWidth: '150px',
};

const dropdownStyle = {
  position: 'absolute', right: 0, top: 'calc(100% + 4px)',
  background: 'white', border: '1px solid #e2e8f0',
  borderRadius: '6px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
  zIndex: 10, display: 'flex', flexDirection: 'column',
  minWidth: '120px', overflow: 'hidden',
};

const dropdownBtnStyle = {
  padding: '8px 16px', border: 'none',
  borderBottom: '1px solid #f1f5f9',
  background: 'white', textAlign: 'left',
  cursor: 'pointer', display: 'flex',
  gap: '8px', alignItems: 'center',
  color: '#334155', fontSize: '14px',
};

const bulkThStyle = {
  padding: '8px 10px', textAlign: 'left',
  fontSize: '12px', fontWeight: '600',
  color: '#64748b', textTransform: 'uppercase',
  letterSpacing: '0.04em', borderBottom: '1px solid #e2e8f0',
};

const bulkTdStyle = {
  padding: '6px 6px', borderBottom: '1px solid #f1f5f9',
  verticalAlign: 'middle',
};

const bulkInputStyle = {
  width: '100%', padding: '6px 8px',
  border: '1px solid #e2e8f0', borderRadius: '6px',
  fontSize: '13px', color: '#1e293b', outline: 'none',
  boxSizing: 'border-box',
};

function avatarStyle(name) {
  const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
  const idx = name.charCodeAt(0) % colors.length;
  return {
    width: '32px', height: '32px', borderRadius: '50%',
    background: colors[idx], color: 'white',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '13px', fontWeight: 600, flexShrink: 0,
  };
}
