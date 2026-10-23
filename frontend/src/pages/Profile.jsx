import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, CheckCircle, Calendar, LogOut, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import authService from '../services/authService';
import Spinner from '../components/common/Spinner';
import Alert from '../components/common/Alert';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { formatDate } from '../utils/formatDate';

export const Profile = () => {
  const { user, setUser, logout } = useAuth();
  const { success, error } = useToast();

  const [profileData, setProfileData] = useState(user);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const refreshProfile = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await authService.getProfile();
      if (res?.data) {
        setProfileData(res.data);
        setUser(res.data);
        localStorage.setItem('carepulse_user', JSON.stringify(res.data));
        success('Profile data refreshed.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to refresh user profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!profileData) {
      refreshProfile();
    }
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">User Account & Profile</h1>
          <p className="page-subtitle">Personal credentials, security roles, and system session info</p>
        </div>
        <div className="page-actions">
          <Button variant="secondary" icon={RefreshCw} onClick={refreshProfile} loading={loading}>
            Refresh
          </Button>
          <Button variant="danger" icon={LogOut} onClick={logout}>
            Sign Out
          </Button>
        </div>
      </div>

      {errorMsg && <Alert type="danger" message={errorMsg} onClose={() => setErrorMsg('')} />}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Profile Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <User size={18} color="var(--color-primary)" />
              Account Overview
            </h3>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--color-primary), var(--color-teal))',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
                }}
              >
                {profileData?.name ? profileData.name[0].toUpperCase() : 'U'}
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{profileData?.name}</h2>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '4px' }}>
                  <Badge variant="primary">{profileData?.role}</Badge>
                  {profileData?.isActive && (
                    <Badge variant="success">Active Account</Badge>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Email Address
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-slate-800)', marginTop: '2px' }}>
                  {profileData?.email}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Account Role
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-primary-dark)', marginTop: '2px' }}>
                  {profileData?.role}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Account Created
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 500, marginTop: '2px' }}>
                  {formatDate(profileData?.createdAt)}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Account Database Identifier
                </div>
                <div style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {profileData?._id}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Access Rights Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Shield size={18} color="var(--color-teal)" />
              Security & Permissions
            </h3>
          </div>
          <div className="card-body">
            <p style={{ fontSize: '0.875rem', color: 'var(--color-slate-600)', marginBottom: '1.25rem' }}>
              Your current session is secured with JSON Web Token (JWT) authorization verified by the backend API.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--color-slate-50)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={16} color="var(--color-success)" />
                <span style={{ fontSize: '0.85rem' }}>
                  <strong>Role:</strong> {profileData?.role} permissions active
                </span>
              </div>

              <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--color-slate-50)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={16} color="var(--color-success)" />
                <span style={{ fontSize: '0.85rem' }}>
                  <strong>Session:</strong> Bearer Token authenticated
                </span>
              </div>

              <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--color-slate-50)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={16} color="var(--color-success)" />
                <span style={{ fontSize: '0.85rem' }}>
                  <strong>HIPAA Ready:</strong> Patient record access guarded
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
