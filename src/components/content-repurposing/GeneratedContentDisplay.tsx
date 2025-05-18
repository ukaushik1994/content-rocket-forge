
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
    <Card className="h-full">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">Generated Content</CardTitle>
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
  );
};

export default GeneratedContentDisplay;
