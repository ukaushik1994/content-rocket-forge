
import React, { memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getFormatByIdOrDefault } from './formats';
import { Image as ImageIcon, Film } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { VideoPlaceholder } from '@/components/content/VideoPlaceholder';
import { GeneratedImageVisualData } from '@/types/enhancedChat';

// Import our components
import FormatSelector from './generated-content/FormatSelector';
import ContentViewer from './generated-content/ContentViewer';
import ActionButtons from './generated-content/ActionButtons';
import NoContentDisplay from './generated-content/NoContentDisplay';
import SelectFormatDisplay from './generated-content/SelectFormatDisplay';

// Video-eligible format IDs
const VIDEO_ELIGIBLE_FORMATS = ['video-script', 'tiktok', 'youtube', 'reels', 'shorts'];

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
  generatedImages?: GeneratedImageVisualData[];
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
  personasMap = {},
  generatedImages = []
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
          <CardDescription className="text-white/70 flex items-center gap-2 flex-wrap">
            <span>
              {hasGeneratedContent
                ? selectedPersonas.length > 0
                  ? `${generatedFormats.length} format(s) generated for ${selectedPersonas.length} persona${selectedPersonas.length !== 1 ? 's' : ''}`
                  : `${generatedFormats.length} format(s) generated`
                : 'Select formats and generate content'}
            </span>
            {generatedImages.length > 0 && (
              <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 gap-1">
                <ImageIcon className="h-3 w-3" />
                {generatedImages.length} image{generatedImages.length !== 1 ? 's' : ''}
              </Badge>
            )}
            {activeFormat && VIDEO_ELIGIBLE_FORMATS.includes(activeFormat) && (
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30 gap-1">
                <Film className="h-3 w-3" />
                Video Soon
              </Badge>
            )}
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
            
            {/* Video Placeholder for eligible formats */}
            {VIDEO_ELIGIBLE_FORMATS.includes(activeFormat) && (
              <div className="mt-3 px-1">
                <VideoPlaceholder 
                  variant="inline" 
                />
              </div>
            )}
            
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
