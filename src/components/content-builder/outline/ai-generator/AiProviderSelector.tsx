import React from 'react';
import { Sparkles } from 'lucide-react';

interface AiProviderSelectorProps {
  className?: string;
}

export function AiProviderSelector({ 
  className = ""
}: AiProviderSelectorProps) {
  return (
    <div className={`flex items-center gap-1.5 text-xs text-muted-foreground ${className}`}>
      <Sparkles className="h-3 w-3 text-primary" />
      <span>AI Ready</span>
    </div>
  );
}
