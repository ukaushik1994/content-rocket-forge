
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Download, Save, LayoutGrid, Image } from 'lucide-react';
import { contentFormats } from '@/components/content-builder/final-review/tabs/RepurposeTab';

interface GeneratedContentDisplayProps {
  generatedContents: Record<string, string>;
  activeFormat: string | null;
  setActiveFormat: (format: string) => void;
  onCopyToClipboard: (content: string) => void;
  onDownloadAsText: (content: string, formatName: string) => void;
  onSaveAsNewContent: (formatId: string, content: string) => void;
}

const GeneratedContentDisplay: React.FC<GeneratedContentDisplayProps> = ({
  generatedContents,
  activeFormat,
  setActiveFormat,
  onCopyToClipboard,
  onDownloadAsText,
  onSaveAsNewContent
}) => {
  // Helper function to get format name from ID
  const getFormatName = (formatId: string) => {
    const format = contentFormats.find(f => f.id === formatId);
    return format?.name || formatId;
  };
  
  // Helper function to get icon for content format
  const getFormatIcon = (formatId: string) => {
    switch (formatId) {
      case 'carousel':
        return <LayoutGrid className="h-4 w-4 mr-1" />;
      case 'meme':
        return <Image className="h-4 w-4 mr-1" />;
      default:
        return null;
    }
  };

  // If no content has been generated yet
  if (Object.keys(generatedContents).length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Generated Content</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground">
            Select content formats on the left and click "Generate" to create repurposed content
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatIds = Object.keys(generatedContents);
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg">Generated Content Formats</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formatIds.map(formatId => (
            <Card 
              key={formatId} 
              className={`cursor-pointer transition-shadow hover:shadow-md ${
                activeFormat === formatId ? 'border-primary ring-1 ring-primary' : ''
              }`}
              onClick={() => setActiveFormat(formatId)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center">
                  {getFormatIcon(formatId)}
                  <span className="font-medium">{getFormatName(formatId)}</span>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="h-24 overflow-hidden text-sm text-muted-foreground">
                  <p className="line-clamp-3">
                    {generatedContents[formatId].substring(0, 150)}
                    {generatedContents[formatId].length > 150 ? '...' : ''}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {activeFormat && (
          <div className="mt-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center">
                  {getFormatIcon(activeFormat)}
                  {getFormatName(activeFormat)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap rounded-md bg-muted p-4 text-sm font-mono overflow-auto max-h-[400px]">
                  {generatedContents[activeFormat]}
                </pre>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onCopyToClipboard(generatedContents[activeFormat])}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onDownloadAsText(
                    generatedContents[activeFormat], 
                    getFormatName(activeFormat)
                  )}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => onSaveAsNewContent(activeFormat, generatedContents[activeFormat])}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save as Content
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GeneratedContentDisplay;
