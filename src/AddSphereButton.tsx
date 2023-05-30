// AddSphereButton.tsx
import React, { MouseEvent } from 'react';

interface AddSphereButtonProps {
  addSphere: (() => void) | null;
}

function AddSphereButton({ addSphere }: AddSphereButtonProps) {
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (addSphere) {
      addSphere();
    }
  };

  return (
    <button onClick={handleClick} disabled={!addSphere}>
      Add Sphere
    </button>
  );
};

export default AddSphereButton;
