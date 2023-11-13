import { type ReactElement } from 'react';
import { GeometryType } from '../../Engine/Geometry/GeometryType';
import GeometryButton from '../Buttons/GeomtryButtons';
import styles from '../../styles/browser.module.scss';

type CreateGeometryFnType = ((type: GeometryType) => void) | null;

interface GeometryPanelProps {
  createGeometryFn: CreateGeometryFnType;
}

function GeometryPanel({ createGeometryFn }: GeometryPanelProps): ReactElement {
  if (createGeometryFn == null) {
    return <div>Loading...</div>;
  }

  const handleButtonClick = (type: GeometryType): void => {
    createGeometryFn(type);
  };

  return (
    <div className={styles['browser-grid']}>
      {Object.keys(GeometryType)
        .filter(k => isNaN(Number(k)))
        .map(key => {
          const geometryType = GeometryType[key as keyof typeof GeometryType];
          return (
            <GeometryButton
              key={geometryType}
              type={geometryType}
              onClick={handleButtonClick}
              label={`${GeometryType[geometryType]}`}
            />
          );
        })}
    </div>
  );
}

export default GeometryPanel;
