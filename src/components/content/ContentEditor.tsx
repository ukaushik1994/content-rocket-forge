
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';

interface ContentEditorProps {
  content: string;
  onContentChange: (newContent: string) => void;
  isLoading?: boolean;
}

export const ContentEditor: React.FC<ContentEditorProps> = ({
  content,
  onContentChange,
  isLoading = false
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onContentChange(e.target.value);
  };

  // Simple Markdown to HTML converter
  const renderMarkdown = (markdown: string) => {
    if (!markdown) return '';
    let html = markdown;

    // Convert headers
    html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
    html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');

    // Convert bold
    html = html.replace(/\*\*(.*)\*\*/gm, '<strong>$1</strong>');

    // Convert italic
    html = html.replace(/\*(.*)\*/gm, '<em>$1</em>');

    // Convert paragraphs
    html = html.split('\n\n').map(p => `<p>${p}</p>`).join('');
    return html;
  };
  
  return (
    <Card className="border border-muted h-full flex-1 flex flex-col">
      <Tabs defaultValue="write" className="flex-1 flex flex-col">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="write">Write</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="write" className="flex-1 m-0 data-[state=active]:flex flex-col relative">
          {isLoading && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Loading content...</span>
              </div>
            </div>
          )}
          <Textarea 
            value={content} 
            onChange={handleChange} 
            placeholder="Write your content here..." 
            className="min-h-[60vh] border-0 focus-visible:ring-0 resize-none p-4 flex-1" 
            disabled={isLoading}
          />
        </TabsContent>
        
        <TabsContent value="preview" className="flex-1 m-0 data-[state=active]:flex flex-col relative">
          {isLoading && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Loading preview...</span>
              </div>
            </div>
          )}
          <CardContent className="p-4 flex-1">
            <ScrollArea className="h-[60vh]">
              <div 
                className="prose prose-sm max-w-none dark:prose-invert" 
                dangerouslySetInnerHTML={{
                  __html: renderMarkdown(content)
                }} 
              />
            </ScrollArea>
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
