import { type ReactElement } from 'react';
import { GeometryType } from '../../Engine/Geometry/GeometryType';
import GeometryButton from '../Buttons/GeomtryButtons';

type CreateGeometryFnType = ((type: GeometryType) => void) | null;

interface BrowserProps {
  createGeometryFn: CreateGeometryFnType;
}

function Browser({ createGeometryFn }: BrowserProps): ReactElement {
  if (createGeometryFn == null) {
    return <div>Loading...</div>;
  }

  const handleButtonClick = (type: GeometryType): void => {
    createGeometryFn(type);
  };

  return (
    <div>
      {Object.keys(GeometryType)
        .filter(k => isNaN(Number(k)))
        .map(key => {
          const geometryType = GeometryType[key as keyof typeof GeometryType];
          return (
            <GeometryButton
              key={geometryType}
              type={geometryType}
              onClick={handleButtonClick}
              label={`Add ${GeometryType[geometryType]}`}
            />
          );
        })}
    </div>
  );
}

export default Browser;
