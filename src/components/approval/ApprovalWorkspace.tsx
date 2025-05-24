
import React, { useState, useMemo } from 'react';
import { ContentItemType } from '@/contexts/content/types';
import { ApprovalCard } from './ApprovalCard';
import { ApprovalDashboard } from './ApprovalDashboard';
import { ContentApprovalEditor } from './ContentApprovalEditor';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, RefreshCw, Clock, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContent } from '@/contexts/content';
import { toast } from 'sonner';

interface ApprovalWorkspaceProps {
  contentItems: ContentItemType[];
}

const statusConfig = {
  'draft': { label: 'Draft', icon: Clock, color: 'bg-gray-500/20 text-gray-400' },
  'pending_review': { label: 'Pending Review', icon: AlertCircle, color: 'bg-yellow-500/20 text-yellow-400' },
  'in_review': { label: 'In Review', icon: Clock, color: 'bg-blue-500/20 text-blue-400' },
  'approved': { label: 'Approved', icon: CheckCircle2, color: 'bg-green-500/20 text-green-400' },
  'rejected': { label: 'Rejected', icon: XCircle, color: 'bg-red-500/20 text-red-400' },
  'needs_changes': { label: 'Needs Changes', icon: AlertCircle, color: 'bg-orange-500/20 text-orange-400' },
  'published': { label: 'Published', icon: CheckCircle2, color: 'bg-purple-500/20 text-purple-400' },
  'archived': { label: 'Archived', icon: XCircle, color: 'bg-gray-600/20 text-gray-500' }
};

export const ApprovalWorkspace: React.FC<ApprovalWorkspaceProps> = ({
  contentItems
}) => {
  const [selectedContent, setSelectedContent] = useState<ContentItemType | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'dashboard' | 'review'>('dashboard');
  const [sortBy, setSortBy] = useState<'updated_at' | 'created_at' | 'title'>('updated_at');
  
  const { 
    updateContentItem, 
    refreshContent,
    approveContent,
    rejectContent,
    requestChanges 
  } = useContent();

  // Enhanced filtering and sorting
  const filteredAndSortedContent = useMemo(() => {
    let filtered = contentItems.filter(item => {
      // Status filter
      const matchesStatus = statusFilter === 'all' || item.approval_status === statusFilter;
      
      // Search filter
      const matchesSearch = searchQuery === '' || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.content && item.content.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesStatus && matchesSearch;
    });

    // Sort items
    filtered.sort((a, b) => {
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return new Date(b[sortBy]).getTime() - new Date(a[sortBy]).getTime();
    });

    return filtered;
  }, [contentItems, statusFilter, priorityFilter, searchQuery, sortBy]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = contentItems.length;
    const pending = contentItems.filter(item => item.approval_status === 'pending_review').length;
    const inReview = contentItems.filter(item => item.approval_status === 'in_review').length;
    const approved = contentItems.filter(item => item.approval_status === 'approved').length;
    const rejected = contentItems.filter(item => item.approval_status === 'rejected').length;
    const needsChanges = contentItems.filter(item => item.approval_status === 'needs_changes').length;

    return { total, pending, inReview, approved, rejected, needsChanges };
  }, [contentItems]);

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

  const handleViewContent = (content: ContentItemType) => {
    setSelectedContent(content);
    setViewMode('review');
  };

  const handleBulkAction = async (action: 'approve' | 'reject', selectedItems: string[], reason?: string) => {
    try {
      for (const itemId of selectedItems) {
        if (action === 'approve') {
          await handleApprove(itemId);
        } else {
          await handleReject(itemId, reason || 'Bulk rejection');
        }
      }
      toast.success(`Bulk ${action} completed successfully`);
    } catch (error) {
      toast.error(`Failed to perform bulk ${action}`);
      console.error(error);
    }
  };

  if (viewMode === 'review' && selectedContent) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => setViewMode('dashboard')}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            ← Back to Dashboard
          </Button>
          <h2 className="text-xl font-semibold text-white/90">Review Content</h2>
          <Badge className={statusConfig[selectedContent.approval_status as keyof typeof statusConfig]?.color}>
            {statusConfig[selectedContent.approval_status as keyof typeof statusConfig]?.label}
          </Badge>
        </div>
        <ContentApprovalEditor content={selectedContent} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Dashboard */}
      <div className="glass-panel rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white/90">Content Approval Dashboard</h2>
          <div className="flex gap-2">
            {Object.entries(stats).map(([key, value]) => (
              <Badge key={key} variant="outline" className="bg-white/5 border-white/10 text-white/70">
                {key.charAt(0).toUpperCase() + key.slice(1)}: {value}
              </Badge>
            ))}
          </div>
        </div>

        <ApprovalDashboard 
          contentItems={contentItems}
          onFilterChange={setStatusFilter}
          selectedFilter={statusFilter}
        />
      </div>

      {/* Enhanced Search and Filters */}
      <div className="glass-panel rounded-xl p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
            <Input
              placeholder="Search content by title or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending_review">Pending Review</SelectItem>
                <SelectItem value="in_review">In Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="needs_changes">Needs Changes</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updated_at">Last Updated</SelectItem>
                <SelectItem value="created_at">Created Date</SelectItem>
                <SelectItem value="title">Title</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => refreshContent()}
              className="bg-white/5 border-white/10 hover:bg-white/10 text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="space-y-4">
        {filteredAndSortedContent.length === 0 ? (
          <div className="glass-panel rounded-xl p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-white/30" />
            </div>
            <h3 className="text-lg font-medium text-white/80 mb-2">No content found</h3>
            <p className="text-white/60 mb-4">
              {searchQuery ? 'Try adjusting your search terms' : 'No content matches the selected filter'}
            </p>
            <p className="text-white/50 text-sm">
              Total content items: {contentItems.length} | Filtered results: {filteredAndSortedContent.length}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredAndSortedContent.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <ApprovalCard
                    content={item}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onRequestChanges={handleRequestChanges}
                    onView={handleViewContent}
                    isSelected={selectedContent?.id === item.id}
                    onClick={() => setSelectedContent(item)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};
