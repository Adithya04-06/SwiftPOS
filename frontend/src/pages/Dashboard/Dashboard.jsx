import React, { useState, useEffect, useCallback } from 'react';
import { Package, Archive, DollarSign, Activity, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats', err);
      setError('Failed to load dashboard data. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading Dashboard...</div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Dashboard Overview</h1>
        </div>
        <div className="loading" style={{ color: '#ef4444', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <p>{error || 'Failed to load data.'}</p>
          <button className="btn-primary" onClick={fetchStats} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard Overview</h1>
        <button className="btn-secondary" onClick={fetchStats} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue"><Package size={24} /></div>
          <div className="stat-details">
            <h3>Total Products</h3>
            <p>{stats.totalProducts ?? 0}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange"><Archive size={24} /></div>
          <div className="stat-details">
            <h3>Total Stock</h3>
            <p>{stats.totalStock ?? 0}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><DollarSign size={24} /></div>
          <div className="stat-details">
            <h3>Today's Sales</h3>
            <p>₹{Number(stats.todaysSales || 0).toFixed(2)}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple"><Activity size={24} /></div>
          <div className="stat-details">
            <h3>Total Transactions</h3>
            <p>{stats.totalTransactions ?? 0}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-panel">
          <h2>Recent Sales</h2>
          {stats.recentSales && stats.recentSales.length > 0 ? (
            <table className="table-simple">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Method</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentSales.map(sale => (
                  <tr key={sale.id}>
                    <td>{sale.transactionId}</td>
                    <td>{sale.date ? new Date(sale.date).toLocaleDateString() : 'N/A'}</td>
                    <td>₹{Number(sale.total || 0).toFixed(2)}</td>
                    <td>{sale.paymentMethod}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ color: '#64748b', padding: '16px 0' }}>No recent sales recorded yet.</p>
          )}
        </div>

        <div className="dashboard-panel">
          <h2>
            <AlertCircle size={18} style={{ verticalAlign: 'bottom', marginRight: 5, color: '#ef4444' }} /> 
            Low Stock Alerts
          </h2>
          {stats.lowStockItems && stats.lowStockItems.length > 0 ? (
            <table className="table-simple">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {stats.lowStockItems.map(item => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>
                      <span className={`badge ${item.stock === 0 ? 'danger' : 'warning'}`}>
                        {item.stock} left
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ color: '#64748b', padding: '16px 0' }}>All products are sufficiently stocked.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
