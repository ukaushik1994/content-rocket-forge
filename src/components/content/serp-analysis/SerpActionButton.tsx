
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
  disabled?: boolean;
  actionType?: 'add' | 'view' | 'export' | 'default';
}

export function SerpActionButton({ 
  onClick, 
  children, 
  className = '',
  variant = 'default',
  icon = <PlusCircle className="h-4 w-4 mr-2" />,
  disabled = false,
  actionType = 'default'
}: SerpActionButtonProps) {
  // Define color schemes for different action types
  const actionColors = {
    add: {
      bg: 'bg-gradient-to-r from-green-600/40 to-emerald-800/30',
      border: 'border-green-500/30',
      hover: 'hover:border-green-400/50',
      glow: 'group-hover:shadow-[0_0_15px_rgba(52,211,153,0.2)]'
    },
    view: {
      bg: 'bg-gradient-to-r from-blue-600/40 to-indigo-800/30',
      border: 'border-blue-500/30',
      hover: 'hover:border-blue-400/50',
      glow: 'group-hover:shadow-[0_0_15px_rgba(96,165,250,0.2)]'
    },
    export: {
      bg: 'bg-gradient-to-r from-purple-600/40 to-violet-800/30',
      border: 'border-purple-500/30',
      hover: 'hover:border-purple-400/50',
      glow: 'group-hover:shadow-[0_0_15px_rgba(167,139,250,0.2)]'
    },
    default: {
      bg: 'bg-gradient-to-r from-primary/20 to-purple-500/20',
      border: 'border-white/10',
      hover: 'hover:border-white/20',
      glow: ''
    }
  };

  const colors = actionColors[actionType];

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
        className={`group w-full relative overflow-hidden transition-all duration-300 
          ${colors.bg} ${colors.border} ${colors.hover} ${colors.glow} ${className}`}
      >
        <div className="absolute inset-0 bg-grid-white/5 opacity-0 group-hover:opacity-20"></div>
        <div className="relative z-10 flex items-center justify-center w-full">
          {icon}
          <span>{children}</span>
        </div>
      </Button>
    </motion.div>
  );
}
