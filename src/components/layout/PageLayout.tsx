import React from 'react';
import Navbar from './Navbar';
import { cn } from '@/lib/utils';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  showNavbar?: boolean;
  containerized?: boolean;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  className = '',
  showNavbar = true,
  containerized = true
}) => {
  return (
    <div className="min-h-screen flex flex-col">
      {showNavbar && <Navbar />}
      <main className={cn(
        'flex-1',
        showNavbar && 'pt-20', // 80px = navbar (64px) + breathing room (16px)
        containerized && 'container mx-auto px-4 py-8',
        className
      )}>
        {children}
      </main>
    </div>
  );
};
