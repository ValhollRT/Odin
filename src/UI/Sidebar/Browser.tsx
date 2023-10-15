import { GeometryType } from '../../Engine/Geometry/GeometryType';
import GeometryButton from '../Buttons/GeomtryButtons';

// Note: You'll need to provide geometryCreationFunctions from a higher component or context
function Browser({ geometryCreationFunctions }: any) {
    console.log("geometryCreationFunctions", geometryCreationFunctions)

    if (!geometryCreationFunctions) {
        return <div>Loading...</div>;
    }
    
    return (
        <div>
            {Object.keys(GeometryType)
                .filter(k => isNaN(Number(k)))
                .map(key => {
                    const geometryType = GeometryType[key as keyof typeof GeometryType];
                    return (
                        <GeometryButton
                            key={geometryType}
                            createGeometry={geometryCreationFunctions[geometryType]}
                            label={`Add ${GeometryType[geometryType]}`}
                        />
                    );
                })}
        </div>
    );
}

export default Browser;
