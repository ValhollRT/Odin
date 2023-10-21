// App.tsx
import React, { useState } from 'react';
import Viewport from './UI/Viewport/Viewport'; // adjust the path based on your file structure
import SidebarControl from './UI/Sidebar/SidebarControl';
import { BabylonManagerContext } from './BabylonManagerContext'; // Importa el contexto
import { BabylonManager } from './Engine/Geometry/BabylonManager'; // Importa el manager
import Login from './UI/Login';

function App() {
  const [isViewportReady, setIsViewportReady] = useState(false);
  const [babylonManager, setBabylonManager] = useState<BabylonManager | null>(null);

  const onReady = (manager: BabylonManager) => {
    setIsViewportReady(true);
    setBabylonManager(manager);
    console.log("Cargado App", manager)
  }

  const [isLoggedIn, setIsLoggedIn] = useState(false);


  return (
    <BabylonManagerContext.Provider value={{ babylonManager, isReady: isViewportReady }}>
      <div className="App">
        {!isLoggedIn ? (
          <div>
            <Viewport onReady={onReady} />
            {isViewportReady && <SidebarControl />}
          </div>
        ) : (
          <Login setIsLoggedIn={setIsLoggedIn} />
        )}
      </div>
    </BabylonManagerContext.Provider>
  );
}

export default App;