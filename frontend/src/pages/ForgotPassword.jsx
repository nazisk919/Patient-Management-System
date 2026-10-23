import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Mail, ArrowLeft, Send } from 'lucide-react';
import authService from '../services/authService';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.forgotPassword(email);
      setSuccessMsg(res.message || 'Password reset link sent successfully! Please check your email.');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to send reset link.');
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
          <h1 className="auth-title">Reset Password</h1>
          <p className="auth-subtitle">
            Enter your email and we'll send you a password recovery link
          </p>
        </div>

        {successMsg && <Alert type="success" message={successMsg} />}
        {errorMsg && <Alert type="danger" message={errorMsg} onClose={() => setErrorMsg('')} />}

        {!successMsg ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label required" htmlFor="forgotEmail">
                Email Address
              </label>
              <input
                id="forgotEmail"
                type="email"
                placeholder="doctor@hospital.com"
                required
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              icon={Send}
              loading={loading}
              style={{ width: '100%', marginTop: '0.75rem' }}
            >
              Send Reset Link
            </Button>
          </form>
        ) : (
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <Link to="/login" className="btn btn-secondary" style={{ width: '100%' }}>
              Back to Login
            </Link>
          </div>
        )}

        <div className="auth-footer">
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <ArrowLeft size={16} />
            <span>Back to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
