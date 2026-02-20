import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, ArrowRight, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { EnhancedAIProposalCard } from '@/components/research/content-strategy/components/EnhancedAIProposalCard';

interface Proposal {
  id?: string;
  title: string;
  description?: string;
  primary_keyword: string;
  related_keywords?: string[];
  content_type?: string;
  priority_tag?: string;
  estimated_impressions?: number;
  solution_id?: string;
}

interface ProposalBrowseStepProps {
  proposals: Proposal[];
  onUseProposal: (proposal: Proposal) => void;
  isLoading?: boolean;
}

const ProposalSkeletonCard = () => (
  <Card className="p-4 border-border/30 bg-background/60">
    <div className="flex gap-1.5 mb-2">
      <Skeleton className="h-4 w-16 rounded-full" />
      <Skeleton className="h-4 w-12 rounded-full" />
    </div>
    <Skeleton className="h-4 w-3/4 mb-1" />
    <Skeleton className="h-3 w-full mb-1" />
    <Skeleton className="h-3 w-2/3 mb-2" />
    <div className="flex gap-1 mb-3">
      <Skeleton className="h-5 w-20 rounded" />
      <Skeleton className="h-5 w-16 rounded" />
      <Skeleton className="h-5 w-14 rounded" />
    </div>
    <div className="flex items-center justify-between">
      <Skeleton className="h-3 w-28" />
      <Skeleton className="h-7 w-20 rounded" />
    </div>
  </Card>
);

export const ProposalBrowseStep: React.FC<ProposalBrowseStepProps> = ({
  proposals,
  onUseProposal,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-5 py-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            <h3 className="text-sm font-medium text-foreground">Generating Proposals…</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Analyzing solutions and building content ideas</p>
        </div>
        <ScrollArea className="flex-1 px-5">
          <div className="space-y-3 pb-4">
            {Array.from({ length: 4 }, (_, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <ProposalSkeletonCard />
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  }

  if (proposals.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-center px-6">
        <div>
          <FileText className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No proposals generated yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-medium text-foreground">
            {proposals.length} AI Proposals
          </h3>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Pick a proposal to start writing with the Content Wizard
        </p>
      </div>

      <ScrollArea className="flex-1 px-5">
        <div className="space-y-3 pb-4">
          {proposals.map((proposal, index) => (
            <motion.div
              key={proposal.id || index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              className="relative"
            >
              <EnhancedAIProposalCard
                proposal={proposal}
                showActions={false}
                isNew={index < 2}
              />
              {/* Use This overlay button */}
              <div className="absolute bottom-3 right-3 z-10">
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUseProposal(proposal);
                  }}
                  className="h-7 px-3 text-xs gap-1 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
                >
                  Use This <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
