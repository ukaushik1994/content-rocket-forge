
import React, { useState, useEffect } from 'react';
import { ContentItemType } from '@/contexts/content/types';
import { ContentApprovalSidebar } from './ContentApprovalSidebar';
import { Tabs } from '@/components/ui/tabs';
import { useApproval } from './context/ApprovalContext';
import { motion } from 'framer-motion';
import { StatusActions, TabContent, EmptyContent, WorkflowTabs } from './workflow';

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
              <StatusActions selectedContent={selectedContent} />
            </div>
            
            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab} 
              className="w-full"
            >
              <WorkflowTabs 
                activeTab={activeTab} 
                onTabChange={setActiveTab} 
              />
              
              <TabContent 
                activeTab={activeTab} 
                selectedContent={selectedContent} 
              />
            </Tabs>
          </>
        ) : (
          <EmptyContent />
        )}
      </motion.div>
    </div>
  );
};
