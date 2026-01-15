import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Copy, 
  Download, 
  Edit2, 
  Save, 
  X,
  FileText,
  Code,
  Target,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { sanitizeMarkdown, sanitizeHtml } from '@/utils/sanitize';

interface ContentItem {
  id: string;
  title: string;
  content: string;
  content_type: string;
  seo_score?: number;
  keywords?: string[];
  meta_title?: string;
  meta_description?: string;
}

interface ContentPreviewProps {
  content: ContentItem;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (content: ContentItem) => void;
}

export const ContentPreview = ({ 
  content, 
  isOpen, 
  onClose,
  onUpdate 
}: ContentPreviewProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(content.title);
  const [editedContent, setEditedContent] = useState(content.content);
  const [isSaving, setIsSaving] = useState(false);
  const [renderedHtml, setRenderedHtml] = useState('');

  const wordCount = content.content.split(/\s+/).filter(w => w.length > 0).length;

  // Render markdown to HTML with sanitization
  React.useEffect(() => {
    const renderMarkdownSafe = async () => {
      const html = await sanitizeMarkdown(content.content);
      setRenderedHtml(html);
    };
    renderMarkdownSafe();
  }, [content.content]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content.content);
    toast.success('Content copied to clipboard');
  };

  const handleDownload = async (format: 'md' | 'html' | 'txt') => {
    let fileContent = '';
    let mimeType = '';
    let extension = '';

    switch (format) {
      case 'md':
        fileContent = `# ${content.title}\n\n${content.content}`;
        mimeType = 'text/markdown';
        extension = 'md';
        break;
      case 'html':
        const sanitizedBody = await sanitizeMarkdown(content.content);
        fileContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${sanitizeHtml(content.meta_title || content.title)}</title>
  <meta name="description" content="${sanitizeHtml(content.meta_description || '')}">
</head>
<body>
  <h1>${sanitizeHtml(content.title)}</h1>
  ${sanitizedBody}
</body>
</html>`;
        mimeType = 'text/html';
        extension = 'html';
        break;
      case 'txt':
        fileContent = `${content.title}\n\n${content.content}`;
        mimeType = 'text/plain';
        extension = 'txt';
        break;
    }

    const blob = new Blob([fileContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${content.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`Downloaded as ${extension.toUpperCase()}`);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('content_items')
        .update({
          title: editedTitle,
          content: editedContent,
          updated_at: new Date().toISOString()
        })
        .eq('id', content.id);

      if (error) throw error;

      toast.success('Content updated successfully');
      setIsEditing(false);
      
      if (onUpdate) {
        onUpdate({
          ...content,
          title: editedTitle,
          content: editedContent
        });
      }
    } catch (error) {
      console.error('Failed to save content:', error);
      toast.error('Failed to save content');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedTitle(content.title);
    setEditedContent(content.content);
    setIsEditing(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {isEditing ? (
                <Input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="text-xl font-bold mb-2"
                />
              ) : (
                <DialogTitle className="text-2xl">{content.title}</DialogTitle>
              )}
              <DialogDescription className="flex items-center gap-2 mt-2">
                <Badge variant="outline">{content.content_type}</Badge>
                <span className="text-xs">•</span>
                <span className="text-xs">{wordCount} words</span>
                {content.seo_score && (
                  <>
                    <span className="text-xs">•</span>
                    <span className="text-xs flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      SEO: {content.seo_score}
                    </span>
                  </>
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          <Tabs defaultValue="content" className="flex-1 flex flex-col">
            <div className="px-6 pt-4 border-b border-border">
              <TabsList>
                <TabsTrigger value="content">
                  <FileText className="h-4 w-4 mr-2" />
                  Content
                </TabsTrigger>
                <TabsTrigger value="preview">
                  <Code className="h-4 w-4 mr-2" />
                  HTML Preview
                </TabsTrigger>
                <TabsTrigger value="metadata">
                  <Target className="h-4 w-4 mr-2" />
                  Metadata
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="content" className="flex-1 overflow-hidden px-6 pb-6">
              <ScrollArea className="h-full">
                {isEditing ? (
                  <Textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="min-h-[500px] font-mono text-sm"
                  />
                ) : (
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <div dangerouslySetInnerHTML={{ __html: renderedHtml }} />
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="preview" className="flex-1 overflow-hidden px-6 pb-6">
              <ScrollArea className="h-full">
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <div dangerouslySetInnerHTML={{ __html: renderedHtml }} />
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="metadata" className="flex-1 overflow-hidden px-6 pb-6">
              <ScrollArea className="h-full">
                <div className="space-y-4">
                  {content.meta_title && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Meta Title</label>
                      <p className="mt-1 p-3 bg-muted rounded-md">{content.meta_title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {content.meta_title.length}/60 characters
                      </p>
                    </div>
                  )}

                  {content.meta_description && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Meta Description</label>
                      <p className="mt-1 p-3 bg-muted rounded-md">{content.meta_description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {content.meta_description.length}/160 characters
                      </p>
                    </div>
                  )}

                  {Array.isArray(content.keywords) && content.keywords.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Keywords</label>
                      <div className="flex gap-2 flex-wrap mt-2">
                        {content.keywords.map((kw, idx) => (
                          <Badge key={idx} variant="secondary">{String(kw)}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {content.seo_score && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">SEO Score</label>
                      <div className="mt-2 flex items-center gap-3">
                        <div className="text-3xl font-bold text-primary">{content.seo_score}</div>
                        <div className="text-sm text-muted-foreground">
                          {content.seo_score >= 80 ? 'Excellent' :
                           content.seo_score >= 60 ? 'Good' :
                           content.seo_score >= 40 ? 'Fair' : 'Needs Improvement'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        <div className="px-6 py-4 border-t border-border flex items-center justify-between">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleDownload('md')}>
              <Download className="h-4 w-4 mr-2" />
              MD
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleDownload('html')}>
              <Download className="h-4 w-4 mr-2" />
              HTML
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleDownload('txt')}>
              <Download className="h-4 w-4 mr-2" />
              TXT
            </Button>
          </div>

          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
