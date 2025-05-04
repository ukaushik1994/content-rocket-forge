
import React from 'react';
import { cn } from "@/lib/utils";
import { motion } from 'framer-motion';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  animated?: boolean;
  icon?: React.ReactNode;
  onClick?: () => void;
}

export function CustomBadge({ 
  children, 
  className, 
  animated = false, 
  icon,
  onClick
}: BadgeProps) {
  const BadgeComponent = animated ? motion.span : "span";
  const animationProps = animated ? {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    whileHover: { scale: 1.05 },
    transition: { duration: 0.2 }
  } : {};
  
  return (
    <BadgeComponent
      {...animationProps}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        onClick && "cursor-pointer hover:bg-white/10",
        className
      )}
      onClick={onClick}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </BadgeComponent>
  );
}
