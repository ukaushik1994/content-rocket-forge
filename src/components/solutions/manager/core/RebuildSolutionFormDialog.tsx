import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Loader2, Save, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Solution } from '@/contexts/content-builder/types';
import { EnhancedSolution } from '@/contexts/content-builder/types/enhanced-solution-types';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useSolutionFormState } from './SolutionFormState';
import { solutionDataService } from './SolutionDataService';

// Import all tab components
import { EnhancedBasicInfoTab } from '../tabs/EnhancedBasicInfoTab';
import { FeaturesTab } from '../tabs/FeaturesTab';
import { ResourcesTab } from '../tabs/ResourcesTab';
import { PreviewTab } from '../tabs/PreviewTab';
import { FormProgressIndicator } from '../components/FormProgressIndicator';
import { TargetMarketTab } from '../tabs/TargetMarketTab';
import { CompetitiveAnalysisTab } from '../tabs/CompetitiveAnalysisTab';
import { TechnicalSpecsTab } from '../tabs/TechnicalSpecsTab';
import { PricingTab } from '../tabs/PricingTab';
import { CaseStudiesTab } from '../tabs/CaseStudiesTab';
import { AnalyticsTab } from '../tabs/AnalyticsTab';

interface RebuildSolutionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  solution?: Solution | null;
}

