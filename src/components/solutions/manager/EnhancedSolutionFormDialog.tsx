
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
import { useSimpleFormState } from '@/hooks/useSimpleFormState';
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
  isSubmitting: parentIsSubmitting = false
}) => {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

  // Initialize form data when dialog opens or solution changes
  useEffect(() => {
    if (open) {
      const initialData: Partial<EnhancedSolution> = {
        id: solution?.id,
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
      
      resetForm(initialData);
      setLogoPreview(solution?.logoUrl || null);
      setLogoFile(null);
      setSaveError(null);
    }
  }, [open, solution, resetForm]);

  // updateFormData is now provided by useFormPersistence hook

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

      console.log('Submitting solution data:', formData);

      // Transform data for service
      const solutionData = {
        name: formData.name!,
        description: formData.description || '',
        category: formData.category!,
        features: formData.features || [],
        useCases: formData.useCases || [],
        painPoints: formData.painPoints || [],
        targetAudience: formData.targetAudience || [],
        externalUrl: formData.externalUrl || null,
        resources: formData.resources || [],
        shortDescription: formData.shortDescription,
        benefits: formData.benefits,
        tags: formData.tags,
        marketData: formData.marketData,
        competitors: formData.competitors,
        technicalSpecs: formData.technicalSpecs,
        pricing: formData.pricing,
        caseStudies: formData.caseStudies,
        metrics: formData.metrics,
        uniqueValuePropositions: formData.uniqueValuePropositions,
        positioningStatement: formData.positioningStatement,
        keyDifferentiators: formData.keyDifferentiators,
        metadata: formData.metadata
      };

      // Direct save to database via service
      if (solution?.id) {
        await solutionService.updateSolution(solution.id, solutionData, logoFile || undefined);
        toast.success('Solution updated successfully!');
      } else {
        await solutionService.createSolution(solutionData, logoFile || undefined);
        toast.success('Solution created successfully!');
      }
      
      // Clear dirty state and close dialog
      clearDirty();
      onOpenChange(false);
      
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
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden bg-background/95 backdrop-blur-xl border border-border/50 shadow-2xl z-50 flex flex-col">
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse-glow"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }}></div>
        </div>

        <DialogHeader className="flex-shrink-0 relative z-10">
          <DialogTitle className="flex items-center justify-between">
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="p-2 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-lg backdrop-blur-sm border border-white/10">
                <Save className="h-6 w-6 text-primary animate-pulse" />
              </div>
              <div>
                <div className="text-xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                  {solution ? `Edit ${solution.name}` : 'Create Solution'}
                </div>
                <div className="text-sm text-muted-foreground font-mono">
                  {solution 
                    ? 'Update your business solution details'
                    : 'Build a comprehensive solution profile'}
                </div>
              </div>
            </motion.div>
            
            {/* Progress Indicator */}
            <motion.div 
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {logoPreview && (
                <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-primary/20">
                  <img src={logoPreview} alt="Solution logo" className="w-full h-full object-cover" />
                </div>
              )}
              {isDirty && (
                <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-lg">
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                  <span className="text-xs text-amber-200 font-medium">Unsaved</span>
                </div>
              )}
            </motion.div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden relative z-10">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-5 bg-black/20 backdrop-blur-sm border border-white/10 p-1 rounded-xl mb-4 flex-shrink-0">
              <TabsTrigger 
                value="basic" 
                className="relative flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-white/10 data-[state=active]:to-white/5 data-[state=active]:border-white/20 transition-all duration-300 rounded-lg group"
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  Overview
                </motion.div>
              </TabsTrigger>
              <TabsTrigger 
                value="market" 
                className="relative flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-white/10 data-[state=active]:to-white/5 data-[state=active]:border-white/20 transition-all duration-300 rounded-lg group"
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Market Intelligence
                </motion.div>
              </TabsTrigger>
              <TabsTrigger 
                value="technical" 
                className="relative flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-white/10 data-[state=active]:to-white/5 data-[state=active]:border-white/20 transition-all duration-300 rounded-lg group"
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  Technical & Pricing
                </motion.div>
              </TabsTrigger>
              <TabsTrigger 
                value="cases" 
                className="relative flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-white/10 data-[state=active]:to-white/5 data-[state=active]:border-white/20 transition-all duration-300 rounded-lg group"
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  Case Studies & Analytics
                </motion.div>
              </TabsTrigger>
              <TabsTrigger 
                value="preview" 
                className="relative flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-white/10 data-[state=active]:to-white/5 data-[state=active]:border-white/20 transition-all duration-300 rounded-lg group"
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  Preview
                </motion.div>
              </TabsTrigger>
            </TabsList>
            
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  variants={tabVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-6"
                >
                  {/* Overview Tab - Combines Basic Info and Features */}
                  <TabsContent value="basic" className="mt-0 space-y-6">
                    <Card className="bg-background/50 backdrop-blur-sm border border-border/30">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                          Basic Information
                        </h3>
                        <BasicInfoTab
                          formData={formData}
                          updateFormData={updateFormData}
                          logoFile={logoFile}
                          setLogoFile={setLogoFile}
                          logoPreview={logoPreview}
                          setLogoPreview={setLogoPreview}
                        />
                      </CardContent>
                    </Card>
                    <Card className="bg-background/50 backdrop-blur-sm border border-border/30">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                          Features & Benefits
                        </h3>
                        <FeaturesTab
                          formData={formData}
                          updateFormData={updateFormData}
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  {/* Market Intelligence Tab - Combines Market and Competitors */}
                  <TabsContent value="market" className="mt-0 space-y-6">
                    <Card className="bg-background/50 backdrop-blur-sm border border-border/30">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                          Market Analysis
                        </h3>
                        <MarketDataTab formData={formData} updateFormData={updateFormData} />
                      </CardContent>
                    </Card>
                    <Card className="bg-background/50 backdrop-blur-sm border border-border/30">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                          Competitive Analysis
                        </h3>
                        <CompetitiveAnalysisTab formData={formData} updateFormData={updateFormData} />
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  {/* Technical & Pricing Tab */}
                  <TabsContent value="technical" className="mt-0 space-y-6">
                    <Card className="bg-background/50 backdrop-blur-sm border border-border/30">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                          Technical Specifications
                        </h3>
                        <TechnicalSpecsTab formData={formData} updateFormData={updateFormData} />
                      </CardContent>
                    </Card>
                    <Card className="bg-background/50 backdrop-blur-sm border border-border/30">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">
                          Pricing Strategy
                        </h3>
                        <PricingTab formData={formData} updateFormData={updateFormData} />
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  {/* Case Studies & Analytics Tab */}
                  <TabsContent value="cases" className="mt-0 space-y-6">
                    <Card className="bg-background/50 backdrop-blur-sm border border-border/30">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                          Case Studies
                        </h3>
                        <CaseStudiesTab formData={formData} updateFormData={updateFormData} />
                      </CardContent>
                    </Card>
                    <Card className="bg-background/50 backdrop-blur-sm border border-border/30">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
                          Analytics & Metrics
                        </h3>
                        <AnalyticsTab formData={formData} updateFormData={updateFormData} />
                      </CardContent>
                    </Card>
                    <Card className="bg-background/50 backdrop-blur-sm border border-border/30">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                          Resources & Documentation
                        </h3>
                        <ResourcesTab
                          formData={formData}
                          updateFormData={updateFormData}
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  {/* Preview Tab */}
                  <TabsContent value="preview" className="mt-0">
                    <Card className="bg-background/50 backdrop-blur-sm border border-border/30">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
                          Solution Preview
                        </h3>
                        <PreviewTab formData={formData} logoPreview={logoPreview} />
                      </CardContent>
                    </Card>
                  </TabsContent>
                </motion.div>
              </AnimatePresence>
            </div>
          </Tabs>
        </div>
        
        {/* Error Display */}
        {saveError && (
          <motion.div 
            className="flex-shrink-0 p-4 bg-gradient-to-r from-destructive/20 to-red-500/20 border border-destructive/30 rounded-lg backdrop-blur-sm relative z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="flex items-center gap-3 text-sm text-destructive">
              <AlertCircle className="h-5 w-5 animate-pulse" />
              <div>
                <div className="font-medium">Save Error</div>
                <div className="text-destructive/80">{saveError}</div>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Footer Actions */}
        <div className="flex-shrink-0 flex justify-between items-center pt-6 border-t border-border/50 backdrop-blur-sm relative z-10">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-2 h-2 bg-primary/40 rounded-full" />
              <span className="font-mono text-xs">Auto-saved locally</span>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-6 bg-background/50 backdrop-blur-sm border-border/50 hover:bg-background/70 hover:border-border"
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || !formData.name?.trim()}
              className="min-w-[140px] px-6 bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 border-0 shadow-lg hover:shadow-primary/25 transition-all duration-300"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span className="animate-pulse">Saving...</span>
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Solution
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
