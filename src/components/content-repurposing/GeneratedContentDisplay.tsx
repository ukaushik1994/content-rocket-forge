
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Copy, Download, Save, Book, Images, Image, Twitter, Linkedin, Facebook, Mail, BarChart, Trash } from 'lucide-react';
import { contentFormats } from '@/components/content-builder/final-review/tabs/RepurposeTab';
import { toast } from 'sonner';

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
  // Helper function to get the appropriate icon for a format
  const getFormatIcon = (formatId: string) => {
    switch (formatId) {
      case 'glossary':
        return <Book className="h-4 w-4" />;
      case 'carousel':
        return <Images className="h-4 w-4" />;
      case 'meme':
        return <Image className="h-4 w-4" />;
      case 'social-twitter':
        return <Twitter className="h-4 w-4" />;
      case 'social-linkedin':
        return <Linkedin className="h-4 w-4" />;
      case 'social-facebook': 
        return <Facebook className="h-4 w-4" />;
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'infographic':
        return <BarChart className="h-4 w-4" />;
      case 'blog':
      case 'script':
      default:
        return <FileText className="h-4 w-4" />;
    }
  };
  
  // Function to format special content types
  const formatContent = (content: string, formatId: string) => {
    if (formatId === 'meme') {
      try {
        // Extract meme components if in the expected format
        const imageMatch = content.match(/Image description: (.*?)(?:\n|$)/);
        const topTextMatch = content.match(/Top text: (.*?)(?:\n|$)/);
        const bottomTextMatch = content.match(/Bottom text: (.*?)(?:\n|$)/);
        const altCaptionMatch = content.match(/Alternative caption: (.*?)(?:\n|$)/);
        const contextMatch = content.match(/Context explanation: (.*?)(?:\n|$)/);
        
        if (imageMatch && (topTextMatch || bottomTextMatch)) {
          return (
            <div className="space-y-4">
              <div className="bg-black/80 p-4 rounded-lg space-y-2">
                <p className="text-center text-white font-bold uppercase">{topTextMatch ? topTextMatch[1] : ''}</p>
                <div className="border border-dashed border-gray-500 h-32 flex items-center justify-center">
                  <p className="text-gray-400 text-sm">[{imageMatch[1]}]</p>
                </div>
                <p className="text-center text-white font-bold uppercase">{bottomTextMatch ? bottomTextMatch[1] : ''}</p>
              </div>
              
              {altCaptionMatch && (
                <div className="mt-4">
                  <p className="text-sm font-semibold">Alternative Caption:</p>
                  <p className="text-sm">{altCaptionMatch[1]}</p>
                </div>
              )}
              
              {contextMatch && (
                <div className="mt-2">
                  <p className="text-sm font-semibold">Context:</p>
                  <p className="text-sm">{contextMatch[1]}</p>
                </div>
              )}
            </div>
          );
        }
      } catch (e) {
        console.error("Error parsing meme content:", e);
      }
    }
    
    if (formatId === 'carousel') {
      try {
        // Extract carousel slides if they follow the pattern "Slide X: content"
        const slides = content.split('\n\n').filter(line => line.trim().startsWith('Slide'));
        
        if (slides.length >= 3) {
          return (
            <div className="space-y-4">
              {slides.map((slide, index) => {
                const [slideTitle, ...slideContent] = slide.split(':');
                return (
                  <div key={index} className="border rounded-lg p-4">
                    <p className="font-semibold">{slideTitle}:</p>
                    <p>{slideContent.join(':').trim()}</p>
                  </div>
                );
              })}
            </div>
          );
        }
      } catch (e) {
        console.error("Error parsing carousel content:", e);
      }
    }
    
    // Default rendering for other content types or if parsing fails
    return (
      <pre className="whitespace-pre-wrap font-mono text-sm">
        {content}
      </pre>
    );
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
              {formatContent(generatedContents[activeFormat], activeFormat)}
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
                Save to Original
              </Button>
              {onDeleteRepurposedContent && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-500 hover:text-red-600"
                  onClick={() => {
                    if (activeFormat && onDeleteRepurposedContent) {
                      onDeleteRepurposedContent(activeFormat);
                    }
                  }}
                  disabled={isDeleting}
                >
                  <Trash className="h-4 w-4 mr-1" />
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              )}
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
