
import React, { useState, useEffect } from 'react';
import { ContentItemType } from '@/contexts/content/types';
import { ContentApprovalSidebar } from './ContentApprovalSidebar';
import { ContentApprovalEditor } from './ContentApprovalEditor';
import { InterLinkingSuggestions } from './interlinking/InterLinkingSuggestions';
import { SeoRecommendations } from './seo/SeoRecommendations';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApproval } from './context/ApprovalContext';

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar */}
      <div className="lg:col-span-1">
        <ContentApprovalSidebar 
          contentItems={contentItems}
          selectedContent={selectedContent}
          onSelectContent={onSelectContent}
        />
      </div>
      
      {/* Main Content Area */}
      <div className="lg:col-span-3 space-y-6">
        {selectedContent ? (
          <>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="editor">Content Editor</TabsTrigger>
                <TabsTrigger value="interlinking">Interlinking</TabsTrigger>
                <TabsTrigger value="seo">SEO Recommendations</TabsTrigger>
              </TabsList>
              
              <TabsContent value="editor" className="mt-0">
                <ContentApprovalEditor 
                  content={selectedContent} 
                />
              </TabsContent>
              
              <TabsContent value="interlinking" className="mt-0">
                <InterLinkingSuggestions
                  content={selectedContent}
                />
              </TabsContent>
              
              <TabsContent value="seo" className="mt-0">
                <SeoRecommendations
                  content={selectedContent}
                />
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="border rounded-md p-8 flex items-center justify-center text-muted-foreground">
            Select content from the sidebar to begin approval process
          </div>
        )}
      </div>
    </div>
  );
};
