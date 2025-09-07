import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ContentItemType } from '@/contexts/content/types';
import { useContentRepurposing } from '@/components/content-repurposing/hooks';
import { ContentFormatSelection } from '@/components/content-repurposing/ContentFormatSelection';
import { GeneratedContentDisplay } from '@/components/content-repurposing/GeneratedContentDisplay';
import { PersonaSelector } from '@/components/content-repurposing/PersonaSelector';
import { AiProviderSelector } from '@/components/content-builder/outline/ai-generator/AiProviderSelector';
import { motion } from 'framer-motion';

interface ContentRepurposingModalProps {
  open: boolean;
  onClose: () => void;
  content: ContentItemType | null;
  onContentGenerated?: () => void;
}

export const ContentRepurposingModal: React.FC<ContentRepurposingModalProps> = ({
  open,
  onClose,
  content,
  onContentGenerated
}) => {
  const {
    selectedFormats,
    generatedContents,
    personasMap,
    isGenerating,
    activeFormat,
    isSaving,
    isSavingAll,
    isDeleting,
    savedContentFormats,
    selectedPersonas,
    setSelectedPersonas,
    availablePersonas,
    setSelectedFormats,
    setActiveFormat,
    handleGenerateContent,
    copyToClipboard,
    downloadAsText,
    saveAsNewContent,
    handleSaveAllContent,
    handleDeleteActiveFormat,
    refreshRepurposedData,
    handleContentSelection,
  } = useContentRepurposing();

  // Load content when modal opens
  useEffect(() => {
    if (open && content) {
      console.log('[ContentRepurposingModal] Loading content:', content);
      handleContentSelection(content);
    }
  }, [open, content, handleContentSelection]);

  // Refresh parent when content is generated
  useEffect(() => {
    if (Object.keys(generatedContents).length > 0 && onContentGenerated) {
      onContentGenerated();
    }
  }, [generatedContents, onContentGenerated]);

  if (!content) return null;

  const handleGenerate = (formats: string[]) => {
    handleGenerateContent(formats);
  };

  const handleSaveAll = async () => {
    const success = await handleSaveAllContent();
    if (success && onContentGenerated) {
      onContentGenerated();
    }
    return success;
  };

  const handleSaveFormat = async (formatId: string, generatedContent: string) => {
    const success = await saveAsNewContent(formatId, generatedContent);
    if (success && onContentGenerated) {
      onContentGenerated();
    }
    return success;
  };

  const handleDelete = async () => {
    const success = await handleDeleteActiveFormat();
    if (success && onContentGenerated) {
      onContentGenerated();
    }
    return success;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[95vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-4 pb-2 border-b">
          <DialogTitle className="text-xl text-foreground">
            Repurpose Content: {content.title}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Transform your content into multiple formats for different platforms and audiences
          </p>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left Column - Format Selection & Personas */}
            <div className="space-y-6">
              {/* AI Provider Selector */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-background via-muted/5 to-background border border-border backdrop-blur-sm rounded-xl p-4"
              >
                <h3 className="text-sm font-medium text-foreground mb-3">AI Service</h3>
                <AiProviderSelector />
              </motion.div>

              {/* Persona Selection */}
              {availablePersonas.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <PersonaSelector
                    personas={availablePersonas}
                    selectedPersonas={selectedPersonas}
                    onSelectionChange={setSelectedPersonas}
                  />
                </motion.div>
              )}

              {/* Format Selection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <ContentFormatSelection
                  selectedFormats={selectedFormats}
                  setSelectedFormats={setSelectedFormats}
                  onGenerateContent={handleGenerate}
                  isGenerating={isGenerating}
                  generatedContents={generatedContents}
                  onSaveAllContent={handleSaveAll}
                  isSaving={isSavingAll}
                  selectedPersonas={selectedPersonas}
                  availablePersonas={availablePersonas}
                />
              </motion.div>
            </div>

            {/* Right Column - Generated Content */}
            <div className="xl:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="h-full"
              >
                <GeneratedContentDisplay
                  generatedContents={generatedContents}
                  activeFormat={activeFormat}
                  setActiveFormat={setActiveFormat}
                  onCopyToClipboard={copyToClipboard}
                  onDownloadAsText={downloadAsText}
                  onSaveAsNewContent={handleSaveFormat}
                  onSaveAllContent={handleSaveAll}
                  onDeleteFormat={handleDelete}
                  isSaving={isSaving}
                  isSavingAll={isSavingAll}
                  isDeleting={isDeleting}
                  savedContentFormats={savedContentFormats}
                  selectedPersonas={selectedPersonas}
                  availablePersonas={availablePersonas}
                  personasMap={personasMap}
                />
              </motion.div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};