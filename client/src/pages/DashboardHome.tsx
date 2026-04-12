import React, { useState, useEffect } from 'react';
import './DashboardHome.css';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area,
} from 'recharts';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function getToken() {
  return localStorage.getItem('token');
}

function authHeaders() {
  return { Authorization: `Bearer ${getToken()}` };
}

// ── Shared UI Atoms ────────────────────────────────────────────
function StatCard({ icon, label, value, accent, loading }) {
  return (
    <div className={`dh-stat-card dh-stat-${accent}`}>
      <div className="dh-stat-icon">{icon}</div>
      <div className="dh-stat-body">
        <span className="dh-stat-label">{label}</span>
        <strong className="dh-stat-value">
          {loading ? <span className="dh-skeleton-val" /> : value ?? 0}
        </strong>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    Pending: 'badge-pending',
    'In Progress': 'badge-inprogress',
    Resolved: 'badge-resolved',
    Approved: 'badge-approved',
    Rejected: 'badge-rejected',
  };
  return <span className={`dh-badge ${map[status] || ''}`}>{status}</span>;
}

function UrgencyBadge({ urgency }) {
  const map = { Low: 'urg-low', Medium: 'urg-medium', High: 'urg-high' };
  return <span className={`dh-urg ${map[urgency] || ''}`}>{urgency}</span>;
}

