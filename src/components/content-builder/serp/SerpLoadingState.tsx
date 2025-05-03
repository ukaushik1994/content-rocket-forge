
import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface SerpLoadingStateProps {
  isLoading: boolean;
  navigateToStep?: (step: number) => void;
}

export const SerpLoadingState: React.FC<SerpLoadingStateProps> = ({
  isLoading,
  navigateToStep = () => {} // Default empty function to avoid undefined errors
}) => {
  if (!isLoading) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center py-12 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
          <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-primary h-8 w-8 animate-pulse" />
        </div>
        <p className="mt-6 text-lg font-medium bg-clip-text text-transparent bg-gradient-to-r from-neon-purple to-neon-blue">Analyzing search results...</p>
        <p className="text-sm text-muted-foreground mt-2">Extracting insights from top-ranking content</p>
      </div>
    </div>
  );
};
