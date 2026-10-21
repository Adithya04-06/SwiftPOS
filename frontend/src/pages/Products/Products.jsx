import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import api from '../../services/api';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({
    name: '',
    sku: '',
    category: '',
    price: '',
    stock: '',
    minimumStock: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (err) {
      console.error('Failed to fetch products', err);
      setError('Failed to load products. Ensure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (stock, minStock) => {
    if (stock === 0) return <span className="badge danger">Out of Stock</span>;
    if (stock <= minStock) return <span className="badge warning">Low Stock</span>;
    return <span className="badge success">In Stock</span>;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentProduct({ ...currentProduct, [name]: value });
  };

  const openAddModal = () => {
    setActionError(null);
    setIsEditing(false);
    setCurrentProduct({ name: '', sku: '', category: '', price: '', stock: '', minimumStock: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setActionError(null);
    setIsEditing(true);
    setCurrentProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setActionError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionError(null);
    setSubmitting(true);

    const payload = {
      ...currentProduct,
      price: parseFloat(currentProduct.price),
      stock: parseInt(currentProduct.stock, 10),
      minimumStock: parseInt(currentProduct.minimumStock, 10) || 0
    };

    if (isNaN(payload.price) || payload.price < 0) {
      setActionError('Price must be a valid non-negative number.');
      setSubmitting(false);
      return;
    }

    if (isNaN(payload.stock) || payload.stock < 0) {
      setActionError('Stock must be a non-negative whole number.');
      setSubmitting(false);
      return;
    }

    try {
      if (isEditing) {
        await api.updateProduct(currentProduct.id, payload);
      } else {
        await api.createProduct(payload);
      }
      await fetchProducts();
      closeModal();
    } catch (err) {
      console.error('Failed to save product', err);
      setActionError(err.message || 'Failed to save product.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.deleteProduct(id);
        fetchProducts();
      } catch (err) {
        console.error('Failed to delete product', err);
        alert(err.message || 'Failed to delete product.');
      }
    }
  };

  if (loading) return <div className="loading">Loading Products...</div>;

  return (
    <div className="products-container">
      <div className="page-header">
        <h1>Products Management</h1>
        <button className="btn-primary" onClick={openAddModal}>
          <Plus size={18} /> Add Product
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
              <th>Product</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.sku}</td>
                <td>{product.category || 'General'}</td>
                <td>₹{Number(product.price).toFixed(2)}</td>
                <td>{product.stock}</td>
                <td>{getStatusBadge(product.stock, product.minimumStock)}</td>
                <td>
                  <div className="action-btns">
                    <button className="btn-icon edit" onClick={() => openEditModal(product)} title="Edit">
                      <Edit2 size={16} />
                    </button>
                    <button className="btn-icon delete" onClick={() => handleDelete(product.id)} title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && !error && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '24px' }}>No products found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
            
            {actionError && (
              <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '8px 12px', borderRadius: 6, marginBottom: 12, fontSize: 14 }}>
                {actionError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input type="text" name="name" value={currentProduct.name} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>SKU</label>
                <input type="text" name="sku" value={currentProduct.sku} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input type="text" name="category" value={currentProduct.category} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Price (₹)</label>
                <input type="number" step="0.01" min="0" name="price" value={currentProduct.price} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Stock</label>
                <input type="number" min="0" name="stock" value={currentProduct.stock} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Minimum Stock (Alert Level)</label>
                <input type="number" min="0" name="minimumStock" value={currentProduct.minimumStock} onChange={handleInputChange} required />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeModal} disabled={submitting}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : (isEditing ? 'Update' : 'Save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;