
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Save, X, AlertCircle, Wand2 } from 'lucide-react';
import { EnhancedSolution, EnhancedSolutionResource } from '@/contexts/content-builder/types/enhanced-solution-types';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { useSimpleFormState } from '@/hooks/useSimpleFormState';
import { supabase } from '@/integrations/supabase/client';
import { BasicInfoTab } from './tabs/BasicInfoTab';
import { FeaturesTab } from './tabs/FeaturesTab';
import { ResourcesTab } from './tabs/ResourcesTab';
import { PreviewTab } from './tabs/PreviewTab';
import { MarketDataTab } from './tabs/MarketDataTab';
import { CompetitiveAnalysisTab } from './tabs/CompetitiveAnalysisTab';
import { TechnicalSpecsTab } from './tabs/TechnicalSpecsTab';
import { PricingTab } from './tabs/PricingTab';
import { CaseStudiesTab } from './tabs/CaseStudiesTab';
import { AnalyticsTab } from './tabs/AnalyticsTab';
import { PersonasTab } from './tabs/PersonasTab';
import { solutionService } from '@/services/solutionService';
import { AutoSaveStatus } from './AutoSaveStatus';
import { AIAutofillOverlay } from '@/components/common/AIAutofillOverlay';
import { useAIServiceStatus } from '@/hooks/useAIServiceStatus';
interface EnhancedSolutionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any, logoFile?: File) => void;
  solution?: EnhancedSolution | null;
  prefilledData?: Partial<EnhancedSolution>;
  isSubmitting?: boolean;
  onMultipleSolutionsDetected?: (solutions: Partial<EnhancedSolution>[]) => void;
}

export const EnhancedSolutionFormDialog: React.FC<EnhancedSolutionFormDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  solution,
  prefilledData,
  isSubmitting: parentIsSubmitting = false,
  onMultipleSolutionsDetected
}) => {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);
  const [autoSaveError, setAutoSaveError] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isAIAutofillOpen, setIsAIAutofillOpen] = useState(false);
  const [aiProgress, setAiProgress] = useState(0);
  const [aiStage, setAiStage] = useState<string>('Preparing AI extraction…');
  
  // AI service status and cancellation
  const { isEnabled, hasProviders, activeProviders, refreshStatus } = useAIServiceStatus();
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  
  // Get userId from Supabase session
  const [userId, setUserId] = useState<string>('');
  
  useEffect(() => {
    const getUserId = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        setUserId(session.user.id);
      }
    };
    getUserId();
  }, []);
  
  // Use simple form state
  const {
    formData,
    activeTab,
    isDirty,
    setActiveTab,
    updateFormData,
    resetForm,
    clearDirty
  } = useSimpleFormState();

