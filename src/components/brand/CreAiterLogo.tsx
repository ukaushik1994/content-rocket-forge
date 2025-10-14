import React from 'react';

interface CreAiterLogoProps {
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
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
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-3xl'
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        {/* Multi-color glow effect */}
        <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-[#9b87f5]/20 via-[#FFA3E8]/20 via-[#D946EF]/20 via-[#F97316]/20 to-[#33C3F0]/20 opacity-50 blur-lg absolute`}></div>
        <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-sm flex items-center justify-center border border-white/10 relative`}>
          <svg
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Main C shape with full spectrum gradient */}
            <path
              d="M16.5 6.5C14.8 4.8 12.5 4 10 4C7.5 4 5.2 4.8 3.5 6.5C1.8 8.2 1 10.5 1 13C1 15.5 1.8 17.8 3.5 19.5C5.2 21.2 7.5 22 10 22C12.5 22 14.8 21.2 16.5 19.5"
              stroke="url(#spectrumGradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            
            {/* AI energy particles - flowing from C opening */}
            <circle cx="18.5" cy="8" r="1.5" fill="url(#particle1)" opacity="0.9" />
            <circle cx="20.5" cy="10.5" r="1.2" fill="url(#particle2)" opacity="0.85" />
            <circle cx="21.5" cy="13" r="1.4" fill="url(#particle3)" opacity="0.9" />
            <circle cx="20" cy="15.5" r="1.1" fill="url(#particle4)" opacity="0.8" />
            <circle cx="18.5" cy="17.5" r="1.3" fill="url(#particle5)" opacity="0.85" />
            
            {/* Neural network inner accents */}
            <path
              d="M14 8.5C12.8 7.3 11.2 6.5 9.5 6.5C7.8 6.5 6.2 7.3 5 8.5"
              stroke="url(#neuralGradient1)"
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.5"
            />
            <path
              d="M13.5 17C12.5 18 11.2 18.5 9.5 18.5C8 18.5 6.5 18 5.5 17"
              stroke="url(#neuralGradient2)"
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.5"
            />
            
            {/* Gradient definitions */}
            <defs>
              {/* Main spectrum gradient for C */}
              <linearGradient id="spectrumGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#9b87f5" />
                <stop offset="20%" stopColor="#FFA3E8" />
                <stop offset="40%" stopColor="#D946EF" />
                <stop offset="60%" stopColor="#F97316" />
                <stop offset="80%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#33C3F0" />
              </linearGradient>
              
              {/* Individual particle gradients */}
              <linearGradient id="particle1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFA3E8" />
                <stop offset="100%" stopColor="#D946EF" />
              </linearGradient>
              <linearGradient id="particle2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F97316" />
                <stop offset="100%" stopColor="#F59E0B" />
              </linearGradient>
              <linearGradient id="particle3" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#33C3F0" />
              </linearGradient>
              <linearGradient id="particle4" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#9b87f5" />
                <stop offset="100%" stopColor="#FFA3E8" />
              </linearGradient>
              <linearGradient id="particle5" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#15803D" />
                <stop offset="100%" stopColor="#33C3F0" />
              </linearGradient>
              
              {/* Neural network gradients */}
              <linearGradient id="neuralGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#9b87f5" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
              <linearGradient id="neuralGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F97316" />
                <stop offset="100%" stopColor="#D946EF" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
      {showText && (
        <span className={`font-bold bg-gradient-to-r from-[#9b87f5] via-[#FFA3E8] via-[#D946EF] via-[#F97316] via-[#3B82F6] to-[#33C3F0] bg-clip-text text-transparent ${textSizeClasses[size]}`}>
          CreAiter
        </span>
      )}
    </div>
  );
};