import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { WizardStepSolution } from './WizardStepSolution';
import { WizardStepResearch } from './WizardStepResearch';
import { WizardStepOutline } from './WizardStepOutline';
import { WizardStepWordCount } from './WizardStepWordCount';
import { WizardStepGenerate } from './WizardStepGenerate';
import { EnhancedSolution } from '@/contexts/content-builder/types/enhanced-solution-types';
import { OutlineSection } from '@/contexts/content-builder/types/outline-types';
import { useResponsiveBreakpoint } from '@/hooks/useResponsiveBreakpoint';

interface ContentWizardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  keyword: string;
  solutionId?: string | null;
  contentType?: string;
}

export interface WizardState {
  keyword: string;
  contentType: string;
  selectedSolution: EnhancedSolution | null;
  researchSelections: {
    faqs: string[];
    contentGaps: string[];
    relatedKeywords: string[];
    serpHeadings: string[];
  };
  outline: OutlineSection[];
  wordCount: number | null;
  wordCountMode: 'ai' | 'custom';
  writingStyle: 'conversational' | 'professional' | 'academic' | 'casual';
  expertiseLevel: 'beginner' | 'intermediate' | 'expert';
  contentArticleType: 'general' | 'how-to' | 'listicle' | 'comprehensive';
  includeStats: boolean;
  includeCaseStudies: boolean;
  includeFAQs: boolean;
  metaTitle: string;
  metaDescription: string;
  generatedContent: string;
}

const STEPS = [
  { id: 0, label: 'Topic' },
  { id: 1, label: 'Solution' },
  { id: 2, label: 'Research' },
  { id: 3, label: 'Outline' },
  { id: 4, label: 'Words' },
  { id: 5, label: 'Generate' },
];

