import { useState, useLayoutEffect } from "react";

export const usePortalPosition = (containerRef, includeHeight = false) => {
  const [coords, setCoords] = useState(null);

  useLayoutEffect(() => {
    const updatePosition = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const baseTop = rect.top + window.scrollY;

      setCoords({
        top: includeHeight ? baseTop + rect.height : baseTop,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
      });
    };

    updatePosition();

    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [containerRef, includeHeight]);

  return coords;
};
