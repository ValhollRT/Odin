import React from 'react';
import BabylonViewport from './BabylonViewport'; // adjust the path based on your file structure
import AddSphereButton from './AddSphereButton';

function App() {
  const { addSphere, canvasRef } = BabylonViewport();

  return (
    <div className="App">
      <header className="App-header">
      <canvas ref={canvasRef} style={{ width: '100%', height: '600px' }} />
        <AddSphereButton addSphere={addSphere} />
      </header>
    </div>
  );
}

export default App;