import React from "react";

interface SwitchProps {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
}

export const Switch: React.FC<SwitchProps> = ({ id, checked, onCheckedChange, label }) => {
  return (
    <div className="switch-container">
      <label htmlFor={id} className="switch-label">
        <div className="switch-relative">
          <input
            type="checkbox"
            id={id}
            className="switch-input"
            checked={checked}
            onChange={(e) => onCheckedChange(e.target.checked)}
          />
          <div className={`switch-track ${checked ? "switch-track-checked" : ""}`}></div>
          <div className={`switch-thumb ${checked ? "switch-thumb-checked" : ""}`}></div>
        </div>
        {label && <span className="switch-text">{label}</span>}
      </label>
    </div>
  );
};
