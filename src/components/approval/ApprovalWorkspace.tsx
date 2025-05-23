
import React, { useState } from 'react';
import { ContentItemType } from '@/contexts/content/types';
import { ApprovalCard } from './ApprovalCard';
import { ApprovalDashboard } from './ApprovalDashboard';
import { ContentApprovalEditor } from './ContentApprovalEditor';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContent } from '@/contexts/content';
import { toast } from 'sonner';

interface ApprovalWorkspaceProps {
  contentItems: ContentItemType[];
}

export const ApprovalWorkspace: React.FC<ApprovalWorkspaceProps> = ({
  contentItems
}) => {
  const [selectedContent, setSelectedContent] = useState<ContentItemType | null>(null);
  const [statusFilter, setStatusFilter] = useState('all'); // Changed from 'pending_review' to 'all'
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'dashboard' | 'review'>('dashboard');
  
  const { 
    updateContentItem, 
    refreshContent,
    approveContent,
    rejectContent,
    requestChanges 
  } = useContent();

  // Filter content based on status and search - improved logic
  const filteredContent = contentItems.filter(item => {
    // Status filter logic
    let matchesStatus = true;
    if (statusFilter !== 'all') {
      // Handle approval status filtering
      if (item.approval_status) {
        matchesStatus = item.approval_status === statusFilter;
      } else {
        // Fallback to regular status if approval_status is not set
        matchesStatus = item.status === statusFilter;
      }
    }
    
    // Search filter logic
    const matchesSearch = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.content && item.content.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesStatus && matchesSearch;
  });

  const handleApprove = async (id: string, comments?: string) => {
    try {
      await updateContentItem(id, { 
        approval_status: 'approved',
        status: 'published'
      });
      toast.success('Content approved successfully');
      await refreshContent();
    } catch (error) {
      toast.error('Failed to approve content');
      console.error(error);
    }
  };

  const handleReject = async (id: string, comments: string) => {
    try {
      await updateContentItem(id, { 
        approval_status: 'rejected'
      });
      toast.success('Content rejected');
      await refreshContent();
    } catch (error) {
      toast.error('Failed to reject content');
      console.error(error);
    }
  };

  const handleRequestChanges = async (id: string, comments: string) => {
    try {
      await updateContentItem(id, { 
        approval_status: 'needs_changes'
      });
      toast.success('Change request sent');
      await refreshContent();
    } catch (error) {
      toast.error('Failed to request changes');
      console.error(error);
    }
  };

  const handleViewContent = (content: ContentItemType) => {
    setSelectedContent(content);
    setViewMode('review');
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
        </div>
        <ContentApprovalEditor content={selectedContent} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ApprovalDashboard 
        contentItems={contentItems}
        onFilterChange={setStatusFilter}
        selectedFilter={statusFilter}
      />

      {/* Search and Filters */}
      <div className="glass-panel rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
            <Input
              placeholder="Search content by title or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => refreshContent()}
              className="bg-white/5 border-white/10 hover:bg-white/10 text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button
              variant="outline"
              className="bg-white/5 border-white/10 hover:bg-white/10 text-white"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="space-y-4">
        {filteredContent.length === 0 ? (
          <div className="glass-panel rounded-xl p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-white/30" />
            </div>
            <h3 className="text-lg font-medium text-white/80 mb-2">No content found</h3>
            <p className="text-white/60 mb-4">
              {searchQuery ? 'Try adjusting your search terms' : 'No content matches the selected filter'}
            </p>
            {contentItems.length === 0 && (
              <p className="text-white/50 text-sm">
                Total content items available: {contentItems.length}
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredContent.map((item) => (
                <ApprovalCard
                  key={item.id}
                  content={item}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onRequestChanges={handleRequestChanges}
                  onView={handleViewContent}
                  isSelected={selectedContent?.id === item.id}
                  onClick={() => setSelectedContent(item)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};
