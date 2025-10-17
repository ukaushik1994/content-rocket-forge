import React from 'react';
import { StrategyEnhancedSolutionSelector } from './StrategyEnhancedSolutionSelector';
import { StrategyEnhancedOutlineGenerator } from './StrategyEnhancedOutlineGenerator';
import { StrategyEnhancedContentGenerator } from './StrategyEnhancedContentGenerator';
import { StrategyContentSaver } from './StrategyContentSaver';
import { SerpAnalysisStep } from '@/components/content-builder/steps/SerpAnalysisStep';

interface StepContentProps {
  currentStep: number;
  proposal: any;
  handleClose: () => void;
}

export function StepContent({ currentStep, proposal, handleClose }: StepContentProps) {
  switch (currentStep) {
    case 0:
      return <StrategyEnhancedSolutionSelector proposal={proposal} />;
    
    case 1:
      return (
        <div className="h-full">
          <SerpAnalysisStep proposal={proposal} />
        </div>
      );
    
    case 2:
      return <StrategyEnhancedOutlineGenerator proposal={proposal} />;
    
    case 3:
      return <StrategyEnhancedContentGenerator proposal={proposal} />;
    
    case 4:
      return (
        <StrategyContentSaver
          proposal={proposal}
          onSaveComplete={handleClose}
        />
      );
    
    default:
      return <div>Invalid step</div>;
  }
}