
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
      transition: { duration: 0.3, ease: "easeOut" as const }
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
            <TabsList className="grid w-full grid-cols-4 mb-4 flex-shrink-0">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                Basic Info
              </TabsTrigger>
              <TabsTrigger value="features" className="flex items-center gap-2">
                Features
              </TabsTrigger>
              <TabsTrigger value="resources" className="flex items-center gap-2">
                Resources
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2">
                Preview
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
                  
                  <TabsContent value="preview" className="mt-0">
                    <PreviewTab
                      formData={formData}
                      logoPreview={logoPreview}
                    />
                  </TabsContent>
                </motion.div>
              </AnimatePresence>
            </div>
          </Tabs>
        </div>
        
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
