// GeometryButton.tsx
import React from 'react';
import { type GeometryType } from '../../Engine/Geometry/GeometryType';

interface GeometryButtonProps {
  label: string;
  type: GeometryType;
  onClick: (type: GeometryType) => void;
}

const GeometryButton: React.FC<GeometryButtonProps> = ({
  label,
  type,
  onClick
}) => {
  return (
    <button
      onClick={() => {
        onClick(type);
      }}
    >
      {label}
    </button>
  );
};

export default GeometryButton;
