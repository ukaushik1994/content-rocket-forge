
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

interface GeneratedContentDisplayProps {
  generatedContents: Record<string, string>;
  activeFormat: string | null;
  setActiveFormat: React.Dispatch<React.SetStateAction<string | null>>;
  onCopyToClipboard: (content: string) => void;
  onDownloadAsText: (content: string, formatName: string) => void;
  onSaveAsNewContent: (formatId: string, generatedContent: string) => void;
  onSaveAllContent?: () => Promise<boolean>;
  onDeleteRepurposedContent?: (formatId: string) => Promise<boolean>;
  isDeleting?: boolean;
  isSaving?: boolean;
  isSavingAll?: boolean;
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
  isSavingAll = false
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
          <div className="p-4 pb-2 flex flex-row items-center justify-between bg-gradient-to-r from-black/60 to-black/40 border-b border-white/10">
            <div>
              <h2 className="text-lg font-bold text-gradient">Generated Content</h2>
              <p className="text-sm text-white/60">
                {hasGeneratedContent
                  ? `${generatedFormats.length} format${generatedFormats.length !== 1 ? 's' : ''} generated`
                  : 'Select formats and generate content'}
              </p>
            </div>

            {hasGeneratedContent && (
              <div className="flex items-center gap-4">
                <PreviewModeToggle 
                  isPreviewMode={previewMode} 
                  onToggle={() => setPreviewMode(!previewMode)}
                />
                <FormatSelector 
                  generatedFormats={generatedFormats}
                  activeFormat={activeFormat}
                  setActiveFormat={setActiveFormat}
                />
              </div>
            )}
          </div>

          {/* Content area with improved spacing */}
          <div className="flex-1 overflow-hidden p-4">
            {!hasGeneratedContent ? (
              <NoContentDisplay />
            ) : activeFormat ? (
              <div className="flex flex-col h-full">
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
