// AddSphereButton.tsx
import React, { type ReactElement, type MouseEvent } from 'react';

interface AddSphereButtonProps {
  addSphere: (() => void) | null;
}

function AddSphereButton({ addSphere }: AddSphereButtonProps): ReactElement {
  const handleClick = (event: MouseEvent<HTMLButtonElement>): void => {
    if (addSphere != null) {
      addSphere();
    }
  };

  return (
    <button onClick={handleClick} disabled={addSphere == null}>
      Add Sphere
    </button>
  );
}

export default AddSphereButton;
