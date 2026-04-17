import React, { useState } from 'react';
import './CafeMenu.css';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
}

const INITIAL_MENU: MenuItem[] = [
  {
    id: '1',
    name: 'Espresso',
    description: 'Rich and bold single shot of espresso',
    price: 3.50,
    category: 'Coffee',
    image: 'https://images.unsplash.com/photo-1510061910243-7f287842cff3?w=300&q=80',
    available: true,
  },
  {
    id: '2',
    name: 'Cappuccino',
    description: 'Espresso with steamed milk and a deep layer of foam',
    price: 4.50,
    category: 'Coffee',
    image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=300&q=80',
    available: true,
  },
  {
    id: '3',
    name: 'Green Tea',
    description: 'Fresh and light premium green tea',
    price: 3.00,
    category: 'Tea',
    image: 'https://images.unsplash.com/photo-1627492275510-48869c9b1b4b?w=300&q=80',
    available: true,
  },
  {
    id: '4',
    name: 'Turkey Sandwich',
    description: 'Roast turkey with lettuce, tomato, and mayo',
    price: 6.50,
    category: 'Food',
    image: 'https://images.unsplash.com/photo-1619096252214-ef06c45683e3?w=300&q=80',
    available: false,
  },
  {
    id: '5',
    name: 'Blueberry Muffin',
    description: 'Freshly baked muffin bursting with blueberries',
    price: 3.75,
    category: 'Bakery',
    image: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=300&q=80',
    available: true,
  }
];

export function CafeMenu() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(menuItems.map(item => item.category)))];

  const filteredItems = activeCategory === 'All' 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  const toggleAvailability = (id: string) => {
    setMenuItems(items => items.map(item => 
      item.id === id ? { ...item, available: !item.available } : item
    ));
  };

  return (
    <div className="cafe-menu-container">
      <div className="page-header">
        <div className="page-title">
          <h1>Cafe Menu</h1>
          <p>Manage your food and beverage offerings</p>
        </div>
        <div className="header-buttons">
          <button className="btn btn-primary">
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
        {filteredItems.map(item => (
          <div key={item.id} className={`menu-card ${!item.available ? 'unavailable' : ''}`}>
            <div className="menu-card-image" style={{ backgroundImage: `url(${item.image})` }}>
              {!item.available && <div className="unavailable-overlay">Sold Out</div>}
              <div className="menu-card-category">{item.category}</div>
            </div>
            
            <div className="menu-card-content">
              <div className="menu-card-header">
                <h3>{item.name}</h3>
                <span className="price">${item.price.toFixed(2)}</span>
              </div>
              <p className="description">{item.description}</p>
              
              <div className="menu-card-actions">
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={item.available} 
                    onChange={() => toggleAvailability(item.id)}
                  />
                  <span className="slider"></span>
                  <span className="toggle-label">{item.available ? 'Available' : 'Unavailable'}</span>
                </label>
                
                <div className="action-buttons">
                  <button className="icon-btn-small edit-btn" title="Edit">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" />
                    </svg>
                  </button>
                  <button className="icon-btn-small delete-btn" title="Delete">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
