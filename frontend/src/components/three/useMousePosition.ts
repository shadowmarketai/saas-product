import { useEffect, useRef } from 'react';

interface MousePos {
  x: number;
  y: number;
}

/**
 * Tracks normalized mouse position (-1 to 1) via a ref to avoid re-renders.
 * Read from useFrame in R3F components.
 */
export function useMousePosition() {
  const mouse = useRef<MousePos>({ x: 0, y: 0 });

  useEffect(() => {
    function onMove(e: PointerEvent) {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    }
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  return mouse;
}
