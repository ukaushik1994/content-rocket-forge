
import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface SerpActionButtonProps extends ButtonProps {
  icon?: React.ReactNode;
  label: string;
  gradient?: boolean;
}

export function SerpActionButton({ 
  icon, 
  label, 
  gradient = false,
  className,
  ...props 
}: SerpActionButtonProps) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Button
        className={`
          ${gradient ? 'bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple' : ''} 
          transition-all duration-300
          ${className}
        `}
        {...props}
      >
        {icon && <span className="mr-2">{icon}</span>}
        {label}
      </Button>
    </motion.div>
  );
}
