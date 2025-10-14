import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { LearningEngineVisual } from './hero-visuals/LearningEngineVisual';
import { SmartContentVisual } from './hero-visuals/SmartContentVisual';
import { WorkflowPipelineVisual } from './hero-visuals/WorkflowPipelineVisual';
import { AudienceInsightsVisual } from './hero-visuals/AudienceInsightsVisual';

interface HeroDashboardPreviewProps {
  currentMessageIndex: number;
}

export const HeroDashboardPreview = ({ currentMessageIndex }: HeroDashboardPreviewProps) => {
  const visualComponents = [
    LearningEngineVisual,
    SmartContentVisual,
    WorkflowPipelineVisual,
    AudienceInsightsVisual
  ];

  const CurrentVisual = visualComponents[currentMessageIndex] || LearningEngineVisual;

  return (
    <div className="relative">
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-neon-blue/20 to-neon-pink/20 blur-3xl animate-pulse" />
      
      {/* Dashboard Container */}
      <div className="relative bg-gradient-to-br from-background/80 to-background/40 backdrop-blur-xl rounded-2xl border border-border/50 overflow-visible shadow-2xl">
        
        {/* Dynamic Dashboard Content */}
        <div className="p-6 md:p-8 relative z-10 min-h-[650px]">
          <AnimatePresence mode="wait">
            <CurrentVisual key={currentMessageIndex} />
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
