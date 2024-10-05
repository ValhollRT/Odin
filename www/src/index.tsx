import React from 'react';
import ReactDOM from 'react-dom/client';
import MainWindow from './components/MainWindow';
import { AppProvider } from './context/AppContext';
import './index.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <AppProvider>
      <MainWindow />
    </AppProvider>
  </React.StrictMode>
);