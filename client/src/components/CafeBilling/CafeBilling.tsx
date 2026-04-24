import { useState } from 'react';
import './CafeBilling.css';

export function CafeBilling() {
  const [activeTab, setActiveTab] = useState('Overview');

  const metrics = [
    {
      title: 'Total Revenue',
      value: 'Nu. 45,231.00',
      trend: '+12.5%',
      trendUp: true,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
        </svg>
      )
    },
    {
      title: 'Pending Payments',
      value: 'Nu. 3,450.00',
      trend: '-2.4%',
      trendUp: false,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: 'Successful Transactions',
      value: '1,284',
      trend: '+18.2%',
      trendUp: true,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: 'Refunds',
      value: 'Nu. 420.00',
      trend: '+4.1%',
      trendUp: false,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      )
    }
  ];

  const recentTransactions = [
    { id: 'TRX-9901', student: 'Karma Dorji', date: 'Today, 10:42 AM', amount: 150.00, status: 'Completed' },
    { id: 'TRX-9902', student: 'Sonam Choden', date: 'Today, 09:15 AM', amount: 320.00, status: 'Completed' },
    { id: 'TRX-9903', student: 'Tenzin Wangdi', date: 'Yesterday, 04:30 PM', amount: 45.00, status: 'Pending' },
    { id: 'TRX-9904', student: 'Dechen Zangmo', date: 'Yesterday, 02:10 PM', amount: 210.00, status: 'Completed' },
    { id: 'TRX-9905', student: 'Pema Lhamo', date: 'Yesterday, 11:20 AM', amount: 180.00, status: 'Refunded' },
  ];

  return (
    <div className="cafe-billing-container">
      <div className="page-header">
        <div className="page-title">
          <h1>Cafe Billing & Finances</h1>
          <p>Manage transactions, revenue, and payments</p>
        </div>
        <div className="header-buttons">
          <button className="btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Export Report
          </button>
        </div>
      </div>

      <div className="metrics-grid">
        {metrics.map((metric, index) => (
          <div className="metric-card" key={index}>
            <div className="metric-header">
              <div className="metric-title">{metric.title}</div>
              <div className={`metric-icon ${metric.trendUp ? 'positive' : 'neutral'}`}>
                {metric.icon}
              </div>
            </div>
            <div className="metric-value">{metric.value}</div>
            <div className="metric-footer">
              <span className={`trend-badge ${metric.trendUp ? 'trend-up' : 'trend-down'}`}>
                {metric.trendUp ? '↑' : '↓'} {metric.trend}
              </span>
              <span className="trend-text">from last month</span>
            </div>
          </div>
        ))}
      </div>

      <div className="table-box">
        <div className="table-actions-bar">
          <div className="filters">
            <select className="filter-select"><option>All Status</option><option>Completed</option><option>Pending</option><option>Refunded</option></select>
            <select className="filter-select"><option>Today</option><option>This Week</option><option>This Month</option></select>
          </div>
          <div className="action-icons">
            <button className="action-icon-btn active">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5Modular" /></svg>
            </button>
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th><input type="checkbox" /></th>
              <th>Transaction ID</th>
              <th>Customer</th>
              <th>Date & Time</th>
              <th>Amount (Nu.)</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {recentTransactions.map((trx, index) => (
              <tr key={index}>
                <td><input type="checkbox" /></td>
                <td><span className="trx-id">{trx.id}</span></td>
                <td>
                  <div className="customer-info">
                    <div className="customer-avatar">{trx.student.charAt(0)}</div>
                    <span>{trx.student}</span>
                  </div>
                </td>
                <td><span className="text-gray">{trx.date}</span></td>
                <td><strong>{trx.amount.toFixed(2)}</strong></td>
                <td>
                  <span className={`status-badge ${trx.status.toLowerCase()}`}>
                    {trx.status}
                  </span>
                </td>
                <td>
                  <div className="row-actions">
                    <button className="action-btn" title="View Details">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="pagination">
          <span className="pagination-info">Showing 1 to 5 of 45 transactions</span>
          <div className="pagination-controls">
            <button className="page-btn disabled">Previous</button>
            <button className="page-btn active">1</button>
            <button className="page-btn">2</button>
            <button className="page-btn">3</button>
            <span className="page-dots">...</span>
            <button className="page-btn">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
