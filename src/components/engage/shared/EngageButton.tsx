import React from 'react';
import { motion } from 'framer-motion';
import { Button, type ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EngageButtonProps extends ButtonProps {
  gradient?: boolean;
}

export const EngageButton = React.forwardRef<HTMLButtonElement, EngageButtonProps>(
  ({ className, gradient = true, children, ...props }, ref) => {
    return (
      <motion.div
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        className="inline-flex"
      >
        <Button
          ref={ref}
          className={cn(
            gradient && 'bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg hover:shadow-primary/25 transition-shadow',
            className
          )}
          {...props}
        >
          {children}
        </Button>
      </motion.div>
    );
  }
);
EngageButton.displayName = 'EngageButton';
