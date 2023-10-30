// App.tsx
import React, { type ReactElement, useState } from 'react';
import Viewport from './UI/Viewport/Viewport';
import SidebarControl from './UI/Sidebar/SidebarControl';
import { BabylonManagerContext } from './BabylonManagerContext';
import { type BabylonManager } from './Engine/Geometry/BabylonManager';
import Login from './UI/Login';

function App(): ReactElement {
  const [isViewportReady, setIsViewportReady] = useState(false);
  const [babylonManager, setBabylonManager] = useState<BabylonManager | null>(
    null
  );

  const onReady = (manager: BabylonManager): void => {
    setIsViewportReady(true);
    setBabylonManager(manager);
  };

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <BabylonManagerContext.Provider
      value={{ babylonManager, isReady: isViewportReady }}
    >
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
