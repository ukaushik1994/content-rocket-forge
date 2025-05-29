
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
import { Search, Filter, RefreshCw, Clock, AlertCircle, CheckCircle2, XCircle, BarChart3, Users, FileText, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContent } from '@/contexts/content';
import { toast } from 'sonner';

interface ApprovalWorkspaceProps {
  contentItems: ContentItemType[];
}

const statusConfig = {
  'draft': { label: 'Draft', icon: Clock, color: 'bg-gray-500/20 text-gray-300 border-gray-500/30' },
  'pending_review': { label: 'Pending Review', icon: AlertCircle, color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
  'in_review': { label: 'In Review', icon: Clock, color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  'approved': { label: 'Approved', icon: CheckCircle2, color: 'bg-green-500/20 text-green-300 border-green-500/30' },
  'rejected': { label: 'Rejected', icon: XCircle, color: 'bg-red-500/20 text-red-300 border-red-500/30' },
  'needs_changes': { label: 'Needs Changes', icon: AlertCircle, color: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
  'published': { label: 'Published', icon: CheckCircle2, color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  'archived': { label: 'Archived', icon: XCircle, color: 'bg-gray-600/20 text-gray-400 border-gray-600/30' }
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
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm rounded-xl border border-white/10">
          <Button
            variant="ghost"
            onClick={() => setViewMode('dashboard')}
            className="text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
          >
            ← Back to Dashboard
          </Button>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-white/90">Review Content</h2>
            <p className="text-white/60 text-sm">Detailed content review and editing interface</p>
          </div>
          <Badge className={`${statusConfig[selectedContent.approval_status as keyof typeof statusConfig]?.color} border`}>
            {statusConfig[selectedContent.approval_status as keyof typeof statusConfig]?.label}
          </Badge>
        </div>
        <ContentApprovalEditor content={selectedContent} />
      </motion.div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Dashboard Header */}
      <motion.div 
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800/40 to-gray-900/60 backdrop-blur-lg border border-white/10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/10 to-neon-blue/10"></div>
        <div className="relative p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white/90 mb-2">Approval Dashboard</h2>
              <p className="text-white/60">Manage and review your content efficiently</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => refreshContent()}
                className="bg-white/5 border-white/20 hover:bg-white/10 text-white transition-all duration-200"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            {Object.entries(stats).map(([key, value]) => {
              const getIcon = () => {
                switch(key) {
                  case 'total': return BarChart3;
                  case 'pending': return Clock;
                  case 'inReview': return Users;
                  case 'approved': return CheckCircle2;
                  case 'rejected': return XCircle;
                  case 'needsChanges': return AlertCircle;
                  default: return FileText;
                }
              };
              const Icon = getIcon();
              
              return (
                <motion.div
                  key={key}
                  className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-neon-purple/20 to-neon-blue/20">
                      <Icon className="h-4 w-4 text-white/80" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{value}</p>
                      <p className="text-xs text-white/60 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <ApprovalDashboard 
            contentItems={contentItems}
            onFilterChange={setStatusFilter}
            selectedFilter={statusFilter}
          />
        </div>
      </motion.div>

      {/* Enhanced Search and Filters */}
      <motion.div 
        className="bg-gradient-to-r from-gray-800/40 to-gray-900/60 backdrop-blur-lg rounded-xl p-6 border border-white/10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
            <Input
              placeholder="Search content by title or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-white/5 border-white/20 text-white placeholder:text-white/40 h-12 rounded-lg focus:ring-2 focus:ring-neon-purple/50 transition-all duration-200"
            />
          </div>
          
          <div className="flex gap-3 flex-wrap">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-44 bg-white/5 border-white/20 text-white h-12 rounded-lg">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-white/20">
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
              <SelectTrigger className="w-44 bg-white/5 border-white/20 text-white h-12 rounded-lg">
                <TrendingUp className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-white/20">
                <SelectItem value="updated_at">Last Updated</SelectItem>
                <SelectItem value="created_at">Created Date</SelectItem>
                <SelectItem value="title">Title</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </motion.div>

      {/* Content Grid */}
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        {filteredAndSortedContent.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/50 backdrop-blur-lg rounded-2xl p-16 text-center border border-white/10">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-neon-purple/20 to-neon-blue/20 flex items-center justify-center mx-auto mb-6">
              <Search className="h-10 w-10 text-white/30" />
            </div>
            <h3 className="text-2xl font-medium text-white/80 mb-3">No content found</h3>
            <p className="text-white/60 mb-6 max-w-md mx-auto">
              {searchQuery ? 'Try adjusting your search terms or filters to find content.' : 'No content matches the selected filter criteria.'}
            </p>
            <div className="flex justify-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-white/50">
                <span>Total items:</span>
                <Badge variant="outline" className="border-white/20 text-white/70">{contentItems.length}</Badge>
              </div>
              <div className="flex items-center gap-2 text-white/50">
                <span>Filtered results:</span>
                <Badge variant="outline" className="border-white/20 text-white/70">{filteredAndSortedContent.length}</Badge>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredAndSortedContent.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  whileHover={{ y: -5 }}
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
      </motion.div>
    </div>
  );
};
