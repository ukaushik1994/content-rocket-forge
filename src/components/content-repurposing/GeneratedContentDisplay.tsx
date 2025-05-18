
import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { getFormatByIdOrDefault, formatCategories, FormatCategory } from './formats';

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
  
  // Group formats by category
  const formatsByCategory = useMemo(() => {
    const grouped: Record<FormatCategory, string[]> = {
      'social': [],
      'document': [],
      'visual': [],
      'audio-video': []
    };
    
    generatedFormats.forEach(formatId => {
      const format = getFormatByIdOrDefault(formatId);
      grouped[format.category].push(formatId);
    });
    
    return grouped;
  }, [generatedFormats]);
  
  // Get categories that have content
  const categoriesWithContent = Object.entries(formatsByCategory)
    .filter(([_, formats]) => formats.length > 0)
    .map(([category]) => category as FormatCategory);
  
  return (
    <Card className="h-full glass-panel border-white/10 bg-black/40 backdrop-blur-md">
      <CardHeader className="pb-2 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg bg-gradient-to-r from-neon-purple to-neon-blue bg-clip-text text-transparent">
              Generated Content
            </CardTitle>
            <CardDescription>
              {hasGeneratedContent
                ? `${generatedFormats.length} format${generatedFormats.length !== 1 ? 's' : ''} generated`
                : 'Select formats and generate content'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 h-[500px] flex flex-col">
        {!hasGeneratedContent ? (
          <NoContentDisplay />
        ) : (
          <>
            <div className="border-b border-white/10 pb-3 mb-3">
              <FormatSelector 
                generatedFormats={generatedFormats}
                formatsByCategory={formatsByCategory}
                categoriesWithContent={categoriesWithContent}
                activeFormat={activeFormat}
                setActiveFormat={setActiveFormat}
              />
            </div>
            
            {activeFormat ? (
              <motion.div
                className="flex flex-col h-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                key={activeFormat}
              >
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
                  formatId={activeFormat}
                />
              </motion.div>
            ) : (
              <SelectFormatDisplay />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default GeneratedContentDisplay;
