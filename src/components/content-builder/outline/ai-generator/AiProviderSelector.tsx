
import React, { useState, useEffect } from 'react';
import { SimpleAIServiceIndicator } from '../../ai/SimpleAIServiceIndicator';

interface AiProviderSelectorProps {
  className?: string;
}

interface ProviderStatus {
  [key: string]: boolean;
}

export function AiProviderSelector({ 
  className = ""
}: AiProviderSelectorProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <SimpleAIServiceIndicator size="sm" showLabel={true} />
    </div>
  );
}