export const ContentWizardSidebar: React.FC<ContentWizardSidebarProps> = ({
  isOpen,
  onClose,
  keyword,
  solutionId,
  contentType = 'blog',
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardState, setWizardState] = useState<WizardState>({
    keyword,
    contentType,
    selectedSolution: null,
    researchSelections: { faqs: [], contentGaps: [], relatedKeywords: [], serpHeadings: [] },
    outline: [],
    wordCount: null,
    wordCountMode: 'ai',
    writingStyle: 'conversational',
    expertiseLevel: 'intermediate',
    contentArticleType: 'general',
    includeStats: false,
    includeCaseStudies: false,
    includeFAQs: true,
    metaTitle: '',
    metaDescription: '',
    generatedContent: '',
  });

  const { isMobile } = useResponsiveBreakpoint();

  const updateState = useCallback((updates: Partial<WizardState>) => {
    setWizardState(prev => ({ ...prev, ...updates }));
  }, []);

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 0: return wizardState.keyword.trim().length >= 2;
      case 1: return !!wizardState.selectedSolution;
      case 2: {
        const s = wizardState.researchSelections;
        return (s.faqs.length + s.contentGaps.length + s.relatedKeywords.length + s.serpHeadings.length) > 0;
      }
      case 3: return wizardState.outline.length > 0;
      case 4: return wizardState.wordCountMode === 'ai' || (wizardState.wordCount !== null && wizardState.wordCount > 0);
      case 5: return true;
      default: return false;
    }
  };

  const goNext = () => { if (currentStep < 5 && canProceed()) setCurrentStep(s => s + 1); };
  const goBack = () => { if (currentStep > 0) setCurrentStep(s => s - 1); };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-16 bottom-24 left-0 right-0 bg-black/40 backdrop-blur-sm z-[35] lg:hidden"
            onClick={onClose}
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={cn(
              "fixed top-20 right-0 bottom-24 z-[35]",
              "w-full sm:w-[400px] lg:w-[520px] xl:w-[600px]",
              "bg-background/95 backdrop-blur-xl",
              "border-l border-border/10",
              "flex flex-col overflow-hidden"
            )}
          >
            {/* Header */}
            <div className="flex-shrink-0 px-5 py-4 border-b border-border/10">
              <div className="flex items-center justify-between mb-4">
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold text-foreground truncate">Content Wizard</h2>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">"{wizardState.keyword || keyword}"</p>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-muted text-muted-foreground">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Step Indicator */}
              <div className="flex items-center gap-1">
                {STEPS.map((step, idx) => (
                  <React.Fragment key={step.id}>
                    <div className="flex flex-col items-center gap-1">
                      <div className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all",
                        currentStep === step.id && "bg-primary text-primary-foreground ring-2 ring-primary/30",
                        currentStep > step.id && "bg-primary/20 text-primary",
                        currentStep < step.id && "bg-muted text-muted-foreground"
                      )}>
                        {currentStep > step.id ? <Check className="w-3.5 h-3.5" /> : step.id}
                      </div>
                      <span className={cn(
                        "text-[10px] font-medium",
                        currentStep === step.id ? "text-foreground" : "text-muted-foreground"
                      )}>{step.label}</span>
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div className={cn(
                        "flex-1 h-0.5 rounded-full mt-[-14px]",
                        currentStep > step.id ? "bg-primary/40" : "bg-border/30"
                      )} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Content */}
            <ScrollArea className="flex-1 min-h-0">
              <div className="p-5">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {currentStep === 0 && (
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-semibold text-foreground">What would you like to write about?</h3>
                          <p className="text-xs text-muted-foreground mt-1">Enter a keyword or topic for your content</p>
                        </div>
                        <Input
                          value={wizardState.keyword}
                          onChange={(e) => updateState({ keyword: e.target.value })}
                          placeholder="e.g. AI in healthcare, best running shoes..."
                          className="text-sm"
                          autoFocus
                        />
                      </div>
                    )}
                    {currentStep === 1 && (
                      <WizardStepSolution
                        selectedSolution={wizardState.selectedSolution}
                        onSelect={(sol) => updateState({ selectedSolution: sol })}
                        preSelectedId={solutionId}
                      />
                    )}
                    {currentStep === 2 && (
                      <WizardStepResearch
                        keyword={wizardState.keyword}
                        selections={wizardState.researchSelections}
                        onSelectionsChange={(sel) => updateState({ researchSelections: sel })}
                      />
                    )}
                    {currentStep === 3 && (
                      <WizardStepOutline
                        keyword={wizardState.keyword}
                        solution={wizardState.selectedSolution}
                        researchSelections={wizardState.researchSelections}
                        outline={wizardState.outline}
                        onOutlineChange={(outline) => updateState({ outline })}
                      />
                    )}
                    {currentStep === 4 && (
                      <WizardStepWordCount
                        outline={wizardState.outline}
                        researchSelections={wizardState.researchSelections}
                        wordCount={wizardState.wordCount}
                        wordCountMode={wizardState.wordCountMode}
                        writingStyle={wizardState.writingStyle}
                        expertiseLevel={wizardState.expertiseLevel}
                        contentArticleType={wizardState.contentArticleType}
                        onWordCountChange={(wc) => updateState({ wordCount: wc })}
                        onModeChange={(mode) => updateState({ wordCountMode: mode })}
                        onWritingStyleChange={(s) => updateState({ writingStyle: s })}
                        onExpertiseLevelChange={(l) => updateState({ expertiseLevel: l })}
                        onContentArticleTypeChange={(t) => updateState({ contentArticleType: t })}
                      />
                    )}
                    {currentStep === 5 && (
                      <WizardStepGenerate
                        wizardState={wizardState}
                        onMetaChange={(title, desc) => updateState({ metaTitle: title, metaDescription: desc })}
                        onContentGenerated={(content) => updateState({ generatedContent: content })}
                        onClose={onClose}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </ScrollArea>

            {/* Footer Navigation */}
            {currentStep < 5 && (
              <div className="flex-shrink-0 px-5 py-3 border-t border-border/10 flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goBack}
                  disabled={currentStep === 0}
                  className="text-muted-foreground"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <Button
                  size="sm"
                  onClick={goNext}
                  disabled={!canProceed()}
                  className="gap-1"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
