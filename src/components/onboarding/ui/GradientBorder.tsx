import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GradientBorderProps {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
}

export const GradientBorder: React.FC<GradientBorderProps> = ({
  children,
  className,
  animate = true,
}) => {
  return (
    <div className={cn("relative", className)}>
      {/* Animated gradient border */}
      <motion.div
        className="absolute -inset-[1px] rounded-3xl bg-gradient-to-r from-neon-purple via-neon-blue to-pink-500 opacity-60"
        animate={animate ? {
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        } : {}}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          backgroundSize: '200% 200%',
        }}
      />
      
      {/* Outer glow */}
      <motion.div
        className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-neon-purple/30 via-neon-blue/30 to-pink-500/30 blur-xl"
        animate={animate ? {
          opacity: [0.3, 0.6, 0.3],
        } : {}}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Inner content container - glassmorphic */}
      <div className="relative rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-white/[0.08]">
        {children}
      </div>
    </div>
  );
};
