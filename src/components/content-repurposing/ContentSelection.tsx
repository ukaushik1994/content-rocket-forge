
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ContentList from './content-selection/ContentList';
import ContentSelectionHeader from './content-selection/ContentSelectionHeader';
import EmptyContentState from './content-selection/EmptyContentState';
import RepurposedContentDialog from './RepurposedContentDialog';
import { GeneratedContentFormat } from './hooks/repurposing/types';
import { ContentItemType } from '@/contexts/content/types';

interface ContentSelectionProps {
  contentItems: ContentItemType[];
  onSelectContent: (contentId: string) => void;
  onOpenRepurposedContent: (contentId: string, formatId: string) => void;
  repurposedDialogOpen: boolean;
  onCloseRepurposedDialog: () => void;
  selectedRepurposedContent: GeneratedContentFormat | null;
  onCopyToClipboard: (content: string) => void;
  onDownloadAsText: (content: string, formatName: string) => void;
  onDeleteRepurposedContent?: (contentId: string, formatId: string) => Promise<boolean>;
  isDeleting?: boolean;
  selectedContentId?: string;
}

const ContentSelection: React.FC<ContentSelectionProps> = ({
  contentItems,
  onSelectContent,
  onOpenRepurposedContent,
  repurposedDialogOpen,
  onCloseRepurposedDialog,
  selectedRepurposedContent,
  onCopyToClipboard,
  onDownloadAsText,
  onDeleteRepurposedContent,
  isDeleting,
  selectedContentId
}) => {
  const [activeTab, setActiveTab] = useState<'new' | 'repurposed'>('new');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter content items based on active tab
  const newContentItems = contentItems.filter(item => 
    !item.metadata?.repurposedFormats?.length
  );
  
  const repurposedContentItems = contentItems.filter(item => 
    item.metadata?.repurposedFormats?.length > 0
  );

  // Apply search filter if searchQuery is not empty
  const filteredNewContent = searchQuery 
    ? newContentItems.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.content?.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : newContentItems;

  const filteredRepurposedContent = searchQuery
    ? repurposedContentItems.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.content?.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : repurposedContentItems;

  const activeItems = activeTab === 'new' ? filteredNewContent : filteredRepurposedContent;
  const showEmptyState = activeItems.length === 0;

  return (
    <div className="space-y-4">
      <ContentSelectionHeader 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        totalItems={activeItems.length}
      />
      
      <Tabs 
        value={activeTab} 
        onValueChange={(value) => setActiveTab(value as 'new' | 'repurposed')}
      >
        <TabsList className="w-full bg-black/20 p-0.5 border border-white/10 rounded-lg">
          <TabsTrigger 
            value="new" 
            className="relative data-[state=active]:shadow-none flex-1 py-2"
          >
            {activeTab === 'new' && (
              <motion.div
                layoutId="activeTabBackground"
                className="absolute inset-0 bg-white/10 rounded-md"
                transition={{ duration: 0.3, type: "spring" }}
              />
            )}
            <span className="relative z-10">New Content</span>
          </TabsTrigger>
          <TabsTrigger 
            value="repurposed" 
            className="relative data-[state=active]:shadow-none flex-1 py-2"
          >
            {activeTab === 'repurposed' && (
              <motion.div
                layoutId="activeTabBackground"
                className="absolute inset-0 bg-white/10 rounded-md"
                transition={{ duration: 0.3, type: "spring" }}
              />
            )}
            <span className="relative z-10">Repurposed Content</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="new" className="pt-3 focus-visible:outline-none focus-visible:ring-0">
          {showEmptyState ? (
            <EmptyContentState viewType="new" searchQuery={searchQuery} />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="overflow-y-auto"
            >
              <ContentList
                contentItems={filteredNewContent}
                onSelectContent={onSelectContent}
                onOpenRepurposedContent={onOpenRepurposedContent}
                viewType="new"
                selectedContentId={selectedContentId}
              />
            </motion.div>
          )}
        </TabsContent>
        
        <TabsContent value="repurposed" className="pt-3 focus-visible:outline-none focus-visible:ring-0">
          {showEmptyState ? (
            <EmptyContentState viewType="repurposed" searchQuery={searchQuery} />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="overflow-y-auto"
            >
              <ContentList
                contentItems={filteredRepurposedContent}
                onSelectContent={onSelectContent}
                onOpenRepurposedContent={onOpenRepurposedContent}
                onDeleteContent={onDeleteRepurposedContent && ((contentId: string, formatId: string) => {
                  if (onDeleteRepurposedContent) {
                    return onDeleteRepurposedContent(contentId, formatId);
                  }
                  return Promise.resolve(false);
                })}
                isDeleting={isDeleting}
                viewType="repurposed"
                selectedContentId={selectedContentId}
              />
            </motion.div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Repurposed Content Dialog */}
      <RepurposedContentDialog
        open={repurposedDialogOpen}
        onClose={onCloseRepurposedDialog}
        content={selectedRepurposedContent}
        onCopy={onCopyToClipboard}
        onDownload={onDownloadAsText}
        onDelete={onDeleteRepurposedContent}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default ContentSelection;
