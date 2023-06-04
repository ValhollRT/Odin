import React from 'react';

interface GeometryButtonProps {
  createGeometry: () => void;
  label: string;
}

function GeometryButton({ createGeometry, label }: GeometryButtonProps) {
  return <button onClick={createGeometry}>{label}</button>;
}

export default GeometryButton;
