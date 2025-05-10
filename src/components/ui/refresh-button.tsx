
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RefreshButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isRefreshing?: boolean;
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

export const RefreshButton: React.FC<RefreshButtonProps> = ({ 
  isRefreshing = false,
  size = 'sm',
  variant = 'outline',
  className,
  onClick,
  children,
  ...props
}) => {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={isRefreshing}
      className={cn("gap-1.5", className)}
      {...props}
    >
      <RefreshCw className={cn(
        "h-3.5 w-3.5", 
        isRefreshing && "animate-spin"
      )} />
      {children || "Refresh"}
    </Button>
  );
};
