
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import ContentDetails from '@/components/content-repurposing/ContentDetails';
import ContentFormatSelection from '@/components/content-repurposing/ContentFormatSelection';
import GeneratedContentDisplay from '@/components/content-repurposing/GeneratedContentDisplay';
import { ContentItemType } from '@/contexts/content/types';

interface ContentRepurposingViewProps {
  content: ContentItemType;
  selectedFormats: string[];
  generatedContents: Record<string, string>;
  isGenerating: boolean;
  activeFormat: string | null;
  isDeleting: boolean;
  isSaving: boolean;
  isSavingAll: boolean;
  setSelectedFormats: (formats: string[]) => void;
  setActiveFormat: (format: string) => void;
  handleGenerateContent: (formats: string[]) => void;
  copyToClipboard: (content: string) => void;
  downloadAsText: (content: string, formatName: string) => void;
  saveAsNewContent: (formatId: string, content: string) => Promise<boolean>;
  handleSaveAllContent: () => Promise<boolean>;
  handleDeleteActiveFormat: (formatId: string) => Promise<boolean>;
  resetContent: () => void;
}

const ContentRepurposingView: React.FC<ContentRepurposingViewProps> = ({
  content,
  selectedFormats,
  generatedContents,
  isGenerating,
  activeFormat,
  isDeleting,
  isSaving,
  isSavingAll,
  setSelectedFormats,
  setActiveFormat,
  handleGenerateContent,
  copyToClipboard,
  downloadAsText,
  saveAsNewContent,
  handleSaveAllContent,
  handleDeleteActiveFormat,
  resetContent,
}) => {
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

        {/* Selection of content formats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-6">
            <ContentDetails content={content} />
            <ContentFormatSelection
              selectedFormats={selectedFormats}
              setSelectedFormats={setSelectedFormats}
              onGenerateContent={handleGenerateContent}
              isGenerating={isGenerating}
            />
          </div>

          <div className="md:col-span-2">
            <GeneratedContentDisplay
              generatedContents={generatedContents}
              activeFormat={activeFormat}
              setActiveFormat={setActiveFormat}
              onCopyToClipboard={copyToClipboard}
              onDownloadAsText={downloadAsText}
              onSaveAsNewContent={saveAsNewContent}
              onSaveAllContent={handleSaveAllContent}
              onDeleteRepurposedContent={handleDeleteActiveFormat}
              isDeleting={isDeleting}
              isSaving={isSaving}
              isSavingAll={isSavingAll}
            />
          </div>
        </div>
      </motion.main>
    </div>
  );
};

export default ContentRepurposingView;
