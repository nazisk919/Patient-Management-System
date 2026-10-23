import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  icon: Icon,
  accentColor = 'var(--color-primary)',
  bgColor = 'var(--color-primary-light)',
  subtitle,
  to,
  onClick,
}) => {
  const isClickable = !!(to || onClick);

  const cardContent = (
    <>
      <div className="stat-top">
        <span className="stat-title">{title}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {isClickable && (
            <span
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                display: 'inline-flex',
                alignItems: 'center',
                opacity: 0.8,
              }}
            >
              <ArrowUpRight size={14} color={accentColor} />
            </span>
          )}
          <div className="stat-icon">
            <Icon size={22} />
          </div>
        </div>
      </div>
      <div className="stat-value">{value ?? 0}</div>
      {subtitle && (
        <div className="stat-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{subtitle}</span>
          {isClickable && (
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: accentColor }}>
              Open →
            </span>
          )}
        </div>
      )}
    </>
  );

  const cardStyle = {
    '--stat-accent': accentColor,
    '--stat-bg': bgColor,
    cursor: isClickable ? 'pointer' : 'default',
    textDecoration: 'none',
    color: 'inherit',
    display: 'flex',
  };

  if (to) {
    return (
      <Link to={to} className="stat-card" style={cardStyle} title={`View ${title}`}>
        {cardContent}
      </Link>
    );
  }

  return (
    <div
      className="stat-card"
      style={cardStyle}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      {cardContent}
    </div>
  );
};

export default StatCard;
