import React from 'react';
import { Settings } from 'lucide-react';
import { SimpleProviderManagement } from './SimpleProviderManagement';
import { SimpleAIServiceToggle } from './SimpleAIServiceToggle';
import { TestAllProvidersButton } from '../ai-chat/TestAllProvidersButton';

export function MinimalAPISettings() {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-semibold">API Settings</h1>
        </div>
        <p className="text-muted-foreground">
          Configure your AI providers and service settings
        </p>
      </div>

      <div className="space-y-6">
        <SimpleAIServiceToggle />
        <SimpleProviderManagement />
        
        <div className="pt-4 border-t">
          <h2 className="text-lg font-medium mb-3">Testing & Diagnostics</h2>
          <TestAllProvidersButton />
        </div>
      </div>
    </div>
  );
}