import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WizardStepSolution } from './WizardStepSolution';
import { WizardStepResearch } from './WizardStepResearch';
import { WizardStepOutline } from './WizardStepOutline';
import { WizardStepWordCount } from './WizardStepWordCount';
import { WizardStepGenerate } from './WizardStepGenerate';
import { EnhancedSolution } from '@/contexts/content-builder/types/enhanced-solution-types';
import { OutlineSection } from '@/contexts/content-builder/types/outline-types';
import { useResponsiveBreakpoint } from '@/hooks/useResponsiveBreakpoint';
import { mapOfferingToBrief } from '@/utils/content/offeringToBrief';
import { toast } from 'sonner';

interface ContentWizardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  keyword: string;
  solutionId?: string | null;
  contentType?: string;
}

export interface ContentBrief {
  targetAudience: string;
  contentGoal: string;
  tone: string;
  specificPoints: string;
}

export interface WizardState {
  keyword: string;
  contentType: string;
  title: string;
  selectedSolution: EnhancedSolution | null;
  researchSelections: {
    faqs: string[];
    contentGaps: string[];
    relatedKeywords: string[];
    serpHeadings: string[];
    entities?: string[];
  };
  serpData: any; // Raw SERP analysis data for comprehensive metadata persistence
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
  contentBrief: ContentBrief;
  additionalInstructions: string;
}

const BLOG_STEPS = [
  { id: 0, label: 'Topic & Solution' },
  { id: 1, label: 'Research' },
  { id: 2, label: 'Outline' },
  { id: 3, label: 'Config' },
  { id: 4, label: 'Generate' },
];

const QUICK_STEPS = [
  { id: 0, label: 'Topic & Solution' },
  { id: 1, label: 'Generate' },
];

