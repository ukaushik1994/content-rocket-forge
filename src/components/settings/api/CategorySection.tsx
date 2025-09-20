import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ApiProvider } from './types';

interface CategorySectionProps {
  title: string;
  providers: ApiProvider[];
  connectedCount: number;
  totalCount: number;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}

export const CategorySection = ({ 
  title, 
  providers, 
  connectedCount, 
  totalCount, 
  defaultExpanded = false,
  children 
}: CategorySectionProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
  const hasRequiredProviders = providers.some(p => p.required);
  const allRequiredConfigured = providers
    .filter(p => p.required)
    .every(p => connectedCount > 0); // Simplified check for demo

  return (
    <div className="space-y-3">
      <Button
        variant="ghost"
        className="w-full h-auto p-0 justify-start font-normal hover:bg-transparent"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between w-full py-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
              <h3 className="font-medium text-sm">{title}</h3>
            </div>
            
            {hasRequiredProviders && !allRequiredConfigured && (
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {connectedCount}/{totalCount}
            </span>
            <div className="flex gap-1">
              {Array.from({ length: totalCount }).map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full ${
                    i < connectedCount ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </Button>
      
      {isExpanded && (
        <div className="space-y-2 pl-6">
          {children}
        </div>
      )}
    </div>
  );
};