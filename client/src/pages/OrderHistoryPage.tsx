import React, { useState } from 'react';
import './ReportsPage.css';

const initialOrders = [
  {
    id: 'ORD-1001',
    itemName: 'Projector Bulbs',
    requestedBy: 'Alice Johnson',
    quantity: 10,
    status: 'Delivered',
    orderDate: '2026-03-20',
  },
  {
    id: 'ORD-1002',
    itemName: 'Whiteboard Markers',
    requestedBy: 'Bob Brown',
    quantity: 50,
    status: 'Pending',
    orderDate: '2026-03-22',
  },
  {
    id: 'ORD-1003',
    itemName: 'Ergonomic Chairs',
    requestedBy: 'John Doe',
    quantity: 5,
    status: 'Cancelled',
    orderDate: '2026-03-18',
  },
  {
    id: 'ORD-1004',
    itemName: 'Plumbing Tape',
    requestedBy: 'Jane Smith',
    quantity: 20,
    status: 'Delivered',
    orderDate: '2026-03-15',
  }
];

export default function OrderHistoryPage({ user }) {
  const [orders, setOrders] = useState(initialOrders);

  const getStatusClass = (status) => {
    switch (status) {
      case 'Delivered':
        return 'status-resolved';
      case 'Pending':
        return 'status-pending';
      case 'Cancelled':
        return 'td-badge badge-other';
      default:
        return '';
    }
  };

  return (
    <div className="reports-page-container">
      <div className="reports-header">
        <div>
          <h1 className="reports-title">Order History</h1>
          <p className="reports-subtitle">Track all inventory orders and requests</p>
        </div>
      </div>

      <div className="reports-card">
        <div className="table-responsive">
          <table className="reports-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Item Name</th>
                <th>Requested By</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Order Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="fw-medium">{order.id}</td>
                  <td>{order.itemName}</td>
                  <td>{order.requestedBy}</td>
                  <td>{order.quantity} units</td>
                  <td>
                    <span 
                      className={`status-badge ${getStatusClass(order.status)}`}
                      style={order.status === 'Cancelled' ? { color: '#ef4444' } : {}}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="description-cell">{order.orderDate}</td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="6" className="empty-state" style={{ textAlign: 'center' }}>No order history found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
