
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, CheckCircle, Circle, Search, MessageSquare, Hash, Newspaper, Image, Video, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SerpSelection } from '@/contexts/content-builder/types';

interface SerpSelectionStepsProps {
  serpData: any;
  serpSelections: SerpSelection[];
  handleToggleSelection: (type: string, content: string) => void;
  onComplete: () => void;
}

interface StepConfig {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  optional?: boolean;
}

const STEPS: StepConfig[] = [
  {
    id: 'organic',
    title: 'Top Ranking Pages',
    description: 'Select relevant titles and content from top-ranking pages',
    icon: Search,
    color: 'text-blue-500'
  },
  {
    id: 'questions',
    title: 'People Also Ask',
    description: 'Choose questions your audience is asking',
    icon: MessageSquare,
    color: 'text-green-500'
  },
  {
    id: 'keywords',
    title: 'Related Keywords',
    description: 'Pick additional keywords to target',
    icon: Hash,
    color: 'text-purple-500'
  },
  {
    id: 'features',
    title: 'SERP Features',
    description: 'Select from news, images, videos, and knowledge graph',
    icon: Brain,
    color: 'text-orange-500',
    optional: true
  }
];

export const SerpSelectionSteps: React.FC<SerpSelectionStepsProps> = ({
  serpData,
  serpSelections,
  handleToggleSelection,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const getCurrentStepData = () => {
    const step = STEPS[currentStep];
    const stepId = step.id;
    
    switch (stepId) {
      case 'organic':
        return serpData?.serp_blocks?.organic?.slice(0, 8) || [];
      case 'questions':
        return serpData?.serp_blocks?.people_also_ask?.slice(0, 6) || [];
      case 'keywords':
        return serpData?.related_keywords?.slice(0, 10) || [];
      case 'features':
        return [
          ...(serpData?.serp_blocks?.top_stories?.slice(0, 3) || []),
          ...(serpData?.serp_blocks?.images?.slice(0, 2) || []),
          ...(serpData?.serp_blocks?.videos?.slice(0, 2) || []),
          ...(serpData?.serp_blocks?.knowledge_graph ? [serpData.serp_blocks.knowledge_graph] : [])
        ];
      default:
        return [];
    }
  };

  const getSelectedCount = (stepId: string) => {
    switch (stepId) {
      case 'organic':
        return serpSelections.filter(s => s.type === 'heading' && s.selected).length;
      case 'questions':
        return serpSelections.filter(s => s.type === 'question' && s.selected).length;
      case 'keywords':
        return serpSelections.filter(s => s.type === 'relatedKeyword' && s.selected).length;
      case 'features':
        return serpSelections.filter(s => 
          ['topStory', 'image', 'video', 'knowledgeEntity'].includes(s.type) && s.selected
        ).length;
      default:
        return 0;
    }
  };

  const getTotalSelections = () => {
    return serpSelections.filter(s => s.selected).length;
  };

  const handleNext = () => {
    const selectedCount = getSelectedCount(STEPS[currentStep].id);
    if (selectedCount > 0 || STEPS[currentStep].optional) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
    }
    
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    onComplete();
  };

  const canProceed = () => {
    const selectedCount = getSelectedCount(STEPS[currentStep].id);
    return selectedCount > 0 || STEPS[currentStep].optional;
  };

  const renderStepContent = () => {
    const step = STEPS[currentStep];
    const data = getCurrentStepData();
    
    if (!data.length) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <step.icon className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No {step.title.toLowerCase()} available for this keyword</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {data.map((item: any, index: number) => {
          let content = '';
          let type = '';
          let isSelected = false;
          
          switch (step.id) {
            case 'organic':
              content = item.title || item.snippet || 'Untitled';
              type = 'heading';
              break;
            case 'questions':
              content = item.question || item;
              type = 'question';
              break;
            case 'keywords':
              content = item;
              type = 'relatedKeyword';
              break;
            case 'features':
              if (item.title) {
                content = item.title;
                type = item.source ? 'topStory' : 'knowledgeEntity';
              } else {
                content = item.toString();
                type = 'topStory';
              }
              break;
          }
          
          isSelected = serpSelections.some(s => s.content === content && s.selected);
          
          return (
            <Card 
              key={index} 
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'
              }`}
              onClick={() => handleToggleSelection(type, content)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-2">{content}</p>
                    {step.id === 'organic' && item.snippet && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {item.snippet}
                      </p>
                    )}
                  </div>
                  <div className="ml-3">
                    {isSelected ? (
                      <CheckCircle className="h-5 w-5 text-primary" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="space-y-6">
      {/* Step Progress */}
      <Card className="glass-panel">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-2">
            <CardTitle className="text-lg">SERP Selection Progress</CardTitle>
            <Badge variant="secondary">{getTotalSelections()} items selected</Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = completedSteps.has(index);
              const isCurrent = index === currentStep;
              const selectedCount = getSelectedCount(step.id);
              
              return (
                <div 
                  key={step.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm ${
                    isCurrent 
                      ? 'bg-primary text-primary-foreground' 
                      : isCompleted 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{step.title}</span>
                  {selectedCount > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {selectedCount}
                    </Badge>
                  )}
                  {step.optional && (
                    <span className="text-xs opacity-70">(Optional)</span>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Current Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="glass-panel">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full bg-white/10 ${STEPS[currentStep].color}`}>
                  <STEPS[currentStep].icon className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">{STEPS[currentStep].title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{STEPS[currentStep].description}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Badge variant="outline">
                  Step {currentStep + 1} of {STEPS.length}
                </Badge>
                <Badge variant="secondary">
                  {getSelectedCount(STEPS[currentStep].id)} selected
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto">
              {renderStepContent()}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex gap-2">
          {currentStep < STEPS.length - 1 ? (
            <Button
              variant="outline"
              onClick={handleNext}
              disabled={!canProceed()}
              className="gap-2"
            >
              {STEPS[currentStep].optional ? 'Skip' : 'Next'}
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={getTotalSelections() === 0}
              className="gap-2 bg-gradient-to-r from-neon-purple to-neon-blue"
            >
              Complete Selection
              <CheckCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
