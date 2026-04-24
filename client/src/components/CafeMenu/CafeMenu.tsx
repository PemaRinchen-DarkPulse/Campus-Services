import React, { useState, useEffect } from 'react';
import './CafeMenu.css';

interface MenuItem {
  _id?: string;
  id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function CafeMenu() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState<Partial<MenuItem>>({});

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/menu`);
      const data = await response.json();
      if (data.success) {
        // Map _id to id for consistency if needed, or just use _id
        const items = data.data.map((item: any) => ({ ...item, id: item._id }));
        setMenuItems(items);
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const categories = ['All', ...Array.from(new Set(menuItems.map(item => item.category)))];

  const filteredItems = activeCategory === 'All' 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  const toggleAvailability = async (id: string, currentStatus: boolean = true) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/menu/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available: !currentStatus })
      });
      if (response.ok) {
        setMenuItems(items => items.map(item => 
          item.id === id ? { ...item, available: !item.available } : item
        ));
      }
    } catch (err) {
      console.error('Error toggling availability:', err);
    }
  };

  const handleOpenModal = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({ category: 'Food', available: true, price: 0, image: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData({});
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/menu/${id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          setMenuItems(items => items.filter(item => item.id !== id));
        } else {
          alert('Failed to delete item.');
        }
      } catch (err) {
        console.error('Error deleting item', err);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem && editingItem.id) {
        // Update existing mapping
        const response = await fetch(`${API_BASE_URL}/api/menu/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (response.ok) {
          fetchMenuItems();
        } else {
          alert('Failed to update item');
        }
      } else {
        // Create new
        const response = await fetch(`${API_BASE_URL}/api/menu`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (response.ok) {
          fetchMenuItems();
        } else {
          alert('Failed to create item, please check your fields.');
        }
      }
    } catch (err) {
      console.error('Error saving item:', err);
    }
    handleCloseModal();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="cafe-menu-container">
      <div className="page-header">
        <div className="page-title">
          <h1>Cafe Menu</h1>
          <p>Manage your food and beverage offerings</p>
        </div>
        <div className="header-buttons">
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
              <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Item
          </button>
        </div>
      </div>

      <div className="menu-filters">
        {categories.map(category => (
          <button 
            key={category}
            className={`filter-chip ${activeCategory === category ? 'active' : ''}`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="menu-grid">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <div key={`skeleton-${index}`} className="menu-card skeleton-card">
              <div className="skeleton-image">
                <div className="skeleton-category"></div>
                <div className="skeleton-price"></div>
              </div>
              <div className="menu-card-content">
                <div className="menu-card-header">
                  <div className="skeleton-title"></div>
                </div>
                <div className="skeleton-desc"></div>
                <div className="skeleton-desc short"></div>
                <div className="menu-card-actions">
                  <div className="skeleton-toggle"></div>
                  <div className="skeleton-buttons"></div>
                </div>
              </div>
            </div>
          ))
        ) : (
          filteredItems.map(item => (
            <div key={item.id} className={`menu-card ${!item.available ? 'unavailable' : ''}`}>
              <div className="menu-card-image" style={{ backgroundImage: `url(${item.image})` }}>
                {!item.available && <div className="unavailable-overlay">Sold Out</div>}
                <div className="menu-card-category">{item.category}</div>
                <div className="price-badge">Nu. {item.price.toFixed(2)}</div>
              </div>
            
            <div className="menu-card-content">
              <div className="menu-card-header">
                <h3>{item.name}</h3>
              </div>
              <p className="description">{item.description}</p>
              
              <div className="menu-card-actions">
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={item.available} 
                    onChange={() => item.id && toggleAvailability(item.id, item.available)}
                  />
                  <span className="slider"></span>
                  <span className="toggle-label">{item.available ? 'Available' : 'Unavailable'}</span>
                </label>
                
                <div className="action-buttons">
                  <button className="icon-btn-small edit-btn" title="Edit" onClick={() => handleOpenModal(item)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" />
                    </svg>
                  </button>
                  <button className="icon-btn-small delete-btn" title="Delete" onClick={() => item.id && handleDelete(item.id)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )))}
      </div>

      {isModalOpen && (
        <div className="drawer-overlay" onClick={handleCloseModal}>
          <div className="drawer-content" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <h2>{editingItem ? 'Edit Item' : 'Add New Item'}</h2>
              <button className="drawer-close" onClick={handleCloseModal}>×</button>
            </div>
            <div className="drawer-body">
              <form id="menu-form" onSubmit={handleSave}>
                <div className="form-group">
                  <label>Item Name</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g., Ema Datshi"
                    value={formData.name || ''} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea 
                    required 
                    placeholder="Brief description of the item"
                    value={formData.description || ''} 
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    rows={3}
                  />
                </div>
                <div className="form-row" style={{ display: 'flex', gap: '16px' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Price (Nu.)</label>
                    <input 
                      type="number" 
                      required 
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.price || ''} 
                      onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Category</label>
                    <select 
                      value={formData.category || 'Food'} 
                      onChange={e => setFormData({...formData, category: e.target.value})}
                    >
                      <option value="Food">Food</option>
                      <option value="Beverage">Beverage</option>
                      <option value="Snacks">Snacks</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Item Image</label>
                  <label 
                    className={`image-drop-zone ${formData.image ? 'has-image' : ''}`}
                    style={{ backgroundImage: formData.image ? `url(${formData.image})` : 'none' }}
                  >
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      className="hidden-file-input"
                    />
                    {!formData.image ? (
                      <div className="drop-zone-content">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                          <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="upload-title"><strong>Click to upload</strong> or drag and drop</p>
                        <p className="upload-subtitle">SVG, PNG, JPG or GIF (max. 5MB)</p>
                      </div>
                    ) : (
                      <div className="image-overlay">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" />
                        </svg>
                        <span>Change Image</span>
                      </div>
                    )}
                  </label>
                </div>
                {editingItem && (
                  <div className="form-group">
                    <label className="toggle-switch" style={{ marginTop: '8px' }}>
                      <input 
                        type="checkbox" 
                        checked={formData.available ?? true} 
                        onChange={e => setFormData({...formData, available: e.target.checked})}
                      />
                      <span className="slider"></span>
                      <span className="toggle-label">{formData.available !== false ? 'Available' : 'Unavailable'}</span>
                    </label>
                  </div>
                )}
              </form>
            </div>
            <div className="drawer-footer">
              <button type="submit" form="menu-form" className="btn btn-primary full-width">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {editingItem ? 'Save Changes' : 'Add Item'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
