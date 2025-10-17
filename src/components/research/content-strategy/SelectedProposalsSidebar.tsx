import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  X, 
  CheckCircle2, 
  Target, 
  TrendingUp, 
  BarChart3, 
  Send,
  Trash2,
  Eye,
  Download,
  Calendar,
  ChevronRight,
  ListPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SelectedProposalsSidebarProps {
  proposals: any[];
  selected: Record<string, boolean>;
  onSelectionChange: (index: number, isSelected: boolean) => void;
  onSendToBuilder: (proposal: any) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const SelectedProposalsSidebar = ({
  proposals,
  selected,
  onSelectionChange,
  onSendToBuilder,
  isOpen,
  onToggle
}: SelectedProposalsSidebarProps) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const selectedProposals = proposals.filter((_, index) => selected[index]);
  const selectedCount = selectedProposals.length;
  
  const totalEstimatedTraffic = selectedProposals.reduce((sum, proposal) => {
    const primaryKw = proposal.primary_keyword;
    const metrics = proposal.serp_data?.[primaryKw] || {};
    const est = proposal.estimated_impressions ?? Math.round((metrics.searchVolume || 0) * 0.05);
    return sum + est;
  }, 0);

  const quickWins = selectedProposals.filter(p => p.priority_tag === 'quick_win').length;

  if (!isOpen) {
    return (
      <motion.div
        initial={{ x: 300 }}
        animate={{ x: 0 }}
        className="fixed right-4 top-1/2 -translate-y-1/2 z-50"
      >
        <Button
          onClick={onToggle}
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-lg rounded-l-lg rounded-r-none p-3"
        >
          <ListPlus className="h-5 w-5" />
          {selectedCount > 0 && (
            <Badge className="ml-2 bg-white/20 text-white text-xs">
              {selectedCount}
            </Badge>
          )}
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ x: 400 }}
      animate={{ x: 0 }}
      exit={{ x: 400 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed right-0 top-20 bottom-0 w-96 bg-background/95 backdrop-blur-lg border-l border-border/20 shadow-2xl z-40 flex flex-col"
    >
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-border/20 bg-card/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
              <CheckCircle2 className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-white">Selected Proposals</h2>
            {selectedCount > 0 && (
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-400/30">
                {selectedCount}
              </Badge>
            )}
          </div>
          <Button
            onClick={onToggle}
            variant="ghost"
            size="sm"
            className="text-white/60 hover:text-white hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Summary Stats */}
        {selectedCount > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="text-center p-2 bg-white/5 rounded-lg border border-white/10">
              <div className="text-lg font-bold text-white">{selectedCount}</div>
              <div className="text-xs text-white/60">Selected</div>
            </div>
            <div className="text-center p-2 bg-green-500/10 rounded-lg border border-green-500/20">
              <div className="text-lg font-bold text-green-400">{totalEstimatedTraffic.toLocaleString()}</div>
              <div className="text-xs text-green-400/80">Traffic</div>
            </div>
            <div className="text-center p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <div className="text-lg font-bold text-blue-400">{quickWins}</div>
              <div className="text-xs text-blue-400/80">Quick Wins</div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {selectedCount === 0 ? (
            <div className="text-center py-12">
              <Target className="h-12 w-12 text-white/40 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No Proposals Selected</h3>
              <p className="text-white/60 text-sm">
                Select proposals from the main view to see them here
              </p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {selectedProposals.map((proposal, idx) => {
                const originalIndex = proposals.findIndex(p => p.primary_keyword === proposal.primary_keyword);
                const isExpanded = expandedIndex === originalIndex;
                
                return (
                  <motion.div
                    key={proposal.primary_keyword || idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300">
                      <CardHeader 
                        className="pb-2 cursor-pointer"
                        onClick={() => setExpandedIndex(isExpanded ? null : originalIndex)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-sm font-semibold text-white line-clamp-2 flex items-center gap-2">
                              <CheckCircle2 className="h-3 w-3 text-blue-400 flex-shrink-0" />
                              {proposal.title || 'Untitled Proposal'}
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  proposal.priority_tag === 'quick_win' ? 'text-green-400 border-green-400/30' :
                                  proposal.priority_tag === 'high_return' ? 'text-blue-400 border-blue-400/30' :
                                  'text-purple-400 border-purple-400/30'
                                }`}
                              >
                                {proposal.priority_tag?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Evergreen'}
                              </Badge>
                              <ChevronRight className={`h-3 w-3 text-white/40 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                            </div>
                          </div>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectionChange(originalIndex, false);
                            }}
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1 h-auto"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardHeader>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <CardContent className="pt-0 space-y-3">
                              {/* Primary Keyword */}
                              <div className="flex items-center gap-2">
                                <Target className="h-3 w-3 text-purple-400" />
                                <span className="text-xs text-white/80">Primary:</span>
                                <Badge variant="outline" className="text-xs text-white/80 border-white/20 bg-white/10">
                                  {typeof proposal.primary_keyword === 'string' ? proposal.primary_keyword : proposal.primary_keyword?.keyword || String(proposal.primary_keyword)}
                                </Badge>
                              </div>

                              {/* Traffic Estimation */}
                              <div className="flex items-center gap-2 p-2 bg-green-500/10 rounded border border-green-500/20">
                                <TrendingUp className="h-3 w-3 text-green-400" />
                                <div className="text-xs">
                                  <span className="text-white/80">Est. Monthly: </span>
                                  <span className="font-semibold text-green-400">
                                    {(proposal.estimated_impressions ?? 
                                      Math.round((proposal.serp_data?.[proposal.primary_keyword]?.searchVolume || 0) * 0.05)
                                    ).toLocaleString()}
                                  </span>
                                </div>
                              </div>

                              {/* Related Keywords */}
                              {proposal.related_keywords && proposal.related_keywords.length > 0 && (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 text-xs text-white/80">
                                    <BarChart3 className="h-3 w-3 text-blue-400" />
                                    Related Keywords
                                  </div>
                                   <div className="flex flex-wrap gap-1">
                                    {proposal.related_keywords.slice(0, 2).map((keyword: any, index: number) => (
                                      <Badge key={index} variant="outline" className="text-xs text-white/80 border-white/20 bg-white/10">
                                        {typeof keyword === 'string' ? keyword : keyword?.keyword ? String(keyword.keyword) : String(keyword)}
                                      </Badge>
                                    ))}
                                    {proposal.related_keywords.length > 2 && (
                                      <Badge variant="outline" className="text-xs text-white/80 border-white/20 bg-white/10">
                                        +{proposal.related_keywords.length - 2}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Actions */}
                              <div className="flex gap-2 pt-2 border-t border-white/20">
                                 <Button
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     onSendToBuilder({ 
                                       ...proposal, 
                                       source_proposal_id: proposal.id || proposal.title.toLowerCase().replace(/\s+/g, '-')
                                     });
                                   }}
                                   size="sm"
                                   className="flex-1 gap-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 text-xs"
                                 >
                                   <Send className="h-3 w-3" />
                                   Create Content
                                 </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // TODO: Add view details functionality
                                  }}
                                  className="border-white/20 text-white/80 hover:bg-white/10 text-xs"
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                              </div>
                            </CardContent>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </ScrollArea>

      {/* Footer Actions */}
      {selectedCount > 0 && (
        <div className="flex-shrink-0 p-4 border-t border-white/10 bg-white/5">
          <div className="space-y-2">
            <Button
              onClick={() => {
                // Clear all selections
                Object.keys(selected).forEach(index => {
                  if (selected[index]) {
                    onSelectionChange(parseInt(index), false);
                  }
                });
              }}
              variant="outline"
              size="sm"
              className="w-full gap-2 border-red-400/30 text-red-400 hover:bg-red-500/10"
            >
              <Trash2 className="h-4 w-4" />
              Clear All Selections
            </Button>
            <Button
              onClick={() => {
                // TODO: Add export functionality
                console.log('Exporting selected proposals:', selectedProposals);
              }}
              variant="outline"
              size="sm"
              className="w-full gap-2 border-white/20 text-white/80 hover:bg-white/10"
            >
              <Download className="h-4 w-4" />
              Export Selected
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
};