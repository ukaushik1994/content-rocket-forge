import { useState, useEffect } from 'react';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

const BREAKPOINTS = {
  mobile: 640,    // < 640px
  tablet: 1024,   // 640px - 1023px
  desktop: 1024   // >= 1024px
};

export function useResponsiveBreakpoint(): {
  breakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
} {
  const [state, setState] = useState<{
    breakpoint: Breakpoint;
    width: number;
  }>({
    breakpoint: 'desktop',
    width: typeof window !== 'undefined' ? window.innerWidth : 1200
  });

  useEffect(() => {
    const getBreakpoint = (width: number): Breakpoint => {
      if (width < BREAKPOINTS.mobile) return 'mobile';
      if (width < BREAKPOINTS.tablet) return 'tablet';
      return 'desktop';
    };

    const handleResize = () => {
      const width = window.innerWidth;
      setState({
        breakpoint: getBreakpoint(width),
        width
      });
    };

    // Set initial value
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    breakpoint: state.breakpoint,
    isMobile: state.breakpoint === 'mobile',
    isTablet: state.breakpoint === 'tablet',
    isDesktop: state.breakpoint === 'desktop',
    width: state.width
  };
}
