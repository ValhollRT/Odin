// SidebarControl.tsx
import React, {
  type ReactElement,
  useContext,
  useEffect,
  useState
} from 'react';
import Tabs from '../TabPanel/Tabs';
import TabPanel from '../TabPanel/TabPanel';
import Browser from './Browser';
import GeometryPanel from './GeometryPanel'; // Asumiendo que has creado este componente
import TreeNode from './TreeNode';
import { GeometryFactory } from '../../Engine/Geometry/GeometryFactory';
import { BabylonManagerContext } from '../../BabylonManagerContext';
import log from '../../logConfig';
import '../../styles/styles.scss';

function SidebarControl(): ReactElement {
  const [geometryFactory, setGeometryFactory] =
    useState<GeometryFactory | null>(null);
  const { babylonManager, isReady } = useContext(BabylonManagerContext);

  useEffect(() => {
    if (babylonManager != null) {
      const newGeometryFactory = new GeometryFactory(babylonManager.scene);
      setGeometryFactory(newGeometryFactory);
    } else {
      log.debug('BabylonManager is not loaded');
    }
  }, [babylonManager, isReady]);

  let createGeometryFn = null;
  if (geometryFactory != null) {
    createGeometryFn = geometryFactory.createGeometry.bind(geometryFactory);
  }

  return (
    <div className="sidebar">
      {isReady ? (
        <Tabs>
          <TabPanel label="Browser">
            <Browser createGeometryFn={createGeometryFn} />
          </TabPanel>
          <TabPanel label="Geometry">
            <GeometryPanel />
          </TabPanel>
        </Tabs>
      ) : (
        'Loading...'
      )}
      <TreeNode />
    </div>
  );
}

export default SidebarControl;
