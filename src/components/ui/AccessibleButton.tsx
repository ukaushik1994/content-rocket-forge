import React, { forwardRef } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAccessibility } from '@/hooks/useAccessibility';

interface AccessibleButtonProps extends ButtonProps {
  ariaLabel?: string;
  ariaDescription?: string;
  announceOnClick?: boolean;
  keyboardShortcut?: string;
}

/**
 * Enhanced button component with comprehensive accessibility features
 */
export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({ 
    ariaLabel,
    ariaDescription,
    announceOnClick = false,
    keyboardShortcut,
    children,
    className,
    onClick,
    onKeyDown,
    ...props 
  }, ref) => {
    const { announce, handleKeyboardNavigation } = useAccessibility();

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (announceOnClick && ariaLabel) {
        announce(`${ariaLabel} activated`);
      }
      onClick?.(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      // Handle keyboard shortcuts
      if (keyboardShortcut && e.key === keyboardShortcut && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleClick(e as any);
        return;
      }

      handleKeyboardNavigation(e.nativeEvent, {
        onEnter: () => handleClick(e as any),
        onSpace: () => handleClick(e as any)
      });

      onKeyDown?.(e);
    };

    return (
      <Button
        ref={ref}
        className={cn(
          // Enhanced focus styles for accessibility
          'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary',
          'focus-visible:outline-none transition-all duration-200',
          // High contrast mode support
          'contrast-more:border-2 contrast-more:border-current',
          className
        )}
        aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
        aria-describedby={ariaDescription ? `${props.id}-desc` : undefined}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {children}
        
        {/* Screen reader description */}
        {ariaDescription && (
          <span id={`${props.id}-desc`} className="sr-only">
            {ariaDescription}
          </span>
        )}
        
        {/* Keyboard shortcut indicator */}
        {keyboardShortcut && (
          <span className="sr-only">
            Press {keyboardShortcut} to activate
          </span>
        )}
      </Button>
    );
  }
);

AccessibleButton.displayName = 'AccessibleButton';