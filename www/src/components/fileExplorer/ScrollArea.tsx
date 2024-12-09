import * as React from "react";

const ScrollArea = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { orientation?: "vertical" | "horizontal" }
>(({ className, children, orientation = "vertical", ...props }, ref) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [hasScroll, setHasScroll] = React.useState(false);
  const [scrollPos, setScrollPos] = React.useState(0);

  React.useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;

    if (!container || !content) return;

    const observer = new ResizeObserver(() => {
      const containerSize = orientation === "vertical" ? container.clientHeight : container.clientWidth;
      const contentSize = orientation === "vertical" ? content.scrollHeight : content.scrollWidth;
      setHasScroll(contentSize > containerSize);
    });

    observer.observe(container);
    observer.observe(content);

    return () => observer.disconnect();
  }, [orientation]);

  const handleScroll = React.useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const scrollSize =
      orientation === "vertical"
        ? container.scrollHeight - container.clientHeight
        : container.scrollWidth - container.clientWidth;
    const scrollPos = orientation === "vertical" ? container.scrollTop : container.scrollLeft;
    setScrollPos(scrollPos / scrollSize);
  }, [orientation]);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <div ref={ref} className={`relative ${className || ""}`} {...props}>
      <div ref={containerRef} className={`h-full w-full overflow-auto ${orientation === "horizontal" ? "flex" : ""}`}>
        <div ref={contentRef}>{children}</div>
      </div>
      {hasScroll && (
        <div
          className={`pointer-events-none absolute ${
            orientation === "vertical" ? "right-0.5 top-0 h-full w-2" : "bottom-0.5 left-0 h-2 w-full"
          }`}
        >
          <div
            className={`rounded-full bg-gray-300 opacity-0 transition-opacity duration-100 ease-in-out hover:opacity-100 ${
              orientation === "vertical" ? "h-[8%] w-full" : "h-full w-[8%]"
            }`}
            style={{
              transform:
                orientation === "vertical" ? `translateY(${scrollPos * 92}%)` : `translateX(${scrollPos * 92}%)`,
            }}
          />
        </div>
      )}
    </div>
  );
});
ScrollArea.displayName = "ScrollArea";

export { ScrollArea };
