import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  isValidElement,
} from "react";

// ContextMenu Components
export const ContextMenu: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <div className="context-menu">{children}</div>;
};

interface ContextMenuTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  onContextMenu?: (e: React.MouseEvent) => void; // Explicitly type onContextMenu
}

export const ContextMenuTrigger = forwardRef<
  HTMLDivElement,
  ContextMenuTriggerProps
>(({ children, asChild, ...props }, ref) => {
  const Comp =
    asChild && isValidElement(children) && typeof children.type === "function"
      ? children.type
      : "div";

  return React.createElement(
    Comp,
    {
      ref,
      ...props,
      onContextMenu: (e: React.MouseEvent) => {
        e.preventDefault();
        props.onContextMenu?.(e);
      },
    },
    asChild ? null : children
  );
});

ContextMenuTrigger.displayName = "ContextMenuTrigger";

export const ContextMenuContent: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();
      setPosition({ x: event.clientX, y: event.clientY });
      setIsOpen(true);
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div
      ref={ref}
      className="context-menu-content"
      style={{ top: position.y, left: position.x }}
    >
      <div
        className="context-menu-items"
        role="menu"
        aria-orientation="vertical"
        aria-labelledby="options-menu"
      >
        {children}
      </div>
    </div>
  );
};

export const ContextMenuItem: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ children, ...props }) => {
  return (
    <button
      type="button"
      className="context-menu-item"
      role="menuitem"
      {...props}
    >
      {children}
    </button>
  );
};