// Load solution data from backend when dialog opens
useEffect(() => {
  const loadSolutionData = async () => {
    if (!open) return;
    
    setIsLoadingData(true);
    setSaveError(null);
    
    try {
      if (solution?.id) {
        // Always fetch fresh data from backend for editing to ensure we have the latest saved data
        const freshData = await solutionService.getSolutionById(solution.id);
        if (freshData) {
          let initialData: Partial<EnhancedSolution> = {
            id: freshData.id,
            name: freshData.name || '',
            description: freshData.description || '',
            category: freshData.category || 'Business Solution',
            features: freshData.features || [],
            useCases: freshData.useCases || [],
            painPoints: freshData.painPoints || [],
            targetAudience: freshData.targetAudience || [],
            externalUrl: freshData.externalUrl || '',
            resources: freshData.resources || [],
            shortDescription: freshData.shortDescription || '',
            benefits: freshData.benefits || [],
            tags: freshData.tags || [],
            marketData: freshData.marketData || {},
            competitors: freshData.competitors || [],
            technicalSpecs: freshData.technicalSpecs || {},
            pricing: freshData.pricing || {
              model: 'subscription',
              tiers: []
            },
            caseStudies: freshData.caseStudies || [],
            metrics: freshData.metrics || {},
            uniqueValuePropositions: freshData.uniqueValuePropositions || [],
            positioningStatement: freshData.positioningStatement || '',
            keyDifferentiators: freshData.keyDifferentiators || [],
            metadata: freshData.metadata || {}
          };
          // Apply prefilled overrides if provided
          if (prefilledData) {
            initialData = { ...initialData, ...prefilledData };
          }
          resetForm(initialData);
          setLogoPreview(freshData.logoUrl || null);
        } else {
          setSaveError('Failed to load solution data');
        }
      } else {
        // New solution - start with empty form
        let initialData: Partial<EnhancedSolution> = {
          name: '',
          description: '',
          category: 'Business Solution',
          features: [],
          useCases: [],
          painPoints: [],
          targetAudience: [],
          externalUrl: '',
          resources: [],
          shortDescription: '',
          benefits: [],
          tags: [],
        };
        if (prefilledData) {
          initialData = { ...initialData, ...prefilledData };
        }
        resetForm(initialData);
        setLogoPreview(null);
      }
      
      setLogoFile(null);
    } catch (error) {
      console.error('Error loading solution data:', error);
      setSaveError('Failed to load solution data. Please refresh and try again.');
    } finally {
      setIsLoadingData(false);
    }
  };

  loadSolutionData();
}, [open, solution?.id, resetForm, prefilledData]);

  // Auto-save functionality
  const performAutoSave = useCallback(async () => {
    if (!isDirty || !formData.name?.trim() || !solution?.id || isSubmitting) return;
    
    try {
      setIsAutoSaving(true);
      setAutoSaveError(false);
      
      const categoryFinal = formData.category === 'Other'
        ? ((formData.metadata as any)?.customCategory?.trim() || 'Other')
        : formData.category!;
      
      const solutionData = {
        name: formData.name!,
        description: formData.description || '',
        category: categoryFinal,
        features: formData.features || [],
        use_cases: formData.useCases || [],
        pain_points: formData.painPoints || [],
        target_audience: formData.targetAudience || [],
        external_url: formData.externalUrl || null,
        resources: formData.resources || [],
        short_description: formData.shortDescription,
        benefits: formData.benefits || [],
        tags: formData.tags,
        market_data: formData.marketData,
        competitors: formData.competitors,
        technical_specs: formData.technicalSpecs,
        pricing_model: formData.pricing,
        case_studies: formData.caseStudies,
        metrics: formData.metrics,
        unique_value_propositions: formData.uniqueValuePropositions,
        positioning_statement: formData.positioningStatement,
        key_differentiators: formData.keyDifferentiators,
        metadata: formData.metadata
      };

      await onSubmit(solutionData);
      setLastAutoSave(new Date());
      clearDirty();
      console.log('Auto-saved solution data');
    } catch (error) {
      console.error('Auto-save failed:', error);
      setAutoSaveError(true);
    } finally {
      setIsAutoSaving(false);
    }
  }, [isDirty, formData, solution?.id, isSubmitting, clearDirty, onSubmit]);

  // Set up auto-save timer
  useEffect(() => {
    if (isDirty && solution?.id && formData.name?.trim()) {
      // Clear existing timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      // Set new timeout for 10 seconds
      autoSaveTimeoutRef.current = setTimeout(() => {
        performAutoSave();
      }, 10000);
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [isDirty, performAutoSave, solution?.id, formData.name]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // AI Autofill inside form
  const handleAutofillFromDoc = () => {
    if (isAIAutofillOpen) {
      toast.info('Autofill is already in progress.');
      return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        await refreshStatus();
        if (!isEnabled) {
          toast.error('AI service is disabled. Enable it in Settings.');
          return;
        }
        if (!hasProviders || activeProviders === 0) {
          toast.error('No AI providers configured. Add one in Settings.');
          return;
        }

        const { parseSolutionFromFile } = await import('@/services/solutionAutoFillFromFile');
        const controller = new AbortController();
        setAbortController(controller);
        setIsAIAutofillOpen(true);
        setAiProgress(0);
        setAiStage('Reading document…');

        const prefill = await parseSolutionFromFile(file, formData as EnhancedSolution, {
          onProgress: ({ stage, progress }) => {
            if (stage) setAiStage(stage);
            if (typeof progress === 'number') setAiProgress(progress);
          },
          signal: controller.signal,
        });

        const isMeaningful = !!(
          (prefill as any)?.name?.trim?.() ||
          (Array.isArray((prefill as any)?.features) && (prefill as any).features.length > 0) ||
          (Array.isArray((prefill as any)?.useCases) && (prefill as any).useCases.length > 0) ||
          (prefill as any)?.description?.trim?.()
        );

        if (!isMeaningful) {
          toast.info('No structured data could be extracted. Try a different document.');
        } else {
          // Merge prefill into form
          updateFormData({ ...(formData as any), ...(prefill as any) });
          toast.success('Autofill complete. Review the highlighted sections.');
        }
      } catch (e: any) {
        if (e?.message?.toLowerCase?.().includes('cancel')) {
          toast.info('Autofill cancelled');
        } else {
          console.error('Autofill failed', e);
          toast.error(e?.message || 'Failed to process file');
        }
      } finally {
        setIsAIAutofillOpen(false);
        setAbortController(null);
      }
    };
    input.click();
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setSaveError(null);

      // Validate required fields with specific error messages
      if (!formData.name?.trim()) {
        setSaveError('Solution name is required');
        return;
      }

      if (!formData.category?.trim()) {
        setSaveError('Solution category is required');
        return;
      }

      // If user selected Other, require a custom category
      if (formData.category === 'Other' && !((formData.metadata as any)?.customCategory?.trim())) {
        setSaveError('Please specify a custom category.');
        return;
      }

      console.log('Submitting solution data:', formData);
      console.log('Benefits in formData:', formData.benefits);

      // Transform data for service
      const categoryFinal = formData.category === 'Other'
        ? ((formData.metadata as any)?.customCategory?.trim() || 'Other')
        : formData.category!;
      const solutionData = {
        name: formData.name!,
        description: formData.description || '',
        category: categoryFinal,
        features: formData.features || [],
        use_cases: formData.useCases || [],
        pain_points: formData.painPoints || [],
        target_audience: formData.targetAudience || [],
        external_url: formData.externalUrl || null,
        resources: formData.resources || [],
        short_description: formData.shortDescription,
        benefits: formData.benefits || [],
        tags: formData.tags,
        market_data: formData.marketData,
        competitors: formData.competitors,
        technical_specs: formData.technicalSpecs,
        pricing_model: formData.pricing,
        case_studies: formData.caseStudies,
        metrics: formData.metrics,
        unique_value_propositions: formData.uniqueValuePropositions,
        positioning_statement: formData.positioningStatement,
        key_differentiators: formData.keyDifferentiators,
        metadata: formData.metadata
      };

      console.log('Transformed solution data for service:', solutionData);
      console.log('Benefits in solutionData:', solutionData.benefits);

      // Use parent's onSubmit function instead of calling service directly
      await onSubmit(solutionData, logoFile || undefined);
      
      console.log('Save completed successfully');
      
      // Clear dirty state and close dialog
      clearDirty();
      // keep dialog open after save
      
    } catch (error) {
      console.error('Form submission error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save solution. Please try again.';
      setSaveError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Prevent closing if there's a save error and user hasn't acknowledged it
    if (saveError) {
      if (!confirm('There was an error saving your changes. Do you want to close anyway and lose your changes?')) {
        return; // Stay open if user wants to retry
      }
    }
    
    // Check for unsaved changes
    if (isDirty && !isSubmitting) {
      if (!confirm('You have unsaved changes. Are you sure you want to close?')) {
        return; // Stay open if user wants to keep editing
      }
    }
    
    // Clear data and close
    clearDirty();
    setSaveError(null);
    onOpenChange(false);
  };

  const tabVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.3, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      x: -20,
      transition: { duration: 0.2 }
    }
  };

  const missingInfo = useMemo(() => {
    const items: { key: string; label: string; tab: string }[] = [];
    if (!formData.name?.trim()) items.push({ key: 'name', label: 'Name', tab: 'basic' });
    if (!formData.description?.trim()) items.push({ key: 'description', label: 'Description', tab: 'basic' });
    if (!formData.category?.trim()) items.push({ key: 'category', label: 'Category', tab: 'basic' });
    if (!formData.features || (Array.isArray(formData.features) && formData.features.length === 0)) items.push({ key: 'features', label: 'At least 1 Feature', tab: 'features' });
    if (!formData.useCases || (Array.isArray(formData.useCases) && formData.useCases.length === 0)) items.push({ key: 'useCases', label: 'At least 1 Use case', tab: 'features' });
    return items;
  }, [formData]);

  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          handleClose();
        } else {
          onOpenChange(newOpen);
        }
      }}
    >
        <DialogContent className="glass-panel sm:max-w-6xl max-h-[95vh] overflow-hidden flex flex-col shadow-neon rounded-xl">
        <DialogHeader className="sticky top-0 z-10 bg-background/60 backdrop-blur-sm border-b border-border/50">
          <DialogTitle className="text-xl">
            {solution ? `Edit ${solution.name}` : 'Add New Solution'}
          </DialogTitle>
          <DialogDescription>
            {solution 
              ? 'Update your business solution details below.'
              : 'Create a comprehensive profile for your business solution.'}
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-between mb-2">
          <div />
          <div className="flex items-center gap-2">
            {formData.externalUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  if (!formData.externalUrl) {
                    toast.error('Please enter a website URL first');
                    return;
                  }
                  
                  // Validate URL format
                  try {
                    new URL(formData.externalUrl);
                  } catch {
                    toast.error('Please enter a valid website URL');
                    return;
                  }
                  
                  try {
                    setIsAIAutofillOpen(true);
                    setAiProgress(10);
                    setAiStage('Analyzing website...');
                    
                    const { autoFillFromWebsite } = await import('@/services/solutionIntelService');
                    const result = await autoFillFromWebsite(formData.externalUrl, userId);
                    
                    if (!result) {
                      throw new Error('Failed to analyze website');
                    }
                    
                    setAiProgress(100);
                    
                    // Handle multiple solutions detected
                    if (result.multipleDetected && result.solutions.length > 1) {
                      toast.info(`${result.solutions.length} solutions detected! Select which to add...`);
                      onOpenChange(false); // Close form dialog
                      onMultipleSolutionsDetected?.(result.solutions); // Trigger picker in parent
                      return;
                    }
                    
                    // Single solution: auto-fill the form
                    if (result.solutions.length > 0) {
                      const solutionData = result.solutions[0];
                      updateFormData({ ...formData, ...solutionData });
                      
                      const cacheMsg = result.diagnostics.cache_hit ? ' (from cache)' : '';
                      toast.success(`Solution data auto-filled successfully!${cacheMsg}`);
                    } else {
                      toast.warning('No solution data detected on this website');
                    }
                  } catch (error: any) {
                    console.error('Auto-fill error:', error);
                    
                    // Specific error handling
                    if (error.message?.includes('rate limit')) {
                      toast.error('Rate limit exceeded. Please try again in a moment.');
                    } else if (error.message?.includes('timeout')) {
                      toast.error('Request timed out. The website may be too large or slow to respond.');
                    } else if (error.message?.includes('unreachable')) {
                      toast.error('Website is unreachable. Please check the URL and try again.');
                    } else {
                      toast.error(error.message || 'Failed to auto-fill from website');
                    }
                  } finally {
                    setIsAIAutofillOpen(false);
                  }
                }}
                disabled={isAIAutofillOpen}
              >
                {isAIAutofillOpen ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Auto-fill from Website
                  </>
                )}
              </Button>
            )}
            <Button
              onClick={async () => {
                try {
                  await refreshStatus();
                  if (!isEnabled) {
                    toast.error('AI service is disabled. Enable it in Settings.');
                    return;
                  }
                  if (!hasProviders || activeProviders === 0) {
                    toast.error('No AI providers configured. Add one in Settings.');
                    return;
                  }
                  toast.success(`AI ready: ${activeProviders} provider(s) active`);
                } catch (e: any) {
                  toast.error(e?.message || 'Failed to check AI status');
                }
              }}
              variant="outline"
              disabled={isAIAutofillOpen}
            >
              Test AI connection
            </Button>
            <Button onClick={handleAutofillFromDoc} variant="outline" disabled={isAIAutofillOpen}>
              <Wand2 className="mr-2 h-4 w-4" />
              Autofill from document
            </Button>
          </div>
        </div>
        {missingInfo.length > 0 && (
          <div className="mb-3 rounded-lg border border-white/10 bg-background/20 backdrop-blur-sm p-3">
            <div className="text-sm mb-2">Missing information:</div>
            <div className="flex flex-wrap items-center gap-2">
              {missingInfo.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveTab(item.tab)}
                  className="px-2 py-1 text-xs rounded-md bg-background/40 border border-white/10 hover:bg-accent/30 transition-colors"
                >
                  {item.label}
                </button>
              ))}
              <div className="ml-auto">
                <Button size="sm" variant="secondary" onClick={handleSubmit}>Skip and Save</Button>
              </div>
            </div>
          </div>
        )}
        <div className="flex-1 overflow-hidden">
          {isLoadingData ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading solution data...</p>
              </div>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-5 mb-4 flex-shrink-0 bg-background/20 backdrop-blur-sm border border-white/10 rounded-lg">
              <TabsTrigger value="basic" className="data-[state=active]:bg-neon-purple/20">Overview</TabsTrigger>
              <TabsTrigger value="features" className="data-[state=active]:bg-neon-purple/20">Features</TabsTrigger>
              <TabsTrigger value="market" className="data-[state=active]:bg-neon-purple/20">Market</TabsTrigger>
              <TabsTrigger value="technical" className="data-[state=active]:bg-neon-purple/20">Technical</TabsTrigger>
              <TabsTrigger value="pricing" className="data-[state=active]:bg-neon-purple/20">Pricing</TabsTrigger>
            </TabsList>
            <TabsList className="grid w-full grid-cols-6 mb-4 flex-shrink-0">
              <TabsTrigger value="personas">Personas</TabsTrigger>
              <TabsTrigger value="competitors">Competitors</TabsTrigger>
              <TabsTrigger value="cases">Case Studies</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    variants={tabVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="p-1"
                  >
                  <TabsContent value="basic" className="mt-0">
                    <BasicInfoTab
                      formData={formData}
                      updateFormData={updateFormData}
                      logoFile={logoFile}
                      setLogoFile={setLogoFile}
                      logoPreview={logoPreview}
                      setLogoPreview={setLogoPreview}
                    />
                  </TabsContent>
                  
                  <TabsContent value="features" className="mt-0">
                    <FeaturesTab
                      formData={formData}
                      updateFormData={updateFormData}
                    />
                  </TabsContent>
                  
                  <TabsContent value="resources" className="mt-0">
                    <ResourcesTab
                      formData={formData}
                      updateFormData={updateFormData}
                    />
                  </TabsContent>
                  
                  <TabsContent value="market" className="mt-0">
                    <MarketDataTab formData={formData} updateFormData={updateFormData} />
                  </TabsContent>
                  
                  <TabsContent value="technical" className="mt-0">
                    <TechnicalSpecsTab formData={formData} updateFormData={updateFormData} />
                  </TabsContent>
                  
                  <TabsContent value="pricing" className="mt-0">
                    <PricingTab formData={formData} updateFormData={updateFormData} />
                  </TabsContent>
                  
                  <TabsContent value="personas" className="mt-0">
                    <PersonasTab formData={formData} updateFormData={updateFormData} />
                  </TabsContent>
                  
                  <TabsContent value="competitors" className="mt-0">
                    <CompetitiveAnalysisTab formData={formData} updateFormData={updateFormData} />
                  </TabsContent>
                  
                  <TabsContent value="cases" className="mt-0">
                    <CaseStudiesTab formData={formData} updateFormData={updateFormData} />
                  </TabsContent>
                  
                  <TabsContent value="analytics" className="mt-0">
                    <AnalyticsTab formData={formData} updateFormData={updateFormData} />
                  </TabsContent>
                  
                  <TabsContent value="preview" className="mt-0">
                    <PreviewTab formData={formData} logoPreview={logoPreview} />
                  </TabsContent>
                  </motion.div>
                </AnimatePresence>
              </ScrollArea>
            </div>
          </Tabs>
          )}
        </div>
        
        {/* Error Display */}
        {saveError && (
          <div className="flex-shrink-0 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {saveError}
            </div>
          </div>
        )}
        
        {/* Footer Actions */}
        <div className="flex-shrink-0 flex justify-between items-center pt-4 border-t border-border/50 bg-background/60 backdrop-blur-sm sticky bottom-0">
          <div className="flex items-center gap-4">
            {isDirty && (
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                Unsaved changes
              </span>
            )}
            {solution?.id && (
              <AutoSaveStatus
                isAutoSaving={isAutoSaving}
                lastAutoSave={lastAutoSave}
                hasError={autoSaveError}
              />
            )}
          </div>
          
          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Close
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || parentIsSubmitting || isLoadingData || !formData.name?.trim()}
              className="min-w-[120px] bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple hover:shadow-neon"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>
        <AIAutofillOverlay
          open={isAIAutofillOpen}
          progress={aiProgress}
          stage={aiStage}
          onCancel={() => {
            abortController?.abort();
            setIsAIAutofillOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
