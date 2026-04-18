import React, { useState, useEffect } from 'react';
import './StudentSettings.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  customerName: string;
  items: OrderItem[];
  status: 'Pending' | 'Preparing' | 'Ready' | 'Completed' | 'Cancelled';
  time: string;
  date: string;
  total: number;
}

interface StudentSettingsProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
  credits: number;
}

export default function StudentSettings({ user, credits }: StudentSettingsProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'credits' | 'orders'>('credits');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      if (data.success) {
        const fetchedOrders = data.data.map((order: any) => ({
          id: order._id,
          customerName: order.customerName || 'Unknown',
          items: order.items.map((item: any) => ({
            id: item._id || item.menuItem || Math.random().toString(),
            name: item.name || 'Unknown Item',
            quantity: item.quantity,
            price: item.price
          })),
          status: order.status,
          time: new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: new Date(order.createdAt).toLocaleDateString(),
          total: order.total
        }));
        setOrders(fetchedOrders);
      }
    } catch (err) {
      console.error('Error fetching orders', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  return (
    <div className="student-settings-container">
      <div className="settings-header">
        <h2>Settings</h2>
        <p>Manage your account settings and credit balance.</p>
      </div>

      <div className="settings-layout">
        <div className="settings-nav">
          <button 
            className={`settings-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
            </svg>
            Profile Information
          </button>
          <button 
            className={`settings-nav-item ${activeTab === 'credits' ? 'active' : ''}`}
            onClick={() => setActiveTab('credits')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <path d="M2 10h20" />
            </svg>
            My Credits & Billing
          </button>
          <button 
            className={`settings-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Cafe Order History
          </button>
        </div>

        <div className="settings-content">
          {activeTab === 'profile' && (
            <div className="settings-card">
              <h3>Profile Information</h3>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" value={user.name} disabled />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" value={user.email} disabled />
              </div>
              <div className="form-group">
                <label>Role</label>
                <input type="text" value={user.role} disabled style={{ textTransform: 'capitalize' }} />
              </div>
              <p className="hint">Please contact administration to change your core profile details.</p>
            </div>
          )}

          {activeTab === 'credits' && (
            <>
              <div className="settings-card credits-card">
                <div className="credits-header">
                  <div>
                    <h3>Available Credits</h3>
                    <p>Use credits to purchase meals at the cafe, library books, and other campus services.</p>
                  </div>
                  <div className="credits-badge">
                    <span className="credits-amount">{credits}</span>
                    <span className="credits-label">Nu.</span>
                  </div>
                </div>

                <div className="credits-actions">
                  <button className="primary-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14m-7-7h14" />
                    </svg>
                    Top up Credits
                  </button>
                  <button className="secondary-btn">View Transaction History</button>
                </div>
              </div>
              
              <div className="settings-card">
                <h3>Recent Transactions</h3>
                <div className="empty-state">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p>No recent transactions found.</p>
                </div>
              </div>
            </>
          )}

          {activeTab === 'orders' && (
            <div className="settings-card" style={{ flex: 1, overflowY: 'auto' }}>
              <h3>Cafe Order History</h3>
              {loadingOrders ? (
                <div className="order-history-list">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={`skeleton-${index}`} className="order-history-item skeleton-order-card" style={{ padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div>
                          <div className="skeleton-line medium" style={{ marginBottom: '8px' }}></div>
                          <div className="skeleton-line short"></div>
                        </div>
                        <div className="skeleton-chip"></div>
                      </div>
                      <div style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', gap: '8px' }}><div className="skeleton-line short"></div><div className="skeleton-line long"></div></div>
                          <div className="skeleton-line short"></div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', gap: '8px' }}><div className="skeleton-line short"></div><div className="skeleton-line medium"></div></div>
                          <div className="skeleton-line short"></div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #e5e7eb', paddingTop: '12px' }}>
                        <div className="skeleton-line short"></div>
                        <div className="skeleton-line medium"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="empty-state">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1">
                    <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <p>You haven't placed any orders yet.</p>
                </div>
              ) : (
                <div className="order-history-list">
                  {orders.map((order: any) => (
                    <div key={order.id} className="order-history-item">
                      <div className="order-history-header">
                        <div>
                          <span className="order-history-id">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            Order #{order.id.slice(-5).toUpperCase()}
                          </span>
                          <span className="order-history-date">{order.date} at {order.time}</span>
                        </div>
                        <span className={`status-badge status-${order.status ? order.status.toLowerCase() : 'pending'}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="order-history-items">
                        {order.items.map((item: any, idx: number) => (
                          <div key={idx} className="order-history-item-row">
                            <div className="order-item-details">
                              <span className="order-item-qty">{item.quantity}x</span>
                              <span>{item.name}</span>
                            </div>
                            <span className="order-item-price">Nu. {item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                      <div className="order-history-footer">
                        <span>Total Paid</span>
                        <strong>Nu. {order.total}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
