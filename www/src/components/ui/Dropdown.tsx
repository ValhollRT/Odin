import React, {
    SelectHTMLAttributes
} from "react";

// Dropdown Component
export const Dropdown: React.FC<SelectHTMLAttributes<HTMLSelectElement>> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <select className={`dropdown ${className}`} {...props}>
      {children}
    </select>
  );
};
