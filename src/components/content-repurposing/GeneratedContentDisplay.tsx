
import React, { memo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getFormatByIdOrDefault, getFormatIconComponent } from './formats';
import { motion } from 'framer-motion';

// Import our components
import FormatSelector from './generated-content/FormatSelector';
import ContentViewer from './generated-content/ContentViewer';
import ActionButtons from './generated-content/ActionButtons';
import NoContentDisplay from './generated-content/NoContentDisplay';
import SelectFormatDisplay from './generated-content/SelectFormatDisplay';
import ContentStats from './generated-content/ContentStats';
import PreviewModeToggle from './generated-content/PreviewModeToggle';
import { SaveStatusBar } from './SaveStatusBar';

interface GeneratedContentDisplayProps {
  generatedContents: Record<string, string>;
  activeFormat: string | null;
  setActiveFormat: React.Dispatch<React.SetStateAction<string | null>>;
  onCopyToClipboard: (content: string) => void;
  onDownloadAsText: (content: string, formatName: string) => void;
  onSaveAsNewContent: (formatId: string, generatedContent: string) => Promise<boolean>;
  onSaveAllContent?: () => Promise<boolean>;
  onDeleteRepurposedContent?: (formatId: string) => Promise<boolean>;
  isDeleting?: boolean;
  isSaving?: boolean;
  isSavingAll?: boolean;
  savedContentFormats?: string[];
}

export const GeneratedContentDisplay: React.FC<GeneratedContentDisplayProps> = memo(({
  generatedContents,
  activeFormat,
  setActiveFormat,
  onCopyToClipboard,
  onDownloadAsText,
  onSaveAsNewContent,
  onSaveAllContent,
  onDeleteRepurposedContent,
  isDeleting = false,
  isSaving = false,
  isSavingAll = false,
  savedContentFormats = []
}) => {
  const [previewMode, setPreviewMode] = useState<boolean>(true);
  const generatedFormats = Object.keys(generatedContents);
  const hasGeneratedContent = generatedFormats.length > 0;
  const hasMultipleFormats = generatedFormats.length > 1;
  
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="h-full"
    >
      <div className="h-full relative overflow-hidden rounded-xl glass-panel neon-border shadow-neon">
        <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/5 to-neon-blue/5 z-0"></div>
        
        <div className="relative z-10 flex flex-col h-full">
          {/* Header with glass effect */}
          <div className="p-4 pb-2 bg-gradient-to-r from-black/60 to-black/40 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gradient">Generated Content</h2>
              
              {hasGeneratedContent && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-white/60">
                    {`${generatedFormats.length} format${generatedFormats.length !== 1 ? 's' : ''} generated`}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Content area with improved spacing */}
          <div className="flex-1 overflow-hidden p-4 flex flex-col">
            {!hasGeneratedContent ? (
              <NoContentDisplay />
            ) : activeFormat ? (
              <div className="flex flex-col h-full">
                {/* Moved controls to the top of content area */}
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <PreviewModeToggle 
                      isPreviewMode={previewMode} 
                      onToggle={() => setPreviewMode(!previewMode)}
                    />
                    <span className="text-sm text-white/70">
                      {previewMode ? 'Preview' : 'Code'} View
                    </span>
                  </div>
                  
                  <FormatSelector 
                    generatedFormats={generatedFormats}
                    activeFormat={activeFormat}
                    setActiveFormat={setActiveFormat}
                  />
                </div>
                
                {generatedContents[activeFormat] && (
                  <ContentStats 
                    content={generatedContents[activeFormat]} 
                    formatId={activeFormat} 
                  />
                )}
                <ContentViewer 
                  content={generatedContents[activeFormat]} 
                  formatId={activeFormat}
                  previewMode={previewMode}
                />
                <ActionButtons 
                  onCopy={() => onCopyToClipboard(generatedContents[activeFormat])}
                  onDownload={() => {
                    const format = getFormatByIdOrDefault(activeFormat);
                    onDownloadAsText(
                      generatedContents[activeFormat],
                      format.name
                    );
                  }}
                  onSave={() => onSaveAsNewContent(activeFormat, generatedContents[activeFormat])}
                  onSaveAll={hasMultipleFormats && onSaveAllContent ? onSaveAllContent : undefined}
                  onDelete={onDeleteRepurposedContent && activeFormat ? 
                    () => onDeleteRepurposedContent(activeFormat) : undefined
                  }
                  hasMultipleFormats={hasMultipleFormats}
                  isDeleting={isDeleting}
                  isSaving={isSaving}
                  isSavingAll={isSavingAll}
                />
                
                {/* Show save status bar if we have save formats tracking */}
                {hasGeneratedContent && savedContentFormats && onSaveAllContent && (
                  <SaveStatusBar 
                    activeFormat={activeFormat}
                    savedFormats={savedContentFormats}
                    totalFormats={generatedFormats.length}
                    onSaveAll={onSaveAllContent}
                  />
                )}
              </div>
            ) : (
              <SelectFormatDisplay />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

GeneratedContentDisplay.displayName = 'GeneratedContentDisplay';

export default GeneratedContentDisplay;
