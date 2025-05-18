
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getFormatByIdOrDefault } from './formats';

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
  onSaveAsNewContent: (formatId: string, generatedContent: string) => Promise<boolean>;
  onDeleteRepurposedContent?: (formatId: string) => Promise<boolean>;
  onRegenerateContent?: (formatId: string) => Promise<void>;
  isDeleting?: boolean;
  isRegenerating?: boolean;
  isSaving?: boolean;
}

export const GeneratedContentDisplay: React.FC<GeneratedContentDisplayProps> = ({
  generatedContents,
  activeFormat,
  setActiveFormat,
  onCopyToClipboard,
  onDownloadAsText,
  onSaveAsNewContent,
  onDeleteRepurposedContent,
  onRegenerateContent,
  isDeleting = false,
  isRegenerating = false,
  isSaving = false
}) => {
  const generatedFormats = Object.keys(generatedContents);
  const hasGeneratedContent = generatedFormats.length > 0;
  
  return (
    <Card className="h-full bg-gradient-to-br from-black/80 to-black/90 border border-white/10 overflow-hidden backdrop-blur-sm">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
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
              onDelete={onDeleteRepurposedContent && activeFormat ? 
                () => onDeleteRepurposedContent(activeFormat) : undefined
              }
              onRegenerate={onRegenerateContent && activeFormat ?
                () => onRegenerateContent(activeFormat) : undefined
              }
              isDeleting={isDeleting}
              isRegenerating={isRegenerating}
              isSaving={isSaving}
            />
          </div>
        ) : (
          <SelectFormatDisplay />
        )}
      </CardContent>
    </Card>
  );
};

export default GeneratedContentDisplay;
