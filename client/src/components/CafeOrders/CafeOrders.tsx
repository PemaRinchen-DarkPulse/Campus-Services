import { useState, useEffect } from 'react';
import './CafeOrders.css';

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
  total: number;
}

interface CafeOrdersProps {
  studentUser?: {
    id: string;
    name: string;
    cardId: string;
    role: string;
  };
}

export function CafeOrders({ studentUser }: CafeOrdersProps) {
  // If studentUser is provided, we are in POS / Customer Ordering mode
  const isCustomerMode = !!studentUser;

  // Mode: Admin (Orders List)
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'All' | 'Pending' | 'Preparing' | 'Ready' | 'Completed'>('All');
  const [loadingOrders, setLoadingOrders] = useState(!isCustomerMode);

  // Mode: Customer (Menu POS)
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(isCustomerMode);
  const [submittingOrder, setSubmittingOrder] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (res.ok) {
        const result = await res.json();
        if (result.success && Array.isArray(result.data)) {
          // ensure _id is mapped to id
          const fetchedOrders = result.data.map((o: any) => ({
            ...o,
            id: o._id,
            // Format time properly if it exists, otherwise provide fallback
            time: o.time || new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }));
          setOrders(fetchedOrders);
        }
      }
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (!isCustomerMode) {
      fetchOrders();
      // Optional: Refresh periodically for café managers
      const interval = setInterval(fetchOrders, 10000);
      return () => clearInterval(interval);
    }
  }, [isCustomerMode]);

  useEffect(() => {
    if (isCustomerMode) {
      // Fetch menu items for the customer to order
      const fetchMenu = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/menu`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          if (res.ok) {
            const result = await res.json();
            if (result.success && Array.isArray(result.data)) {
              // Map _id to id so it works seamlessly and filter only available items
              const formattedItems = result.data
                .filter((item: any) => item.available !== false)
                .map((item: any) => ({ ...item, id: item._id }));
              setMenuItems(formattedItems);
            }
          }
        } catch (err) {
          console.error('Failed to load menu', err);
        } finally {
          setLoadingMenu(false);
        }
      };
      fetchMenu();
    }
  }, [isCustomerMode]);

  const addToCart = (item: any) => {
    const itemId = item._id || item.id;
    setCart((prev) => {
      const existing = prev.find(p => p.id === itemId);
      if (existing) {
        return prev.map(p => p.id === itemId ? { ...p, quantity: p.quantity + 1 } : p);
      }
      return [...prev, { id: itemId, name: item.name, price: item.price, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const existing = prev.find(p => p.id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map(p => p.id === itemId ? { ...p, quantity: p.quantity - 1 } : p);
      }
      return prev.filter(p => p.id !== itemId);
    });
  };

  const submitOrder = async () => {
    if (cart.length === 0 || !studentUser) return;
    setSubmittingOrder(true);
    
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const orderPayload = {
      customerName: studentUser.name,
      items: cart.map(item => ({
        menuItem: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      total,
      status: 'Pending',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(orderPayload)
      });
      
      const result = await res.json();
      if (res.ok && result.success) {
        alert(`Order placed successfully! Total: Nu. ${total.toFixed(2)}`);
        setCart([]);
      } else {
        alert('Failed to place order: ' + (result.message || 'Please try again.'));
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('An error occurred while placing the order. Please try again.');
    } finally {
      setSubmittingOrder(false);
    }
  };

  // -------------------------------------------------------------
  // CUSTOMER MODE (POS) RENDERING
  // -------------------------------------------------------------
  if (isCustomerMode) {
    const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
      <div className="cafe-pos-container" style={{ display: 'flex', height: '100%', gap: '24px' }}>
        {/* Left side: Menu items grid */}
        <div className="pos-menu-section" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <h2 style={{ margin: '0 0 24px 0' }}>Menu</h2>
          {loadingMenu ? (
            <div className="pos-menu-grid" style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: '16px',
              overflowY: 'auto',
              paddingBottom: '20px'
            }}>
              <style>{`
                @keyframes pulse-skeleton {
                  0%, 100% { opacity: 1; }
                  50% { opacity: 0.5; }
                }
              `}</style>
              {[...Array(6)].map((_, index) => (
                <div key={index} style={{ 
                  background: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px', 
                  overflow: 'hidden', 
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  animation: 'pulse-skeleton 1.5s ease-in-out infinite'
                }}>
                  <div style={{ height: '140px', background: '#e5e7eb', width: '100%' }}></div>
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                    <div style={{ height: '20px', background: '#f3f4f6', borderRadius: '4px', width: '70%', marginBottom: '16px' }}></div>
                    <div style={{ height: '20px', background: '#f3f4f6', borderRadius: '4px', width: '40%', marginBottom: '24px' }}></div>
                    <div style={{ height: '38px', background: '#e5e7eb', borderRadius: '8px', width: '100%', marginTop: 'auto' }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="pos-menu-grid" style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: '16px', 
              overflowY: 'auto',
              paddingBottom: '20px'
            }}>
              {menuItems.map(item => (
                <div key={item._id || item.id} 
                  className="pos-menu-card" 
                  style={{ 
                    background: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px', 
                    overflow: 'hidden', 
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)';
                  }}
                >
                  <div style={{ height: '140px', background: '#f3f4f6', width: '100%', position: 'relative' }}>
                    {item.image ? (
                      <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>No image</div>
                    )}
                  </div>
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontWeight: '600', marginBottom: '4px', color: '#1f2937', fontSize: '15px' }}>{item.name}</div>
                      {item.description && (
                        <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {item.description}
                        </div>
                      )}
                      <div style={{ color: '#059669', fontWeight: 'bold', fontSize: '16px', marginBottom: '16px' }}>Nu. {item.price.toFixed(2)}</div>
                    </div>
                    <button 
                      onClick={() => addToCart(item)}
                      style={{
                        background: '#4f46e5',
                        color: 'white',
                        border: 'none',
                        padding: '10px 16px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '14px',
                        width: '100%',
                        marginTop: 'auto',
                        transition: 'background 0.2s ease'
                      }}
                      onMouseOver={e => e.currentTarget.style.background = '#4338ca'}
                      onMouseOut={e => e.currentTarget.style.background = '#4f46e5'}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right side: Cart */}
        <div className="pos-cart-section" style={{ 
          width: '320px', 
          background: 'white', 
          borderRadius: '12px', 
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
          display: 'flex', 
          flexDirection: 'column' 
        }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #f3f4f6', fontWeight: 'bold', fontSize: '18px' }}>
            Your Order
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
            {cart.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#9ca3af', marginTop: '40px' }}>Cart is empty</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {cart.map(item => (
                  <div key={item.id} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '16px',
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                  }}>
                    <div style={{ flex: 1, paddingRight: '12px' }}>
                      <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px', fontSize: '15px' }}>{item.name}</div>
                      <div style={{ color: '#059669', fontSize: '15px', fontWeight: 'bold' }}>Nu. {(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#f9fafb' }}>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5563', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', transition: 'background 0.1s' }}
                        onMouseOver={e => e.currentTarget.style.background = '#f3f4f6'}
                        onMouseOut={e => e.currentTarget.style.background = 'white'}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                      </button>
                      <span style={{ fontWeight: '600', width: '20px', textAlign: 'center', color: '#1f2937', fontSize: '14px' }}>{item.quantity}</span>
                      <button 
                        onClick={() => addToCart({ id: item.id, name: item.name, price: item.price })}
                        style={{ width: '28px', height: '28px', borderRadius: '6px', border: 'none', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5563', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', transition: 'background 0.1s' }}
                        onMouseOver={e => e.currentTarget.style.background = '#f3f4f6'}
                        onMouseOut={e => e.currentTarget.style.background = 'white'}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ padding: '20px', borderTop: '1px solid #f3f4f6', background: '#f9fafb', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '18px', marginBottom: '16px' }}>
              <span>Total</span>
              <span>Nu. {cartTotal.toFixed(2)}</span>
            </div>
            <button 
              onClick={submitOrder}
              disabled={cart.length === 0 || submittingOrder}
              style={{
                width: '100%', padding: '14px', background: cart.length === 0 ? '#9ca3af' : '#2563eb', 
                color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px',
                cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
                opacity: submittingOrder ? 0.7 : 1
              }}
            >
              {submittingOrder ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // ADMIN MODE RENDERING
  // -------------------------------------------------------------
  const tabs = ['All', 'Pending', 'Preparing', 'Ready', 'Completed'];

  const filteredOrders = activeTab === 'All'
    ? orders
    : orders.filter(order => order.status === activeTab);

  const updateOrderStatus = async (id: string, newStatus: Order['status']) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setOrders(orders.map(order => 
          order.id === id ? { ...order, status: newStatus } : order
        ));
      } else {
        const result = await res.json();
        alert('Failed to update status: ' + (result.message || 'Please try again.'));
      }
    } catch (err) {
      console.error('Update status error', err);
      alert('Error updating status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'status-pending';
      case 'Preparing': return 'status-preparing';
      case 'Ready': return 'status-ready';
      case 'Completed': return 'status-completed';
      case 'Cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  return (
    <div className="cafe-orders-container">
      <div className="page-header">
        <div className="page-title">
          <h1>Orders</h1>
          <p>Track and manage customer orders</p>
        </div>
      </div>

      <div className="orders-filters">
        {tabs.map(tab => (
          <button
            key={tab}
            className={`filter-chip ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab as any)}
          >
            {tab}
            {tab !== 'All' && (
              <span className="badge">
                {orders.filter(o => o.status === tab).length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="orders-grid">
        {loadingOrders ? (
          <>
            <style>{`
              @keyframes pulse-skeleton {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
              }
            `}</style>
            {[...Array(6)].map((_, index) => (
              <div key={`skeleton-${index}`} className="order-card" style={{ 
                animation: 'pulse-skeleton 1.5s ease-in-out infinite',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ height: '24px', width: '80px', background: '#e5e7eb', borderRadius: '4px', marginBottom: '8px' }}></div>
                    <div style={{ height: '16px', width: '120px', background: '#f3f4f6', borderRadius: '4px' }}></div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                    <div style={{ height: '24px', width: '70px', background: '#e5e7eb', borderRadius: '12px' }}></div>
                    <div style={{ height: '14px', width: '50px', background: '#f3f4f6', borderRadius: '4px' }}></div>
                  </div>
                </div>
                <div style={{ borderTop: '1px solid #f3f4f6', borderBottom: '1px solid #f3f4f6', padding: '12px 0' }}>
                  {[...Array(2)].map((_, i) => (
                    <div key={`sk-item-${i}`} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ height: '16px', width: '150px', background: '#f3f4f6', borderRadius: '4px' }}></div>
                      <div style={{ height: '16px', width: '40px', background: '#f3f4f6', borderRadius: '4px' }}></div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                  <div style={{ height: '20px', width: '60px', background: '#e5e7eb', borderRadius: '4px' }}></div>
                  <div style={{ height: '32px', width: '100px', background: '#e5e7eb', borderRadius: '6px' }}></div>
                </div>
              </div>
            ))}
          </>
        ) : filteredOrders.length === 0 ? (
          <div className="empty-state">
            <p>No {activeTab.toLowerCase()} orders right now.</p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-card-header">
                <div>
                  <h3 className="order-id">#{order.id.slice(-5).toUpperCase()}</h3>
                  <p className="order-customer">{order.customerName}</p>
                </div>
                <div className="order-meta">
                  <span className={`status-badge ${getStatusColor(order.status)}`}>{order.status}</span>
                  <span className="order-time">{order.time}</span>
                </div>
              </div>
              
              <div className="order-items-list">
                {order.items.map((item, idx) => (
                  <div key={idx} className="order-item">
                    <span className="item-quantity">{item.quantity}x</span>
                    <span className="item-name">{item.name}</span>
                    <span className="item-price">Nu. {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className="order-card-footer">
                <div className="order-total">
                  <span>Total</span>
                  <strong>Nu. {order.total.toFixed(2)}</strong>
                </div>
                
                <div className="order-actions">
                  {order.status === 'Pending' && (
                    <button className="btn btn-primary btn-sm" onClick={() => updateOrderStatus(order.id, 'Preparing')}>
                      Start Preparing
                    </button>
                  )}
                  {order.status === 'Preparing' && (
                    <button className="btn btn-outline btn-sm status-ready-btn" onClick={() => updateOrderStatus(order.id, 'Ready')}>
                      Mark Ready
                    </button>
                  )}
                  {order.status === 'Ready' && (
                    <button className="btn btn-primary btn-sm status-completed-btn" onClick={() => updateOrderStatus(order.id, 'Completed')}>
                      Complete Order
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
