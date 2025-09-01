import React from 'react';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GradientCardProps extends React.HTMLAttributes<HTMLDivElement> {
  gradient?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  glass?: boolean;
  hover?: boolean;
  glow?: boolean;
  children: React.ReactNode;
}

const gradientClasses = {
  primary: 'from-primary/15 via-blue-500/10 to-purple-500/15',
  secondary: 'from-secondary/15 via-muted/10 to-accent/15',
  success: 'from-green-500/15 via-emerald-500/10 to-teal-500/15',
  warning: 'from-yellow-500/15 via-orange-500/10 to-red-500/15',
  danger: 'from-red-500/15 via-pink-500/10 to-rose-500/15',
  info: 'from-blue-500/15 via-cyan-500/10 to-indigo-500/15'
};

const glowClasses = {
  primary: 'shadow-[0_0_30px_rgba(155,135,245,0.3)]',
  secondary: 'shadow-[0_0_30px_rgba(100,100,100,0.2)]',
  success: 'shadow-[0_0_30px_rgba(34,197,94,0.3)]',
  warning: 'shadow-[0_0_30px_rgba(245,158,11,0.3)]',
  danger: 'shadow-[0_0_30px_rgba(239,68,68,0.3)]',
  info: 'shadow-[0_0_30px_rgba(59,130,246,0.3)]'
};

export const GradientCard: React.FC<GradientCardProps> = ({
  className,
  children,
  gradient = 'primary',
  glass = true,
  hover = true,
  glow = false,
  ...props
}) => {
  return (
    <motion.div
      whileHover={hover ? { 
        y: -8, 
        scale: 1.02,
        transition: { duration: 0.2, ease: "easeOut" }
      } : {}}
      className="group"
    >
      <Card
        className={cn(
          'relative overflow-hidden border border-white/20 shadow-xl transition-all duration-500',
          glass && 'glass-card',
          hover && 'group-hover:shadow-2xl group-hover:border-white/30',
          glow && `group-hover:${glowClasses[gradient]}`,
          className
        )}
        {...props}
      >
        {/* Background Gradient */}
        <div className={cn(
          'absolute inset-0 bg-gradient-to-br opacity-80',
          gradientClasses[gradient]
        )} />
        
        {/* Animated Gradient Overlay */}
        <div className={cn(
          'absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-20 transition-opacity duration-500',
          gradientClasses[gradient]
        )} />
        
        {/* Subtle Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="w-full h-full futuristic-grid" />
        </div>
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
        
        {/* Corner Accent */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-radial from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </Card>
    </motion.div>
  );
};