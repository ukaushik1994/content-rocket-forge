import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { EnhancedSolution } from '@/contexts/content-builder/types/enhanced-solution-types';
import { EnhancedSolutionFormDialog } from './EnhancedSolutionFormDialog';
import { DeleteSolutionDialog } from './DeleteSolutionDialog';
import { useDeleteSolution } from './hooks/useDeleteSolution';
import { solutionService } from '@/services/solutionService';
import { EmptyState } from './EmptyState';
import { ErrorDisplay } from './ErrorDisplay';
import { LoadingState } from './LoadingState';
import { EnhancedSolutionGrid } from '../EnhancedSolutionGrid';
import { HeroSection } from '../HeroSection';
import { motion } from 'framer-motion';
import { AIAutofillOverlay } from '@/components/common/AIAutofillOverlay';
import { useAIServiceStatus } from '@/hooks/useAIServiceStatus';
import { MultiSolutionPickerDialog } from './MultiSolutionPickerDialog';

interface SolutionManagerProps {
  searchTerm: string;
}

export const SolutionManager: React.FC<SolutionManagerProps> = ({ searchTerm }) => {
  const [filterTerm, setFilterTerm] = useState(searchTerm);
  
  // Use enhanced solution service instead of basic hook
  const [solutions, setSolutions] = useState<EnhancedSolution[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  // Enhanced form state management
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSolution, setSelectedSolution] = useState<EnhancedSolution | null>(null);
  const [prefilledData, setPrefilledData] = useState<Partial<EnhancedSolution> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Multi-solution picker state
  const [detectedSolutions, setDetectedSolutions] = useState<Partial<EnhancedSolution>[]>([]);
  const [showSolutionPicker, setShowSolutionPicker] = useState(false);

  const handleMultipleSolutionsDetected = (solutions: Partial<EnhancedSolution>[]) => {
    setDetectedSolutions(solutions);
    setShowSolutionPicker(true);
  };

  // AI Autofill overlay state
  const [isAutofillOpen, setIsAutofillOpen] = useState(false);
  const [autofillProgress, setAutofillProgress] = useState(0);
  const [autofillStage, setAutofillStage] = useState<string>('Preparing…');
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const { isEnabled, hasProviders, activeProviders, refreshStatus } = useAIServiceStatus();

  const deleteHandler = useDeleteSolution({
    deleteSolution: async (id: string) => {
      const success = await solutionService.deleteSolution(id);
      if (success) {
        setSolutions(prev => prev.filter(s => s.id !== id));
        void fetchSolutions({ background: true });
      }
      return success;
    }
  });

  // Fetch solutions using enhanced service
  const fetchSolutions = async (options?: { background?: boolean }) => {
    const background = !!options?.background;
    if (background) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);
    try {
      console.log('Fetching solutions from enhanced service...');
      const solutionsData = await solutionService.getAllSolutions();
      console.log('Fetched solutions:', solutionsData);
      setSolutions(solutionsData);
    } catch (error: any) {
      console.error('Error fetching solutions:', error);
      setError(error.message || 'Failed to load solutions');
      toast.error('Failed to load solutions');
    } finally {
      if (background) {
        setIsRefreshing(false);
      } else {
        setIsLoading(false);
        if (isInitialLoading) setIsInitialLoading(false);
      }
    }
  };
  // Update local filter when search term changes
  useEffect(() => {
    setFilterTerm(searchTerm);
  }, [searchTerm]);
  
  useEffect(() => {
    fetchSolutions();
  }, []);

  // Filter solutions based on search term
  const filteredSolutions = solutions.filter(solution => {
    if (!filterTerm) return true;
    
    const searchLower = filterTerm.toLowerCase();
    
    // Search in name
    if (solution.name.toLowerCase().includes(searchLower)) return true;
    
    // Search in features
    if (solution.features.some(feature => 
      feature.toLowerCase().includes(searchLower))) return true;
    
    // Search in use cases
    if (solution.useCases.some(useCase => 
      useCase.toLowerCase().includes(searchLower))) return true;
    
    // Search in pain points
    if (solution.painPoints.some(painPoint => 
      painPoint.toLowerCase().includes(searchLower))) return true;
    
    // Search in target audience
    if (solution.targetAudience.some(audience => 
      audience.toLowerCase().includes(searchLower))) return true;
    
    return false;
  });

  // Function to handle Add File -> extract -> AI map -> open Edit with prefill
  const handleUseInContent = (solution: EnhancedSolution) => {
    if (isAutofillOpen) {
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
        setAutofillProgress(0);
        setAutofillStage('Preparing…');
        setIsAutofillOpen(true);

        const prefill = await parseSolutionFromFile(file, solution, {
          onProgress: ({ stage, progress }) => {
            if (stage) setAutofillStage(stage);
            if (typeof progress === 'number') setAutofillProgress(progress);
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
          setSelectedSolution(solution);
          setPrefilledData(prefill);
          setIsDialogOpen(true);
          toast.success('AI autofill completed. Review and save.');
        }
      } catch (e: any) {
        if (e?.message?.toLowerCase?.().includes('cancel')) {
          toast.info('Autofill cancelled');
        } else {
          console.error('Add File processing failed', e);
          toast.error(e?.message || 'Failed to process file');
        }
      } finally {
        setIsAutofillOpen(false);
        setAbortController(null);
      }
    };
    input.click();
  };
  const handleSearchChange = (term: string) => {
    setFilterTerm(term);
  };

  // "Add Solution from Document" flow
  const handleAutofillFromDoc = () => {
    if (isAutofillOpen) {
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
        setAutofillProgress(0);
        setAutofillStage('Preparing…');
        setIsAutofillOpen(true);

        const prefill = await parseSolutionFromFile(file, undefined, {
          onProgress: ({ stage, progress }) => {
            if (stage) setAutofillStage(stage);
            if (typeof progress === 'number') setAutofillProgress(progress);
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
          setSelectedSolution(null); // New solution
          setPrefilledData(prefill);
          setIsDialogOpen(true);
          toast.success('AI autofill completed. Review and save.');
        }
      } catch (e: any) {
        if (e?.message?.toLowerCase?.().includes('cancel')) {
          toast.info('Autofill cancelled');
        } else {
          console.error('Add Solution from Document failed', e);
          toast.error(e?.message || 'Failed to process file');
        }
      } finally {
        setIsAutofillOpen(false);
        setAbortController(null);
      }
    };
    input.click();
  };

  // Enhanced form handlers
  const handleAddNew = () => {
    setSelectedSolution(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (solution: EnhancedSolution) => {
    setSelectedSolution(solution);
    setIsDialogOpen(true);
  };

  const handleSubmitForm = async (solutionData: any, logoFile?: File) => {
    console.log('HandleSubmitForm called with:', { solutionData, logoFile });
    
    try {
      setIsSubmitting(true);
      
      if (selectedSolution?.id) {
        console.log('Updating solution with ID:', selectedSolution.id);
        const result = await solutionService.updateSolution(selectedSolution.id, solutionData, logoFile);
        console.log('Update result:', result);
        
        if (result.success && result.data) {
          console.log('Update successful, refreshing solutions list');
          // Refresh the solutions list in background
          void fetchSolutions({ background: true });
          console.log('Solutions list refreshed');
          toast.success('Solution updated successfully');
          // Keep dialog open; user closes explicitly via Close button
          // setIsDialogOpen(false);
          // setSelectedSolution(null);
        } else {
          // Throw error to keep dialog open and let user retry
          throw new Error(result.error || 'Failed to update solution');
        }
      } else {
        console.log('Creating new solution');
        const result = await solutionService.createSolution(solutionData, logoFile);
        console.log('Create result:', result);
        
        if (result.success && result.data) {
          console.log('Create successful, refreshing solutions list');
          // Refresh the solutions list in background
          void fetchSolutions({ background: true });
          console.log('Solutions list refreshed');
          toast.success('Solution created successfully');
          // Keep dialog open; user closes explicitly via Close button
          // setIsDialogOpen(false);
          // setSelectedSolution(null);
        } else {
          // Throw error to keep dialog open and let user retry
          throw new Error(result.error || 'Failed to create solution');
        }
      }
    } catch (error) {
      console.error('Error in handleSubmitForm:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast.error(`Save failed: ${errorMessage}`);
      // CRITICAL: Dialog stays open on error so user can retry
      // Do NOT call setIsDialogOpen(false) or setSelectedSolution(null) here
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isInitialLoading || isLoading) {
    return <LoadingState />;
  }
  
  if (error) {
    return <ErrorDisplay error={error} onRetry={fetchSolutions} />;
  }
  
  return (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Hero section with search and stats */}
      <HeroSection 
        solutionCount={solutions.length} 
        searchTerm={filterTerm}
        onSearchChange={handleSearchChange}
        activeCount={solutions.length}
        featuredCount={0}
      />
      
      {/* Main content area */}
      {filteredSolutions.length === 0 ? (
        <EmptyState searchTerm={filterTerm} onAddNew={handleAddNew} />
      ) : (
        <EnhancedSolutionGrid 
          solutions={filteredSolutions}
          onEdit={handleEdit}
          onDelete={deleteHandler.handleDelete}
          onUseInContent={handleUseInContent}
          onAddNew={handleAddNew}
          onAutofillFromDoc={handleAutofillFromDoc}
          isRefreshing={isRefreshing}
        />
      )}
      
      {/* Add/Edit Dialog */}
      <EnhancedSolutionFormDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setPrefilledData(null);
        }}
        onSubmit={handleSubmitForm}
        solution={selectedSolution}
        prefilledData={prefilledData || undefined}
        isSubmitting={isSubmitting}
        onMultipleSolutionsDetected={handleMultipleSolutionsDetected}
      />
      
      {/* Delete Confirmation Dialog */}
      <DeleteSolutionDialog
        open={deleteHandler.isDeleteDialogOpen}
        onOpenChange={deleteHandler.setIsDeleteDialogOpen}
        onConfirmDelete={deleteHandler.confirmDelete}
        solution={deleteHandler.selectedSolution}
        isSubmitting={deleteHandler.isSubmitting}
      />

      {/* AI Autofill Overlay */}
      <AIAutofillOverlay
        open={isAutofillOpen}
        progress={autofillProgress}
        stage={autofillStage}
        onCancel={() => {
          abortController?.abort();
          setIsAutofillOpen(false);
        }}
      />

      {/* Multi-Solution Picker Dialog */}
      <MultiSolutionPickerDialog
        open={showSolutionPicker}
        onOpenChange={setShowSolutionPicker}
        solutions={detectedSolutions}
        onSelectSolutions={async (selected) => {
          setShowSolutionPicker(false);
          
          // Create solutions one by one
          for (const solutionData of selected) {
            // Ensure required fields are present
            if (!solutionData.name) {
              toast.error('Solution name is required');
              continue;
            }
            
            try {
              const result = await solutionService.createSolution(solutionData as any);
              if (!result.success) {
                toast.error(`Failed to create ${solutionData.name}`);
              }
            } catch (error) {
              console.error(`Error creating ${solutionData.name}:`, error);
              toast.error(`Failed to create ${solutionData.name}`);
            }
          }
          
          // Refresh the list after all creations
          await fetchSolutions({ background: true });
          toast.success(`Successfully added ${selected.length} solution${selected.length > 1 ? 's' : ''}`);
          setDetectedSolutions([]);
        }}
      />
    </motion.div>
  );
};

export default SolutionManager;