export const RebuildSolutionFormDialog: React.FC<RebuildSolutionFormDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
  solution
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Initialize form state with enhanced state management
  const [formState, formActions] = useSolutionFormState({
    key: solution?.id || 'new-solution',
    autoSaveInterval: 8000, // Auto-save every 8 seconds
    enablePersistence: true
  });

  // Initialize form data when dialog opens or solution changes
  useEffect(() => {
    if (open) {
      const initialData: Partial<EnhancedSolution> = solution ? {
        name: solution.name,
        description: solution.description,
        category: solution.category,
        features: solution.features,
        useCases: solution.useCases,
        painPoints: solution.painPoints,
        targetAudience: solution.targetAudience,
        externalUrl: solution.externalUrl,
        resources: solution.resources?.map((r, index) => ({
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
      } : {
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
      
      formActions.resetForm(initialData);
      setLogoPreview(solution?.logoUrl || null);
      setLogoFile(null);
      setSaveError(null);
    }
  }, [open, solution, formActions]);

  const handleSubmit = async () => {
    setSaveError(null);
    formActions.clearErrors();
    
    if (!formState.data.name?.trim()) {
      setSaveError("Solution name is required");
      formActions.setError('name', 'Solution name is required');
      toast.error("Solution name is required");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Submitting solution with data:', formState.data);

      let result;
      if (solution?.id) {
        // Update existing solution
        result = await solutionDataService.updateSolution(solution.id, formState.data, logoFile || undefined);
      } else {
        // Create new solution
        result = await solutionDataService.createSolution(formState.data as any, logoFile || undefined);
      }

      if (result.success) {
        // Mark form as clean and show success
        formActions.markClean();
        setSaveError(null);
        
        const action = solution ? 'updated' : 'created';
        toast.success(`Solution ${action} successfully!`);
        
        // Notify parent of success
        onSuccess();
        
        // Close dialog
        onOpenChange(false);
      } else {
        throw new Error(result.error || 'Save operation failed');
      }
    } catch (error) {
      console.error("Error submitting solution:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      setSaveError(errorMessage);
      toast.error(`Error saving solution: ${errorMessage}`);
      // Dialog stays open for retry
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Check for unsaved changes
    if (formState.isDirty && !isSubmitting) {
      if (!confirm('You have unsaved changes. Are you sure you want to close?')) {
        return;
      }
    }
    
    // Clear any save errors
    setSaveError(null);
    formActions.clearErrors();
    
    // Close dialog
    onOpenChange(false);
  };

  const tabVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      y: -20,
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
          <DialogTitle className="text-xl flex items-center gap-2">
            {solution ? `Edit ${solution.name}` : 'Create New Solution'}
            {formState.lastSaved && (
              <span className="text-xs text-muted-foreground font-normal flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Saved {formState.lastSaved.toLocaleTimeString()}
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            {solution 
              ? 'Update your business solution details below. Changes are auto-saved.'
              : 'Create a comprehensive profile for your business solution. Progress is auto-saved.'}
          </DialogDescription>
        </DialogHeader>
        
        {/* Progress Indicator */}
        <div className="mb-4">
          <FormProgressIndicator
            formData={formState.data}
            currentTab={formState.activeTab}
            lastSaved={formState.lastSaved}
            isDirty={formState.isDirty}
            hasErrors={Object.keys(formState.errors).length > 0}
          />
        </div>
        
        <div className="flex-1 overflow-hidden">
          <Tabs 
            value={formState.activeTab} 
            onValueChange={formActions.setActiveTab} 
            className="h-full flex flex-col"
          >
            <TabsList className="grid w-full grid-cols-5 mb-4 flex-shrink-0">
              <TabsTrigger value="basic" className="relative">
                Overview
                {formState.errors.name && (
                  <AlertCircle className="h-3 w-3 text-destructive absolute -top-1 -right-1" />
                )}
              </TabsTrigger>
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
                  key={formState.activeTab}
                  variants={tabVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <TabsContent value="basic" className="mt-0">
                    <EnhancedBasicInfoTab
                      formData={formState.data}
                      updateFormData={formActions.updateData}
                      errors={formState.errors}
                      onFieldFocus={(field) => formActions.clearError(field)}
                    />
                  </TabsContent>
                  
                  <TabsContent value="features" className="mt-0">
                    <FeaturesTab
                      formData={formState.data}
                      updateFormData={formActions.updateData}
                    />
                  </TabsContent>
                  
                  <TabsContent value="resources" className="mt-0">
                    <ResourcesTab
                      formData={formState.data}
                      updateFormData={formActions.updateData}
                    />
                  </TabsContent>
                  
                  <TabsContent value="market" className="mt-0">
                    <TargetMarketTab 
                      formData={formState.data} 
                      updateFormData={formActions.updateData} 
                    />
                  </TabsContent>
                  
                  <TabsContent value="technical" className="mt-0">
                    <TechnicalSpecsTab 
                      formData={formState.data} 
                      updateFormData={formActions.updateData} 
                    />
                  </TabsContent>
                  
                  <TabsContent value="pricing" className="mt-0">
                    <PricingTab 
                      formData={formState.data} 
                      updateFormData={formActions.updateData} 
                    />
                  </TabsContent>
                  
                  <TabsContent value="competitors" className="mt-0">
                    <CompetitiveAnalysisTab 
                      formData={formState.data} 
                      updateFormData={formActions.updateData} 
                    />
                  </TabsContent>
                  
                  <TabsContent value="cases" className="mt-0">
                    <CaseStudiesTab 
                      formData={formState.data} 
                      updateFormData={formActions.updateData} 
                    />
                  </TabsContent>
                  
                  <TabsContent value="analytics" className="mt-0">
                    <AnalyticsTab 
                      formData={formState.data} 
                      updateFormData={formActions.updateData} 
                    />
                  </TabsContent>
                  
                  <TabsContent value="preview" className="mt-0">
                    <PreviewTab 
                      formData={formState.data} 
                      logoPreview={logoPreview} 
                    />
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
        
        {/* Footer with Status and Actions */}
        <div className="flex-shrink-0 flex justify-between items-center pt-4 border-t border-border/50">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {formState.isDirty && (
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                Unsaved changes
              </span>
            )}
            
            {formState.lastSaved && !formState.isDirty && (
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle className="h-3 w-3" />
                Auto-saved
              </span>
            )}
            
            {!formState.isValid && Object.keys(formState.errors).length > 0 && (
              <span className="flex items-center gap-1 text-destructive">
                <AlertCircle className="h-3 w-3" />
                {Object.keys(formState.errors).length} error(s)
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
              disabled={isSubmitting || !formState.data.name?.trim()}
              className="min-w-[140px]"
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