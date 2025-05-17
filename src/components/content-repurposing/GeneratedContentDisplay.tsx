
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  
  // Ensure we have an active format selected
  if (!activeFormat && formatIds.length > 0) {
    setActiveFormat(formatIds[0]);
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg">Generated Content</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col">
        <Tabs 
          value={activeFormat || formatIds[0]} 
          onValueChange={setActiveFormat}
          className="flex-grow flex flex-col"
        >
          <TabsList className="mb-4 flex flex-wrap h-auto">
            {formatIds.map(formatId => (
              <TabsTrigger key={formatId} value={formatId} className="flex items-center">
                {getFormatIcon(formatId)}
                {getFormatName(formatId)}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {formatIds.map(formatId => (
            <TabsContent 
              key={formatId} 
              value={formatId} 
              className="flex-grow flex flex-col data-[state=active]:flex-grow"
            >
              <div className="flex-grow mb-4 relative">
                <pre className="h-full overflow-auto p-4 rounded-md bg-muted text-sm font-mono whitespace-pre-wrap">
                  {generatedContents[formatId]}
                </pre>
              </div>
              
              <div className="flex justify-end gap-2 mt-auto">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onCopyToClipboard(generatedContents[formatId])}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onDownloadAsText(generatedContents[formatId], getFormatName(formatId))}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => onSaveAsNewContent(formatId, generatedContents[formatId])}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save as Content
                </Button>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default GeneratedContentDisplay;
