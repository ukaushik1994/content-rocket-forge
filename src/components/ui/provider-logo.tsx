import React from 'react';
import { cn } from '@/lib/utils';
import openaiLogo from '@/assets/providers/openai.svg';
import anthropicLogo from '@/assets/providers/anthropic.svg';
import geminiLogo from '@/assets/providers/gemini.webp';
import lmstudioLogo from '@/assets/providers/lmstudio.png';

type Provider = 'openai' | 'anthropic' | 'gemini' | 'lmstudio' | 'mistral' | 'openrouter';
type Size = 'sm' | 'md' | 'lg' | 'xl';

interface ProviderLogoProps {
  provider: Provider;
  size?: Size;
  className?: string;
  showFallback?: boolean;
}

const logoMap: Record<Provider, string | null> = {
  openai: openaiLogo,
  anthropic: anthropicLogo,
  gemini: geminiLogo,
  lmstudio: lmstudioLogo,
  mistral: null,
  openrouter: null,
};

const sizeMap: Record<Size, string> = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-10 w-10',
  xl: 'h-12 w-12',
};

const fallbackInitials: Record<Provider, string> = {
  openai: 'O',
  anthropic: 'A',
  gemini: 'G',
  lmstudio: 'L',
  mistral: 'M',
  openrouter: 'O',
};

export const ProviderLogo: React.FC<ProviderLogoProps> = ({
  provider,
  size = 'md',
  className,
  showFallback = true,
}) => {
  const logoSrc = logoMap[provider];
  const sizeClass = sizeMap[size];

  if (logoSrc) {
    return (
      <img
        src={logoSrc}
        alt={`${provider} logo`}
        className={cn(sizeClass, 'object-contain', className)}
      />
    );
  }

  if (showFallback) {
    return (
      <div
        className={cn(
          sizeClass,
          'flex items-center justify-center rounded-lg bg-primary/20 text-primary font-bold',
          size === 'sm' && 'text-xs',
          size === 'md' && 'text-sm',
          size === 'lg' && 'text-xl',
          size === 'xl' && 'text-2xl',
          className
        )}
      >
        {fallbackInitials[provider]}
      </div>
    );
  }

  return null;
};
