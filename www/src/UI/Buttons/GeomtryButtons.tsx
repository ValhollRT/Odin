// GeometryButton.tsx
import React from 'react';
import { type GeometryType } from '../../Engine/Geometry/GeometryType';
import styles from '../../styles/geometry-button.module.scss';
import geometryIcon from '../../images/icons/geometry/box.svg';

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
      className={styles['geometry-button']}
      onClick={() => {
        onClick(type);
      }}
    >
      <img src={geometryIcon} alt={label} />
      <span>{label}</span>
    </button>
  );
};

export default GeometryButton;
