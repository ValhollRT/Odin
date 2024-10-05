import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { MeshBuilder } from '@babylonjs/core';
import { useAppContext } from '../context/AppContext';
import { Button } from './ui/Button';

type GeometryType = 'sphere' | 'cube' | 'cylinder' | 'cone' | 'torus';

const colors = [
  { name: 'Rojo', hex: '#FF0000' },
  { name: 'Verde', hex: '#00FF00' },
  { name: 'Azul', hex: '#0000FF' },
  { name: 'Amarillo', hex: '#FFFF00' },
  { name: 'Magenta', hex: '#FF00FF' },
  { name: 'Cian', hex: '#00FFFF' }
];

const GeometryCreator = () => {
  const [activeTab, setActiveTab] = useState('geometries');
  const { scene, setGeometries } = useAppContext();

  const createGeometry = (type: GeometryType) => {
    if (!scene) return;

    const id = Date.now();
    const meshName = `${type}-${id}`;
    let mesh;

    switch (type) {
      case 'sphere':
        mesh = MeshBuilder.CreateSphere(meshName, { diameter: 5 }, scene);
        break;
      case 'cube':
        mesh = MeshBuilder.CreateBox(meshName, { size: 5 }, scene);
        break;
      case 'cylinder':
        mesh = MeshBuilder.CreateCylinder(
          meshName,
          { height: 5, diameter: 5 },
          scene
        );
        break;
      case 'cone':
        mesh = MeshBuilder.CreateCylinder(
          meshName,
          { height: 5, diameterTop: 0, diameterBottom: 5 },
          scene
        );
        break;
      case 'torus':
        mesh = MeshBuilder.CreateTorus(
          meshName,
          { thickness: 1, diameter: 5 },
          scene
        );
        break;
    }

    mesh.position.x = (Math.random() - 0.5) * 20;
    mesh.position.z = (Math.random() - 0.5) * 20;
    mesh.position.y = 2.5;

    setGeometries(prev => [
      ...prev,
      { id, type, meshName, children: [], isExpanded: true }
    ]);
  };

  const handleDragStart = (e: React.DragEvent, type: GeometryType) => {
    e.dataTransfer.setData('geometryType', type);
  };

  const handleColorDragStart = (e: React.DragEvent, color: string) => {
    e.dataTransfer.setData('color', color);
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="geometries">Geometrías</TabsTrigger>
        <TabsTrigger value="materials">Materiales</TabsTrigger>
      </TabsList>
      <TabsContent value="geometries" className="space-y-4">
        <h3 className="text-lg font-semibold mb-2">Crear Geometrías</h3>
        <div className="grid grid-cols-2 gap-2">
          <Button
            draggable
            onDragStart={e => {
              handleDragStart(e, 'sphere');
            }}
            onClick={() => {
              createGeometry('sphere');
            }}
          >
            Esfera
          </Button>
          <Button
            draggable
            onDragStart={e => {
              handleDragStart(e, 'cube');
            }}
            onClick={() => {
              createGeometry('cube');
            }}
          >
            Cubo
          </Button>
          <Button
            draggable
            onDragStart={e => {
              handleDragStart(e, 'cylinder');
            }}
            onClick={() => {
              createGeometry('cylinder');
            }}
          >
            Cilindro
          </Button>
          <Button
            draggable
            onDragStart={e => {
              handleDragStart(e, 'cone');
            }}
            onClick={() => {
              createGeometry('cone');
            }}
          >
            Cono
          </Button>
          <Button
            draggable
            onDragStart={e => {
              handleDragStart(e, 'torus');
            }}
            onClick={() => {
              createGeometry('torus');
            }}
          >
            Toro
          </Button>
        </div>
      </TabsContent>
      <TabsContent value="materials" className="space-y-4">
        <h3 className="text-lg font-semibold mb-2">Paleta de Colores</h3>
        <div className="grid grid-cols-3 gap-2">
          {colors.map(color => (
            <Button
              key={color.hex}
              draggable
              onDragStart={e => {
                handleColorDragStart(e, color.hex);
              }}
              style={{ backgroundColor: color.hex, color: '#000000' }}
            >
              {color.name}
            </Button>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default GeometryCreator;