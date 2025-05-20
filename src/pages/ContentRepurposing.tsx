
import React, { useState } from 'react';
import { toast } from 'sonner';
import { ContentSelectionView, ContentRepurposingView } from './content-repurposing';
import { useContentRepurposing } from '@/components/content-repurposing/hooks';
import { ContentItemType } from '@/contexts/content/types';
import { supabase } from '@/integrations/supabase/client';

const ContentRepurposing = () => {
  const [isSavingAll, setIsSavingAll] = useState<boolean>(false);
  
  const {
    content,
    contentItems,
    selectedFormats,
    generatedContents,
    isGenerating,
    activeFormat,
    repurposedDialogOpen,
    selectedRepurposedContent,
    generatedFormats,
    isDeleting,
    isSaving,
    setSelectedFormats,
    setActiveFormat,
    handleContentSelection,
    handleGenerateContent,
    handleOpenRepurposedContentWithFormats,
    handleCloseRepurposedDialog,
    handleFormatChange,
    copyToClipboard,
    downloadAsText,
    saveAsNewContent,
    deleteRepurposedContent,
    handleDeleteActiveFormat,
    resetContent,
    saveAllFormats, // Add this to access the function
  } = useContentRepurposing();
  
  // Function to save all generated content in a single transaction
  const handleSaveAllContent = async (): Promise<boolean> => {
    if (!content || !generatedContents || Object.keys(generatedContents).length === 0) {
      toast.error('No content to save');
      return false;
    }
    
    setIsSavingAll(true);
    try {
      // Get all format IDs and mark them as saved in UI state
      const formatIds = saveAllFormats();
      
      if (formatIds.length === 0) {
        toast.info('All formats are already saved');
        setIsSavingAll(false);
        return true;
      }
      
      // Prepare the metadata update with all formats
      const contentMap: Record<string, string> = {};
      formatIds.forEach(formatId => {
        const formatContent = generatedContents[formatId];
        if (formatContent && typeof formatContent === 'string') {
          contentMap[formatId] = formatContent;
        }
      });
      
      // Get the current metadata first
      const { data: currentContent, error: fetchError } = await supabase
        .from('content_items')
        .select('metadata')
        .eq('id', content.id)
        .single();
      
      if (fetchError) {
        console.error('Error fetching current content metadata:', fetchError);
        toast.error('Error saving content formats');
        setIsSavingAll(false);
        return false;
      }
      
      // Merge with existing metadata
      const currentMetadata = currentContent?.metadata || {};
      const updatedMetadata = {
        ...currentMetadata,
        repurposedContentMap: {
          ...(currentMetadata.repurposedContentMap || {}),
          ...contentMap
        },
        repurposedFormats: Array.from(new Set([
          ...(currentMetadata.repurposedFormats || []),
          ...formatIds
        ])),
        lastUpdated: new Date().toISOString()
      };
      
      // Update the database in a single operation
      const { error: updateError } = await supabase
        .from('content_items')
        .update({
          metadata: updatedMetadata
        })
        .eq('id', content.id);
      
      if (updateError) {
        console.error('Error updating content metadata:', updateError);
        toast.error('Error saving content formats');
        setIsSavingAll(false);
        return false;
      }
      
      toast.success(`Successfully saved ${formatIds.length} content format${formatIds.length > 1 ? 's' : ''}`);
      return true;
    } catch (error) {
      console.error('Error saving all content:', error);
      toast.error('Error saving all content formats');
      return false;
    } finally {
      setIsSavingAll(false);
    }
  };

  // If no content is selected yet, show the content selection view
  if (!content) {
    return (
      <ContentSelectionView
        contentItems={contentItems || []}
        onSelectContent={(selectedContent: ContentItemType) => {
          if (selectedContent && selectedContent.id) {
            handleContentSelection(selectedContent.id);
          }
        }}
        onOpenRepurposedContent={handleOpenRepurposedContentWithFormats}
        repurposedDialogOpen={repurposedDialogOpen}
        onCloseRepurposedDialog={handleCloseRepurposedDialog}
        selectedRepurposedContent={selectedRepurposedContent}
        copyToClipboard={(text: string) => {
          if (text) copyToClipboard(text);
        }}
        downloadAsText={(text: string, formatName: string) => {
          if (text && formatName) downloadAsText(text, formatName);
        }}
        deleteRepurposedContent={deleteRepurposedContent}
        handleFormatChange={handleFormatChange}
        isDeleting={isDeleting}
        generatedFormats={generatedFormats || []}
      />
    );
  }

  return (
    <ContentRepurposingView
      content={content}
      selectedFormats={selectedFormats || []}
      generatedContents={generatedContents || {}}
      isGenerating={isGenerating}
      activeFormat={activeFormat}
      isDeleting={isDeleting}
      isSaving={isSaving}
      isSavingAll={isSavingAll}
      setSelectedFormats={setSelectedFormats}
      setActiveFormat={(format: string) => {
        if (format) setActiveFormat(format);
      }}
      handleGenerateContent={handleGenerateContent}
      copyToClipboard={copyToClipboard}
      downloadAsText={downloadAsText}
      saveAsNewContent={saveAsNewContent}
      handleSaveAllContent={handleSaveAllContent}
      handleDeleteActiveFormat={handleDeleteActiveFormat}
      resetContent={resetContent}
    />
  );
};

export default ContentRepurposing;
