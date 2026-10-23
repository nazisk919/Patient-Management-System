import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, message, title) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    const newToast = { id, type, message, title };

    setToasts((prev) => [...prev, newToast]);

    // Auto remove after 4.5s
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((msg, title = 'Success') => addToast('success', msg, title), [addToast]);
  const error = useCallback((msg, title = 'Error') => addToast('error', msg, title), [addToast]);
  const warning = useCallback((msg, title = 'Warning') => addToast('warning', msg, title), [addToast]);
  const info = useCallback((msg, title = 'Info') => addToast('info', msg, title), [addToast]);

  return (
    <ToastContext.Provider value={{ success, error, warning, info }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => {
          let IconComponent = CheckCircle2;
          let iconColor = 'var(--color-success)';

          if (toast.type === 'error') {
            IconComponent = AlertCircle;
            iconColor = 'var(--color-danger)';
          } else if (toast.type === 'warning') {
            IconComponent = AlertTriangle;
            iconColor = 'var(--color-warning)';
          } else if (toast.type === 'info') {
            IconComponent = Info;
            iconColor = 'var(--color-primary)';
          }

          return (
            <div key={toast.id} className={`toast toast-${toast.type}`}>
              <IconComponent size={20} color={iconColor} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                {toast.title && <div className="toast-title">{toast.title}</div>}
                <div className="toast-message">{toast.message}</div>
              </div>
              <button
                type="button"
                className="toast-close"
                onClick={() => removeToast(toast.id)}
                aria-label="Close notification"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastContext;
