
import React from 'react';
import { ContentItemType } from '@/contexts/content/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import RepurposedContentDialog from './RepurposedContentDialog';
import ContentSelectionHeader from './content-selection/ContentSelectionHeader';
import EmptyContentState from './content-selection/EmptyContentState';
import ContentList from './content-selection/ContentList';

interface ContentSelectionProps {
  contentItems: ContentItemType[];
  onSelectContent: (contentId: string) => void;
  onOpenRepurposedContent: (contentId: string, formatId: string) => void;
  repurposedDialogOpen: boolean;
  onCloseRepurposedDialog: () => void;
  selectedRepurposedContent: {
    content: string;
    formatId: string;
    contentId: string;
    title: string;
  } | null;
  onCopyToClipboard: (content: string) => void;
  onDownloadAsText: (content: string, formatName: string) => void;
  onDeleteRepurposedContent?: (contentId: string, formatId: string) => Promise<boolean>;
  isDeleting?: boolean;
}

export const ContentSelection: React.FC<ContentSelectionProps> = ({
  contentItems,
  onSelectContent,
  onOpenRepurposedContent,
  repurposedDialogOpen,
  onCloseRepurposedDialog,
  selectedRepurposedContent,
  onCopyToClipboard,
  onDownloadAsText,
  onDeleteRepurposedContent,
  isDeleting = false
}) => {
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [activeTab, setActiveTab] = React.useState('new');
  
  // Filter content items based on search query
  const filteredItems = contentItems.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (item.content && item.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Separate content into new and repurposed
  const newContentItems = filteredItems.filter(item => 
    !item.metadata?.repurposedFormats || item.metadata.repurposedFormats.length === 0
  );
  
  const repurposedContentItems = filteredItems.filter(item => 
    item.metadata?.repurposedFormats && item.metadata.repurposedFormats.length > 0
  );

  return (
    <>
      <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-black/40 to-black/60 backdrop-blur-md border border-white/10">
        <CardHeader className="border-b border-white/10 bg-black/30">
          <ContentSelectionHeader 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            totalItems={contentItems.length}
          />
        </CardHeader>
        
        <CardContent className="p-6">
          <Tabs 
            defaultValue="new" 
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 mb-6 bg-black/30 w-full max-w-md mx-auto">
              <TabsTrigger 
                value="new"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-neon-purple data-[state=active]:to-neon-blue data-[state=active]:text-white"
              >
                New Content ({newContentItems.length})
              </TabsTrigger>
              <TabsTrigger 
                value="repurposed"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-neon-purple data-[state=active]:to-neon-blue data-[state=active]:text-white"
              >
                Repurposed ({repurposedContentItems.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="new" className="space-y-4">
              {newContentItems.length === 0 ? (
                <EmptyContentState message="No new content to repurpose" />
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <ContentList
                    contentItems={newContentItems}
                    onSelectContent={onSelectContent}
                    onOpenRepurposedContent={onOpenRepurposedContent}
                    viewType="new"
                  />
                </motion.div>
              )}
            </TabsContent>
            
            <TabsContent value="repurposed" className="space-y-4">
              {repurposedContentItems.length === 0 ? (
                <EmptyContentState message="No repurposed content yet" />
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <ContentList
                    contentItems={repurposedContentItems}
                    onSelectContent={onSelectContent}
                    onOpenRepurposedContent={onOpenRepurposedContent}
                    viewType="repurposed"
                  />
                </motion.div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Repurposed Content Dialog with Delete Button */}
      <RepurposedContentDialog
        open={repurposedDialogOpen}
        onClose={onCloseRepurposedDialog}
        content={selectedRepurposedContent}
        onCopy={onCopyToClipboard}
        onDownload={onDownloadAsText}
        onDelete={onDeleteRepurposedContent}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default ContentSelection;
