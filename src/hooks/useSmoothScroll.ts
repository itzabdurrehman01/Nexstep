import { useEffect } from 'react';

export function useSmoothScroll() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('marketing-scroll');
    return () => root.classList.remove('marketing-scroll');
  }, []);
}
