import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, ArrowRight, FileText } from 'lucide-react';

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
}

const priorityColors: Record<string, string> = {
  quick_win: 'bg-green-500/20 text-green-400 border-green-500/30',
  growth_opportunity: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  high_return: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  evergreen: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

export const ProposalBrowseStep: React.FC<ProposalBrowseStepProps> = ({
  proposals,
  onUseProposal
}) => {
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
            >
              <Card className="p-4 border-border/30 hover:border-primary/30 transition-all group bg-background/60">
                {/* Priority & type badges */}
                <div className="flex gap-1.5 mb-2">
                  {proposal.priority_tag && (
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${priorityColors[proposal.priority_tag] || ''}`}>
                      {proposal.priority_tag.replace(/_/g, ' ')}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {proposal.content_type || 'blog'}
                  </Badge>
                </div>

                {/* Title */}
                <h4 className="text-sm font-medium text-foreground mb-1 line-clamp-2 group-hover:text-primary/90 transition-colors">
                  {proposal.title}
                </h4>

                {/* Description */}
                {proposal.description && (
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                    {proposal.description}
                  </p>
                )}

                {/* Keywords */}
                <div className="flex flex-wrap gap-1 mb-3">
                  <span className="text-[10px] px-1.5 py-0.5 bg-primary/15 text-primary rounded">
                    {proposal.primary_keyword}
                  </span>
                  {proposal.related_keywords?.slice(0, 2).map((kw, i) => (
                    <span key={i} className="text-[10px] px-1.5 py-0.5 bg-secondary/20 rounded text-muted-foreground">
                      {typeof kw === 'string' ? kw : (kw as any)?.keyword || String(kw)}
                    </span>
                  ))}
                </div>

                {/* Impressions & CTA */}
                <div className="flex items-center justify-between">
                  {proposal.estimated_impressions ? (
                    <span className="text-[10px] text-muted-foreground">
                      ~{proposal.estimated_impressions.toLocaleString()} est. impressions
                    </span>
                  ) : <span />}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onUseProposal(proposal)}
                    className="h-7 px-3 text-xs gap-1 text-primary hover:text-primary hover:bg-primary/10"
                  >
                    Use This <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
