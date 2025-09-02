
import React, { memo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import ContentDetails from '@/components/content-repurposing/ContentDetails';
import ContentFormatSelection from '@/components/content-repurposing/ContentFormatSelection';
import GeneratedContentDisplay from '@/components/content-repurposing/GeneratedContentDisplay';
import { PersonaSelector } from '@/components/content-repurposing/PersonaSelector';
import { ContentItemType } from '@/contexts/content/types';
import ContentRepurposingTour from '@/components/content-repurposing/tour/ContentRepurposingTour';
import ContentPreviewDialog from '@/components/content-repurposing/preview/ContentPreviewDialog';
import { AiProviderSelector } from '@/components/content-builder/outline/ai-generator/AiProviderSelector';
import { AiProvider } from '@/services/aiService/types';
import { SolutionPersona } from '@/contexts/content-builder/types/solution-types';

interface ContentRepurposingViewProps {
  content: ContentItemType;
  selectedFormats: string[];
  generatedContents: Record<string, string>;
  personasMap?: Record<string, string[]>;
  isGenerating: boolean;
  activeFormat: string | null;
  isSaving: boolean;
  isSavingAll: boolean;
  savedContentFormats: string[];
  aiProvider: AiProvider;
  setAiProvider: (provider: AiProvider) => void;
  availableProviders: AiProvider[];
  selectedPersonas: string[];
  setSelectedPersonas: (personas: string[]) => void;
  availablePersonas: SolutionPersona[];
  setSelectedFormats: (formats: string[]) => void;
  setActiveFormat: (format: string) => void;
  handleGenerateContent: (formats: string[]) => void;
  copyToClipboard: (content: string) => void;
  downloadAsText: (content: string, formatName: string) => void;
  saveAsNewContent: (formatId: string, content: string) => Promise<boolean>;
  handleSaveAllContent: () => Promise<boolean>;
  handleDeleteActiveFormat?: () => Promise<boolean>;
  handleCopyAllContent?: () => void;
  handleExportAllContent?: () => void;
  isDeleting?: boolean;
  resetContent: () => void;
}

const ContentRepurposingView: React.FC<ContentRepurposingViewProps> = memo(({
  content,
  selectedFormats,
  generatedContents,
  personasMap = {},
  isGenerating,
  activeFormat,
  isSaving,
  isSavingAll,
  savedContentFormats,
  aiProvider,
  setAiProvider,
  availableProviders,
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
  handleCopyAllContent,
  handleExportAllContent,
  isDeleting = false,
  resetContent,
}) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState<{
    content: string;
    formatId: string;
    formatName: string;
  } | null>(null);

  const handleOpenPreview = (content: string, formatId: string, formatName: string) => {
    setPreviewContent({ content, formatId, formatName });
    setIsPreviewOpen(true);
  };

  const handleSavePreviewContent = async (editedContent: string) => {
    if (!previewContent) return false;
    return await saveAsNewContent(previewContent.formatId, editedContent);
  };

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
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => resetContent()} 
            className="hover:bg-white/5"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back to Content List</span>
          </Button>
          
          <h1 className="text-3xl font-bold text-center flex-1 bg-gradient-to-r from-neon-purple to-neon-blue bg-clip-text text-transparent">
            Content Repurposing
          </h1>
          
          <div className="w-10"></div> {/* For balance */}
        </div>

        {/* Content layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-6">
            <ContentDetails content={content} />
            
            {/* Persona Selection */}
            {availablePersonas.length > 0 && (
              <PersonaSelector
                personas={availablePersonas}
                selectedPersonas={selectedPersonas}
                onSelectionChange={setSelectedPersonas}
              />
            )}
            
            {/* AI Service Status */}
            <div className="bg-gradient-to-br from-dark-bg via-dark-surface to-dark-bg border border-white/10 backdrop-blur-sm rounded-xl p-4">
              <h3 className="text-sm font-medium text-white/90 mb-3">AI Service</h3>
              <AiProviderSelector />
            </div>
            
            <ContentFormatSelection
              selectedFormats={selectedFormats}
              setSelectedFormats={setSelectedFormats}
              onGenerateContent={handleGenerateContent}
              isGenerating={isGenerating}
              generatedContents={generatedContents}
              onSaveAllContent={handleSaveAllContent}
              onExportAll={handleExportAllContent}
              onCopyAll={handleCopyAllContent}
              isSaving={isSavingAll}
              selectedPersonas={selectedPersonas}
              availablePersonas={availablePersonas}
            />
          </div>

          <div className="md:col-span-2 content-display">
            <GeneratedContentDisplay
              generatedContents={generatedContents}
              activeFormat={activeFormat}
              setActiveFormat={setActiveFormat}
              onCopyToClipboard={copyToClipboard}
              onDownloadAsText={downloadAsText}
              onSaveAsNewContent={saveAsNewContent}
              onSaveAllContent={handleSaveAllContent}
              onDeleteFormat={handleDeleteActiveFormat}
              onPreviewContent={handleOpenPreview}
              isSaving={isSaving}
              isSavingAll={isSavingAll}
              isDeleting={isDeleting}
              savedContentFormats={savedContentFormats}
              selectedPersonas={selectedPersonas}
              availablePersonas={availablePersonas}
              personasMap={personasMap}
            />
          </div>
        </div>
        
        {/* Guided Tour Component */}
        <ContentRepurposingTour />
        
        {/* Content Preview Dialog */}
        {previewContent && (
          <ContentPreviewDialog
            isOpen={isPreviewOpen}
            onClose={() => setIsPreviewOpen(false)}
            content={previewContent.content}
            formatName={previewContent.formatName}
            onSave={handleSavePreviewContent}
            isReadOnly={savedContentFormats.includes(previewContent.formatId)}
          />
        )}
      </motion.main>
    </div>
  );
});

ContentRepurposingView.displayName = 'ContentRepurposingView';

export default ContentRepurposingView;
