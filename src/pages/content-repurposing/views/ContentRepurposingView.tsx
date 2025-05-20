
import React from 'react';
import { ContentItemType } from '@/contexts/content/types';
import { 
  ContentDetails, 
  ContentFormatSelection, 
  GeneratedContentDisplay, 
  SaveStatusBar 
} from '@/components/content-repurposing';

interface ContentRepurposingViewProps {
  content: ContentItemType;
  selectedFormats: string[];
  generatedContents: Record<string, string>;
  isGenerating: boolean;
  activeFormat: string | null;
  isDeleting: boolean;
  isSaving: boolean;
  isSavingAll: boolean;
  savedContentFormats: string[];
  setSelectedFormats: (formats: string[]) => void;
  setActiveFormat: (format: string) => void;
  handleGenerateContent: (formats: string[]) => void;
  copyToClipboard: (text: string) => void;
  downloadAsText: (text: string, formatName: string) => void;
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
  savedContentFormats,
  setSelectedFormats,
  setActiveFormat,
  handleGenerateContent,
  copyToClipboard,
  downloadAsText,
  saveAsNewContent,
  handleSaveAllContent,
  handleDeleteActiveFormat,
  resetContent
}) => {
  return (
    <div className="space-y-6">
      {/* Content Details Section */}
      <ContentDetails 
        content={content} 
        onReset={resetContent} 
      />
      
      {/* Format Selection Section */}
      <ContentFormatSelection 
        selectedFormats={selectedFormats}
        onFormatChange={setSelectedFormats}
        onGenerateContent={handleGenerateContent}
        isGenerating={isGenerating}
      />
      
      {/* Generated Content Display - only show if we have content */}
      {Object.keys(generatedContents).length > 0 && (
        <>
          <GeneratedContentDisplay 
            generatedContents={generatedContents}
            activeFormat={activeFormat}
            onFormatChange={setActiveFormat}
            onCopy={copyToClipboard}
            onDownload={downloadAsText}
            onSave={saveAsNewContent}
            onDelete={handleDeleteActiveFormat}
            isDeleting={isDeleting}
            isSaving={isSaving}
            savedFormats={savedContentFormats}
          />
          
          {/* Save All Formats Status Bar */}
          <SaveStatusBar 
            formatCount={Object.keys(generatedContents).length} 
            savedCount={savedContentFormats.length} 
            onSaveAll={handleSaveAllContent}
            isSaving={isSavingAll}
          />
        </>
      )}
    </div>
  );
};

export default ContentRepurposingView;
