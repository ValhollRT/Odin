// App.tsx
import React, { useState } from 'react';
import Viewport from './UI/Viewport/Viewport'; // adjust the path based on your file structure
import SidebarControl from './UI/Sidebar/SidebarControl';
import { BabylonManagerContext } from './BabylonManagerContext'; // Importa el contexto
import { BabylonManager } from './Engine/Geometry/BabylonManager'; // Importa el manager

function App() {
  const [isViewportReady, setIsViewportReady] = useState(false);
  const [babylonManager, setBabylonManager] = useState<BabylonManager | null>(null);

  const onReady = (manager: BabylonManager) => {
    setIsViewportReady(true);
    setBabylonManager(manager);
    console.log("Cargado App", manager)
  }

  return (
    <BabylonManagerContext.Provider value={{ babylonManager, isReady: isViewportReady }}>
      <div className="App">
        <Viewport onReady={onReady} />
        {isViewportReady && <SidebarControl />}
      </div>
    </BabylonManagerContext.Provider>
  );
}

export default App;
