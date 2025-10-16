import { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = 768;

export function useIsMobile(breakpoint = MOBILE_BREAKPOINT) {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };
    
    // Set initial value
    setIsMobile(window.innerWidth < breakpoint);
    
    // Listen for changes
    mql.addEventListener('change', onChange);
    
    return () => mql.removeEventListener('change', onChange);
  }, [breakpoint]);

  return isMobile;
}