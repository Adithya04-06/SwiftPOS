import React, { useState, useEffect } from 'react';
import { Eye, X, RefreshCw } from 'lucide-react';
import api from '../../services/api';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSaleDetail, setSelectedSaleDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getSales();
      setSales(data);
    } catch (err) {
      console.error('Failed to fetch sales', err);
      setError('Failed to load sales history. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewSale = async (saleId) => {
    setDetailLoading(true);
    try {
      const details = await api.getSaleById(saleId);
      setSelectedSaleDetail(details);
    } catch (err) {
      console.error('Failed to load sale details', err);
      alert('Failed to load sale details: ' + (err.message || 'Error'));
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetailModal = () => {
    setSelectedSaleDetail(null);
  };

  if (loading) return <div className="loading">Loading Sales...</div>;

  return (
    <div className="products-container">
      <div className="page-header">
        <h1>Sales History</h1>
        <button className="btn-secondary" onClick={fetchSales} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
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
              <th>Transaction ID</th>
              <th>Date</th>
              <th>Method</th>
              <th>Status</th>
              <th>Total Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sales.map(sale => (
              <tr key={sale.id}>
                <td><strong>{sale.transactionId}</strong></td>
                <td>{sale.date ? new Date(sale.date).toLocaleString() : 'N/A'}</td>
                <td>{sale.paymentMethod}</td>
                <td>
                  <span className={`badge ${sale.status === 'COMPLETED' ? 'success' : 'warning'}`}>
                    {sale.status}
                  </span>
                </td>
                <td style={{ fontWeight: 'bold', color: '#0f172a' }}>₹{Number(sale.total).toFixed(2)}</td>
                <td>
                  <button 
                    className="btn-icon" 
                    onClick={() => handleViewSale(sale.id)} 
                    title="View Transaction Details"
                    disabled={detailLoading}
                  >
                    <Eye size={18} color="#64748b" />
                  </button>
                </td>
              </tr>
            ))}
            {sales.length === 0 && !error && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '24px' }}>No sales history found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* SALE DETAILS MODAL */}
      {selectedSaleDetail && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 600 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ margin: 0 }}>Sale Details</h2>
              <button 
                onClick={closeDetailModal}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: 8, marginBottom: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 14 }}>
                <div><strong>Transaction ID:</strong> {selectedSaleDetail.sale?.transactionId}</div>
                <div><strong>Date:</strong> {selectedSaleDetail.sale?.date ? new Date(selectedSaleDetail.sale.date).toLocaleString() : 'N/A'}</div>
                <div><strong>Cashier:</strong> {selectedSaleDetail.sale?.cashier?.name || 'N/A'}</div>
                <div><strong>Payment:</strong> {selectedSaleDetail.sale?.paymentMethod}</div>
              </div>
            </div>

            <table className="table-modern" style={{ marginBottom: 16 }}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th style={{ textAlign: 'center' }}>Qty</th>
                  <th style={{ textAlign: 'right' }}>Price</th>
                  <th style={{ textAlign: 'right' }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {selectedSaleDetail.items && selectedSaleDetail.items.map(item => (
                  <tr key={item.id}>
                    <td>{item.product?.name || `Product #${item.product?.id}`}</td>
                    <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                    <td style={{ textAlign: 'right' }}>₹{Number(item.price).toFixed(2)}</td>
                    <td style={{ textAlign: 'right' }}>₹{Number(item.subtotal).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ textAlign: 'right', borderTop: '1px solid #e2e8f0', paddingTop: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>
                Total (incl. 5% tax): ₹{Number(selectedSaleDetail.sale?.total || 0).toFixed(2)}
              </div>
            </div>

            <div className="modal-actions" style={{ marginTop: 20 }}>
              <button type="button" className="btn-secondary" onClick={closeDetailModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;