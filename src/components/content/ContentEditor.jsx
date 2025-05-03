import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
export const ContentEditor = ({
  content,
  onContentChange
}) => {
  const handleChange = e => {
    onContentChange(e.target.value);
  };

  // Simple Markdown to HTML converter
  const renderMarkdown = markdown => {
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
  return <Card className="border border-muted">
      <Tabs defaultValue="write">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="write">Write</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="write">
          <Textarea value={content} onChange={handleChange} placeholder="Write your content here..." className="min-h-[1000px] border-0 focus-visible:ring-0 resize-none p-4" />
        </TabsContent>
        
        <TabsContent value="preview">
          <CardContent className="p-4">
            <ScrollArea className="h-[500px]">
              <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{
              __html: renderMarkdown(content)
            }} />
            </ScrollArea>
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>;
};