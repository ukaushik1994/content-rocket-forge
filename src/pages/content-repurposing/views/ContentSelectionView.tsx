
import React, { memo, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import { ContentItemType } from '@/contexts/content/types';
import { GeneratedContentFormat } from '@/components/content-repurposing/hooks/repurposing/types';
import ContentSelection from '@/components/content-repurposing/ContentSelection';
import { supabase } from '@/integrations/supabase/client';

interface ContentSelectionViewProps {
  contentItems: ContentItemType[];
  onSelectContent: (content: ContentItemType) => void;
  onOpenRepurposedContent: (contentId: string, formatId: string) => void;
  repurposedDialogOpen: boolean;
  onCloseRepurposedDialog: () => void;
  selectedRepurposedContent: GeneratedContentFormat | null;
  copyToClipboard: (text: string) => void;
  downloadAsText: (text: string, formatName: string) => void;
  deleteRepurposedContent: (contentId: string, formatId: string) => Promise<boolean>;
  handleFormatChange: (contentId: string, formatId: string) => void;
  isDeleting: boolean;
  generatedFormats: string[];
}

const ContentSelectionView: React.FC<ContentSelectionViewProps> = memo(({
  contentItems,
  onSelectContent,
  onOpenRepurposedContent,
  repurposedDialogOpen,
  onCloseRepurposedDialog,
  selectedRepurposedContent,
  copyToClipboard,
  downloadAsText,
  deleteRepurposedContent,
  handleFormatChange,
  isDeleting,
  generatedFormats = [],
}) => {
  const [formatsMap, setFormatsMap] = useState<Record<string, string[]>>({});
  
  // Fetch saved formats for each content item
  useEffect(() => {
    const fetchFormatsForContent = async () => {
      if (!contentItems || contentItems.length === 0) return;
      
      try {
        // Get all repurposed content for these content items
        const contentIds = contentItems.map(item => item.id);
        
        const { data, error } = await supabase
          .from('repurposed_contents')
          .select('content_id, format_code')
          .in('content_id', contentIds);
          
        if (error) {
          console.error('Error fetching repurposed content formats:', error);
          return;
        }
        
        // Group by content_id
        const formatsMapTemp: Record<string, string[]> = {};
        
        data.forEach(item => {
          if (!formatsMapTemp[item.content_id]) {
            formatsMapTemp[item.content_id] = [];
          }
          
          if (!formatsMapTemp[item.content_id].includes(item.format_code)) {
            formatsMapTemp[item.content_id].push(item.format_code);
          }
        });
        
        setFormatsMap(formatsMapTemp);
      } catch (error) {
        console.error('Error in fetchFormatsForContent:', error);
      }
    };
    
    fetchFormatsForContent();
  }, [contentItems]);
  
  return (
    <div className="min-h-screen flex flex-col bg-black">
      <Helmet>
        <title>Content Repurposing | Content Platform</title>
      </Helmet>
      
      <Navbar />
      
      <motion.main 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex-1 container py-8 max-w-7xl mx-auto px-4 sm:px-6"
      >
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-neon-purple to-neon-blue bg-clip-text text-transparent">Content Repurposing</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">Transform your existing content into various formats and platforms with AI assistance</p>
        </div>
        
        <ContentSelection 
          contentItems={contentItems}
          onSelectContent={onSelectContent}
          onOpenRepurposedContent={onOpenRepurposedContent}
          repurposedDialogOpen={repurposedDialogOpen}
          onCloseRepurposedDialog={onCloseRepurposedDialog}
          selectedRepurposedContent={selectedRepurposedContent}
          onCopyToClipboard={copyToClipboard}
          onDownloadAsText={downloadAsText}
          onDeleteRepurposedContent={deleteRepurposedContent}
          onFormatChange={handleFormatChange}
          isDeleting={isDeleting}
          generatedFormats={generatedFormats}
          formatsMap={formatsMap}
        />
      </motion.main>
    </div>
  );
});

ContentSelectionView.displayName = 'ContentSelectionView';

export default ContentSelectionView;
