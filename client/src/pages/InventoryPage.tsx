import React, { useState } from 'react';
import './ReportsPage.css';

const initialInventory = [
  {
    id: 1,
    itemName: 'Projector Bulbs',
    category: 'Electrical',
    stock: 45,
    status: 'In Stock',
    lastUpdated: '2026-03-15'
  },
  {
    id: 2,
    itemName: 'Whiteboard Markers',
    category: 'Stationery',
    stock: 12,
    status: 'Low Stock',
    lastUpdated: '2026-03-10'
  },
  {
    id: 3,
    itemName: 'Ergonomic Chairs',
    category: 'Furniture',
    stock: 0,
    status: 'Out of Stock',
    lastUpdated: '2026-02-28'
  },
  {
    id: 4,
    itemName: 'Plumbing Tape',
    category: 'Plumbing',
    stock: 150,
    status: 'In Stock',
    lastUpdated: '2026-03-12'
  }
];

export default function InventoryPage({ user }) {
  const [inventory, setInventory] = useState(initialInventory);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    itemName: '',
    category: 'Electrical',
    stock: 0,
    status: 'In Stock'
  });

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newEntry = {
      ...newItem,
      id: inventory.length + 1,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    setInventory([newEntry, ...inventory]);
    setNewItem({ itemName: '', category: 'Electrical', stock: 0, status: 'In Stock' });
    handleCloseModal();
  };

  const userRole = user?.role?.toLowerCase() || '';
  const isStoreManager = userRole === 'storemanager' || userRole === 'store manger';

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

  const getStatusClass = (status) => {
    switch (status) {
      case 'In Stock':
        return 'status-resolved';
      case 'Low Stock':
        return 'status-pending';
      default:
        return '';
    }
  };

  return (
    <div className="reports-page-container">
      <div className="reports-header">
        <div>
          <h1 className="reports-title">Inventory Management</h1>
          <p className="reports-subtitle">Overview of campus supplies and stock levels</p>
        </div>
        {isStoreManager && (
          <button className="btn-new-report" onClick={handleOpenModal}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none"><line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2"/><line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2"/></svg>
            Add Inventory
          </button>
        )}
      </div>

      <div className="reports-card">
        <div className="table-responsive">
          <table className="reports-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Category</th>
                <th>Stock Level</th>
                <th>Status</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item.id}>
                  <td className="fw-medium">{item.itemName}</td>
                  <td>
                    <span className={getCategoryClass(item.category)}>{item.category}</span>
                  </td>
                  <td>{item.stock} units</td>
                  <td>
                    <span 
                      className={`status-badge ${getStatusClass(item.status)}`}
                      style={item.status === 'Out of Stock' ? { color: '#ef4444' } : {}}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="description-cell">{item.lastUpdated}</td>
                </tr>
              ))}
              {inventory.length === 0 && (
                <tr>
                  <td colSpan="5" className="empty-state" style={{ textAlign: 'center' }}>No inventory items found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="offcanvas-overlay" onClick={handleCloseModal}>
          <div className="offcanvas-content" onClick={(e) => e.stopPropagation()}>
            <div className="offcanvas-header">
              <h2>Add New Inventory</h2>
              <div className="offcanvas-header-actions">
                <button className="btn-close" onClick={handleCloseModal}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            </div>

            <div className="offcanvas-body">
              <form onSubmit={handleSubmit} id="new-inventory-form">
                <div className="form-group">
                  <label>Item Name</label>
                  <input
                    type="text"
                    name="itemName"
                    value={newItem.itemName}
                    onChange={handleInputChange}
                    placeholder="Enter item name"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group form-col-65">
                    <label>Category</label>
                    <select
                      name="category"
                      value={newItem.category}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="Electrical">Electrical</option>
                      <option value="Plumbing">Plumbing</option>
                      <option value="Furniture">Furniture</option>
                      <option value="Stationery">Stationery</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group form-col-35">
                    <label>Stock Level</label>
                    <input
                      type="number"
                      name="stock"
                      value={newItem.stock}
                      onChange={handleInputChange}
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={newItem.status}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="In Stock">In Stock</option>
                    <option value="Low Stock">Low Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>
              </form>
            </div>

            <div className="offcanvas-footer">
              <button type="submit" form="new-inventory-form" className="btn-primary">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none"><line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2"/><line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2"/></svg>
                Add Inventory
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
