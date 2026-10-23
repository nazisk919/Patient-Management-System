import React from 'react';

export const Spinner = ({ size = 20, primary = false, className = '' }) => {
  return (
    <span
      className={`spinner ${primary ? 'spinner-primary' : ''} ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
      role="status"
      aria-label="Loading"
    />
  );
};

export default Spinner;
