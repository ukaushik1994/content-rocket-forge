
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Target, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { AnimatedBackground } from '../animations/AnimatedBackground';
import { AudiencePersonaBuilder } from './strategy-wizard/AudiencePersonaBuilder';
import { InteractiveGoalSelector } from './strategy-wizard/InteractiveGoalSelector';
import { ContentPillarDesigner } from './strategy-wizard/ContentPillarDesigner';
import { StrategyPreview } from './strategy-wizard/StrategyPreview';
import { PublishingStrategyBuilder } from './strategy-wizard/PublishingStrategyBuilder';

const wizardSteps = [
  { id: 'audience', title: 'Define Your Audience', icon: '👥' },
  { id: 'goals', title: 'Set Your Goals', icon: '🎯' },
  { id: 'pillars', title: 'Content Pillars', icon: '🏛️' },
  { id: 'publishing', title: 'Publishing Strategy', icon: '📅' },
  { id: 'preview', title: 'Strategy Overview', icon: '👁️' }
];

export const EnhancedContentStrategyStep = () => {
  const { state, setContentStrategy, markStepCompleted } = useContentBuilder();
  const { contentStrategy } = state;

  const [currentWizardStep, setCurrentWizardStep] = useState(0);
  const [wizardData, setWizardData] = useState({
    targetAudience: contentStrategy?.targetAudience || '',
    contentGoals: contentStrategy?.contentGoals || [],
    businessObjectives: contentStrategy?.businessObjectives || '',
    competitorAnalysis: contentStrategy?.competitorAnalysis || '',
    contentPillars: contentStrategy?.contentPillars || [],
    publishingSchedule: contentStrategy?.publishingSchedule || 'weekly',
    targetFunnelStage: contentStrategy?.targetFunnelStage || 'awareness'
  });

  const progress = ((currentWizardStep + 1) / wizardSteps.length) * 100;

  const handleNext = () => {
    if (currentWizardStep < wizardSteps.length - 1) {
      setCurrentWizardStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentWizardStep > 0) {
      setCurrentWizardStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    if (!wizardData.targetAudience.trim()) {
      toast.error('Please define your target audience');
      return;
    }

    if (wizardData.contentGoals.length === 0) {
      toast.error('Please select at least one content goal');
      return;
    }

    const strategy = {
      targetAudience: wizardData.targetAudience.trim(),
      contentGoals: wizardData.contentGoals,
      businessObjectives: wizardData.businessObjectives.trim(),
      competitorAnalysis: wizardData.competitorAnalysis.trim(),
      contentPillars: wizardData.contentPillars.filter(p => p.trim() !== ''),
      publishingSchedule: wizardData.publishingSchedule,
      targetFunnelStage: wizardData.targetFunnelStage
    };

    setContentStrategy(strategy);
    markStepCompleted(0);
    toast.success('Content strategy created successfully!', {
      description: 'Your strategy foundation is now ready for content creation.'
    });
  };

  const renderWizardStep = () => {
    const stepId = wizardSteps[currentWizardStep].id;
    
    switch (stepId) {
      case 'audience':
        return (
          <AudiencePersonaBuilder
            data={wizardData}
            onChange={setWizardData}
          />
        );
      case 'goals':
        return (
          <InteractiveGoalSelector
            data={wizardData}
            onChange={setWizardData}
          />
        );
      case 'pillars':
        return (
          <ContentPillarDesigner
            data={wizardData}
            onChange={setWizardData}
          />
        );
      case 'publishing':
        return (
          <PublishingStrategyBuilder
            data={wizardData}
            onChange={setWizardData}
          />
        );
      case 'preview':
        return (
          <StrategyPreview
            data={wizardData}
            onChange={setWizardData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <AnimatedBackground />
      
      <div className="relative z-10 container mx-auto py-8 px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Target className="h-8 w-8 text-neon-blue" />
            </motion.div>
            <h1 className="text-4xl font-bold text-gradient">
              Content Strategy Studio
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Create a comprehensive content strategy that aligns with your business goals and resonates with your audience
          </p>
        </motion.div>

        {/* Progress Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-6 mb-8 max-w-4xl mx-auto"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Strategy Progress</h3>
            <span className="text-sm text-muted-foreground">
              Step {currentWizardStep + 1} of {wizardSteps.length}
            </span>
          </div>
          
          <Progress value={progress} className="h-3 mb-4" />
          
          <div className="flex justify-between">
            {wizardSteps.map((step, index) => (
              <motion.div
                key={step.id}
                className={`flex flex-col items-center space-y-2 cursor-pointer`}
                onClick={() => setCurrentWizardStep(index)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center text-lg
                  transition-all duration-300
                  ${index <= currentWizardStep 
                    ? 'bg-gradient-to-r from-neon-purple to-neon-blue text-white shadow-neon-glow' 
                    : 'bg-white/10 text-muted-foreground border border-white/20'
                  }
                `}>
                  {index < currentWizardStep ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : (
                    <span>{step.icon}</span>
                  )}
                </div>
                <span className={`text-xs text-center max-w-20 ${
                  index === currentWizardStep ? 'text-neon-blue font-medium' : 'text-muted-foreground'
                }`}>
                  {step.title}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Wizard Content */}
        <motion.div
          key={currentWizardStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="max-w-6xl mx-auto"
        >
          <AnimatePresence mode="wait">
            {renderWizardStep()}
          </AnimatePresence>
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between max-w-4xl mx-auto mt-8"
        >
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentWizardStep === 0}
            className="gap-2 bg-glass border-white/20 hover:border-white/40"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>

          {currentWizardStep === wizardSteps.length - 1 ? (
            <Button
              onClick={handleComplete}
              className="gap-2 bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple"
            >
              <CheckCircle className="h-4 w-4" />
              Complete Strategy
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="gap-2 bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple"
            >
              Next Step
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </motion.div>
      </div>
    </div>
  );
};
