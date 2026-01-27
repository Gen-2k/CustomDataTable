import { useState, useLayoutEffect } from "react";

/**
 * usePortalPosition - A high-precision positioning hook for overlays.
 * 
 * Since editors often render into a "Portal" (document.body), they lose 
 * their relative CSS positioning. This hook tracks the actual screen coordinates 
 * of the table cell so the editor can "dock" exactly over it.
 * 
 * @param {React.MutableRefObject} containerRef - Ref of the source element.
 * @param {boolean} includeHeight - If true, offsets the top by the element's height (Dropdown style).
 * @returns {Object|null} - { top, left, width, height } coordinates.
 */
export const usePortalPosition = (containerRef, includeHeight = false) => {
  const [coords, setCoords] = useState(null);

  /**
   * useLayoutEffect is essential here to prevent "flickering" 
   * during the jump from static view to portal view.
   */
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

    // Re-calculate on screen changes to keep the editor "glued" to the row
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [containerRef, includeHeight]);

  return coords;
};
