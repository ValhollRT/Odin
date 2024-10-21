import React, { LabelHTMLAttributes } from 'react';

export const Label: React.FC<LabelHTMLAttributes<HTMLLabelElement>> = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <label
      className={`label ${className}`}
      {...props}
    >
      {children}
    </label>
  );
};