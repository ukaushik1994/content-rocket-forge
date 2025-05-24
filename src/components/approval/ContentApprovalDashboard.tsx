
import React, { useState, useEffect } from 'react';
import { ContentItemType } from '@/contexts/content/types';
import { useContent } from '@/contexts/content';
import { ApprovalHeader } from './dashboard/ApprovalHeader';
import { ApprovalSidebar } from './dashboard/ApprovalSidebar';
import { ContentReviewPanel } from './dashboard/ContentReviewPanel';
import { ScoringPanel } from './dashboard/ScoringPanel';
import { InterlinkingPanel } from './dashboard/InterlinkingPanel';
import { SeoAnalysisPanel } from './dashboard/SeoAnalysisPanel';
import { WorkflowPanel } from './dashboard/WorkflowPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Link, BarChart3, Settings, Brain, 
  Search, Users, CheckCircle, AlertTriangle 
} from 'lucide-react';
import { toast } from 'sonner';

export const ContentApprovalDashboard: React.FC = () => {
  const [selectedContent, setSelectedContent] = useState<ContentItemType | null>(null);
  const [activeTab, setActiveTab] = useState('review');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  
  const { contentItems, loading, error } = useContent();
  
  // Filter content based on status
  const filteredContent = contentItems.filter(item => 
    statusFilter === 'all' || item.approval_status === statusFilter
  );
  
  // Auto-select first item if none selected
  useEffect(() => {
    if (filteredContent.length > 0 && !selectedContent) {
      setSelectedContent(filteredContent[0]);
    }
  }, [filteredContent, selectedContent]);
  
  // Calculate dashboard stats
  const stats = {
    total: contentItems.length,
    pending: contentItems.filter(item => item.approval_status === 'pending_review').length,
    approved: contentItems.filter(item => item.approval_status === 'approved').length,
    rejected: contentItems.filter(item => item.approval_status === 'rejected').length,
    needsChanges: contentItems.filter(item => item.approval_status === 'needs_changes').length,
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-neon-purple/30 border-t-neon-purple animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-neon-purple/50 animate-pulse"></div>
            </div>
          </div>
          <span className="text-lg font-medium text-gradient">Loading content approval center...</span>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Error Loading Content</h2>
          <p className="text-white/60">{error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black">
      {/* Sidebar */}
      <ApprovalSidebar
        contentItems={filteredContent}
        selectedContent={selectedContent}
        onSelectContent={setSelectedContent}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        stats={stats}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <ApprovalHeader 
          selectedContent={selectedContent}
          stats={stats}
        />
        
        {/* Content Tabs */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="mx-6 mt-4 grid grid-cols-6 bg-gray-800/50 backdrop-blur-sm border border-white/10">
              <TabsTrigger 
                value="review"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-neon-purple data-[state=active]:to-neon-blue data-[state=active]:text-white"
              >
                <FileText className="h-4 w-4 mr-2" />
                Review
              </TabsTrigger>
              <TabsTrigger 
                value="scoring"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-neon-purple data-[state=active]:to-neon-blue data-[state=active]:text-white"
              >
                <Brain className="h-4 w-4 mr-2" />
                AI Scoring
              </TabsTrigger>
              <TabsTrigger 
                value="seo"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-neon-purple data-[state=active]:to-neon-blue data-[state=active]:text-white"
              >
                <Search className="h-4 w-4 mr-2" />
                SEO Analysis
              </TabsTrigger>
              <TabsTrigger 
                value="interlinking"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-neon-purple data-[state=active]:to-neon-blue data-[state=active]:text-white"
              >
                <Link className="h-4 w-4 mr-2" />
                Interlinking
              </TabsTrigger>
              <TabsTrigger 
                value="analytics"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-neon-purple data-[state=active]:to-neon-blue data-[state=active]:text-white"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger 
                value="workflow"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-neon-purple data-[state=active]:to-neon-blue data-[state=active]:text-white"
              >
                <Settings className="h-4 w-4 mr-2" />
                Workflow
              </TabsTrigger>
            </TabsList>
            
            <div className="flex-1 overflow-hidden p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  <TabsContent value="review" className="h-full m-0">
                    <ContentReviewPanel content={selectedContent} />
                  </TabsContent>
                  
                  <TabsContent value="scoring" className="h-full m-0">
                    <ScoringPanel content={selectedContent} />
                  </TabsContent>
                  
                  <TabsContent value="seo" className="h-full m-0">
                    <SeoAnalysisPanel content={selectedContent} />
                  </TabsContent>
                  
                  <TabsContent value="interlinking" className="h-full m-0">
                    <InterlinkingPanel content={selectedContent} />
                  </TabsContent>
                  
                  <TabsContent value="analytics" className="h-full m-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-full">
                      {/* Analytics content will be added here */}
                      <div className="col-span-full flex items-center justify-center text-white/60">
                        Analytics dashboard coming soon...
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="workflow" className="h-full m-0">
                    <WorkflowPanel contentItems={contentItems} />
                  </TabsContent>
                </motion.div>
              </AnimatePresence>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
