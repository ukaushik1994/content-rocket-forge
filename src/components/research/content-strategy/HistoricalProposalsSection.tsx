import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { History, Eye, TrendingUp, Calendar, Target, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { proposalKeywordSync } from '@/services/proposalKeywordSync';
import { format, parseISO } from 'date-fns';

interface HistoricalProposal {
  id: string;
  title: string;
  description?: string;
  primary_keyword: string;
  related_keywords?: string[];
  estimated_impressions?: number;
  priority_tag?: string;
  content_type?: string;
  created_at: string;
}

interface HistoricalProposalsSectionProps {
  onReuse?: (proposal: HistoricalProposal) => void;
  className?: string;
}

export const HistoricalProposalsSection = ({ onReuse, className }: HistoricalProposalsSectionProps) => {
  const [historicalProposals, setHistoricalProposals] = useState<HistoricalProposal[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'recent' | 'popular' | 'all'>('recent');

  useEffect(() => {
    loadHistoricalProposals();
  }, []);

  const loadHistoricalProposals = async () => {
    try {
      setLoading(true);
      const proposals = await proposalKeywordSync.getHistoricalProposals(100);
      setHistoricalProposals(proposals as HistoricalProposal[]);
    } catch (error) {
      console.error('Error loading historical proposals:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredProposals = () => {
    switch (selectedTab) {
      case 'recent':
        return historicalProposals.slice(0, 12);
      case 'popular':
        return [...historicalProposals]
          .sort((a, b) => (b.estimated_impressions || 0) - (a.estimated_impressions || 0))
          .slice(0, 12);
      case 'all':
        return historicalProposals;
      default:
        return historicalProposals;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'quick_win': return 'text-green-400 bg-green-500/10 border-green-400/30';
      case 'high_return': return 'text-blue-400 bg-blue-500/10 border-blue-400/30';
      case 'evergreen': return 'text-purple-400 bg-purple-500/10 border-purple-400/30';
      default: return 'text-white/80 bg-white/10 border-white/20';
    }
  };

  const getPriorityLabel = (priority?: string) => {
    switch (priority) {
      case 'quick_win': return 'Quick Win';
      case 'high_return': return 'High Return';
      case 'evergreen': return 'Evergreen';
      default: return 'Standard';
    }
  };

  if (historicalProposals.length === 0 && !loading) {
    return null;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <History className="h-5 w-5 text-purple-400" />
            Historical Proposals
            <Badge variant="outline" className="text-white/80 border-white/20 bg-white/10">
              {historicalProposals.length} total
            </Badge>
          </CardTitle>
          <p className="text-sm text-white/60">
            Previously generated content proposals. Keywords from these proposals have been automatically saved to your library.
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as any)}>
            <TabsList className="grid w-full grid-cols-3 bg-white/10">
              <TabsTrigger value="recent" className="data-[state=active]:bg-blue-500/20">
                Recent
              </TabsTrigger>
              <TabsTrigger value="popular" className="data-[state=active]:bg-blue-500/20">
                Popular
              </TabsTrigger>
              <TabsTrigger value="all" className="data-[state=active]:bg-blue-500/20">
                All ({historicalProposals.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTab} className="mt-4">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="bg-white/5 border-white/10 animate-pulse">
                      <CardContent className="p-4 space-y-3">
                        <div className="h-4 bg-white/10 rounded"></div>
                        <div className="h-3 bg-white/10 rounded w-3/4"></div>
                        <div className="h-8 bg-white/10 rounded"></div>
                        <div className="space-y-2">
                          <div className="h-3 bg-white/10 rounded"></div>
                          <div className="h-3 bg-white/10 rounded w-2/3"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ staggerChildren: 0.05 }}
                >
                  {getFilteredProposals().map((proposal, idx) => (
                    <motion.div
                      key={proposal.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 group">
                        <CardContent className="p-4 space-y-3">
                          {/* Header */}
                          <div className="space-y-2">
                            <h4 className="font-medium text-white line-clamp-2 text-sm group-hover:text-blue-300 transition-colors">
                              {proposal.title}
                            </h4>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${getPriorityColor(proposal.priority_tag)}`}
                              >
                                {getPriorityLabel(proposal.priority_tag)}
                              </Badge>
                              <Badge variant="outline" className="text-xs text-white/80 border-white/20 bg-white/10">
                                {proposal.content_type || 'blog'}
                              </Badge>
                            </div>
                          </div>

                          {/* Primary Keyword */}
                          <div className="flex items-center gap-2">
                            <Target className="h-3 w-3 text-purple-400" />
                            <span className="text-xs text-white/80 truncate">
                              {proposal.primary_keyword}
                            </span>
                          </div>

                          {/* Traffic Estimate */}
                          {proposal.estimated_impressions && proposal.estimated_impressions > 0 && (
                            <div className="flex items-center gap-2 p-2 bg-green-500/10 rounded border border-green-400/20">
                              <TrendingUp className="h-3 w-3 text-green-400" />
                              <div className="text-xs">
                                <span className="text-white/80">Est. </span>
                                <span className="font-medium text-white">
                                  {proposal.estimated_impressions.toLocaleString()}
                                </span>
                                <span className="text-white/60"> impressions</span>
                              </div>
                            </div>
                          )}

                          {/* Created Date */}
                          <div className="flex items-center gap-2 text-xs text-white/60">
                            <Calendar className="h-3 w-3" />
                            {format(parseISO(proposal.created_at), 'MMM d, yyyy')}
                          </div>

                          {/* Related Keywords Count */}
                          {proposal.related_keywords && proposal.related_keywords.length > 0 && (
                            <div className="text-xs text-white/60">
                              +{proposal.related_keywords.length} related keywords
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex gap-2 pt-2 border-t border-white/10">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onReuse?.(proposal)}
                              className="flex-1 text-xs bg-white/5 border-white/20 text-white/80 hover:bg-white/10 hover:text-white"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => onReuse?.(proposal)}
                              className="flex-1 text-xs bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-400/30 text-blue-300 hover:from-blue-500/30 hover:to-purple-500/30"
                            >
                              <Sparkles className="h-3 w-3 mr-1" />
                              Reuse
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {!loading && getFilteredProposals().length === 0 && (
                <div className="text-center py-8 text-white/60">
                  <History className="h-12 w-12 mx-auto mb-4 text-white/40" />
                  <p>No historical proposals found</p>
                  <p className="text-sm mt-1">Generate some AI strategies to see them here</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};