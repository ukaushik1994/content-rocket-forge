
import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Loader2, 
  Save, 
  X, 
  AlertCircle, 
  MoreHorizontal, 
  Navigation, 
  Copy, 
  Download, 
  RotateCcw, 
  Zap,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';
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
import { AutoSaveStatus } from './AutoSaveStatus';

interface EnhancedSolutionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any, logoFile?: File) => void;
  solution?: EnhancedSolution | null;
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
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);
  const [autoSaveError, setAutoSaveError] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
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
            const initialData: Partial<EnhancedSolution> = {
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
            
            resetForm(initialData);
            setLogoPreview(freshData.logoUrl || null);
          } else {
            setSaveError('Failed to load solution data');
          }
        } else {
          // New solution - start with empty form
          const initialData: Partial<EnhancedSolution> = {
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
  }, [open, solution?.id, resetForm]);

  // Auto-save functionality
  const performAutoSave = useCallback(async () => {
    if (!isDirty || !formData.name?.trim() || !solution?.id || isSubmitting) return;
    
    try {
      setIsAutoSaving(true);
      setAutoSaveError(false);
      
      const solutionData = {
        name: formData.name!,
        description: formData.description || '',
        category: formData.category!,
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
      console.log('Benefits in formData:', formData.benefits);

      // Transform data for service
      const solutionData = {
        name: formData.name!,
        description: formData.description || '',
        category: formData.category!,
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

  // Tab data for navigation
  const tabData = [
    { value: 'basic', label: 'Overview', isComplete: !!(formData.name && formData.description) },
    { value: 'features', label: 'Features', isComplete: !!(formData.features?.length || formData.benefits?.length) },
    { value: 'market', label: 'Market', isComplete: !!(formData.marketData && Object.keys(formData.marketData).length) },
    { value: 'technical', label: 'Technical', isComplete: !!(formData.technicalSpecs && Object.keys(formData.technicalSpecs).length) },
    { value: 'pricing', label: 'Pricing', isComplete: !!(formData.pricing?.tiers?.length) },
    { value: 'competitors', label: 'Competitors', isComplete: !!(formData.competitors?.length) },
    { value: 'cases', label: 'Case Studies', isComplete: !!(formData.caseStudies?.length) },
    { value: 'resources', label: 'Resources', isComplete: !!(formData.resources?.length) },
    { value: 'analytics', label: 'Analytics', isComplete: !!(formData.metrics && Object.keys(formData.metrics).length) },
    { value: 'preview', label: 'Preview', isComplete: true }
  ];

  const currentTabIndex = tabData.findIndex(tab => tab.value === activeTab);
  const completionPercentage = Math.round((tabData.filter(tab => tab.isComplete).length / tabData.length) * 100);

  // Handlers for enhanced functionality
  const handleQuickNavigate = (tabValue: string) => {
    setActiveTab(tabValue);
  };

  const handleDuplicate = () => {
    toast.success('Duplicate feature coming soon!');
  };

  const handleExportJSON = () => {
    const exportData = {
      ...formData,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formData.name || 'solution'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Solution exported to JSON!');
  };

  const handleResetForm = () => {
    if (confirm('Are you sure you want to reset all form data? This action cannot be undone.')) {
      resetForm();
      toast.success('Form reset successfully');
    }
  };

  const handleAutoFill = (type: string) => {
    toast.success(`Auto-fill ${type} feature coming soon!`);
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
      <DialogContent className="glass-panel sm:max-w-6xl max-h-[95vh] overflow-hidden flex flex-col animate-scale-in floating-particles">
        {/* Enhanced Header with Progress and Dropdowns */}
        <div className="flex-shrink-0 relative">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-neon-blue/5 to-neon-purple/5 animate-gradient-shift bg-300%" />
          
          <DialogHeader className="relative z-10 p-6 border-b border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3"
                >
                  <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-bold text-gradient">
                      {solution ? `Edit ${solution.name}` : 'Create New Solution'}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground mt-1">
                      {solution 
                        ? 'Enhance your business solution with powerful features'
                        : 'Build a comprehensive solution profile that drives results'}
                    </DialogDescription>
                  </div>
                </motion.div>
              </div>

              {/* Enhanced Action Buttons */}
              <div className="flex items-center gap-2">
                {/* Quick Navigation Dropdown */}
                <Select value={activeTab} onValueChange={handleQuickNavigate}>
                  <SelectTrigger className="w-[200px] glass-card border-white/20 hover:border-primary/30 transition-all">
                    <Navigation className="h-4 w-4 mr-2 text-primary" />
                    <SelectValue placeholder="Jump to section" />
                  </SelectTrigger>
                  <SelectContent className="glass-panel border-white/20 backdrop-blur-xl">
                    {tabData.map((tab) => (
                      <SelectItem key={tab.value} value={tab.value} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>{tab.label}</span>
                          {tab.isComplete && (
                            <CheckCircle2 className="h-3 w-3 text-green-400" />
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* More Actions Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="glass-card border-white/20 hover:border-primary/30">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="glass-panel border-white/20 backdrop-blur-xl w-56">
                    <DropdownMenuLabel className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      Quick Actions
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/10" />
                    
                    <DropdownMenuItem onClick={handleExportJSON} className="hover:bg-white/10">
                      <Download className="h-4 w-4 mr-2" />
                      Export JSON
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem onClick={handleDuplicate} className="hover:bg-white/10">
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate Solution
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator className="bg-white/10" />
                    
                    <DropdownMenuItem onClick={() => handleAutoFill('template')} className="hover:bg-white/10">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Auto-fill from Template
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem onClick={handleResetForm} className="hover:bg-red-500/10 text-red-400">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset Form
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Close Button */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleClose}
                  className="hover:bg-red-500/20 hover:text-red-400"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Progress Indicator */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Completion Progress
                </span>
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  {completionPercentage}% Complete
                </Badge>
              </div>
              <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPercentage}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-primary to-neon-blue rounded-full"
                />
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                Step {currentTabIndex + 1} of {tabData.length}
              </div>
            </motion.div>
          </DialogHeader>
        </div>
        
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
              {/* Enhanced Tab Navigation */}
              <div className="flex-shrink-0 space-y-3 mb-6">
                <div className="relative p-1 glass-card rounded-lg border-white/10">
                  <div className="grid grid-cols-5 gap-1">
                    {tabData.slice(0, 5).map((tab) => (
                      <motion.button
                        key={tab.value}
                        onClick={() => setActiveTab(tab.value)}
                        className={`relative px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                          activeTab === tab.value
                            ? 'text-primary bg-primary/10 border border-primary/20'
                            : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <span>{tab.label}</span>
                          {tab.isComplete && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-2 h-2 bg-green-400 rounded-full"
                            />
                          )}
                        </div>
                        {activeTab === tab.value && (
                          <motion.div
                            layoutId="activeTab1"
                            className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-md"
                            initial={false}
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>
                
                <div className="relative p-1 glass-card rounded-lg border-white/10">
                  <div className="grid grid-cols-5 gap-1">
                    {tabData.slice(5).map((tab) => (
                      <motion.button
                        key={tab.value}
                        onClick={() => setActiveTab(tab.value)}
                        className={`relative px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                          activeTab === tab.value
                            ? 'text-primary bg-primary/10 border border-primary/20'
                            : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <span>{tab.label}</span>
                          {tab.isComplete && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-2 h-2 bg-green-400 rounded-full"
                            />
                          )}
                        </div>
                        {activeTab === tab.value && (
                          <motion.div
                            layoutId="activeTab2"
                            className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-md"
                            initial={false}
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            
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
                    <MarketDataTab formData={formData} updateFormData={updateFormData} />
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
          )}
        </div>
        
        {/* Enhanced Error Display */}
        {saveError && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-shrink-0 glass-card border border-destructive/30 p-4 mx-6 mb-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-1 rounded-full bg-destructive/20">
                <AlertCircle className="h-4 w-4 text-destructive" />
              </div>
              <div>
                <p className="text-sm font-medium text-destructive">Save Failed</p>
                <p className="text-xs text-destructive/80 mt-1">{saveError}</p>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Enhanced Footer with Navigation & Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-shrink-0 glass-card border-t border-white/10 p-6"
        >
          <div className="flex items-center justify-between">
            {/* Left: Status & Navigation */}
            <div className="flex items-center gap-6">
              {/* Status Indicators */}
              <div className="flex items-center gap-4">
                {isDirty && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20"
                  >
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                    <span className="text-xs text-amber-500 font-medium">Unsaved changes</span>
                  </motion.div>
                )}
                
                {solution?.id && (
                  <AutoSaveStatus
                    isAutoSaving={isAutoSaving}
                    lastAutoSave={lastAutoSave}
                    hasError={autoSaveError}
                    className="border border-white/10"
                  />
                )}
              </div>

              {/* Quick Navigation */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const prevTab = tabData[currentTabIndex - 1];
                    if (prevTab) setActiveTab(prevTab.value);
                  }}
                  disabled={currentTabIndex === 0}
                  className="glass-card border-white/10 hover:border-primary/30"
                >
                  <ArrowRight className="h-3 w-3 rotate-180" />
                </Button>
                
                <span className="text-xs text-muted-foreground px-2">
                  {currentTabIndex + 1} / {tabData.length}
                </span>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const nextTab = tabData[currentTabIndex + 1];
                    if (nextTab) setActiveTab(nextTab.value);
                  }}
                  disabled={currentTabIndex === tabData.length - 1}
                  className="glass-card border-white/10 hover:border-primary/30"
                >
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            {/* Right: Action Buttons */}
            <div className="flex items-center gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={isSubmitting}
                className="glass-card border-white/20 hover:border-white/30"
              >
                Cancel
              </Button>
              
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting || isLoadingData || !formData.name?.trim()}
                  className="min-w-[140px] bg-gradient-to-r from-primary to-neon-blue hover:from-primary/90 hover:to-neon-blue/90 border-0 shadow-lg hover:shadow-primary/25"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Solution
                      <div className="ml-2 px-2 py-0.5 rounded-full bg-white/20 text-xs">
                        ⌘S
                      </div>
                    </>
                  )}
                </Button>
              </motion.div>
            </div>
          </div>
          
          {/* Progress Footer */}
          <div className="mt-4 pt-4 border-t border-white/5">
            <div className="flex items-center justify-center gap-1">
              {tabData.map((tab, index) => (
                <motion.button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`w-8 h-2 rounded-full transition-all duration-300 ${
                    index === currentTabIndex
                      ? 'bg-primary shadow-lg shadow-primary/50'
                      : tab.isComplete
                      ? 'bg-green-400/60 hover:bg-green-400/80'
                      : 'bg-muted/30 hover:bg-muted/50'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
