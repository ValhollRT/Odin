import { Slot } from "@radix-ui/react-slot";
import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "square";
  size?: "default" | "sm" | "lg" | "icon";
  icon?: React.ReactNode;
}

// Button.tsx
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, icon, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    const baseStyles = "button";
    const iconStyles = size === "icon" ? "w-8 h-8" : "";

    return (
      <Comp className={`${baseStyles} ${variant} ${size} ${iconStyles} ${className || ""}`} ref={ref} {...props}>
        {icon && <span className="mr-2">{icon}</span>} {/* Renderizar el icono si se proporciona */}
        {children}
      </Comp>
    );
  }
);

Button.displayName = "Button";

export { Button };
