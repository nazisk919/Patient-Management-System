import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Activity, Lock, CheckCircle2 } from 'lucide-react';
import authService from '../services/authService';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';

export const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.resetPassword(token, password);
      setSuccessMsg(res.message || 'Password reset successfully! You can now log in.');
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      setErrorMsg(err.message || 'Invalid or expired reset token.');
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
          <h1 className="auth-title">Set New Password</h1>
          <p className="auth-subtitle">Enter your new secure password below</p>
        </div>

        {successMsg && <Alert type="success" message={successMsg} />}
        {errorMsg && <Alert type="danger" message={errorMsg} onClose={() => setErrorMsg('')} />}

        {!successMsg && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label required" htmlFor="newPassword">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                placeholder="Minimum 6 characters"
                required
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label required" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter password"
                required
                className="form-control"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              icon={CheckCircle2}
              loading={loading}
              style={{ width: '100%', marginTop: '0.75rem' }}
            >
              Update Password
            </Button>
          </form>
        )}

        <div className="auth-footer">
          <Link to="/login">Back to Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
