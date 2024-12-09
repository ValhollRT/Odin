import React, { forwardRef, InputHTMLAttributes } from "react";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "prefix" | "suffix"> {
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", prefix, suffix, ...props }, ref) => {
    return (
      <div style={{ position: "relative" }}>
        {prefix && (
          <div style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            display: "flex",
            alignItems: "center",
            paddingLeft: "0.75rem",
            pointerEvents: "none",
          }}>
            {prefix}
          </div>
        )}
        <input
          style={{
            display: "flex",
            height: "2.5rem",
            width: "100%",
            borderRadius: "0.375rem",
            border: "1px solid #ccc",
            backgroundColor: "#fff",
            padding: "0.5rem 0.75rem",
            fontSize: "0.875rem",
            paddingLeft: prefix ? "2.5rem" : undefined,
            paddingRight: suffix ? "2.5rem" : undefined,
          }}
          className={`input ${className}`}
          ref={ref}
          {...props}
        />
        {suffix && (
          <div style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            right: 0,
            display: "flex",
            alignItems: "center",
            paddingRight: "0.75rem",
            pointerEvents: "none",
          }}>
            {suffix}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
