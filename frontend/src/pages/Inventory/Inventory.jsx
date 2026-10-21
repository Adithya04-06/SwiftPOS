import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import api from '../../services/api';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (err) {
      console.error('Failed to fetch inventory', err);
      setError('Failed to load inventory data. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const getStatusBadge = (stock, minStock) => {
    if (stock === 0) return <span className="badge danger">Out of Stock</span>;
    if (stock <= minStock) return <span className="badge warning">Low Stock</span>;
    return <span className="badge success">Healthy</span>;
  };

  if (loading) return <div className="loading">Loading Inventory...</div>;

  return (
    <div className="products-container">
      <div className="page-header">
        <h1>Inventory Control</h1>
        <button className="btn-secondary" onClick={fetchProducts} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: 8, marginBottom: 16 }}>
          {error}
        </div>
      )}

      <div className="products-card">
        <table className="table-modern">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Current Stock</th>
              <th>Minimum Stock Level</th>
              <th>Health Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td><strong>{product.sku}</strong></td>
                <td>{product.name}</td>
                <td>{product.category || 'General'}</td>
                <td style={{ fontWeight: 'bold' }}>{product.stock}</td>
                <td>{product.minimumStock}</td>
                <td>{getStatusBadge(product.stock, product.minimumStock)}</td>
              </tr>
            ))}
            {products.length === 0 && !error && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '24px' }}>No inventory data found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventory;