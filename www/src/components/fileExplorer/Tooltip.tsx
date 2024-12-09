"use client";

import React, { createContext, useState, useContext, useRef, useEffect } from "react";

const TooltipContext = createContext<{
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  content: React.ReactNode;
  setContent: React.Dispatch<React.SetStateAction<React.ReactNode>>;
} | null>(null);

export const TooltipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState<React.ReactNode>(null);

  return <TooltipContext.Provider value={{ open, setOpen, content, setContent }}>{children}</TooltipContext.Provider>;
};

const useTooltip = () => {
  const context = useContext(TooltipContext);
  if (!context) {
    throw new Error("useTooltip must be used within a TooltipProvider");
  }
  return context;
};

export const Tooltip: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="relative inline-block">{children}</div>;
};

interface TooltipTriggerProps {
  children: React.ReactElement;
  asChild?: boolean;
}

export const TooltipTrigger: React.FC<TooltipTriggerProps> = ({ children, asChild }) => {
  const { setOpen } = useTooltip();

  const handleMouseEnter = () => setOpen(true);
  const handleMouseLeave = () => setOpen(false);
  const handleFocus = () => setOpen(true);
  const handleBlur = () => setOpen(false);

  if (asChild) {
    return React.cloneElement(children, {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onFocus: handleFocus,
      onBlur: handleBlur,
    });
  }

  return (
    <span onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onFocus={handleFocus} onBlur={handleBlur}>
      {children}
    </span>
  );
};

export const TooltipContent: React.FC<{
  children: React.ReactNode;
  sideOffset?: number;
}> = ({ children, sideOffset = 5 }) => {
  const { open, setOpen, content, setContent } = useTooltip();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setContent(children);
  }, [children, setContent]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setOpen]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className="absolute z-50 px-3 py-1.5 text-sm bg-popover text-popover-foreground rounded-md shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
      style={{
        bottom: `calc(100% + ${sideOffset}px)`,
        left: "50%",
        transform: "translateX(-50%)",
      }}
    >
      {content}
      <div className="absolute w-2 h-2 bg-popover rotate-45 -bottom-1 left-1/2 -translate-x-1/2"></div>
    </div>
  );
};

export const TooltipComponent: React.FC<{
  content: React.ReactNode;
  children: React.ReactElement;
  asChild?: boolean;
}> = ({ content, children, asChild }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild={asChild}>{children}</TooltipTrigger>
        <TooltipContent>{content}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
