import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Archive, DollarSign, ShoppingCart, LogOut, User } from 'lucide-react';
import './Layout.css';

const Layout = () => {
  const navigate = useNavigate();
  const [currentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('swiftpos_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const handleLogout = () => {
    localStorage.removeItem('swiftpos_user');
    navigate('/login');
  };

  return (
    <div className="layout-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>SwiftPOS</h2>
          {currentUser && (
            <div style={{ marginTop: 8, fontSize: 13, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
              <User size={14} />
              <span><strong>{currentUser.name}</strong> ({currentUser.role})</span>
            </div>
          )}
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={20} /> Dashboard
          </NavLink>
          <NavLink to="/products" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Package size={20} /> Products
          </NavLink>
          <NavLink to="/inventory" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Archive size={20} /> Inventory
          </NavLink>
          <NavLink to="/sales" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <DollarSign size={20} /> Sales
          </NavLink>
          <NavLink to="/pos" className="nav-item pos-highlight">
            <ShoppingCart size={20} /> POS
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;