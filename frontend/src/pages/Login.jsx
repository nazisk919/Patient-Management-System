import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Activity, Mail, Lock, LogIn, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import { ROLES } from '../utils/constants';

export const Login = () => {
  const { login, setUser } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.email || !formData.password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(formData);
      success('Logged in successfully! Welcome to Patient Management System.');
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message ||
          err.message ||
          'Authentication failed. Verify credentials or use Demo Login below.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role = ROLES.ADMIN) => {
    const demoUser = {
      _id: '66f1234567890abcdef12345',
      name: role === ROLES.ADMIN ? 'Dr. Sarah Connor (Admin)' : 'Dr. Gregory House',
      email: role === ROLES.ADMIN ? 'admin@hospital.com' : 'doctor@hospital.com',
      role,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    const demoToken = 'demo-jwt-token-pms';
    localStorage.setItem('carepulse_token', demoToken);
    localStorage.setItem('carepulse_user', JSON.stringify(demoUser));
    setUser(demoUser);
    success(`Logged in as ${demoUser.name} (${role})`);
    navigate(from, { replace: true });
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="brand-icon-wrapper">
            <Activity size={26} />
          </div>
          <h1 className="auth-title">Patient Management System</h1>
          <p className="auth-subtitle">Sign in to manage clinical operations</p>
        </div>

        {errorMsg && (
          <Alert type="danger" message={errorMsg} onClose={() => setErrorMsg('')} />
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label required" htmlFor="loginEmail">
              Email Address
            </label>
            <input
              id="loginEmail"
              name="email"
              type="email"
              placeholder="admin@carepulse.com"
              required
              className="form-control"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label required" htmlFor="loginPassword">
                Password
              </label>
              <Link
                to="/forgot-password"
                style={{ fontSize: '0.8rem', color: 'var(--color-primary)' }}
              >
                Forgot password?
              </Link>
            </div>
            <input
              id="loginPassword"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="form-control"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            icon={LogIn}
            loading={loading}
            style={{ width: '100%', marginTop: '0.75rem' }}
          >
            Sign In with API
          </Button>
        </form>

        {/* Demo One-Click Access for UI testing */}
        <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, textAlign: 'center', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
            Quick Preview Access
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleDemoLogin(ROLES.ADMIN)}
              style={{ fontSize: '0.8rem' }}
            >
              <Sparkles size={14} color="var(--color-primary)" />
              <span>Admin Demo</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleDemoLogin(ROLES.DOCTOR)}
              style={{ fontSize: '0.8rem' }}
            >
              <Sparkles size={14} color="var(--color-teal)" />
              <span>Doctor Demo</span>
            </button>
          </div>
        </div>

        <div className="auth-footer">
          Don't have an account?{' '}
          <Link to="/register" style={{ fontWeight: 600 }}>
            Create one now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
