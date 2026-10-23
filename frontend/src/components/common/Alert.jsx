import React from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export const Alert = ({
  type = 'info',
  message,
  title,
  onClose,
  className = '',
}) => {
  if (!message) return null;

  let Icon = Info;
  let bg = '#eff6ff';
  let border = '#bfdbfe';
  let text = '#1e40af';

  if (type === 'danger' || type === 'error') {
    Icon = AlertCircle;
    bg = '#fef2f2';
    border = '#fecaca';
    text = '#991b1b';
  } else if (type === 'warning') {
    Icon = AlertTriangle;
    bg = '#fffbeb';
    border = '#fde68a';
    text = '#92400e';
  } else if (type === 'success') {
    Icon = CheckCircle2;
    bg = '#ecfdf5';
    border = '#a7f3d0';
    text = '#065f46';
  }

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        padding: '0.85rem 1rem',
        borderRadius: 'var(--radius-md)',
        backgroundColor: bg,
        border: `1px solid ${border}`,
        color: text,
        fontSize: '0.875rem',
        marginBottom: '1rem',
      }}
      role="alert"
    >
      <Icon size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
      <div style={{ flex: 1 }}>
        {title && <div style={{ fontWeight: 700, marginBottom: '2px' }}>{title}</div>}
        <div>{message}</div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: text,
            padding: 0,
            opacity: 0.7,
          }}
        >
          ×
        </button>
      )}
    </div>
  );
};

export default Alert;
