import React from 'react';

interface CreAiterLogoProps {
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CreAiterLogo = ({ 
  showText = true, 
  size = 'md',
  className = ''
}: CreAiterLogoProps) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-7 w-7', 
    lg: 'h-8 w-8'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-primary/20 to-blue-500/20 opacity-40 blur-md absolute`}></div>
        <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-primary/10 to-blue-500/10 backdrop-blur-sm flex items-center justify-center border border-primary/30 relative`}>
          <svg
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Main C shape with gradient */}
            <path
              d="M16.5 6.5C14.8 4.8 12.5 4 10 4C7.5 4 5.2 4.8 3.5 6.5C1.8 8.2 1 10.5 1 13C1 15.5 1.8 17.8 3.5 19.5C5.2 21.2 7.5 22 10 22C12.5 22 14.8 21.2 16.5 19.5"
              stroke="url(#logoGradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            
            {/* Decorative dots */}
            <circle cx="19" cy="7" r="1.5" fill="url(#dotGradient)" />
            <circle cx="21" cy="11" r="1" fill="url(#dotGradient)" opacity="0.7" />
            <circle cx="20" cy="15" r="1.2" fill="url(#dotGradient)" opacity="0.8" />
            
            {/* Inner accent curve */}
            <path
              d="M14 8.5C12.8 7.3 11.2 6.5 9.5 6.5C7.8 6.5 6.2 7.3 5 8.5"
              stroke="url(#accentGradient)"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.6"
            />
            
            {/* Gradient definitions */}
            <defs>
              <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="50%" stopColor="hsl(217, 91%, 60%)" />
                <stop offset="100%" stopColor="hsl(var(--primary))" />
              </linearGradient>
              <linearGradient id="dotGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(217, 91%, 70%)" />
                <stop offset="100%" stopColor="hsl(var(--primary))" />
              </linearGradient>
              <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(217, 91%, 65%)" />
                <stop offset="100%" stopColor="hsl(var(--primary))" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
      {showText && (
        <span className={`font-bold bg-gradient-to-r from-primary via-blue-500 to-primary bg-clip-text text-transparent ${textSizeClasses[size]}`}>
          CreAiter
        </span>
      )}
    </div>
  );
};