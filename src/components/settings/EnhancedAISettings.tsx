import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';
import { SimpleProviderManagement } from './SimpleProviderManagement';
import { SimpleAIServiceToggle } from './SimpleAIServiceToggle';

export function EnhancedAISettings() {
  return (
    <div className="w-full space-y-6">
      {/* Simple Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-semibold">AI Settings</h1>
        </div>
        <p className="text-muted-foreground">
          Configure your AI providers and service settings
        </p>
      </div>

      {/* Simple Single Page Layout */}
      <div className="space-y-6">
        <SimpleAIServiceToggle />
        <SimpleProviderManagement />
      </div>
    </div>
  );
}