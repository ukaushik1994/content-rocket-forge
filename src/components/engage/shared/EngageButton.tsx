import React from 'react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EngageButtonProps extends ButtonProps {
  gradient?: boolean;
}

export const EngageButton = React.forwardRef<HTMLButtonElement, EngageButtonProps>(
  ({ className, gradient = true, children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn(
          gradient && 'bg-foreground text-background hover:bg-foreground/90',
          className
        )}
        {...props}
      >
        {children}
      </Button>
    );
  }
);
EngageButton.displayName = 'EngageButton';
