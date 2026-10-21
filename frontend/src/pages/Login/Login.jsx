import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import api from '../../services/api';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await api.login({ email, password });
      if (user && user.role) {
        localStorage.setItem('swiftpos_user', JSON.stringify(user));
        if (user.role === 'ADMIN') {
          navigate('/');
        } else {
          navigate('/pos');
        }
      } else {
        setError('Invalid response from server.');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 15 }}>
            <div style={{ background: '#eff6ff', padding: 15, borderRadius: '50%' }}>
              <Lock size={32} color="#3b82f6" />
            </div>
          </div>
          <h1>SwiftPOS</h1>
          <p>Sign in to your account</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@swiftpos.com"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="demo-credentials">
          <h4>Demo Credentials</h4>
          <p><strong>Admin:</strong> admin@swiftpos.com / admin123</p>
          <p><strong>Cashier:</strong> cashier@swiftpos.com / cashier123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;