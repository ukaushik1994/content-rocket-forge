import React from 'react';
import { cn } from '@/lib/utils';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  containerized?: boolean;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  className = '',
  containerized = true
}) => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className={cn(
        'flex-1',
        containerized && 'container mx-auto px-4 py-8',
        className
      )}>
        {children}
      </main>
    </div>
  );
};