const BLOG_FORMATS = ['blog', 'landing-page'];
const isQuickFormat = (ct: string) => !BLOG_FORMATS.includes(ct);

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
    title: '',
    selectedSolution: null,
    researchSelections: { faqs: [], contentGaps: [], relatedKeywords: [], serpHeadings: [] },
    serpData: null,
    outline: [],
    wordCount: null,
    wordCountMode: 'ai',
    writingStyle: 'conversational',
    expertiseLevel: 'intermediate',
    contentArticleType: 'comprehensive',
    includeStats: false,
    includeCaseStudies: false,
    includeFAQs: true,
    metaTitle: '',
    metaDescription: '',
    generatedContent: '',
    contentBrief: { targetAudience: '', contentGoal: '', tone: '', specificPoints: '' },
    additionalInstructions: '',
  });

  const { isMobile } = useResponsiveBreakpoint();
  const quick = isQuickFormat(wizardState.contentType);
  const activeSteps = quick ? QUICK_STEPS : BLOG_STEPS;
  const maxStep = activeSteps.length - 1;

  const updateState = useCallback((updates: Partial<WizardState>) => {
    setWizardState(prev => {
      const next = { ...prev, ...updates };
      // If content type changed between blog/quick, reset step to 0
      if (updates.contentType && isQuickFormat(updates.contentType) !== isQuickFormat(prev.contentType)) {
        return next; // step will be clamped in render
      }
      return next;
    });
  }, []);

  // Clamp step when switching between quick/blog
  React.useEffect(() => {
    if (currentStep > maxStep) setCurrentStep(maxStep);
  }, [maxStep, currentStep]);

  const canProceed = (): boolean => {
    if (currentStep === 0) return wizardState.keyword.trim().length >= 2 && !!wizardState.selectedSolution;
    if (quick) return true; // step 1 = generate, always ok
    // Blog steps
    switch (currentStep) {
      case 1: {
        const s = wizardState.researchSelections;
        return (s.faqs.length + s.contentGaps.length + s.relatedKeywords.length + s.serpHeadings.length) > 0;
      }
      case 2: return wizardState.outline.length > 0;
      case 3: return wizardState.wordCountMode === 'ai' || (wizardState.wordCount !== null && wizardState.wordCount > 0);
      case 4: return true;
      default: return false;
    }
  };

  const [validationError, setValidationError] = useState(false);

  const goNext = () => {
    if (currentStep === 0 && wizardState.keyword.trim().length < 2) {
      toast.error('Please enter a topic to continue');
      setValidationError(true);
      setTimeout(() => setValidationError(false), 4000);
      return;
    }
    if (currentStep === 0 && !wizardState.selectedSolution) {
      toast.error('Please select an offering to continue');
      return;
    }
    if (currentStep < maxStep && canProceed()) setCurrentStep(s => s + 1);
  };
  const goBack = () => { if (currentStep > 0) setCurrentStep(s => s - 1); };

  // Phase 2C: Handle repurpose from success screen
  const handleRepurpose = useCallback((newContentType: string, sourceContent: string, keyword: string) => {
    setWizardState(prev => ({
      ...prev,
      keyword,
      contentType: newContentType,
      title: '',
      generatedContent: '',
      additionalInstructions: `Use this content as source material and repurpose it:\n\n${sourceContent.substring(0, 2000)}`,
      researchSelections: { faqs: [], contentGaps: [], relatedKeywords: [], serpHeadings: [] },
      serpData: null,
      outline: [],
      metaTitle: '',
      metaDescription: '',
    }));
    // Quick formats go directly to generate (step 1), blog formats go to step 0
    setCurrentStep(isQuickFormat(newContentType) ? 1 : 0);
  }, []);

  // Auto-infer writing defaults + content brief from solution data using shared utility
  const handleSolutionSelect = useCallback((sol: EnhancedSolution) => {
    const result = mapOfferingToBrief(sol);
    updateState({
      selectedSolution: sol,
      writingStyle: result.writingStyle,
      expertiseLevel: result.expertiseLevel,
      contentBrief: result.contentBrief,
    });
  }, [updateState]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
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
              "bg-background/80 backdrop-blur-md",
              "border-l border-border/10",
              "flex flex-col overflow-hidden"
            )}
          >
            {/* Header */}
            <div className="flex-shrink-0 px-5 py-4 border-b border-border/10">
              <div className="flex items-center justify-between mb-4">
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold text-foreground truncate">Content Wizard</h2>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">"{wizardState.keyword}"</p>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-muted text-muted-foreground">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Step Indicator */}
              <div className="flex items-center gap-1">
                {activeSteps.map((step, idx) => (
                  <React.Fragment key={step.id}>
                    <div className="flex flex-col items-center gap-1">
                      <div className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all",
                        currentStep === idx && "bg-primary text-primary-foreground ring-2 ring-primary/30",
                        currentStep > idx && "bg-primary/20 text-primary",
                        currentStep < idx && "bg-muted text-muted-foreground"
                      )}>
                        {currentStep > idx ? <Check className="w-3.5 h-3.5" /> : idx}
                      </div>
                      <span className={cn(
                        "text-[10px] font-medium",
                        currentStep === idx ? "text-foreground" : "text-muted-foreground"
                      )}>{step.label}</span>
                    </div>
                    {idx < activeSteps.length - 1 && (
                      <div className={cn(
                        "flex-1 h-0.5 rounded-full mt-[-14px]",
                        currentStep > idx ? "bg-primary/40" : "bg-border/30"
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
                      <WizardStepSolution
                        selectedSolution={wizardState.selectedSolution}
                        onSelect={handleSolutionSelect}
                        preSelectedId={solutionId}
                        keyword={wizardState.keyword}
                        onKeywordChange={(kw) => { updateState({ keyword: kw }); setValidationError(false); }}
                        contentType={wizardState.contentType}
                        onContentTypeChange={(ct) => updateState({ contentType: ct })}
                        keywordError={validationError}
                      />
                    )}
                    {!quick && currentStep === 1 && (
                      <WizardStepResearch
                        keyword={wizardState.keyword}
                        selections={wizardState.researchSelections}
                        onSelectionsChange={(sel) => updateState({ researchSelections: sel })}
                        onSerpDataChange={(data) => updateState({ serpData: data })}
                      />
                    )}
                    {!quick && currentStep === 2 && (
                      <WizardStepOutline
                        keyword={wizardState.keyword}
                        solution={wizardState.selectedSolution}
                        researchSelections={wizardState.researchSelections}
                        outline={wizardState.outline}
                        onOutlineChange={(outline) => updateState({ outline })}
                      />
                    )}
                    {!quick && currentStep === 3 && (
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
                        selectedSolutionName={wizardState.selectedSolution?.name}
                        contentBrief={wizardState.contentBrief}
                        onContentBriefChange={(brief) => updateState({ contentBrief: brief })}
                        additionalInstructions={wizardState.additionalInstructions}
                        onAdditionalInstructionsChange={(inst) => updateState({ additionalInstructions: inst })}
                      />
                    )}
                    {((quick && currentStep === 1) || (!quick && currentStep === 4)) && (
                      <WizardStepGenerate
                        wizardState={wizardState}
                        onMetaChange={(title, desc) => updateState({ metaTitle: title, metaDescription: desc })}
                        onContentGenerated={(content) => updateState({ generatedContent: content })}
                        onTitleChange={(title) => updateState({ title })}
                        onClose={onClose}
                        onRepurpose={handleRepurpose}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </ScrollArea>

            {/* Footer Navigation */}
            {currentStep < maxStep && (
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