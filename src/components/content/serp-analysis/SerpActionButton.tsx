
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

interface SerpActionButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost';
  icon?: React.ReactNode;
  disabled?: boolean; // Added disabled prop
}

export function SerpActionButton({ 
  onClick, 
  children, 
  className = '',
  variant = 'default',
  icon = <PlusCircle className="h-4 w-4 mr-2" />,
  disabled = false // Added default value
}: SerpActionButtonProps) {
  return (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.03 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      className={`w-full ${disabled ? 'cursor-not-allowed' : ''}`}
    >
      <Button 
        variant={variant} 
        onClick={onClick} 
        disabled={disabled}
        className={`group w-full relative overflow-hidden ${className}`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute inset-0 bg-grid-white/5 opacity-0 group-hover:opacity-20"></div>
        <div className="relative z-10 flex items-center justify-center w-full">
          {icon}
          <span>{children}</span>
        </div>
      </Button>
    </motion.div>
  );
}
