import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useResponsiveBreakpoint } from '@/hooks/useResponsiveBreakpoint';
import { ProposalSolutionStep } from './ProposalSolutionStep';
import { ProposalBrowseStep } from './ProposalBrowseStep';
import { ContentWizardSidebar } from '../content-wizard/ContentWizardSidebar';
import { contentStrategyService } from '@/services/contentStrategyService';
import { toast } from 'sonner';

interface ProposalBrowserSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  keyword?: string;
}

type Step = 'solutions' | 'proposals' | 'wizard';

export const ProposalBrowserSidebar: React.FC<ProposalBrowserSidebarProps> = ({
  isOpen,
  onClose,
  keyword
}) => {
  const [step, setStep] = useState<Step>('solutions');
  const [proposals, setProposals] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [wizardData, setWizardData] = useState<{ keyword: string; solutionId?: string; contentType?: string } | null>(null);

  const handleSolutionSelect = useCallback(async (solutionIds: string[]) => {
    setIsGenerating(true);
    try {
      const mappings = solutionIds.map(id => ({ solutionId: id, competitorId: null }));
      const result = await contentStrategyService.generateAIStrategy({
        solutionCompetitorMappings: mappings
      });
      
      // Attach solution_id to proposals
      const enrichedProposals = (result.proposals || []).map((p: any) => ({
        ...p,
        solution_id: p.solution_id || solutionIds[0]
      }));
      
      setProposals(enrichedProposals);
      setStep('proposals');
      toast.success(`Generated ${enrichedProposals.length} proposals`);
    } catch (err: any) {
      console.error('Proposal generation failed:', err);
      toast.error(err.message || 'Failed to generate proposals');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const handleUseProposal = useCallback((proposal: any) => {
    setWizardData({
      keyword: proposal.primary_keyword || keyword || '',
      solutionId: proposal.solution_id,
      contentType: proposal.content_type || 'blog'
    });
    setStep('wizard');
  }, [keyword]);

  const handleBack = () => {
    if (step === 'proposals') setStep('solutions');
    else if (step === 'wizard') setStep('proposals');
  };

  // If we've transitioned to the wizard, render it directly
  if (step === 'wizard' && wizardData) {
    return (
      <ContentWizardSidebar
        isOpen={isOpen}
        onClose={onClose}
        keyword={wizardData.keyword}
        solutionId={wizardData.solutionId}
        contentType={wizardData.contentType}
      />
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop (mobile/tablet) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-16 bottom-24 left-0 right-0 bg-black/40 backdrop-blur-sm z-[35] lg:hidden"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={cn(
              "fixed top-20 right-0 bottom-24 z-[35]",
              "w-full sm:w-[400px] lg:w-[460px]",
              "bg-background/95 backdrop-blur-md",
              "border-l border-border/10",
              "flex flex-col overflow-hidden"
            )}
          >
            {/* Header */}
            <div className="flex-shrink-0 px-5 py-4 border-b border-border/20 flex items-center gap-3">
              {step !== 'solutions' && (
                <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-medium text-foreground">
                  {step === 'solutions' ? 'AI Proposals' : 'Browse Proposals'}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {step === 'solutions' 
                    ? 'Select solutions to generate content proposals' 
                    : `${proposals.length} proposals ready`}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              {step === 'solutions' && (
                <ProposalSolutionStep
                  onSelect={handleSolutionSelect}
                  isGenerating={isGenerating}
                />
              )}
              {step === 'proposals' && (
                <ProposalBrowseStep
                  proposals={proposals}
                  onUseProposal={handleUseProposal}
                />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
