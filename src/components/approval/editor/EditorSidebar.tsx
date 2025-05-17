
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Search, FileText, Wand } from 'lucide-react';
import { motion } from 'framer-motion';
import { ApprovalSerpSummary } from '../serp/ApprovalSerpSummary';
import { ApprovalAITitleSuggestions } from '../ai/ApprovalAITitleSuggestions';
import { SectionRegenerationTool } from '../ai/SectionRegenerationTool';
import { ContentItemType } from '@/contexts/content/types';

interface EditorSidebarProps {
  showSidebar: boolean;
  activeSidebarTab: string;
  setActiveSidebarTab: React.Dispatch<React.SetStateAction<string>>;
  content: ContentItemType;
  serpData: any;
  isFetchingSerp: boolean;
  handleTitleSelect: (title: string) => void;
  handleSectionRegenerated: (updatedContent: string) => void;
  handleAddToContent: (content: string, type: string) => void;
}

export const EditorSidebar: React.FC<EditorSidebarProps> = ({
  showSidebar,
  activeSidebarTab,
  setActiveSidebarTab,
  content,
  serpData,
  isFetchingSerp,
  handleTitleSelect,
  handleSectionRegenerated,
  handleAddToContent
}) => {
  if (!showSidebar) return null;
  
  return (
    <motion.div 
      initial={{ opacity: 0, width: 0 }}
      animate={{ opacity: 1, width: 'auto' }}
      exit={{ opacity: 0, width: 0 }}
      className="w-80 space-y-4"
    >
      <Tabs defaultValue={activeSidebarTab} onValueChange={setActiveSidebarTab} className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="serp" className="text-xs">
            <Search className="h-4 w-4 mr-1" />
            SERP
          </TabsTrigger>
          <TabsTrigger value="titles" className="text-xs">
            <FileText className="h-4 w-4 mr-1" />
            Titles
          </TabsTrigger>
          <TabsTrigger value="sections" className="text-xs">
            <Wand className="h-4 w-4 mr-1" />
            Sections
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="serp" className="mt-4">
          <ApprovalSerpSummary
            serpData={serpData}
            isLoading={isFetchingSerp}
            mainKeyword={content.keywords?.[0] || 'keyword'}
            onAddToContent={handleAddToContent}
          />
        </TabsContent>
        
        <TabsContent value="titles" className="mt-4">
          <ApprovalAITitleSuggestions
            content={content}
            onSelectTitle={handleTitleSelect}
          />
        </TabsContent>
        
        <TabsContent value="sections" className="mt-4">
          <SectionRegenerationTool
            content={content}
            onSectionRegenerated={handleSectionRegenerated}
          />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};
