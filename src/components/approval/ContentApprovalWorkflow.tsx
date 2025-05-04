
import React, { useState, useEffect } from 'react';
import { ContentItemType } from '@/contexts/content/types';
import { ContentApprovalSidebar } from './ContentApprovalSidebar';
import { ContentApprovalEditor } from './ContentApprovalEditor';
import { InterLinkingSuggestions } from './interlinking/InterLinkingSuggestions';
import { SeoRecommendations } from './seo/SeoRecommendations';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApproval } from './context/ApprovalContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Link, BarChart3 } from 'lucide-react';

interface ContentApprovalWorkflowProps {
  contentItems: ContentItemType[];
  selectedContent: ContentItemType | null;
  onSelectContent: (content: ContentItemType | null) => void;
}

export const ContentApprovalWorkflow: React.FC<ContentApprovalWorkflowProps> = ({
  contentItems,
  selectedContent,
  onSelectContent
}) => {
  const [activeTab, setActiveTab] = useState('editor');
  const { findInterLinkingOpportunities } = useApproval();
  
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

  const tabVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
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
