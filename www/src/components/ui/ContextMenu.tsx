import React, { ReactNode, useEffect, useState } from "react";

// ContextMenu Component
export const ContextMenu: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

  // Abre el menú contextual en la posición del click
  const openContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setPosition({ x: e.pageX, y: e.pageY });
  };

  // Cierra el menú al hacer clic fuera
  const closeContextMenu = () => setPosition(null);

  // Cerrar menú al hacer clic en cualquier lugar de la página
  useEffect(() => {
    document.addEventListener("click", closeContextMenu);
    return () => document.removeEventListener("click", closeContextMenu);
  }, []);

  // Filtrar los elementos `ContextMenuItem` y el contenido principal
  const contextMenuItems = React.Children.toArray(children).filter(
    (child) => React.isValidElement(child) && child.type === ContextMenuItem
  );

  const mainContent = React.Children.toArray(children).filter(
    (child) => !React.isValidElement(child) || child.type !== ContextMenuItem
  );

  return (
    <div onContextMenu={openContextMenu}>
      {mainContent}
      {position && <ContextMenuContent position={position}>{contextMenuItems}</ContextMenuContent>}
    </div>
  );
};

// ContextMenuContent Component
interface ContextMenuContentProps {
  position: { x: number; y: number };
  children: ReactNode;
}

export const ContextMenuContent: React.FC<ContextMenuContentProps> = ({ position, children }) => (
  <div
    style={{
      position: "absolute",
      top: position.y,
      left: position.x,
      background: "white",
      boxShadow: "0px 4px 8px rgba(0,0,0,0.2)",
      padding: "10px",
      borderRadius: "4px",
      zIndex: 1000,
    }}
    role="menu"
  >
    {React.Children.map(children, (child) =>
      React.isValidElement(child) && child.type === ContextMenuItem ? child : null
    )}
  </div>
);

// ContextMenuItem Component
export const ContextMenuItem: React.FC<{ children: ReactNode; onClick: () => void }> = ({ children, onClick }) => {
  return (
    <div onClick={onClick} style={{ padding: "5px 10px", cursor: "pointer" }}>
      {children}
    </div>
  );
};

export const ContextMenuTrigger: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};
