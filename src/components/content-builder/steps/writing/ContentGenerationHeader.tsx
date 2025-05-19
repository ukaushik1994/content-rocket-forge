
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Sparkles, Check, List, Loader2 } from 'lucide-react';
import { AiProviderSelector } from '../../outline/ai-generator/AiProviderSelector';
import type { AiProvider } from '../../outline/ai-generator/types';

interface ContentGenerationHeaderProps {
  title: string | null;
  wordCount: number;
  isGenerating: boolean;
  onGenerate: () => void;
  targetWordCount?: number;
}

export const ContentGenerationHeader = ({ 
  title, 
  wordCount, 
  isGenerating, 
  onGenerate,
  targetWordCount = 0,
}: ContentGenerationHeaderProps) => {
  const [selectedProvider, setSelectedProvider] = useState<AiProvider>('openai');
  
  // Calculate progress percentage capped at 100%
  const progressPercentage = targetWordCount > 0 
    ? Math.min(Math.round((wordCount / targetWordCount) * 100), 100) 
    : 0;
  
  // Determine status class based on progress
  const getStatusClass = () => {
    if (targetWordCount === 0) return "bg-blue-600";
    if (progressPercentage >= 100) return "bg-green-600";
    if (progressPercentage >= 80) return "bg-yellow-600";
    return "bg-blue-600";
  };

  const handleProviderChange = (provider: AiProvider) => {
    setSelectedProvider(provider);
  };

  return (
    <div className="bg-card border rounded-md mb-6 px-5 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-xl font-medium line-clamp-1">
            {title || "Untitled Content"}
          </h2>
          
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              <span className="font-normal">{wordCount} words</span>
            </Badge>
            
            {targetWordCount > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-16 bg-secondary/30 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getStatusClass()} rounded-full transition-all duration-500`}
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {progressPercentage}% of {targetWordCount}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <AiProviderSelector
            selectedProvider={selectedProvider}
            onProviderChange={handleProviderChange}
            size="sm"
            variant="outline" 
            className="h-9"
          />
          
          <Button 
            variant="default"
            className="h-9 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700" 
            onClick={onGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
