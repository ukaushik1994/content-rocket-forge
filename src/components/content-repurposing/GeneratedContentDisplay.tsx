
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getFormatByIdOrDefault } from './formats';
import { motion } from 'framer-motion';

// Import our components
import FormatSelector from './generated-content/FormatSelector';
import ContentViewer from './generated-content/ContentViewer';
import ActionButtons from './generated-content/ActionButtons';
import NoContentDisplay from './generated-content/NoContentDisplay';
import SelectFormatDisplay from './generated-content/SelectFormatDisplay';

interface GeneratedContentDisplayProps {
  generatedContents: Record<string, string>;
  activeFormat: string | null;
  setActiveFormat: React.Dispatch<React.SetStateAction<string | null>>;
  onCopyToClipboard: (content: string) => void;
  onDownloadAsText: (content: string, formatName: string) => void;
  onSaveAsNewContent: (formatId: string, generatedContent: string) => void;
  onDeleteRepurposedContent?: (formatId: string) => Promise<boolean>;
  isDeleting?: boolean;
}

export const GeneratedContentDisplay: React.FC<GeneratedContentDisplayProps> = ({
  generatedContents,
  activeFormat,
  setActiveFormat,
  onCopyToClipboard,
  onDownloadAsText,
  onSaveAsNewContent,
  onDeleteRepurposedContent,
  isDeleting = false
}) => {
  const generatedFormats = Object.keys(generatedContents);
  const hasGeneratedContent = generatedFormats.length > 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="h-full bg-gradient-to-br from-black/60 to-black/40 border-white/10 shadow-lg backdrop-blur-md">
        <CardHeader className="pb-2 border-b border-white/10 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg bg-gradient-to-r from-neon-purple to-neon-blue bg-clip-text text-transparent">Generated Content</CardTitle>
            <CardDescription>
              {hasGeneratedContent
                ? `${generatedFormats.length} format(s) generated`
                : 'Select formats and generate content'}
            </CardDescription>
          </div>

          {hasGeneratedContent && (
            <FormatSelector 
              generatedFormats={generatedFormats}
              activeFormat={activeFormat}
              setActiveFormat={setActiveFormat}
            />
          )}
        </CardHeader>

        <CardContent className="p-4 h-[500px] flex flex-col">
          {!hasGeneratedContent ? (
            <NoContentDisplay />
          ) : activeFormat ? (
            <div className="flex flex-col h-full">
              <ContentViewer 
                content={generatedContents[activeFormat]} 
                formatId={activeFormat} 
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
                onDelete={onDeleteRepurposedContent ? 
                  () => {
                    if (activeFormat && onDeleteRepurposedContent) {
                      return onDeleteRepurposedContent(activeFormat);
                    }
                    return Promise.resolve(false);
                  } : undefined
                }
                isDeleting={isDeleting}
              />
            </div>
          ) : (
            <SelectFormatDisplay />
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default GeneratedContentDisplay;
