import React, { useEffect, useMemo, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AuroraBackdropProps {
  className?: string;
  intensity?: number; // overall parallax intensity in px
}

// Helper: respect reduced motion
function usePrefersReducedMotion(): boolean {
  const [prefers, setPrefers] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !('matchMedia' in window)) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefers(mq.matches);
    const onChange = () => setPrefers(mq.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);
  return prefers;
}

export const AuroraBackdrop: React.FC<AuroraBackdropProps> = ({ className, intensity = 38 }) => {
  const prefersReduced = usePrefersReducedMotion();

  // Motion values for mouse-based parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 80, damping: 20, mass: 0.6 });
  const springY = useSpring(mouseY, { stiffness: 80, damping: 20, mass: 0.6 });

  // Depth factors for each blob
  const depths = useMemo(() => [1, 0.7, 1.25], []);
  const xTransforms = depths.map((d) => useTransform(springX, (v) => v * intensity * d));
  const yTransforms = depths.map((d) => useTransform(springY, (v) => v * intensity * d));

  // Attach global mouse listener (window) for parallax
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (prefersReduced) return;
    let raf = 0;
    const handle = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const vw = window.innerWidth || 1;
        const vh = window.innerHeight || 1;
        // Normalize to [-1, 1] with origin at center
        const nx = (e.clientX / vw) * 2 - 1;
        const ny = (e.clientY / vh) * 2 - 1;
        mouseX.set(nx);
        mouseY.set(ny);
      });
    };
    window.addEventListener('mousemove', handle, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', handle as any);
    };
  }, [mouseX, mouseY, prefersReduced]);

  // Theme-aware radial gradient helpers (no hardcoded colors)
  const radial = (token: string, alpha = 0.16) => ({
    background: `radial-gradient( circle at center, hsl(var(--${token}) / ${alpha}) 0%, transparent 65%)`
  } as React.CSSProperties);

  // If reduced motion, render static gradients only
  if (prefersReduced) {
    return (
      <div className={cn('pointer-events-none overflow-hidden', className)} aria-hidden>
        <div className="absolute top-24 left-[20%] w-[28rem] h-[28rem] blur-3xl opacity-40 rounded-full"
             style={radial('primary', 0.18)} />
        <div className="absolute bottom-16 right-[20%] w-[30rem] h-[30rem] blur-3xl opacity-30 rounded-full"
             style={radial('accent', 0.16)} />
        <div className="absolute top-[33%] right-[33%] w-[22rem] h-[22rem] blur-3xl opacity-25 rounded-full"
             style={radial('secondary', 0.14)} />
      </div>
    );
  }

  return (
    <div className={cn('pointer-events-none overflow-hidden', className)} aria-hidden>
      {/* Subtle noise/veil to blend with theme */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/20 to-background/30" />

      {/* Primary blob (top-left) */}
      <motion.div
        className="absolute -top-24 left-[18%] w-[32rem] h-[32rem] rounded-full blur-3xl opacity-45 will-change-transform"
        style={{ x: xTransforms[0], y: yTransforms[0], ...radial('primary', 0.20) }}
        animate={{ rotate: [0, 6, -4, 0], opacity: [0.35, 0.45, 0.4, 0.45] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Accent blob (bottom-right) */}
      <motion.div
        className="absolute -bottom-24 right-[14%] w-[34rem] h-[34rem] rounded-full blur-3xl opacity-35 will-change-transform"
        style={{ x: xTransforms[1], y: yTransforms[1], ...radial('accent', 0.18) }}
        animate={{ rotate: [0, -8, 5, 0], opacity: [0.28, 0.36, 0.32, 0.35] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Secondary blob (center-right) */}
      <motion.div
        className="absolute top-[35%] right-[32%] w-[26rem] h-[26rem] rounded-full blur-3xl opacity-30 will-change-transform"
        style={{ x: xTransforms[2], y: yTransforms[2], ...radial('secondary', 0.16) }}
        animate={{ rotate: [0, 10, -6, 0], opacity: [0.24, 0.32, 0.28, 0.3] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Soft vignette to keep content readable */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_60%,hsl(var(--background))_100%)]" />
    </div>
  );
};

export default AuroraBackdrop;
