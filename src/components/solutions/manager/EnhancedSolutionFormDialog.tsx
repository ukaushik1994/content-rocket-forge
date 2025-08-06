
import React, { useState, useEffect } from 'react';
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
import { Loader2, Save, X, AlertCircle } from 'lucide-react';
import { Solution } from '@/contexts/content-builder/types';
import { EnhancedSolution, EnhancedSolutionResource } from '@/contexts/content-builder/types/enhanced-solution-types';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useFormPersistence } from '@/hooks/useFormPersistence';
import { BasicInfoTab } from './tabs/BasicInfoTab';
import { FeaturesTab } from './tabs/FeaturesTab';
import { ResourcesTab } from './tabs/ResourcesTab';
import { PreviewTab } from './tabs/PreviewTab';
import { TargetMarketTab } from './tabs/TargetMarketTab';
import { CompetitiveAnalysisTab } from './tabs/CompetitiveAnalysisTab';
import { TechnicalSpecsTab } from './tabs/TechnicalSpecsTab';
import { PricingTab } from './tabs/PricingTab';
import { CaseStudiesTab } from './tabs/CaseStudiesTab';
import { AnalyticsTab } from './tabs/AnalyticsTab';
import { solutionService } from '@/services/solutionService';

interface EnhancedSolutionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any, logoFile?: File) => void;
  solution?: Solution | null;
  isSubmitting?: boolean;
}

export const EnhancedSolutionFormDialog: React.FC<EnhancedSolutionFormDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  solution,
  isSubmitting = false
}) => {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // Use persistent form hook
  const {
    formData,
    activeTab,
    isDirty,
    setActiveTab,
    updateFormData,
    clearPersistedData,
    initializeFormData
  } = useFormPersistence({ 
    key: solution?.id || 'new-solution',
    autoSaveInterval: 10000 // 10 seconds
  });

  // Initialize form data when dialog opens or solution changes
  useEffect(() => {
    if (open) {
      const initialData: Partial<EnhancedSolution> = {
        name: solution?.name || '',
        description: solution?.description || '',
        category: solution?.category || 'Business Solution',
        features: solution?.features || [],
        useCases: solution?.useCases || [],
        painPoints: solution?.painPoints || [],
        targetAudience: solution?.targetAudience || [],
        externalUrl: solution?.externalUrl || '',
        resources: solution?.resources?.map((r, index) => ({
          id: `resource-${index}`,
          title: r.title,
          url: r.url,
          category: 'other' as const,
          order: index,
          isValidated: false
        })) || [],
        shortDescription: '',
        benefits: [],
        tags: [],
      };
      
      initializeFormData(initialData);
      setLogoPreview(solution?.logoUrl || null);
      setLogoFile(null);
      setSaveError(null);
      // Don't reset activeTab to preserve user's last position
    }
  }, [open, solution, initializeFormData]);

  // updateFormData is now provided by useFormPersistence hook

  const handleSubmit = async () => {
    setSaveError(null);
    
    if (!formData.name?.trim()) {
      setSaveError("Solution name is required");
      return;
    }

    console.log('EnhancedSolutionFormDialog: handleSubmit called with formData:', formData);

    try {
      // Transform enhanced form data to database format
      const transformedData = {
        name: formData.name,
        description: formData.description || '',
        short_description: formData.shortDescription || '',
        category: formData.category || 'Business Solution',
        external_url: formData.externalUrl || null,
        features: formData.features || [],
        use_cases: formData.useCases || [],
        pain_points: formData.painPoints || [],
        target_audience: formData.targetAudience || [],
        benefits: formData.benefits || [],
        tags: formData.tags || [],
        unique_value_propositions: formData.uniqueValuePropositions || [],
        positioning_statement: formData.positioningStatement || '',
        key_differentiators: formData.keyDifferentiators || [],
        market_data: formData.marketData || null,
        competitors: formData.competitors || [],
        technical_specs: formData.technicalSpecs || null,
        pricing_model: formData.pricing || null,
        case_studies: formData.caseStudies || [],
        metrics: formData.metrics || null,
        resources: formData.resources?.map((r, index) => ({
          id: r.id || `resource-${Date.now()}-${index}`,
          title: r.title,
          url: r.url,
          category: r.category,
          order: r.order || index
        })) || [],
        metadata: formData.metadata || null
      };

      console.log('EnhancedSolutionFormDialog: Transformed data:', transformedData);

      // Validate the transformed data
      const validation = solutionService.validateSolutionData(transformedData);
      if (!validation.isValid) {
        console.error('EnhancedSolutionFormDialog: Validation failed:', validation.errors);
        setSaveError(validation.errors.join(', '));
        validation.errors.forEach(error => toast.error(error));
        return;
      }

      console.log('EnhancedSolutionFormDialog: Data validation passed, calling onSubmit');
      
      // Call the parent's onSubmit callback with the transformed data
      if (typeof onSubmit === 'function') {
        await onSubmit(transformedData, logoFile || undefined);
        // Success: clear persisted data and close dialog
        clearPersistedData();
        setSaveError(null);
        onOpenChange(false);
      } else {
        console.warn('onSubmit is not a function:', onSubmit);
        setSaveError("Form submission error - invalid callback");
      }
    } catch (error) {
      console.error("EnhancedSolutionFormDialog: Error submitting solution:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      setSaveError(errorMessage);
      toast.error(`Error saving solution: ${errorMessage}`);
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
    clearPersistedData();
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
      <DialogContent className="glass-panel sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl">
            {solution ? `Edit ${solution.name}` : 'Add New Solution'}
          </DialogTitle>
          <DialogDescription>
            {solution 
              ? 'Update your business solution details below.'
              : 'Create a comprehensive profile for your business solution.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-5 mb-4 flex-shrink-0">
              <TabsTrigger value="basic">Overview</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="market">Market</TabsTrigger>
              <TabsTrigger value="technical">Technical</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
            </TabsList>
            <TabsList className="grid w-full grid-cols-5 mb-4 flex-shrink-0">
              <TabsTrigger value="competitors">Competitors</TabsTrigger>
              <TabsTrigger value="cases">Case Studies</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  variants={tabVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
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
                    <TargetMarketTab formData={formData} updateFormData={updateFormData} />
                  </TabsContent>
                  
                  <TabsContent value="technical" className="mt-0">
                    <TechnicalSpecsTab formData={formData} updateFormData={updateFormData} />
                  </TabsContent>
                  
                  <TabsContent value="pricing" className="mt-0">
                    <PricingTab formData={formData} updateFormData={updateFormData} />
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
            </div>
          </Tabs>
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
        <div className="flex-shrink-0 flex justify-between items-center pt-4 border-t border-border/50">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {isDirty && (
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                Unsaved changes
              </span>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || !formData.name?.trim()}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {solution ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {solution ? 'Update Solution' : 'Create Solution'}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
