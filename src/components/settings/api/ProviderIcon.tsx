import React from 'react';
import { ProviderLogo } from '@/components/ui/provider-logo';
import { Zap, Server, Key, Binary, HardDrive, Globe } from 'lucide-react';

type Provider = 'openai' | 'anthropic' | 'gemini' | 'lmstudio' | 'mistral' | 'openrouter';

interface ProviderIconProps {
  provider: string;
}

const lucideIcons: Record<Provider, React.ReactNode> = {
  openai: <Key className="h-4 w-4" />,
  anthropic: <Zap className="h-4 w-4" />,
  gemini: <Binary className="h-4 w-4" />,
  lmstudio: <HardDrive className="h-4 w-4" />,
  mistral: <Server className="h-4 w-4" />,
  openrouter: <Globe className="h-4 w-4" />,
};

export const ProviderIcon: React.FC<ProviderIconProps> = ({ provider }) => {
  const normalizedProvider = provider.toLowerCase() as Provider;

  // Try to render logo first
  if (['openai', 'anthropic', 'gemini', 'lmstudio'].includes(normalizedProvider)) {
    return <ProviderLogo provider={normalizedProvider} size="sm" showFallback={false} />;
  }

  // Fallback to lucide icon
  return <>{lucideIcons[normalizedProvider] || <Key className="h-4 w-4" />}</>;
};
