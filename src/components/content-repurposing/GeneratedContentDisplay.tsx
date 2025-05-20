
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
      <Card className="h-full border border-white/10 bg-black/40 backdrop-blur-lg shadow-xl">
        <CardHeader className="pb-2 flex flex-row items-center justify-between bg-gradient-to-r from-black/50 to-black/20 rounded-t-lg border-b border-white/5">
          <div>
            <CardTitle className="text-lg text-gradient">Generated Content</CardTitle>
            <CardDescription className="text-white/60">
              {hasGeneratedContent
                ? `${generatedFormats.length} format${generatedFormats.length !== 1 ? 's' : ''} generated`
                : 'Select formats and generate content'}
            </CardDescription>
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
        </CardHeader>

        <CardContent className="p-4 h-[500px] flex flex-col">
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
        </CardContent>
      </Card>
    </motion.div>
  );
});

GeneratedContentDisplay.displayName = 'GeneratedContentDisplay';

export default GeneratedContentDisplay;
