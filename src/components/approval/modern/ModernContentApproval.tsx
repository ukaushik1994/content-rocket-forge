import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ContentApprovalHero } from './ContentApprovalHero';
import { ContentApprovalCard } from './ContentApprovalCard';
import { ContentAnalysisModal } from './ContentAnalysisModal';
import { AssignReviewerDialog } from './AssignReviewerDialog';
import { ApprovalHistoryDialog } from './ApprovalHistoryDialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Grid3X3, 
  List,
  SlidersHorizontal,
} from 'lucide-react';
import { ContentItemType } from '@/contexts/content/types';
import { useContent } from '@/contexts/content';
import { toast } from 'sonner';
import { contentAiAnalysisService } from '@/services/contentAiAnalysisService';

interface ModernContentApprovalProps {
  contentItems: ContentItemType[];
}

export const ModernContentApproval: React.FC<ModernContentApprovalProps> = ({
  contentItems
}) => {
  const [selectedContent, setSelectedContent] = useState<ContentItemType | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'updated_at' | 'created_at' | 'title' | 'ai_score' | 'last_analyzed'>('updated_at');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [analysisContent, setAnalysisContent] = useState<ContentItemType | null>(null);
  const [isAnalyzingAll, setIsAnalyzingAll] = useState(false);
  const [analyzingItems, setAnalyzingItems] = useState<Set<string>>(new Set());
  const [aiScores, setAiScores] = useState<Record<string, number>>({});
  const [aiAnalyzedAt, setAiAnalyzedAt] = useState<Record<string, string>>({});
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [assignTarget, setAssignTarget] = useState<ContentItemType | null>(null);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [historyTarget, setHistoryTarget] = useState<ContentItemType | null>(null);
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  

  const { 
    updateContentItem, 
    refreshContent,
    approveContent,
    rejectContent,
    requestChanges,
    assignReviewer,
    getApprovalHistory
  } = useContent();

  // Calculate statistics
  const contentStats = useMemo(() => {
    const all = contentItems.length;
    const draft = contentItems.filter(item => item.approval_status === 'draft').length;
    const pending_review = contentItems.filter(item => item.approval_status === 'pending_review').length;
    const approved = contentItems.filter(item => item.approval_status === 'approved').length;
    const published = contentItems.filter(item => item.approval_status === 'published').length;
    const needs_changes = contentItems.filter(item => item.approval_status === 'needs_changes').length;

    return { all, draft, pending_review, approved, published, needs_changes };
  }, [contentItems]);

  // Filter and sort content
  const filteredAndSortedContent = useMemo(() => {
    let filtered = contentItems.filter(item => {
      const matchesStatus = statusFilter === 'all' || item.approval_status === statusFilter;
      const matchesSearch = searchQuery === '' || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.content && item.content.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesStatus && matchesSearch;
    });

    filtered.sort((a, b) => {
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'ai_score') {
        const aScore = aiScores[a.id] ?? -1;
        const bScore = aiScores[b.id] ?? -1;
        return bScore - aScore;
      }
      if (sortBy === 'last_analyzed') {
        const aAt = aiAnalyzedAt[a.id] ? new Date(aiAnalyzedAt[a.id]).getTime() : 0;
        const bAt = aiAnalyzedAt[b.id] ? new Date(aiAnalyzedAt[b.id]).getTime() : 0;
        return bAt - aAt;
      }
      return new Date(b[sortBy]).getTime() - new Date(a[sortBy]).getTime();
    });

    return filtered;
  }, [contentItems, statusFilter, searchQuery, sortBy]);

  // Preload existing AI analysis scores for cards
  useEffect(() => {
    let isCancelled = false;
    (async () => {
      if (contentItems.length === 0) {
        setAiScores({});
        return;
      }
      try {
        const entries = await Promise.all(
          contentItems.map(async (item) => {
            try {
              const rec = await contentAiAnalysisService.getExistingAnalysis(item.id);
              const score = (rec?.analysis?.overallScore as number | undefined) ?? (rec?.seo_score ?? undefined);
              const analyzedAt = rec?.analyzed_at as string | undefined;
              return [item.id, score, analyzedAt] as const;
            } catch {
              return [item.id, undefined, undefined] as const;
            }
          })
        );
        if (isCancelled) return;
        const scoreMap: Record<string, number> = {};
        const analyzedAtMap: Record<string, string> = {};
        for (const [id, score, analyzedAt] of entries) {
          if (typeof score === 'number') scoreMap[id] = score;
          if (typeof analyzedAt === 'string') analyzedAtMap[id] = analyzedAt;
        }
        setAiScores(scoreMap);
        setAiAnalyzedAt(analyzedAtMap);
      } catch (e) {
        // ignore preload errors
      }
    })();
    return () => { isCancelled = true; };
  }, [contentItems]);

  const handleAnalyzeAll = async () => {
    if (contentItems.length === 0) return;
    setIsAnalyzingAll(true);
    toast.info('Starting AI analysis for all content items...');
    try {
      for (const item of contentItems) {
        setAnalyzingItems(prev => new Set(prev).add(item.id));
        const rec = await contentAiAnalysisService.reanalyze(item);
        const score = (rec?.analysis?.overallScore as number | undefined) ?? (rec?.seo_score ?? 0);
        const analyzedAt = (rec?.analyzed_at as string | undefined) ?? new Date().toISOString();
        setAiScores(prev => ({ ...prev, [item.id]: score }));
        setAiAnalyzedAt(prev => ({ ...prev, [item.id]: analyzedAt }));
        setAnalyzingItems(prev => { const s = new Set(prev); s.delete(item.id); return s; });
      }
      toast.success('AI analysis completed for all content items!');
    } catch (error) {
      toast.error('Failed to complete AI analysis');
      console.error(error);
    } finally {
      setIsAnalyzingAll(false);
    }
  };

  const handleAnalyzeContent = async (content: ContentItemType) => {
    setAnalyzingItems(prev => new Set(prev).add(content.id));
    try {
      const rec = await contentAiAnalysisService.reanalyze(content);
      const score = (rec?.analysis?.overallScore as number | undefined) ?? (rec?.seo_score ?? 0);
      const analyzedAt = (rec?.analyzed_at as string | undefined) ?? new Date().toISOString();
      setAiScores(prev => ({ ...prev, [content.id]: score }));
      setAiAnalyzedAt(prev => ({ ...prev, [content.id]: analyzedAt }));
      toast.success(`AI analysis completed for "${content.title}"`);
    } catch (error) {
      toast.error('Failed to analyze content');
      console.error(error);
    } finally {
      setAnalyzingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(content.id);
        return newSet;
      });
    }
  };

  const handleViewContent = (content: ContentItemType) => {
    setAnalysisContent(content);
    setShowAnalysisModal(true);
  };

  const handleApprove = async (id: string, comments?: string) => {
    try {
      await approveContent(id, comments);
      await refreshContent();
      toast.success('Content approved and published successfully');
    } catch (error) {
      toast.error('Failed to approve content');
      console.error(error);
    }
  };

  const handleReject = async (id: string, comments: string) => {
    try {
      await rejectContent(id, comments);
      await refreshContent();
      toast.success('Content rejected with feedback');
    } catch (error) {
      toast.error('Failed to reject content');
      console.error(error);
    }
  };

  const handleRequestChanges = async (id: string, comments: string) => {
    try {
      await requestChanges(id, comments);
      await refreshContent();
      toast.success('Change request sent to author');
    } catch (error) {
      toast.error('Failed to request changes');
      console.error(error);
    }
  };

  const handleAssign = (content: ContentItemType) => {
    setAssignTarget(content);
    setShowAssignDialog(true);
  };

  const handleViewHistory = async (content: ContentItemType) => {
    setHistoryTarget(content);
    const history = await getApprovalHistory(content.id);
    setHistoryItems(history);
    setShowHistoryDialog(true);
  };

  return (
    <div className="min-h-screen w-full">
      {/* Hero Section */}
      <ContentApprovalHero
        contentStats={contentStats}
        onAnalyzeAll={handleAnalyzeAll}
        onQuickFilter={setStatusFilter}
        activeFilter={statusFilter}
        isAnalyzing={isAnalyzingAll}
      />

      {/* Content Management Section */}
      <div className="relative z-10 px-6 pb-12">
        {/* Enhanced Search and Filters */}
        <motion.div
          className="max-w-7xl mx-auto mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-background/60 backdrop-blur-xl border-border/50">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search content by title, description, or keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-background/40 border-border/50"
                  />
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger className="w-40 bg-background/40 border-border/50">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="updated_at">Last Updated</SelectItem>
                      <SelectItem value="created_at">Created Date</SelectItem>
                      <SelectItem value="title">Title</SelectItem>
                      <SelectItem value="ai_score">AI Score</SelectItem>
                      <SelectItem value="last_analyzed">Last Analyzed</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex gap-1 p-1 bg-background/40 rounded-lg border border-border/50">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="h-8 w-8 p-0"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="h-8 w-8 p-0"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => refreshContent()}
                    className="bg-background/40 border-border/50 hover:bg-background/60"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Content Grid */}
        <div className="max-w-7xl mx-auto">
          {filteredAndSortedContent.length === 0 ? (
            <motion.div
              className="text-center py-24"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="max-w-md mx-auto bg-background/60 backdrop-blur-xl border-border/50">
                <CardContent className="pt-12 pb-12">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-primary/50" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No content found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery ? 'Try adjusting your search terms' : 'No content matches the selected filter'}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Total: {contentItems.length} | Filtered: {filteredAndSortedContent.length}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div 
              className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}
              layout
            >
              <AnimatePresence>
                {filteredAndSortedContent.map((item, index) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <ContentApprovalCard
                      content={item}
                      onView={handleViewContent}
                      onApprove={handleApprove}
                      onReject={handleReject}
                      onRequestChanges={handleRequestChanges}
                      onAnalyzeAI={handleAnalyzeContent}
                      onAssignReviewer={handleAssign}
                      onViewHistory={handleViewHistory}
                      aiScore={aiScores[item.id]}
                      isAnalyzing={analyzingItems.has(item.id)}
                      analyzedAt={aiAnalyzedAt[item.id]}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      {/* Analysis Modal */}
      <ContentAnalysisModal
        isOpen={showAnalysisModal}
        onClose={() => setShowAnalysisModal(false)}
        content={analysisContent}
        onApprove={handleApprove}
        onReject={handleReject}
        onRequestChanges={handleRequestChanges}
      />

      {/* Assign Reviewer */}
      <AssignReviewerDialog
        open={showAssignDialog}
        onClose={() => setShowAssignDialog(false)}
        onSubmit={async ({ reviewerId, dueDate, priority }) => {
          if (!assignTarget) return;
          await assignReviewer(assignTarget.id, reviewerId, dueDate, priority);
          setShowAssignDialog(false);
          setAssignTarget(null);
          await refreshContent();
        }}
      />

      {/* Approval History */}
      <ApprovalHistoryDialog
        open={showHistoryDialog}
        onClose={() => setShowHistoryDialog(false)}
        contentTitle={historyTarget?.title}
        history={historyItems}
      />
    </div>
  );
};