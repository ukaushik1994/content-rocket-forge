
import React, { useState, useEffect } from 'react';
import { ContentItemType } from '@/contexts/content/types';
import { ContentApprovalSidebar } from './ContentApprovalSidebar';
import { ContentApprovalEditor } from './ContentApprovalEditor';
import { InterLinkingSuggestions } from './interlinking/InterLinkingSuggestions';
import { SeoRecommendations } from './seo/SeoRecommendations';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApproval } from './context/ApprovalContext';
import { useContent } from '@/contexts/content';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Link, BarChart3, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  const [activeTab, setActiveTab] = useState('editor');
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
      // Find interlinking opportunities whenever selected content changes
      findInterLinkingOpportunities(selectedContent);
    }
  }, [selectedContent, findInterLinkingOpportunities]);

  const handleApprove = async () => {
    if (!selectedContent) return;
    
    try {
      await updateContentItem(selectedContent.id, { 
        status: 'approved',
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

  const tabVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  const renderStatusActions = () => {
    if (!selectedContent) return null;
    
    switch(selectedContent.status) {
      case 'draft':
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar */}
      <motion.div 
        className="lg:col-span-1"
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
        className="lg:col-span-3 space-y-6"
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
              value={activeTab} 
              onValueChange={setActiveTab} 
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
                  key={activeTab}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={tabVariants}
                >
                  {activeTab === "editor" && (
                    <ContentApprovalEditor content={selectedContent} />
                  )}
                  
                  {activeTab === "interlinking" && (
                    <InterLinkingSuggestions content={selectedContent} />
                  )}
                  
                  {activeTab === "seo" && (
                    <SeoRecommendations content={selectedContent} />
                  )}
                </motion.div>
              </AnimatePresence>
            </Tabs>
          </>
        ) : (
          <div className="border border-white/10 rounded-xl p-12 flex flex-col items-center justify-center text-white/50 bg-gray-800/20 backdrop-blur-sm shadow-xl">
            <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-white/30" />
            </div>
            <h3 className="text-xl font-medium mb-2">Select content to review</h3>
            <p>Choose an item from the sidebar to begin the approval process</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};
