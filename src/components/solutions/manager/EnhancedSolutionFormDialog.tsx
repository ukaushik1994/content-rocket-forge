
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
import { Loader2, Save, X } from 'lucide-react';
import { Solution } from '@/contexts/content-builder/types';
import { EnhancedSolution, EnhancedSolutionResource } from '@/contexts/content-builder/types/enhanced-solution-types';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
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
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState<Partial<EnhancedSolution>>({});
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

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
      
      setFormData(initialData);
      setLogoPreview(solution?.logoUrl || null);
      setLogoFile(null);
      setIsDirty(false);
      setActiveTab('basic');
    }
  }, [open, solution]);

  const updateFormData = (updates: Partial<EnhancedSolution>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setIsDirty(true);
  };

  const handleSubmit = () => {
    // Validate required fields
    if (!formData.name?.trim()) {
      toast.error("Solution name is required");
      setActiveTab('basic');
      return;
    }

    // Convert enhanced data back to the expected format
    const submitData = {
      name: formData.name.trim(),
      category: formData.category || 'Business Solution',
      features: formData.features?.join(', ') || '',
      useCases: formData.useCases?.join(', ') || '',
      painPoints: formData.painPoints?.join(', ') || '',
      targetAudience: formData.targetAudience?.join(', ') || '',
      externalUrl: formData.externalUrl?.trim() || '',
      resources: formData.resources?.map(r => ({
        title: r.title,
        url: r.url
      })) || [],
    };

    onSubmit(submitData, logoFile || undefined);
  };

  const handleClose = () => {
    if (isDirty && !isSubmitting) {
      if (confirm('You have unsaved changes. Are you sure you want to close?')) {
        onOpenChange(false);
      }
    } else {
      onOpenChange(false);
    }
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
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <DialogContent className="card-glass relative sm:max-w-5xl max-h-[95vh] overflow-hidden flex flex-col bg-gradient-to-br from-background/95 via-background/90 to-background/95 backdrop-blur-xl border border-primary/20 shadow-2xl shadow-primary/10">
          {/* Floating Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-gradient-radial from-primary/5 to-transparent rounded-full blur-3xl" />
          </div>

          {/* Header with Enhanced Glass Effect */}
          <DialogHeader className="flex-shrink-0 relative z-10 p-6 bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-md border-b border-primary/20">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {solution ? `Edit ${solution.name}` : 'Add New Solution'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground/80 mt-2">
              {solution 
                ? 'Update your business solution details below.'
                : 'Create a comprehensive profile for your business solution.'}
            </DialogDescription>
            
            {/* Progress Indicator */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {['basic', 'features', 'market', 'technical', 'pricing', 'competitors', 'cases', 'resources', 'analytics', 'preview'].map((tab, index) => (
                    <div
                      key={tab}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        activeTab === tab
                          ? 'bg-primary shadow-lg shadow-primary/50'
                          : 'bg-muted-foreground/30'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground/60 ml-2">
                  Tab {['basic', 'features', 'market', 'technical', 'pricing', 'competitors', 'cases', 'resources', 'analytics', 'preview'].indexOf(activeTab) + 1} of 10
                </span>
              </div>
              
              {isDirty && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-xs text-amber-400"
                >
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                  Unsaved changes
                </motion.div>
              )}
            </div>
          </DialogHeader>
          
          {/* Main Content Area */}
          <div className="flex-1 overflow-hidden relative z-10">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              {/* Enhanced Tab Navigation */}
              <div className="flex-shrink-0 px-6 pt-4">
                <TabsList className="glass-card grid w-full grid-cols-5 p-1 bg-muted/30 backdrop-blur-sm border border-primary/10 rounded-xl mb-3">
                  <TabsTrigger 
                    value="basic" 
                    className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all duration-300 hover:bg-primary/10"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger 
                    value="features"
                    className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all duration-300 hover:bg-primary/10"
                  >
                    Features
                  </TabsTrigger>
                  <TabsTrigger 
                    value="market"
                    className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all duration-300 hover:bg-primary/10"
                  >
                    Market
                  </TabsTrigger>
                  <TabsTrigger 
                    value="technical"
                    className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all duration-300 hover:bg-primary/10"
                  >
                    Technical
                  </TabsTrigger>
                  <TabsTrigger 
                    value="pricing"
                    className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all duration-300 hover:bg-primary/10"
                  >
                    Pricing
                  </TabsTrigger>
                </TabsList>
                
                <TabsList className="glass-card grid w-full grid-cols-5 p-1 bg-muted/30 backdrop-blur-sm border border-primary/10 rounded-xl mb-4">
                  <TabsTrigger 
                    value="competitors"
                    className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all duration-300 hover:bg-primary/10"
                  >
                    Competitors
                  </TabsTrigger>
                  <TabsTrigger 
                    value="cases"
                    className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all duration-300 hover:bg-primary/10"
                  >
                    Case Studies
                  </TabsTrigger>
                  <TabsTrigger 
                    value="resources"
                    className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all duration-300 hover:bg-primary/10"
                  >
                    Resources
                  </TabsTrigger>
                  <TabsTrigger 
                    value="analytics"
                    className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all duration-300 hover:bg-primary/10"
                  >
                    Analytics
                  </TabsTrigger>
                  <TabsTrigger 
                    value="preview"
                    className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 transition-all duration-300 hover:bg-primary/10"
                  >
                    Preview
                  </TabsTrigger>
                </TabsList>
              </div>
              
              {/* Tab Content with Enhanced Scrolling */}
              <div className="flex-1 overflow-y-auto px-6 pb-4 custom-scrollbar">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    variants={tabVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="glass-card bg-background/40 backdrop-blur-sm border border-primary/10 rounded-xl p-6"
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
          
          {/* Enhanced Footer with Glass Effect */}
          <div className="flex-shrink-0 relative z-10 p-6 bg-gradient-to-r from-background/90 to-background/80 backdrop-blur-md border-t border-primary/20">
            <div className="flex justify-between items-center">
              <div className="text-xs text-muted-foreground/60">
                {Object.keys(formData).length > 3 && (
                  <span className="text-primary/80">
                    {Math.round((Object.values(formData).filter(v => v && (Array.isArray(v) ? v.length > 0 : v.toString().trim().length > 0)).length / 10) * 100)}% Complete
                  </span>
                )}
              </div>
              
              <div className="flex gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="glass-card bg-background/50 border-primary/20 hover:bg-primary/10 hover:border-primary/30 transition-all duration-300"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting || !formData.name?.trim()}
                  className="min-w-[140px] bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25 transition-all duration-300"
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
          </div>
        </DialogContent>
      </motion.div>
    </Dialog>
  );
};
