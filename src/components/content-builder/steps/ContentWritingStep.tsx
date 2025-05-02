
import React, { useState, useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { ContentEditor } from '@/components/content/ContentEditor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const ContentWritingStep = () => {
  const { state, dispatch } = useContentBuilder();
  const { content, outline, mainKeyword, selectedKeywords } = state;
  
  const [activeTab, setActiveTab] = useState<string>('write');
  const [processedContent, setProcessedContent] = useState(content);
  
  useEffect(() => {
    // If we have outline but no content, generate a template
    if (outline.length > 0 && !content) {
      generateContentTemplate();
    }
    
    // Mark as complete if we have content with at least 300 characters
    if (content && content.length > 300) {
      dispatch({ type: 'MARK_STEP_COMPLETED', payload: 4 });
    }
    
    // Process content for preview
    processContent();
  }, [content, outline]);
  
  const generateContentTemplate = () => {
    let template = `# ${mainKeyword}\n\n`;
    
    outline.forEach(section => {
      template += `## ${section.title}\n\n`;
      template += `_Add content about ${section.title.toLowerCase()} here..._\n\n`;
      
      if (section.subsections && section.subsections.length > 0) {
        section.subsections.forEach(subsection => {
          template += `### ${subsection.title}\n\n`;
          template += `_Add content about ${subsection.title.toLowerCase()} here..._\n\n`;
        });
      }
    });
    
    template += `\n_This article contains information about: ${selectedKeywords.join(', ')}_`;
    
    dispatch({ type: 'SET_CONTENT', payload: template });
  };
  
  const processContent = () => {
    // For now just set the raw content, but could be expanded to add styling or formatting
    setProcessedContent(content);
  };
  
  const handleContentChange = (newContent: string) => {
    dispatch({ type: 'SET_CONTENT', payload: newContent });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Content Creation</h3>
          <p className="text-sm text-muted-foreground">
            Write and edit your content based on the outline.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-background">
            Word count: {content ? content.split(/\s+/).filter(Boolean).length : 0}
          </Badge>
        </div>
      </div>
      
      <div className="flex gap-6">
        <div className="w-3/4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="write">
                <FileText className="h-4 w-4 mr-2" />
                Write
              </TabsTrigger>
              <TabsTrigger value="preview">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="write" className="p-0">
              <Card className="border-0 shadow-none">
                <ContentEditor 
                  initialContent={content}
                  onChange={handleContentChange}
                />
              </Card>
            </TabsContent>
            
            <TabsContent value="preview" className="mt-0">
              <Card>
                <CardContent className="prose prose-sm dark:prose-invert max-w-none p-6">
                  <div dangerouslySetInnerHTML={{ __html: processedContent }} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="w-1/4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Outline Reference</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <ul className="space-y-2">
                {outline.map((section) => (
                  <li key={section.id} className="font-medium">
                    {section.title}
                    {section.subsections && section.subsections.length > 0 && (
                      <ul className="ml-4 mt-1 space-y-1">
                        {section.subsections.map((subsection) => (
                          <li key={subsection.id} className="text-xs text-muted-foreground">
                            {subsection.title}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          
          <Card className="mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Keywords</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-primary/10 text-primary border-primary/30">
                  {mainKeyword}
                </Badge>
                {selectedKeywords.filter(k => k !== mainKeyword).map((keyword, idx) => (
                  <Badge key={idx} variant="outline">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
