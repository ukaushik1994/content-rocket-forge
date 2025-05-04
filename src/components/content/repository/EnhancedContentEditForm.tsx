import React, { useState, useEffect } from 'react';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Save, Bold, Italic, Heading, ListOrdered, List } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { ContentItemType } from '@/contexts/content';
import { calculateKeywordUsage } from '@/utils/seo/keywordAnalysis';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type FormValues = {
  title: string;
  content: string;
  keywords: string;
};

interface EnhancedContentEditFormProps {
  content: ContentItemType | null;
  isSaving: boolean;
  onSubmit: (values: FormValues) => Promise<void>;
}

export const EnhancedContentEditForm: React.FC<EnhancedContentEditFormProps> = ({
  content,
  isSaving,
  onSubmit,
}) => {
  const [activeTab, setActiveTab] = useState('edit');
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [keywordUsage, setKeywordUsage] = useState<Array<{keyword: string; count: number; density: string}>>([]);
  
  const form = useForm<FormValues>({
    defaultValues: {
      title: content?.title || '',
      content: content?.content || '',
      keywords: content?.keywords?.join(', ') || '',
    }
  });

  const watchContent = form.watch('content');
  const watchKeywords = form.watch('keywords');
  
  // Calculate word count and character count
  useEffect(() => {
    if (watchContent) {
      const words = watchContent.trim().split(/\s+/).filter(Boolean);
      setWordCount(words.length);
      setCharCount(watchContent.length);
      
      // Calculate keyword density
      if (watchKeywords) {
        const keywordsList = watchKeywords.split(',').map(k => k.trim()).filter(Boolean);
        if (keywordsList.length > 0) {
          const usage = calculateKeywordUsage(watchContent, keywordsList[0], keywordsList);
          setKeywordUsage(usage);
        }
      }
    } else {
      setWordCount(0);
      setCharCount(0);
    }
  }, [watchContent, watchKeywords]);
  
  // Insert markdown formatting
  const insertMarkdown = (format: string) => {
    const textarea = document.getElementById('content-textarea') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    
    let formattedText = '';
    const selectedText = text.substring(start, end);
    
    switch(format) {
      case 'bold':
        formattedText = `**${selectedText || 'bold text'}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText || 'italic text'}*`;
        break;
      case 'heading':
        formattedText = `\n## ${selectedText || 'Heading'}\n`;
        break;
      case 'list-ordered':
        formattedText = `\n1. ${selectedText || 'List item'}\n2. Another item\n`;
        break;
      case 'list-unordered':
        formattedText = `\n- ${selectedText || 'List item'}\n- Another item\n`;
        break;
      default:
        return;
    }
    
    const newText = text.substring(0, start) + formattedText + text.substring(end);
    form.setValue('content', newText, { shouldDirty: true });
    
    // Set focus back to textarea with cursor positioned after the inserted markdown
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + formattedText.length,
        start + formattedText.length
      );
    }, 0);
  };
  
  // Save handling
  const handleSave = form.handleSubmit(onSubmit);
  
  // Auto-save with debounce (every 5 seconds of inactivity after changes)
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (form.formState.isDirty) {
      timeout = setTimeout(() => {
        console.log('Auto-saving content...');
        // We don't actually auto-save to the server to avoid unnecessary requests
        // but we could uncomment this if needed
        // handleSave();
      }, 5000);
    }
    
    return () => {
      clearTimeout(timeout);
    };
  }, [watchContent, watchKeywords, form.formState.isDirty]);
  
  return (
    <Form {...form}>
      <form 
        className="flex flex-col flex-1 overflow-hidden"
        onSubmit={handleSave}
      >
        <div className="space-y-4 px-6 py-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium">Title</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Content title" 
                    className="text-lg" 
                    {...field} 
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="keywords"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium">Keywords (comma-separated)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="keyword1, keyword2, keyword3" 
                    {...field} 
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          {keywordUsage.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {keywordUsage.map(({ keyword, count, density }) => (
                <TooltipProvider key={keyword}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge 
                        variant={parseFloat(density) < 0.5 ? "outline" : parseFloat(density) > 5 ? "destructive" : "secondary"}
                        className="cursor-help"
                      >
                        {keyword}: {count} ({density})
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">
                        {parseFloat(density) < 0.5 ? 
                          "Consider using this keyword more" : 
                          parseFloat(density) > 5 ? 
                          "Keyword density too high (potential keyword stuffing)" :
                          "Good keyword density"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          )}
        </div>
          
        <Separator className="my-2" />
          
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center px-6 gap-2">
            <TabsList className="mb-2">
              <TabsTrigger value="edit" className="text-sm">Edit</TabsTrigger>
              <TabsTrigger value="preview" className="text-sm">Preview</TabsTrigger>
            </TabsList>
              
            <div className="flex ml-4 gap-1">
              <Button 
                type="button" 
                variant="ghost" 
                size="sm"
                onClick={() => insertMarkdown('bold')}
                className="p-1 h-8 w-8"
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm"
                onClick={() => insertMarkdown('italic')}
                className="p-1 h-8 w-8"
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm"
                onClick={() => insertMarkdown('heading')}
                className="p-1 h-8 w-8"
              >
                <Heading className="h-4 w-4" />
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm"
                onClick={() => insertMarkdown('list-ordered')}
                className="p-1 h-8 w-8"
              >
                <ListOrdered className="h-4 w-4" />
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm"
                onClick={() => insertMarkdown('list-unordered')}
                className="p-1 h-8 w-8"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
              
          <div className="flex flex-col flex-1 overflow-hidden px-6">
            <TabsContent 
              value="edit" 
              className="flex-1 overflow-hidden mt-0 data-[state=active]:flex data-[state=active]:flex-col"
            >
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <textarea 
                        id="content-textarea"
                        placeholder="Enter your content here..."
                        className="w-full h-full min-h-[400px] flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </TabsContent>
              
            <TabsContent 
              value="preview" 
              className="markdown-preview flex-1 overflow-auto mt-0 border rounded-md p-4 bg-white dark:bg-gray-950"
            >
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: watchContent
                    ? watchContent
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\*(.*?)\*/g, '<em>$1</em>')
                        .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
                        .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
                        .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
                        .replace(/^- (.*?)$/gm, '<li>$1</li>')
                        .replace(/^[0-9]+\. (.*?)$/gm, '<li>$1</li>')
                        .replace(/\n\n/g, '<br/><br/>')
                    : '<p>No content to preview</p>' 
                }}
              />
            </TabsContent>
          </div>
        </Tabs>
          
        <div className="p-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/20">
          <div className="text-sm text-muted-foreground">
            {wordCount} words | {charCount} characters
          </div>
              
          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};
