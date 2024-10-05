import { AppProvider } from '../context/AppContext';
import { Icon } from 'lucide-react';

import './globals.css';

export const metadata = {
  title: '3D Babylon.js Project',
  description: 'A 3D application using Babylon.js and React'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body> 
        <AppProvider>
          <Icon name="aperture" iconNode={[]} /> 
          {children}
        </AppProvider>
      </body>
    </html>
  );
}