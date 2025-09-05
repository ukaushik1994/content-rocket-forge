
import React from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div 
      className={cn("container mx-auto px-6 lg:px-8 max-w-7xl", className)}
      {...props}
    >
      {children}
    </div>
  );
};
