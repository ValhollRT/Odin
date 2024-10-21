import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  isValidElement,
} from "react";
import { Button as OButton } from "./Button";

// DropdownMenu Components
export const DropdownMenu: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <div className="dropdown-menu">{children}</div>;
};

interface DropdownMenuTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: "default" | "outline" | "ghost";
}

export const DropdownMenuTrigger = forwardRef<
  HTMLButtonElement,
  DropdownMenuTriggerProps
>(({ children, asChild, variant = "default", className, ...props }, ref) => {
  const Comp =
    asChild && isValidElement(children) && typeof children.type === "function"
      ? children.type
      : OButton;

  return React.createElement(
    Comp,
    {
      ref,
      variant,
      className: `${className || ""} ${asChild ? "" : "w-full"}`,
      ...props,
    },
    asChild ? null : children
  );
});

export const DropdownMenuContent: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={ref} className="dropdown-menu-content">
      <div
        className="dropdown-menu-items"
        role="menu"
        aria-orientation="vertical"
        aria-labelledby="options-menu"
      >
        {children}
      </div>
    </div>
  );
};

export const DropdownMenuItem: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ children, ...props }) => {
  return (
    <button
      type="button"
      className="dropdown-menu-item"
      role="menuitem"
      {...props}
    >
      {children}
    </button>
  );
};
