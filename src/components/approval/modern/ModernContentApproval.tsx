import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CompactPageHeader } from '@/components/ui/CompactPageHeader';
import { ContentApprovalCard } from './ContentApprovalCard';
import { ReviewEditorModal } from './ReviewEditorModal';
import { AssignReviewerDialog } from './AssignReviewerDialog';
import { ApprovalHistoryDialog } from './ApprovalHistoryDialog';
import { ApprovalNotesDialog } from './ApprovalNotesDialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Grid3X3, 
  List,
  SlidersHorizontal,
  CheckCircle2,
  XCircle,
  RotateCcw,
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
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewContent, setReviewContent] = useState<ContentItemType | null>(null);
  const [isAnalyzingAll, setIsAnalyzingAll] = useState(false);
  const [analyzingItems, setAnalyzingItems] = useState<Set<string>>(new Set());
  const [aiScores, setAiScores] = useState<Record<string, number>>({});
  const [aiAnalyzedAt, setAiAnalyzedAt] = useState<Record<string, string>>({});
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [assignTarget, setAssignTarget] = useState<ContentItemType | null>(null);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [historyTarget, setHistoryTarget] = useState<ContentItemType | null>(null);
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  // Batch selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  // Approval notes dialog
  const [notesDialog, setNotesDialog] = useState<{ open: boolean; action: 'approve' | 'reject' | 'request_changes'; contentId: string } | null>(null);
  

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
    const rejected = contentItems.filter(item => item.approval_status === 'rejected').length;

    return { all, draft, pending_review, approved, published, needs_changes, rejected };
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

  // Optional: auto-open editor via URL param (?editor=first or ?editor=<id>)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const editor = params.get('editor');
    if (!editor || showReviewModal) return;
    if (contentItems.length === 0) return;

    if (editor === 'first') {
      setReviewContent(contentItems[0]);
      setShowReviewModal(true);
    } else {
      const target = contentItems.find((i) => i.id === editor);
      if (target) {
        setReviewContent(target);
        setShowReviewModal(true);
      }
    }
  }, [contentItems, showReviewModal]);

  const [analyzeProgress, setAnalyzeProgress] = useState({ current: 0, total: 0 });

  const handleAnalyzeAll = async () => {
    if (contentItems.length === 0) return;
    setIsAnalyzingAll(true);
    const total = contentItems.length;
    setAnalyzeProgress({ current: 0, total });
    toast.info(`Starting AI analysis for ${total} items...`, { id: 'analyze-all-progress' });
    
    // Process in batches of 2 with delays
    const batchSize = 2;
    for (let i = 0; i < total; i += batchSize) {
      const batch = contentItems.slice(i, i + batchSize);
      const promises = batch.map(async (item) => {
        setAnalyzingItems(prev => new Set(prev).add(item.id));
        try {
          const rec = await contentAiAnalysisService.reanalyze(item);
          const score = (rec?.analysis?.overallScore as number | undefined) ?? (rec?.seo_score ?? 0);
          const analyzedAt = (rec?.analyzed_at as string | undefined) ?? new Date().toISOString();
          setAiScores(prev => ({ ...prev, [item.id]: score }));
          setAiAnalyzedAt(prev => ({ ...prev, [item.id]: analyzedAt }));
        } catch (error) {
          console.warn(`Analysis failed for "${item.title}":`, error);
        } finally {
          setAnalyzingItems(prev => { const s = new Set(prev); s.delete(item.id); return s; });
        }
      });
      
      await Promise.allSettled(promises);
      setAnalyzeProgress({ current: Math.min(i + batchSize, total), total });
      toast.info(`Analyzing ${Math.min(i + batchSize, total)}/${total}...`, { id: 'analyze-all-progress' });
      
      // Delay between batches to avoid rate limits
      if (i + batchSize < total) {
        await new Promise(r => setTimeout(r, 2000));
      }
    }
    
    toast.success('AI analysis completed for all content items!', { id: 'analyze-all-progress' });
    setIsAnalyzingAll(false);
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
    setReviewContent(content);
    setShowReviewModal(true);
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

  const handleSubmitForReview = async (id: string) => {
    try {
      await updateContentItem(id, { approval_status: 'pending_review' });
      await refreshContent();
      toast.success('Content submitted for review');
    } catch (error) {
      toast.error('Failed to submit for review');
      console.error(error);
    }
  };

  const handleRevertToDraft = async (id: string) => {
    try {
      await updateContentItem(id, { approval_status: 'draft' });
      await refreshContent();
      toast.success('Content reverted to draft');
    } catch (error) {
      toast.error('Failed to revert content');
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

  // Batch selection handlers
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(filteredAndSortedContent.map(i => i.id)));
  }, [filteredAndSortedContent]);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const handleBatchApprove = async () => {
    const ids = Array.from(selectedIds);
    toast.info(`Approving ${ids.length} items...`);
    let success = 0;
    for (const id of ids) {
      try {
        await approveContent(id, 'Batch approved');
        success++;
      } catch { /* continue */ }
    }
    await refreshContent();
    clearSelection();
    toast.success(`${success} of ${ids.length} items approved`);
  };

  // Notes dialog handlers
  const openNotesDialog = (action: 'approve' | 'reject' | 'request_changes', contentId: string) => {
    setNotesDialog({ open: true, action, contentId });
  };

  const handleNotesSubmit = async (notes: string) => {
    if (!notesDialog) return;
    const { action, contentId } = notesDialog;
    if (action === 'approve') await handleApprove(contentId, notes);
    else if (action === 'reject') await handleReject(contentId, notes);
    else if (action === 'request_changes') await handleRequestChanges(contentId, notes);
    setNotesDialog(null);
  };

  return (
    <div className="min-h-screen w-full">
      {/* Batch Selection Bar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="fixed top-16 left-0 right-0 z-50 flex items-center justify-center"
          >
            <div className="flex items-center gap-3 px-6 py-3 bg-background/90 backdrop-blur-xl rounded-full border border-primary/30 shadow-xl">
              <span className="text-sm font-medium">{selectedIds.size} selected</span>
              <Button size="sm" variant="outline" onClick={selectAll}>Select All</Button>
              <Button size="sm" variant="ghost" onClick={clearSelection}>Clear</Button>
              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={handleBatchApprove}>
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Approve Selected
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr' 
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
                      onApprove={(id) => openNotesDialog('approve', id)}
                      onReject={(id) => openNotesDialog('reject', id)}
                      onRequestChanges={(id) => openNotesDialog('request_changes', id)}
                      onRevertToDraft={handleRevertToDraft}
                      onAnalyzeAI={handleAnalyzeContent}
                      onAssignReviewer={handleAssign}
                      onViewHistory={handleViewHistory}
                      onSubmitForReview={handleSubmitForReview}
                      aiScore={aiScores[item.id]}
                      isAnalyzing={analyzingItems.has(item.id)}
                      analyzedAt={aiAnalyzedAt[item.id]}
                      isSelected={selectedIds.has(item.id)}
                      onToggleSelect={toggleSelect}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      {/* Review Editor Modal */}
      <ReviewEditorModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        content={reviewContent}
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

      {/* Approval Notes Dialog */}
      {notesDialog && (
        <ApprovalNotesDialog
          open={notesDialog.open}
          action={notesDialog.action}
          onClose={() => setNotesDialog(null)}
          onSubmit={handleNotesSubmit}
        />
      )}
    </div>
  );
};