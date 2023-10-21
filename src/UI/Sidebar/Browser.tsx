import { GeometryType } from '../../Engine/Geometry/GeometryType';
import GeometryButton from '../Buttons/GeomtryButtons';

function Browser({ createGeometryFn }: any) {
    if (!createGeometryFn) {
      return <div>Loading...</div>;
    }
  
    const handleButtonClick = (type: GeometryType) => {
      createGeometryFn.createGeometry(type);
    };
  
    return (
      <div>
        {Object.keys(GeometryType)
          .filter(k => isNaN(Number(k)))
          .map((key) => {
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
 
  
  
  
  