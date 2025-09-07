
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
  onPreviewContent?: (content: string, formatId: string, formatName: string) => void;
  isSaving?: boolean;
  isSavingAll?: boolean;
  isDeleting?: boolean;
  savedContentFormats?: string[];
  selectedPersonas?: string[];
  availablePersonas?: any[];
  personasMap?: Record<string, string[]>; // Map of formatId to personas used
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
  onPreviewContent,
  isSaving = false,
  isSavingAll = false,
  isDeleting = false,
  savedContentFormats = [],
  selectedPersonas = [],
  availablePersonas = [],
  personasMap = {}
}) => {
  // Debug logging to help identify the issue
  console.log('[GeneratedContentDisplay] generatedContents:', generatedContents);
  console.log('[GeneratedContentDisplay] activeFormat:', activeFormat);
  console.log('[GeneratedContentDisplay] savedContentFormats:', savedContentFormats);
  
  const generatedFormats = Object.keys(generatedContents).filter(id => !!id && !!generatedContents[id]);
  const hasGeneratedContent = generatedFormats.length > 0;
  const hasMultipleFormats = generatedFormats.length > 1;
  const isCurrentFormatSaved = activeFormat ? savedContentFormats.includes(activeFormat) : false;
  
  console.log('[GeneratedContentDisplay] generatedFormats:', generatedFormats);
  console.log('[GeneratedContentDisplay] hasGeneratedContent:', hasGeneratedContent);
  console.log('[GeneratedContentDisplay] isCurrentFormatSaved:', isCurrentFormatSaved);
  
  return (
    <Card className="h-full border-white/10 bg-black/40 backdrop-blur-sm">
      <CardHeader className="pb-2 flex flex-row items-center justify-between border-b border-white/10">
        <div>
          <CardTitle className="text-lg text-white font-semibold">Generated Content</CardTitle>
          <CardDescription className="text-white/70">
            {hasGeneratedContent
              ? selectedPersonas.length > 0
                ? `${generatedFormats.length} format(s) generated for ${selectedPersonas.length} persona${selectedPersonas.length !== 1 ? 's' : ''}`
                : `${generatedFormats.length} format(s) generated`
              : 'Select formats and generate content'}
          </CardDescription>
        </div>

        {hasGeneratedContent && (
          <FormatSelector 
            generatedFormats={generatedFormats}
            activeFormat={activeFormat}
            setActiveFormat={setActiveFormat}
            savedFormats={savedContentFormats}
            personasMap={personasMap}
            availablePersonas={availablePersonas}
          />
        )}
      </CardHeader>

      <CardContent className="p-4 h-[500px] flex flex-col bg-black/20">
        {!hasGeneratedContent ? (
          <NoContentDisplay />
        ) : activeFormat && generatedContents[activeFormat] ? (
          <div className="flex flex-col h-full">
            <ContentViewer 
              content={generatedContents[activeFormat]} 
              formatId={activeFormat}
              selectedPersonas={selectedPersonas}
              availablePersonas={availablePersonas}
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
              onPreview={onPreviewContent ? () => {
                const format = getFormatByIdOrDefault(activeFormat);
                onPreviewContent(generatedContents[activeFormat], activeFormat, format.name);
              } : undefined}
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
