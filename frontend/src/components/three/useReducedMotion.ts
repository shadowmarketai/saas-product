import { useEffect, useState } from 'react';

/**
 * Returns true when 3D should be disabled:
 * - User prefers reduced motion
 * - Viewport < 768px (mobile)
 */
export function useReducedMotion(): boolean {
  const [simplified, setSimplified] = useState(() => {
    if (typeof window === 'undefined') return true;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768;
    return prefersReduced || isMobile;
  });

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');

    function check() {
      setSimplified(mql.matches || window.innerWidth < 768);
    }

    mql.addEventListener('change', check);
    window.addEventListener('resize', check);
    return () => {
      mql.removeEventListener('change', check);
      window.removeEventListener('resize', check);
    };
  }, []);

  return simplified;
}
