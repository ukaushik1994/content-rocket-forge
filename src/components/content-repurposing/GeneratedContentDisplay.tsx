
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Copy, Download, Save, Book, Images, Image } from 'lucide-react';
import { contentFormats } from '@/components/content-builder/final-review/tabs/RepurposeTab';
import { toast } from 'sonner';

interface GeneratedContentDisplayProps {
  generatedContents: Record<string, string>;
  activeFormat: string | null;
  setActiveFormat: React.Dispatch<React.SetStateAction<string | null>>;
  onCopyToClipboard: (content: string) => void;
  onDownloadAsText: (content: string, formatName: string) => void;
  onSaveAsNewContent: (formatId: string, generatedContent: string) => void;
}

export const GeneratedContentDisplay: React.FC<GeneratedContentDisplayProps> = ({
  generatedContents,
  activeFormat,
  setActiveFormat,
  onCopyToClipboard,
  onDownloadAsText,
  onSaveAsNewContent
}) => {
  // Helper function to get the appropriate icon for a format
  const getFormatIcon = (formatId: string) => {
    switch (formatId) {
      case 'glossary':
        return <Book className="h-4 w-4" />;
      case 'carousel':
        return <Images className="h-4 w-4" />;
      case 'meme':
        return <Image className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">Generated Content</CardTitle>
          <CardDescription>
            {Object.keys(generatedContents).length > 0
              ? `${Object.keys(generatedContents).length} format(s) generated`
              : 'Select formats and generate content'}
          </CardDescription>
        </div>

        {Object.keys(generatedContents).length > 0 && (
          <div className="flex gap-2 overflow-x-auto py-1">
            {Object.keys(generatedContents).map((formatId) => {
              const format = contentFormats.find(f => f.id === formatId);
              const icon = getFormatIcon(formatId);
              return (
                <Button
                  key={formatId}
                  size="sm"
                  variant={activeFormat === formatId ? "default" : "outline"}
                  onClick={() => setActiveFormat(formatId)}
                  className={activeFormat === formatId 
                    ? "bg-gradient-to-r from-neon-purple to-neon-blue border-none" 
                    : "border-white/10"
                  }
                >
                  {icon && <span className="mr-1">{icon}</span>}
                  {format?.name || formatId}
                </Button>
              );
            })}
          </div>
        )}
      </CardHeader>

      <CardContent className="p-4 h-[500px] flex flex-col">
        {Object.keys(generatedContents).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Content Generated Yet</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              Select content formats from the left panel and click "Generate" to transform your content
            </p>
          </div>
        ) : activeFormat ? (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-auto bg-muted/10 rounded-md p-4 mb-4">
              <pre className="whitespace-pre-wrap font-mono text-sm">
                {generatedContents[activeFormat]}
              </pre>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCopyToClipboard(generatedContents[activeFormat])}
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const format = contentFormats.find(f => f.id === activeFormat);
                  onDownloadAsText(
                    generatedContents[activeFormat],
                    format?.name || 'content'
                  );
                }}
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSaveAsNewContent(activeFormat, generatedContents[activeFormat])}
              >
                <Save className="h-4 w-4 mr-1" />
                Save as Content
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p>Select a content format to view</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GeneratedContentDisplay;