function SectionCard({ title, children, viewAllLabel, onViewAll }) {
  return (
    <div className="dh-section-card">
      <div className="dh-section-header">
        <span className="dh-section-title">{title}</span>
        {onViewAll && (
          <button className="dh-view-all-btn" onClick={onViewAll}>
            {viewAllLabel || 'View all'} →
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function EmptyRow({ message }) {
  return (
    <tr>
      <td colSpan={99} className="dh-empty-row">{message}</td>
    </tr>
  );
}

function LoadingRow() {
  return (
    <tr>
      <td colSpan={99} className="dh-loading-row">Loading…</td>
    </tr>
  );
}

function fmt(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ── Admin Dashboard ────────────────────────────────────────────
function AdminDashboard({ user, setActiveTab }) {
  const [reports, setReports] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [userCount, setUserCount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [rRes, bRes, uRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/reports/all`, { headers: authHeaders() }),
          fetch(`${API_BASE_URL}/api/bookings`, { headers: authHeaders() }),
          fetch(`${API_BASE_URL}/api/auth/users`, { headers: authHeaders() }),
        ]);
        if (rRes.ok) {
          const rd = await rRes.json();
          setReports(rd.data || []);
        }
        if (bRes.ok) {
          const bd = await bRes.json();
          setBookings(bd.data || []);
        }
        if (uRes.ok) {
          const ud = await uRes.json();
          setUserCount((ud.data || ud.users || []).length);
        }
      } catch (_) {}
      setLoading(false);
    };
    fetchAll();
  }, []);

  const totalReports = reports.length;
  const pendingReports = reports.filter((r) => r.status === 'Pending').length;
  const inProgressReports = reports.filter((r) => r.status === 'In Progress').length;
  const resolvedReports = reports.filter((r) => r.status === 'Resolved').length;
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter((b) => b.status === 'Pending').length;
  const approvedBookings = bookings.filter((b) => b.status === 'Approved').length;
  const rejectedBookings = bookings.filter((b) => b.status === 'Rejected').length;

  const recentReports = [...reports].slice(0, 6);
  const recentBookings = [...bookings].slice(0, 5);

  const highUrgency = reports.filter((r) => r.urgency === 'High' && r.status !== 'Resolved').length;

  // ── Chart data ────────────────────────────────────────────────
  const issueStatusData = [
    { name: 'Pending',     value: pendingReports,    color: '#f59e0b' },
    { name: 'In Progress', value: inProgressReports, color: '#f97316' },
    { name: 'Resolved',    value: resolvedReports,   color: '#22c55e' },
  ].filter((d) => d.value > 0);

  const urgencyData = [
    { name: 'High',   value: reports.filter((r) => r.urgency === 'High').length,   color: '#ef4444' },
    { name: 'Medium', value: reports.filter((r) => r.urgency === 'Medium').length, color: '#f59e0b' },
    { name: 'Low',    value: reports.filter((r) => r.urgency === 'Low').length,    color: '#22c55e' },
  ].filter((d) => d.value > 0);

  const bookingStatusData = [
    { name: 'Pending',  value: pendingBookings,  color: '#f59e0b' },
    { name: 'Approved', value: approvedBookings, color: '#22c55e' },
    { name: 'Rejected', value: rejectedBookings, color: '#ef4444' },
  ].filter((d) => d.value > 0);

  const categoryCount = {};
  reports.forEach((r) => { categoryCount[r.category] = (categoryCount[r.category] || 0) + 1; });
  const categoryData = Object.entries(categoryCount)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 7);

  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const m = d.getMonth();
    const y = d.getFullYear();
    return {
      month: d.toLocaleDateString('en-US', { month: 'short' }),
      Issues: reports.filter((r) => {
        const rd = new Date(r.createdAt);
        return rd.getMonth() === m && rd.getFullYear() === y;
      }).length,
      Bookings: bookings.filter((b) => {
        const bd = new Date(b.createdAt);
        return bd.getMonth() === m && bd.getFullYear() === y;
      }).length,
    };
  });

  return (
    <div className="dh-content">
      {/* Welcome banner */}
      <div className="dh-welcome-banner dh-welcome-admin">
        <div className="dh-welcome-left">
          <h2>Welcome back, {user.name} 👋</h2>
          <p>Here's a real-time overview of campus maintenance &amp; bookings.</p>
        </div>
        {highUrgency > 0 && (
          <div className="dh-alert-chip">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="2"/><line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="2"/><line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2"/></svg>
            {highUrgency} High-urgency issue{highUrgency > 1 ? 's' : ''} open
          </div>
        )}
      </div>

      {/* Reports Stats */}
      <div className="dh-stats-row">
        <StatCard loading={loading} accent="blue" label="Total Issues" value={totalReports}
          icon={<svg viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2"/><polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2"/></svg>}
        />
        <StatCard loading={loading} accent="yellow" label="Pending Issues" value={pendingReports}
          icon={<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><polyline points="12 6 12 12 16 14" stroke="currentColor" strokeWidth="2"/></svg>}
        />
        <StatCard loading={loading} accent="orange" label="In Progress" value={inProgressReports}
          icon={<svg viewBox="0 0 24 24" fill="none"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="2"/></svg>}
        />
        <StatCard loading={loading} accent="green" label="Resolved Issues" value={resolvedReports}
          icon={<svg viewBox="0 0 24 24" fill="none"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2"/><polyline points="22 4 12 14.01 9 11.01" stroke="currentColor" strokeWidth="2"/></svg>}
        />
      </div>

      {/* Booking & User Stats */}
      <div className="dh-stats-row dh-stats-row-sm">
        <StatCard loading={loading} accent="purple" label="Total Bookings" value={totalBookings}
          icon={<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/><line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/><line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/><line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/></svg>}
        />
        <StatCard loading={loading} accent="yellow" label="Pending Approvals" value={pendingBookings}
          icon={<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><polyline points="12 6 12 12 16 14" stroke="currentColor" strokeWidth="2"/></svg>}
        />
        <StatCard loading={loading} accent="green" label="Approved Bookings" value={approvedBookings}
          icon={<svg viewBox="0 0 24 24" fill="none"><polyline points="20 6 9 17 4 12" stroke="currentColor" strokeWidth="2"/></svg>}
        />
        {userCount !== null && (
          <StatCard loading={loading} accent="blue" label="Registered Users" value={userCount}
            icon={<svg viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 0 0-4-4H5c-2.2 0-4 1.8-4 4v2" stroke="currentColor" strokeWidth="2"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/><path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="2"/><path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2"/></svg>}
          />
        )}
      </div>

      {/* ── Charts Row ─────────────────────────────────────────── */}
      <div className="dh-charts-row">

        {/* Issue Status Donut */}
        <div className="dh-chart-card">
          <div className="dh-chart-title">Issues by Status</div>
          {loading ? <div className="dh-chart-loading">Loading…</div> : issueStatusData.length === 0 ? <div className="dh-chart-empty">No data yet</div> : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={issueStatusData} cx="50%" cy="50%" innerRadius={58} outerRadius={85}
                  dataKey="value" paddingAngle={3}>
                  {issueStatusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [v, 'Issues']} />
                <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize: '0.72rem' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Urgency Breakdown Donut */}
        <div className="dh-chart-card">
          <div className="dh-chart-title">Issues by Urgency</div>
          {loading ? <div className="dh-chart-loading">Loading…</div> : urgencyData.length === 0 ? <div className="dh-chart-empty">No data yet</div> : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={urgencyData} cx="50%" cy="50%" innerRadius={58} outerRadius={85}
                  dataKey="value" paddingAngle={3}>
                  {urgencyData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [v, 'Issues']} />
                <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize: '0.72rem' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Booking Status Donut */}
        <div className="dh-chart-card">
          <div className="dh-chart-title">Booking Status</div>
          {loading ? <div className="dh-chart-loading">Loading…</div> : bookingStatusData.length === 0 ? <div className="dh-chart-empty">No data yet</div> : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={bookingStatusData} cx="50%" cy="50%" innerRadius={58} outerRadius={85}
                  dataKey="value" paddingAngle={3}>
                  {bookingStatusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [v, 'Bookings']} />
                <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize: '0.72rem' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

      </div>

      {/* ── Category Bar Chart ─────────────────────────────────── */}
      <div className="dh-chart-wide-card">
        <div className="dh-chart-title">Issues by Category</div>
        {loading ? <div className="dh-chart-loading">Loading…</div> : categoryData.length === 0 ? <div className="dh-chart-empty">No data yet</div> : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categoryData} barSize={32} margin={{ top: 4, right: 16, left: -10, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: '#f9fafb' }} />
              <Bar dataKey="value" name="Issues" fill="#34d399" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── 6-Month Trend ─────────────────────────────────────── */}
      <div className="dh-chart-wide-card">
        <div className="dh-chart-title">Activity Trend — Last 6 Months</div>
        {loading ? <div className="dh-chart-loading">Loading…</div> : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyData} margin={{ top: 4, right: 16, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIssues" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize: '0.72rem' }} />
              <Area type="monotone" dataKey="Issues" stroke="#059669" strokeWidth={2}
                fill="url(#colorIssues)" dot={{ r: 3, fill: '#059669' }} activeDot={{ r: 5 }} />
              <Area type="monotone" dataKey="Bookings" stroke="#6366f1" strokeWidth={2}
                fill="url(#colorBookings)" dot={{ r: 3, fill: '#6366f1' }} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Two-column: recent issues & bookings */}
      <div className="dh-two-col">
        <SectionCard title="Recent Issues" viewAllLabel="See all issues" onViewAll={() => setActiveTab('all-issues')}>
          <table className="dh-table">
            <thead>
              <tr>
                <th>Location</th>
                <th>Category</th>
                <th>Urgency</th>
                <th>Status</th>
                <th>Reported</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <LoadingRow /> : recentReports.length === 0 ? <EmptyRow message="No issues yet." /> :
                recentReports.map((r) => (
                  <tr key={r._id}>
                    <td className="td-truncate">{r.location}</td>
                    <td>{r.category}</td>
                    <td><UrgencyBadge urgency={r.urgency} /></td>
                    <td><StatusBadge status={r.status} /></td>
                    <td>{fmt(r.createdAt)}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </SectionCard>

        <SectionCard title="Booking Requests" viewAllLabel="Manage bookings" onViewAll={() => setActiveTab('bookings')}>
          <table className="dh-table">
            <thead>
              <tr>
                <th>Space</th>
                <th>Requester</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <LoadingRow /> : recentBookings.length === 0 ? <EmptyRow message="No bookings yet." /> :
                recentBookings.map((b) => (
                  <tr key={b._id}>
                    <td className="td-truncate">{b.spaceName}</td>
                    <td className="td-truncate">{b.fullName}</td>
                    <td>{b.date}</td>
                    <td><StatusBadge status={b.status} /></td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </SectionCard>
      </div>
    </div>
  );
}

// ── Reporter Dashboard ─────────────────────────────────────────
function ReporterDashboard({ user, setActiveTab, onNewReport }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/reports`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => { setReports(d.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const total = reports.length;
  const pending = reports.filter((r) => r.status === 'Pending').length;
  const inProgress = reports.filter((r) => r.status === 'In Progress').length;
  const resolved = reports.filter((r) => r.status === 'Resolved').length;
  const recent = reports.slice(0, 6);

  return (
    <div className="dh-content">
      <div className="dh-welcome-banner dh-welcome-reporter">
        <div className="dh-welcome-left">
          <h2>Hello, {user.name} 👋</h2>
          <p>Track the status of all your submitted maintenance reports below.</p>
        </div>
        <button className="dh-quick-action-btn" onClick={onNewReport || (() => setActiveTab('reports'))}>
          + Submit New Report
        </button>
      </div>

      <div className="dh-stats-row">
        <StatCard loading={loading} accent="blue" label="My Reports" value={total}
          icon={<svg viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2"/><polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2"/></svg>}
        />
        <StatCard loading={loading} accent="yellow" label="Pending" value={pending}
          icon={<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><polyline points="12 6 12 12 16 14" stroke="currentColor" strokeWidth="2"/></svg>}
        />
        <StatCard loading={loading} accent="orange" label="In Progress" value={inProgress}
          icon={<svg viewBox="0 0 24 24" fill="none"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="2"/></svg>}
        />
        <StatCard loading={loading} accent="green" label="Resolved" value={resolved}
          icon={<svg viewBox="0 0 24 24" fill="none"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2"/><polyline points="22 4 12 14.01 9 11.01" stroke="currentColor" strokeWidth="2"/></svg>}
        />
      </div>

      <SectionCard title="My Recent Reports" viewAllLabel="View all my reports" onViewAll={() => setActiveTab('reports')}>
        <table className="dh-table">
          <thead>
            <tr>
              <th>Location</th>
              <th>Category</th>
              <th>Description</th>
              <th>Urgency</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <LoadingRow /> : recent.length === 0 ? <EmptyRow message="You haven't submitted any reports yet." /> :
              recent.map((r) => (
                <tr key={r._id}>
                  <td className="td-truncate">{r.location}</td>
                  <td>{r.category}</td>
                  <td className="td-truncate td-desc">{r.description}</td>
                  <td><UrgencyBadge urgency={r.urgency} /></td>
                  <td><StatusBadge status={r.status} /></td>
                  <td>{fmt(r.createdAt)}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </SectionCard>
    </div>
  );
}

// ── DormParent Dashboard ───────────────────────────────────────
function DormParentDashboard({ user, setActiveTab }) {
  const [reports, setReports] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [rRes, roomRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/reports`, { headers: authHeaders() }),
          fetch(`${API_BASE_URL}/api/rooms`, { headers: authHeaders() }),
        ]);
        if (rRes.ok) { const d = await rRes.json(); setReports(d.data || []); }
        if (roomRes.ok) { const d = await roomRes.json(); setRooms(d.data || []); }
      } catch (_) {}
      setLoading(false);
    };
    fetchAll();
  }, []);

  const total = reports.length;
  const pending = reports.filter((r) => r.status === 'Pending').length;
  const resolved = reports.filter((r) => r.status === 'Resolved').length;
  const recentReports = reports.slice(0, 5);
  const recentRooms = rooms.slice(0, 5);

  return (
    <div className="dh-content">
      <div className="dh-welcome-banner dh-welcome-dormparent">
        <div className="dh-welcome-left">
          <h2>Welcome, {user.name} 👋</h2>
          <p>Manage dorm room assignments and track maintenance reports for your dormitory.</p>
        </div>
        <div className="dh-banner-actions">
          <button className="dh-quick-action-btn" onClick={() => setActiveTab('reports')}>+ New Report</button>
          <button className="dh-quick-action-btn dh-action-secondary" onClick={() => setActiveTab('rooms')}>+ Assign Room</button>
        </div>
      </div>

      <div className="dh-stats-row">
        <StatCard loading={loading} accent="blue" label="My Reports" value={total}
          icon={<svg viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2"/><polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2"/></svg>}
        />
        <StatCard loading={loading} accent="yellow" label="Pending Reports" value={pending}
          icon={<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><polyline points="12 6 12 12 16 14" stroke="currentColor" strokeWidth="2"/></svg>}
        />
        <StatCard loading={loading} accent="green" label="Resolved Reports" value={resolved}
          icon={<svg viewBox="0 0 24 24" fill="none"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2"/><polyline points="22 4 12 14.01 9 11.01" stroke="currentColor" strokeWidth="2"/></svg>}
        />
        <StatCard loading={loading} accent="purple" label="Room Assignments" value={rooms.length}
          icon={<svg viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2"/><polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" strokeWidth="2"/></svg>}
        />
      </div>

      <div className="dh-two-col">
        <SectionCard title="My Recent Reports" viewAllLabel="View all" onViewAll={() => setActiveTab('reports')}>
          <table className="dh-table">
            <thead>
              <tr><th>Location</th><th>Category</th><th>Urgency</th><th>Status</th><th>Date</th></tr>
            </thead>
            <tbody>
              {loading ? <LoadingRow /> : recentReports.length === 0 ? <EmptyRow message="No reports yet." /> :
                recentReports.map((r) => (
                  <tr key={r._id}>
                    <td className="td-truncate">{r.location}</td>
                    <td>{r.category}</td>
                    <td><UrgencyBadge urgency={r.urgency} /></td>
                    <td><StatusBadge status={r.status} /></td>
                    <td>{fmt(r.createdAt)}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </SectionCard>

        <SectionCard title="Recent Room Assignments" viewAllLabel="Manage rooms" onViewAll={() => setActiveTab('rooms')}>
          <table className="dh-table">
            <thead>
              <tr><th>Student Name</th><th>Dorm</th><th>Room</th><th>Assigned</th></tr>
            </thead>
            <tbody>
              {loading ? <LoadingRow /> : recentRooms.length === 0 ? <EmptyRow message="No room assignments yet." /> :
                recentRooms.map((rm) => (
                  <tr key={rm._id}>
                    <td>{rm.studentName}</td>
                    <td>{rm.dorm}</td>
                    <td>{rm.roomNumber}</td>
                    <td>{fmt(rm.createdAt)}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </SectionCard>
      </div>
    </div>
  );
}

// ── Maintenance Dashboard ──────────────────────────────────────
function MaintenanceDashboard({ user, setActiveTab }) {
  const [assigned, setAssigned] = useState([]);
  const [history, setHistory] = useState([]);
  const [allIssues, setAllIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [aRes, hRes, iRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/reports/assigned`, { headers: authHeaders() }),
          fetch(`${API_BASE_URL}/api/reports/history`, { headers: authHeaders() }),
          fetch(`${API_BASE_URL}/api/reports/all`, { headers: authHeaders() }),
        ]);
        if (aRes.ok) { const d = await aRes.json(); setAssigned(d.data || []); }
        if (hRes.ok) { const d = await hRes.json(); setHistory(d.data || []); }
        if (iRes.ok) { const d = await iRes.json(); setAllIssues(d.data || []); }
      } catch (_) {}
      setLoading(false);
    };
    fetchAll();
  }, []);

  const pendingTasks = assigned.filter((r) => r.status === 'Pending').length;
  const inProgressTasks = assigned.filter((r) => r.status === 'In Progress').length;
  const completedTasks = history.length;
  const recentAssigned = assigned.slice(0, 5);
  const recentHistory = history.slice(0, 5);

  return (
    <div className="dh-content">
      <div className="dh-welcome-banner dh-welcome-maintenance">
        <div className="dh-welcome-left">
          <h2>Ready to work, {user.name}! 🔧</h2>
          <p>
            {user.specialization ? `Your specialization: ${user.specialization} · ` : ''}
            You have <strong>{assigned.length}</strong> active task{assigned.length !== 1 ? 's' : ''} assigned.
          </p>
        </div>
        <button className="dh-quick-action-btn" onClick={() => setActiveTab('my-work')}>
          View My Work
        </button>
      </div>

      <div className="dh-stats-row">
        <StatCard loading={loading} accent="blue" label="Assigned Tasks" value={assigned.length}
          icon={<svg viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2"/><polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2"/></svg>}
        />
        <StatCard loading={loading} accent="yellow" label="Pending" value={pendingTasks}
          icon={<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><polyline points="12 6 12 12 16 14" stroke="currentColor" strokeWidth="2"/></svg>}
        />
        <StatCard loading={loading} accent="orange" label="In Progress" value={inProgressTasks}
          icon={<svg viewBox="0 0 24 24" fill="none"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="2"/></svg>}
        />
        <StatCard loading={loading} accent="green" label="Completed Jobs" value={completedTasks}
          icon={<svg viewBox="0 0 24 24" fill="none"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2"/><polyline points="22 4 12 14.01 9 11.01" stroke="currentColor" strokeWidth="2"/></svg>}
        />
      </div>

      <div className="dh-two-col">
        <SectionCard title="Active Assignments" viewAllLabel="Go to My Work" onViewAll={() => setActiveTab('my-work')}>
          <table className="dh-table">
            <thead>
              <tr><th>Location</th><th>Category</th><th>Urgency</th><th>Status</th><th>Assigned</th></tr>
            </thead>
            <tbody>
              {loading ? <LoadingRow /> : recentAssigned.length === 0 ? <EmptyRow message="No active assignments." /> :
                recentAssigned.map((r) => (
                  <tr key={r._id}>
                    <td className="td-truncate">{r.location}</td>
                    <td>{r.category}</td>
                    <td><UrgencyBadge urgency={r.urgency} /></td>
                    <td><StatusBadge status={r.status} /></td>
                    <td>{fmt(r.assignedAt)}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </SectionCard>

        <SectionCard title="Recently Completed" viewAllLabel="View history" onViewAll={() => setActiveTab('work-history')}>
          <table className="dh-table">
            <thead>
              <tr><th>Location</th><th>Category</th><th>Completed</th></tr>
            </thead>
            <tbody>
              {loading ? <LoadingRow /> : recentHistory.length === 0 ? <EmptyRow message="No completed work yet." /> :
                recentHistory.map((r) => (
                  <tr key={r._id}>
                    <td className="td-truncate">{r.location}</td>
                    <td>{r.category}</td>
                    <td>{fmt(r.updatedAt)}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </SectionCard>
      </div>
    </div>
  );
}

// ── Store Manager Dashboard ────────────────────────────────────
function StoreManagerDashboard({ user, setActiveTab }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/reports/all`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((d) => { setReports(d.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const resolvedIssues = reports.filter((r) => r.status === 'Resolved').length;
  const openIssues = reports.filter((r) => r.status !== 'Resolved').length;

  return (
    <div className="dh-content">
      <div className="dh-welcome-banner dh-welcome-store">
        <div className="dh-welcome-left">
          <h2>Welcome, {user.name} 📦</h2>
          <p>Manage campus inventory and track supply orders from here.</p>
        </div>
      </div>

      <div className="dh-stats-row">
        <StatCard loading={loading} accent="blue" label="Total Issues (Campus)" value={reports.length}
          icon={<svg viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2"/><polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2"/></svg>}
        />
        <StatCard loading={loading} accent="orange" label="Open Issues" value={openIssues}
          icon={<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><polyline points="12 6 12 12 16 14" stroke="currentColor" strokeWidth="2"/></svg>}
        />
        <StatCard loading={loading} accent="green" label="Resolved Issues" value={resolvedIssues}
          icon={<svg viewBox="0 0 24 24" fill="none"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2"/><polyline points="22 4 12 14.01 9 11.01" stroke="currentColor" strokeWidth="2"/></svg>}
        />
      </div>

      {/* Quick Navigation Cards */}
      <div className="dh-nav-cards">
        <div className="dh-nav-card" onClick={() => setActiveTab('inventory')}>
          <div className="dh-nav-card-icon dh-nav-blue">
            <svg viewBox="0 0 24 24" fill="none" width="28" height="28"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </div>
          <div className="dh-nav-card-body">
            <strong>Inventory</strong>
            <span>View and manage campus stock</span>
          </div>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none"><polyline points="9 18 15 12 9 6" stroke="currentColor" strokeWidth="2"/></svg>
        </div>

        <div className="dh-nav-card" onClick={() => setActiveTab('order-history')}>
          <div className="dh-nav-card-icon dh-nav-green">
            <svg viewBox="0 0 24 24" fill="none" width="28" height="28"><path d="M12 8v5l3 3" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/></svg>
          </div>
          <div className="dh-nav-card-body">
            <strong>Order History</strong>
            <span>Review past supply orders</span>
          </div>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none"><polyline points="9 18 15 12 9 6" stroke="currentColor" strokeWidth="2"/></svg>
        </div>
      </div>
    </div>
  );
}

// ── Main Export ────────────────────────────────────────────────
export default function DashboardHome({ user, setActiveTab, onNewReport }) {
  const role = user?.role?.toLowerCase();

  if (role === 'admin') return <AdminDashboard user={user} setActiveTab={setActiveTab} />;
  if (role === 'dormparent') return <DormParentDashboard user={user} setActiveTab={setActiveTab} />;
  if (role === 'maintenance') return <MaintenanceDashboard user={user} setActiveTab={setActiveTab} />;
  if (role === 'storemanager') return <StoreManagerDashboard user={user} setActiveTab={setActiveTab} />;
  // reporter (default)
  return <ReporterDashboard user={user} setActiveTab={setActiveTab} onNewReport={onNewReport} />;
}
