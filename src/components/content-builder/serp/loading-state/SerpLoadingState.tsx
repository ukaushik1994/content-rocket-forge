
import React from 'react';
import { Sparkles } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';
import { ProgressIndicator } from './ProgressIndicator';
import { LoadingParticle } from './LoadingParticle';

export interface SerpLoadingStateProps {
  isLoading: boolean;
  message?: string;
  keywords?: string[];
}

export const SerpLoadingState: React.FC<SerpLoadingStateProps> = ({
  isLoading = true,
  message = 'Analyzing search results...',
  keywords
}) => {
  // Predefined loading messages for variety
  const loadingMessages = [
    'Extracting insights from top-ranking content',
    'Identifying patterns in search results',
    'Finding key entities and topics',
    'Analyzing competitor content structure',
    'Extracting questions people are asking'
  ];
  
  // Get a random loading message
  const randomSubMessage = () => {
    return loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center py-12 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 relative overflow-hidden">
        {/* Background particles */}
        <div className="absolute inset-0 pointer-events-none">
          <LoadingParticle delay={0} top="10%" left="20%" />
          <LoadingParticle delay={1} top="30%" left="70%" />
          <LoadingParticle delay={0.5} top="60%" left="30%" />
          <LoadingParticle delay={1.5} top="80%" left="60%" />
          <LoadingParticle delay={2} top="20%" left="80%" />
        </div>
        
        <div className="relative">
          <LoadingSpinner />
          <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-primary h-8 w-8 animate-pulse" />
        </div>
        <p className="mt-6 text-lg font-medium bg-clip-text text-transparent bg-gradient-to-r from-neon-purple to-neon-blue">{message}</p>
        <p className="text-sm text-muted-foreground mt-2">{randomSubMessage()}</p>
        
        {keywords && keywords.length > 0 && (
          <div className="mt-6">
            <ProgressIndicator keywords={keywords} />
          </div>
        )}
      </div>
    </div>
  );
};
