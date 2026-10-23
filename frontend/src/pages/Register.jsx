import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import { ROLES } from '../utils/constants';

export const Register = () => {
  const { register } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: ROLES.PATIENT,
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name || formData.name.trim().length < 3) {
      errs.name = 'Full name must be at least 3 characters';
    }
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Valid email address is required';
    }
    if (!formData.password || formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setLoading(true);
    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
      });
      success('Account created successfully! Welcome to Patient Management System.');
      navigate('/');
    } catch (err) {
      setServerError(err.message || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="brand-icon-wrapper">
            <Activity size={26} />
          </div>
          <h1 className="auth-title">Create an Account</h1>
          <p className="auth-subtitle">Join the Patient Management System Portal</p>
        </div>

        {serverError && (
          <Alert type="danger" message={serverError} onClose={() => setServerError('')} />
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label required" htmlFor="regName">
              Full Name
            </label>
            <input
              id="regName"
              name="name"
              type="text"
              placeholder="Dr. John Watson"
              className={`form-control ${errors.name ? 'is-invalid' : ''}`}
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
          </div>

          <div className="form-group">
            <label className="form-label required" htmlFor="regEmail">
              Email Address
            </label>
            <input
              id="regEmail"
              name="email"
              type="email"
              placeholder="john@hospital.com"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label className="form-label required" htmlFor="regPassword">
              Password
            </label>
            <input
              id="regPassword"
              name="password"
              type="password"
              placeholder="Minimum 6 characters"
              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
          </div>

          <div className="form-group">
            <label className="form-label required" htmlFor="regRole">
              Account Role
            </label>
            <select
              id="regRole"
              name="role"
              className="form-select"
              value={formData.role}
              onChange={handleChange}
            >
              <option value={ROLES.PATIENT}>Patient</option>
              <option value={ROLES.DOCTOR}>Doctor</option>
              <option value={ROLES.STAFF}>Staff / Nurse</option>
              <option value={ROLES.ADMIN}>System Administrator</option>
            </select>
          </div>

          <Button
            type="submit"
            variant="primary"
            icon={UserPlus}
            loading={loading}
            style={{ width: '100%', marginTop: '0.75rem' }}
          >
            Create Account
          </Button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 600 }}>
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
