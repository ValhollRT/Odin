import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: "primary" |"destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "sm" | "md" | "lg" | "square" | "icon";
  icon?: React.ReactNode;
  iconPosition?: "left" | "right" | "top"; // Nueva prop para controlar posición del ícono
  children?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { 
      className, 
      variant = "primary", 
      size = "md", 
      asChild = false, 
      icon, 
      iconPosition = "left", // Valor por defecto
      children, 
      ...props 
    }, 
    ref
  ) => {
    const iconMarkup = icon && (
      <span
        className={`icon ${iconPosition === "top" ? "icon-top" : "icon-side"}`}
        style={{
          marginRight: iconPosition === "left" ? "0.5rem" : undefined,
          marginLeft: iconPosition === "right" ? "0.5rem" : undefined,
          marginBottom: iconPosition === "top" ? "0.5rem" : undefined,
        }}
      >
        {icon}
      </span>
    );

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        className: [
          "button",
          variant,
          size,
          iconPosition === "top" && "vertical-layout", // Clase especial para disposición vertical
          children.props.className || "",
        ]
          .filter(Boolean)
          .join(" "),
        ...props,
      });
    }

    return (
      <button
        className={["button", variant, size, iconPosition === "top" && "vertical-layout", className || ""]
          .filter(Boolean)
          .join(" ")}
        ref={ref}
        {...props}
      >
        {iconPosition === "left" || iconPosition === "top" ? iconMarkup : null}
        {children}
        {iconPosition === "right" ? iconMarkup : null}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
