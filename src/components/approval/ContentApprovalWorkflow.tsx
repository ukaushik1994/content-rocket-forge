
import React, { useState, useEffect } from 'react';
import { ContentItemType } from '@/contexts/content/types';
import { ContentApprovalSidebar } from './ContentApprovalSidebar';
import { ContentApprovalEditor } from './ContentApprovalEditor';
import { InterLinkingSuggestions } from './interlinking/InterLinkingSuggestions';
import { SeoRecommendations } from './seo/SeoRecommendations';
import { AdvancedFilters, BatchOperations, AssignmentManager } from './workflow';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApproval } from './context/ApprovalContext';
import { useContent } from '@/contexts/content';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Link, BarChart3, CheckCircle, Users, Settings, Filter, List, Columns, Grid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface ContentApprovalWorkflowProps {
  contentItems: ContentItemType[];
  selectedContent: ContentItemType | null;
  onSelectContent: (content: ContentItemType | null) => void;
  statusFilter: string;
}

export const ContentApprovalWorkflow: React.FC<ContentApprovalWorkflowProps> = ({
  contentItems,
  selectedContent,
  onSelectContent,
  statusFilter
}) => {
  const [activeMainTab, setActiveMainTab] = useState('content');
  const [activeContentTab, setActiveContentTab] = useState('editor');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  const { findInterLinkingOpportunities } = useApproval();
  const { updateContentItem, publishContent } = useContent();
  
  // Select first item by default if nothing is selected
  useEffect(() => {
    if (contentItems.length > 0 && !selectedContent) {
      onSelectContent(contentItems[0]);
    }
  }, [contentItems, selectedContent, onSelectContent]);
  
  useEffect(() => {
    if (selectedContent) {
      findInterLinkingOpportunities(selectedContent);
    }
  }, [selectedContent, findInterLinkingOpportunities]);

  const handleApprove = async () => {
    if (!selectedContent) return;
    
    try {
      await updateContentItem(selectedContent.id, { 
        approval_status: 'approved',
        updated_at: new Date().toISOString()
      });
      toast.success('Content approved successfully');
    } catch (error) {
      console.error('Error approving content:', error);
      toast.error('Failed to approve content');
    }
  };

  const handlePublish = async () => {
    if (!selectedContent) return;
    
    try {
      await publishContent(selectedContent.id);
      toast.success('Content published successfully');
    } catch (error) {
      console.error('Error publishing content:', error);
      toast.error('Failed to publish content');
    }
  };

  const handleBatchAction = async (action: 'approve' | 'reject' | 'request_changes' | 'assign', data?: any) => {
    // Implementation for batch actions
    console.log('Batch action:', action, data);
    toast.success(`Batch ${action} completed`);
  };

  const handleAssignment = async (contentId: string, assignmentData: any) => {
    // Implementation for assignment
    console.log('Assignment:', contentId, assignmentData);
    toast.success('Content assigned successfully');
  };

  const handleFiltersChange = (criteria: any) => {
    // Implementation for filter changes
    console.log('Filters changed:', criteria);
  };

  const renderStatusActions = () => {
    if (!selectedContent) return null;
    
    switch(selectedContent.approval_status) {
      case 'draft':
      case 'pending_review':
        return (
          <Button 
            onClick={handleApprove}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Approve Content
          </Button>
        );
      case 'approved':
        return (
          <Button 
            onClick={handlePublish}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Publish Content
          </Button>
        );
      default:
        return null;
    }
  };

  const getStats = () => {
    const total = contentItems.length;
    const pending = contentItems.filter(item => item.approval_status === 'pending_review').length;
    const approved = contentItems.filter(item => item.approval_status === 'approved').length;
    const rejected = contentItems.filter(item => item.approval_status === 'rejected').length;
    
    return { total, pending, approved, rejected };
  };

  const stats = getStats();

  return (
    <div className="flex flex-col h-full">
      {/* Modern Header with Stats */}
      <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm border-b border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white/90">Content Approval Center</h1>
            <p className="text-white/60">Streamlined workflow for content review and approval</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Quick Stats */}
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                Total: {stats.total}
              </Badge>
              <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                Pending: {stats.pending}
              </Badge>
              <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                Approved: {stats.approved}
              </Badge>
              <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">
                Rejected: {stats.rejected}
              </Badge>
            </div>
            
            {/* View Toggle */}
            <div className="flex gap-1 bg-white/5 rounded-lg p-1">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-8 w-8 p-0"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-8 w-8 p-0"
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="flex-1 flex flex-col">
        <TabsList className="mx-6 mt-4 grid grid-cols-4 bg-gray-800/50 backdrop-blur-sm border border-white/10">
          <TabsTrigger 
            value="content"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-neon-purple data-[state=active]:to-neon-blue data-[state=active]:text-white"
          >
            <FileText className="h-4 w-4 mr-2" />
            Content Review
          </TabsTrigger>
          <TabsTrigger 
            value="workflow"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-neon-purple data-[state=active]:to-neon-blue data-[state=active]:text-white"
          >
            <Settings className="h-4 w-4 mr-2" />
            Workflow Tools
          </TabsTrigger>
          <TabsTrigger 
            value="batch"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-neon-purple data-[state=active]:to-neon-blue data-[state=active]:text-white"
          >
            <Users className="h-4 w-4 mr-2" />
            Batch Operations
          </TabsTrigger>
          <TabsTrigger 
            value="analytics"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-neon-purple data-[state=active]:to-neon-blue data-[state=active]:text-white"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Content Review Tab */}
        <TabsContent value="content" className="flex-1 flex gap-6 p-6">
          {/* Sidebar */}
          <motion.div 
            className="w-80 space-y-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ContentApprovalSidebar 
              contentItems={contentItems}
              selectedContent={selectedContent}
              onSelectContent={onSelectContent}
              statusFilter={statusFilter}
            />
          </motion.div>
          
          {/* Main Content Area */}
          <motion.div 
            className="flex-1 space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {selectedContent ? (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-white/90">{selectedContent.title}</h2>
                  {renderStatusActions()}
                </div>
                
                <Tabs 
                  value={activeContentTab} 
                  onValueChange={setActiveContentTab} 
                  className="w-full"
                >
                  <TabsList className="grid grid-cols-3 mb-6 p-1 bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-lg">
                    <TabsTrigger 
                      value="editor"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-neon-purple data-[state=active]:to-neon-blue data-[state=active]:text-white"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Content Editor
                    </TabsTrigger>
                    <TabsTrigger 
                      value="interlinking"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-neon-purple data-[state=active]:to-neon-blue data-[state=active]:text-white"
                    >
                      <Link className="h-4 w-4 mr-2" />
                      Interlinking
                    </TabsTrigger>
                    <TabsTrigger 
                      value="seo"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-neon-purple data-[state=active]:to-neon-blue data-[state=active]:text-white"
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      SEO Analysis
                    </TabsTrigger>
                  </TabsList>
                  
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeContentTab}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      {activeContentTab === "editor" && (
                        <ContentApprovalEditor content={selectedContent} />
                      )}
                      
                      {activeContentTab === "interlinking" && (
                        <InterLinkingSuggestions content={selectedContent} />
                      )}
                      
                      {activeContentTab === "seo" && (
                        <SeoRecommendations content={selectedContent} />
                      )}
                    </motion.div>
                  </AnimatePresence>
                </Tabs>
              </>
            ) : (
              <Card className="border border-white/10 bg-gray-800/20 backdrop-blur-sm shadow-xl">
                <CardContent className="p-12 flex flex-col items-center justify-center text-white/50">
                  <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <FileText className="h-8 w-8 text-white/30" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">Select content to review</h3>
                  <p>Choose an item from the sidebar to begin the approval process</p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </TabsContent>

        {/* Workflow Tools Tab */}
        <TabsContent value="workflow" className="flex-1 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AdvancedFilters
              contentItems={contentItems}
              onFiltersChange={handleFiltersChange}
            />
            <AssignmentManager
              contentItems={contentItems}
              selectedContent={selectedContent || undefined}
              onAssign={handleAssignment}
            />
          </div>
        </TabsContent>

        {/* Batch Operations Tab */}
        <TabsContent value="batch" className="flex-1 p-6">
          <BatchOperations
            contentItems={contentItems}
            selectedItems={selectedItems}
            onSelectionChange={setSelectedItems}
            onBatchAction={handleBatchAction}
          />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="flex-1 p-6">
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white/90">Analytics Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
                  <div className="text-2xl font-bold text-blue-400">{stats.total}</div>
                  <div className="text-blue-300 text-sm">Total Content</div>
                </div>
                <div className="p-4 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                  <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
                  <div className="text-yellow-300 text-sm">Pending Review</div>
                </div>
                <div className="p-4 bg-green-500/20 rounded-lg border border-green-500/30">
                  <div className="text-2xl font-bold text-green-400">{stats.approved}</div>
                  <div className="text-green-300 text-sm">Approved</div>
                </div>
                <div className="p-4 bg-red-500/20 rounded-lg border border-red-500/30">
                  <div className="text-2xl font-bold text-red-400">{stats.rejected}</div>
                  <div className="text-red-300 text-sm">Rejected</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
