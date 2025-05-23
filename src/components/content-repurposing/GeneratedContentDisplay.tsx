
import React, { memo } from 'react';
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
  onSaveAllContent: () => Promise<boolean>;
  onDeleteFormat?: () => Promise<boolean>;
  isSaving?: boolean;
  isSavingAll?: boolean;
  isDeleting?: boolean;
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
  onDeleteFormat,
  isSaving = false,
  isSavingAll = false,
  isDeleting = false,
  savedContentFormats = []
}) => {
  const generatedFormats = Object.keys(generatedContents).filter(id => !!id);
  const hasGeneratedContent = generatedFormats.length > 0;
  const hasMultipleFormats = generatedFormats.length > 1;
  const isCurrentFormatSaved = activeFormat ? savedContentFormats.includes(activeFormat) : false;
  
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
            savedFormats={savedContentFormats}
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
              onSaveAll={hasMultipleFormats ? onSaveAllContent : undefined}
              onDelete={onDeleteFormat}
              hasMultipleFormats={hasMultipleFormats}
              isSaving={isSaving && !isCurrentFormatSaved}
              isSavingAll={isSavingAll}
              isDeleting={isDeleting}
              isFormatSaved={isCurrentFormatSaved}
            />
          </div>
        ) : (
          <SelectFormatDisplay />
        )}
      </CardContent>
    </Card>
  );
});

GeneratedContentDisplay.displayName = 'GeneratedContentDisplay';

export default GeneratedContentDisplay;
