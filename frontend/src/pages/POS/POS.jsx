import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, CreditCard, X, CheckCircle, Printer } from 'lucide-react';
import api from '../../services/api';
import './POS.css';

const POS = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Checkout states
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [lastCompletedSale, setLastCompletedSale] = useState(null);
  const [lastOrderItems, setLastOrderItems] = useState([]); // Snapshot for receipt
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getProducts();
      setProducts(data);
      const cats = ['All', ...new Set(data.map(p => p.category).filter(Boolean))];
      setCategories(cats);
    } catch (err) {
      console.error('Failed to fetch products', err);
      setError('Failed to load products for POS. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product) => {
    if (product.stock <= 0) return;
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      if (existingItem) {
        if (existingItem.quantity >= product.stock) {
          alert('Cannot add more than available stock!');
          return prevCart;
        }
        return prevCart.map(item => 
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId, delta) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.product.id === productId) {
          const newQuantity = item.quantity + delta;
          if (newQuantity <= 0) return null; 
          if (newQuantity > item.product.stock) {
            alert('Cannot exceed available stock!');
            return item;
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(Boolean);
    });
  };

  const removeFromCart = (productId) => setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  const clearCart = () => { if (window.confirm('Clear all items from cart?')) setCart([]); };

  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const tax = subtotal * 0.05; 
  const total = subtotal + tax;

  const handleCompletePayment = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);

    let cashierId = 2; // Default demo cashier
    try {
      const stored = localStorage.getItem('swiftpos_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u && u.id) cashierId = u.id;
      }
    } catch {
      // ignore
    }

    const saleRequest = {
      cashierId: cashierId, 
      paymentMethod: paymentMethod,
      items: cart.map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      }))
    };

    try {
      const saleData = await api.createSale(saleRequest);
      setLastCompletedSale(saleData);
      setLastOrderItems([...cart]); // Snapshot for receipt
      setCheckoutSuccess(true);
      setCart([]); 
      fetchProducts(); // Refresh stock counts
    } catch (err) {
      console.error('Checkout failed', err);
      alert('Checkout failed: ' + (err.message || 'Error communicating with server.'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const closeCheckoutModal = () => {
    setIsCheckoutModalOpen(false);
    setCheckoutSuccess(false);
    setShowReceipt(false);
    setLastCompletedSale(null);
    setLastOrderItems([]);
  };

  if (loading) return <div className="loading">Loading POS Register...</div>;

  return (
    <div className="pos-layout">
      {/* LEFT SIDE - Product Catalog */}
      <div className="pos-left no-print">
        <div className="pos-toolbar">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search products by name or SKU..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="category-chips">
            {categories.map(cat => (
              <button 
                key={cat} 
                className={`chip ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: 8, margin: 16 }}>
            {error}
          </div>
        )}

        <div className="pos-grid">
          {filteredProducts.map(product => (
            <div 
              key={product.id} 
              className={`product-card ${product.stock <= 0 ? 'out-of-stock' : ''}`}
              onClick={() => addToCart(product)}
            >
              <h4>{product.name}</h4>
              <span className="category">{product.category || 'General'}</span>
              <div className="price">₹{Number(product.price).toFixed(2)}</div>
              <div className="stock">Stock: {product.stock}</div>
              <button className="add-btn" disabled={product.stock <= 0} title={product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}>
                <Plus size={16} />
              </button>
            </div>
          ))}
          {filteredProducts.length === 0 && !error && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40, color: '#64748b' }}>
              No products found matching your search.
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDE - Cart */}
      <div className="pos-right no-print">
        <div className="cart-header">
          <h3>Current Order</h3>
          {cart.length > 0 && <button className="clear-btn" onClick={clearCart}>Clear All</button>}
        </div>

        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="empty-cart"><p>Your cart is empty</p></div>
          ) : (
            cart.map(item => (
              <div key={item.product.id} className="cart-item">
                <div className="item-info">
                  <h5>{item.product.name}</h5>
                  <span className="item-price">₹{Number(item.product.price).toFixed(2)} / ea</span>
                </div>
                <div className="qty-controls">
                  <button className="qty-btn" onClick={() => updateQuantity(item.product.id, -1)}>-</button>
                  <span>{item.quantity}</span>
                  <button className="qty-btn" onClick={() => updateQuantity(item.product.id, 1)}>+</button>
                </div>
                <div className="item-total">₹{(item.product.price * item.quantity).toFixed(2)}</div>
                <button className="remove-btn" onClick={() => removeFromCart(item.product.id)} title="Remove">
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="cart-summary">
          <div className="summary-row"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
          <div className="summary-row"><span>Tax (5%)</span><span>₹{tax.toFixed(2)}</span></div>
          <div className="summary-total"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
          <button className="checkout-btn" disabled={cart.length === 0} onClick={() => setIsCheckoutModalOpen(true)}>
            <CreditCard size={20} /> Checkout (₹{total.toFixed(2)})
          </button>
        </div>
      </div>

      {/* CHECKOUT & RECEIPT MODAL */}
      {isCheckoutModalOpen && (
        <div className="modal-overlay">
          <div className={`checkout-modal ${showReceipt ? 'receipt-mode' : 'no-print'}`}>
            {!showReceipt && <button className="close-modal-btn no-print" onClick={closeCheckoutModal}><X size={20} /></button>}
            
            {!checkoutSuccess ? (
              <div className="no-print">
                <h2>Complete Payment</h2>
                <div className="payment-summary">
                  <div className="summary-row"><span>Subtotal:</span> <span>₹{subtotal.toFixed(2)}</span></div>
                  <div className="summary-row"><span>Tax (5%):</span> <span>₹{tax.toFixed(2)}</span></div>
                  <div className="summary-total" style={{marginTop: 10}}><span>Amount Due:</span> <span style={{color: '#10b981'}}>₹{total.toFixed(2)}</span></div>
                </div>

                <div className="payment-methods">
                  <h3>Select Payment Method</h3>
                  <div className="method-options">
                    <button className={`method-btn ${paymentMethod === 'CASH' ? 'active' : ''}`} onClick={() => setPaymentMethod('CASH')}>Cash</button>
                    <button className={`method-btn ${paymentMethod === 'CARD' ? 'active' : ''}`} onClick={() => setPaymentMethod('CARD')}>Card</button>
                    <button className={`method-btn ${paymentMethod === 'UPI' ? 'active' : ''}`} onClick={() => setPaymentMethod('UPI')}>UPI</button>
                  </div>
                </div>

                <button className="complete-btn" onClick={handleCompletePayment} disabled={isProcessing}>
                  {isProcessing ? 'Processing...' : `Pay ₹${total.toFixed(2)}`}
                </button>
              </div>
            ) : !showReceipt ? (
              <div className="success-state no-print">
                <CheckCircle size={60} color="#10b981" style={{marginBottom: 20}} />
                <h2>Payment Successful!</h2>
                <p>Transaction ID: {lastCompletedSale?.transactionId}</p>
                <div className="success-actions">
                  <button className="btn-secondary" onClick={() => setShowReceipt(true)}>View Receipt</button>
                  <button className="btn-primary" onClick={closeCheckoutModal}>New Order</button>
                </div>
              </div>
            ) : (
              <div className="receipt-container print-only-container">
                <div className="receipt-paper">
                  <div className="receipt-header">
                    <h2>SWIFTPOS</h2>
                    <p>Smart Retail Store</p>
                    <p>================================</p>
                  </div>
                  
                  <div className="receipt-meta">
                    <p>Transaction: {lastCompletedSale?.transactionId}</p>
                    <p>Date: {lastCompletedSale?.date ? new Date(lastCompletedSale.date).toLocaleString() : new Date().toLocaleString()}</p>
                    <p>Cashier: {lastCompletedSale?.cashier?.name || 'Cashier Demo'}</p>
                    <p>--------------------------------</p>
                  </div>

                  <table className="receipt-table">
                    <thead>
                      <tr>
                        <th align="left">Product</th>
                        <th align="center">Qty</th>
                        <th align="right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td colSpan="3">--------------------------------</td></tr>
                      {lastOrderItems.map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.product.name.substring(0, 15)}</td>
                          <td align="center">{item.quantity}</td>
                          <td align="right">₹{(item.product.price * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                      <tr><td colSpan="3">--------------------------------</td></tr>
                    </tbody>
                  </table>

                  <div className="receipt-totals">
                    <div className="receipt-row"><span>Subtotal:</span><span>₹{(Number(lastCompletedSale?.total || 0) / 1.05).toFixed(2)}</span></div>
                    <div className="receipt-row"><span>Tax (5%):</span><span>₹{(Number(lastCompletedSale?.total || 0) - (Number(lastCompletedSale?.total || 0) / 1.05)).toFixed(2)}</span></div>
                    <p>--------------------------------</p>
                    <div className="receipt-row receipt-final"><span>TOTAL:</span><span>₹{Number(lastCompletedSale?.total || 0).toFixed(2)}</span></div>
                  </div>

                  <div className="receipt-footer">
                    <p>Payment: {lastCompletedSale?.paymentMethod}</p>
                    <p>================================</p>
                    <p>Thank You!</p>
                  </div>
                </div>

                <div className="receipt-actions no-print">
                  <button className="btn-primary" onClick={handlePrint} style={{flex: 1, display: 'flex', justifyContent: 'center', gap: 10}}><Printer size={18}/> Print Receipt</button>
                  <button className="btn-secondary" onClick={closeCheckoutModal} style={{flex: 1}}>Close</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;