import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Home,
  ArrowLeft,
  Users,
  Calendar,
  CreditCard,
  FileCode,
  Compass,
} from 'lucide-react';

export const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isApiDocsAttempt =
    location.pathname.toLowerCase().includes('doc') ||
    location.pathname.toLowerCase().includes('swagger') ||
    location.pathname.toLowerCase().startsWith('/api');

  return (
    <div
      style={{
        minHeight: '75vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2.5rem 1.5rem',
      }}
    >
      <div
        style={{
          width: '84px',
          height: '84px',
          borderRadius: '50%',
          backgroundColor: '#fef2f2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-danger)',
          marginBottom: '1.25rem',
          boxShadow: '0 4px 14px rgba(239, 68, 68, 0.15)',
        }}
      >
        <AlertTriangle size={42} />
      </div>

      <h1
        style={{
          fontSize: '3rem',
          fontWeight: 800,
          marginBottom: '0.25rem',
          color: 'var(--color-slate-900)',
          letterSpacing: '-0.04em',
        }}
      >
        404
      </h1>

      <h2
        style={{
          fontSize: '1.35rem',
          fontWeight: 700,
          color: 'var(--color-slate-800)',
          marginBottom: '0.75rem',
        }}
      >
        Page Not Found
      </h2>

      <p
        style={{
          color: 'var(--text-muted)',
          maxWidth: '460px',
          marginBottom: '1rem',
          fontSize: '0.95rem',
          lineHeight: '1.5',
        }}
      >
        The page you are looking for does not exist or has been moved to a new route in the system.
      </p>

      {/* Display the unrecognized path for immediate developer clarity */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.35rem 0.85rem',
          backgroundColor: 'var(--color-slate-100)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.825rem',
          color: 'var(--color-slate-700)',
          fontFamily: 'monospace',
          marginBottom: '1.75rem',
          border: '1px solid var(--border-color)',
        }}
      >
        <span>Attempted URL:</span>
        <strong style={{ color: 'var(--color-danger)' }}>{location.pathname}</strong>
      </div>

      {/* Helpful note if trying to reach Swagger/API on the frontend port */}
      {isApiDocsAttempt && (
        <div
          style={{
            maxWidth: '520px',
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.75rem',
            textAlign: 'left',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: 700,
              color: 'var(--color-primary-dark)',
              fontSize: '0.9rem',
              marginBottom: '0.25rem',
            }}
          >
            <FileCode size={18} />
            <span>Looking for API Documentation?</span>
          </div>
          <p style={{ fontSize: '0.825rem', color: '#1e40af', marginBottom: '0.75rem' }}>
            Interactive Swagger API documentation runs on the backend server on port 5000 rather
            than the frontend client (port 3000).
          </p>
          <a
            href="http://localhost:5000/api-docs"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <span>Open Swagger Docs (:5000/api-docs)</span>
          </a>
        </div>
      )}

      {/* Primary Navigation Actions */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn btn-secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <ArrowLeft size={16} />
          <span>Go Back</span>
        </button>

        <Link
          to="/"
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Home size={16} />
          <span>Return to Dashboard</span>
        </Link>
      </div>

      {/* Quick Links Directory */}
      <div
        style={{
          marginTop: '2.5rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--border-color)',
          maxWidth: '460px',
          width: '100%',
        }}
      >
        <div
          style={{
            fontSize: '0.8rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--text-muted)',
            marginBottom: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.35rem',
          }}
        >
          <Compass size={14} />
          <span>Quick System Links</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/patients" className="btn btn-secondary btn-sm">
            <Users size={14} />
            <span>Patients</span>
          </Link>
          <Link to="/appointments" className="btn btn-secondary btn-sm">
            <Calendar size={14} />
            <span>Appointments</span>
          </Link>
          <Link to="/billing" className="btn btn-secondary btn-sm">
            <CreditCard size={14} />
            <span>Billing</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
