import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Eye, Edit3, Download, Copy, RotateCcw, Save } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';

interface EnhancedContentEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSave?: () => void;
  title?: string;
  isGenerating?: boolean;
  placeholder?: string;
  className?: string;
}

export const EnhancedContentEditor: React.FC<EnhancedContentEditorProps> = ({
  content,
  onChange,
  onSave,
  title = "Content Editor",
  isGenerating = false,
  placeholder = "Start writing your content here...",
  className = ""
}) => {
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Update counts when content changes
  useEffect(() => {
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    const chars = content.length;
    setWordCount(words);
    setCharCount(chars);
  }, [content]);

  // Track unsaved changes
  useEffect(() => {
    setHasUnsavedChanges(true);
    
    // Auto-save after 3 seconds of no changes
    const timeoutId = setTimeout(() => {
      if (onSave && hasUnsavedChanges) {
        onSave();
        setHasUnsavedChanges(false);
      }
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [content]);

  const handleContentChange = (value: string) => {
    onChange(value);
    setHasUnsavedChanges(true);
  };

  const handleManualSave = () => {
    if (onSave) {
      onSave();
      setHasUnsavedChanges(false);
      toast.success('Content saved successfully');
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success('Content copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy content');
    }
  };

  const downloadAsMarkdown = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Content downloaded as Markdown');
  };

  const clearContent = () => {
    if (content.length > 0) {
      if (window.confirm('Are you sure you want to clear all content? This action cannot be undone.')) {
        handleContentChange('');
        toast.success('Content cleared');
      }
    }
  };

  const insertText = (textToInsert: string) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const newContent = content.substring(0, start) + textToInsert + content.substring(end);
      handleContentChange(newContent);
      
      // Restore cursor position
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start + textToInsert.length;
          textareaRef.current.selectionEnd = start + textToInsert.length;
          textareaRef.current.focus();
        }
      }, 0);
    }
  };

  const formatButtons = [
    { label: 'H1', action: () => insertText('# ') },
    { label: 'H2', action: () => insertText('## ') },
    { label: 'H3', action: () => insertText('### ') },
    { label: 'Bold', action: () => insertText('**text**') },
    { label: 'Italic', action: () => insertText('*text*') },
    { label: 'Link', action: () => insertText('[link text](url)') },
    { label: 'List', action: () => insertText('\n- ') },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`w-full ${className}`}
    >
      <Card className="border border-border/50 bg-card/80 backdrop-blur-xl shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Edit3 className="h-5 w-5 text-primary" />
              {title}
              {hasUnsavedChanges && (
                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                  Unsaved
                </span>
              )}
            </CardTitle>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{wordCount} words</span>
              <span>•</span>
              <span>{charCount} characters</span>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'write' | 'preview')} className="w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <TabsList className="grid w-full max-w-[200px] grid-cols-2">
                <TabsTrigger value="write" className="flex items-center gap-2">
                  <Edit3 className="h-4 w-4" />
                  Write
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Preview
                </TabsTrigger>
              </TabsList>
              
              <div className="flex flex-wrap gap-2">
                {activeTab === 'write' && (
                  <div className="flex flex-wrap gap-1">
                    {formatButtons.map((button) => (
                      <Button
                        key={button.label}
                        variant="outline"
                        size="sm"
                        onClick={button.action}
                        className="h-8 px-2 text-xs"
                      >
                        {button.label}
                      </Button>
                    ))}
                  </div>
                )}
                
                <div className="flex gap-2">
                  {onSave && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleManualSave}
                      disabled={!hasUnsavedChanges}
                      className="flex items-center gap-1"
                    >
                      <Save className="h-4 w-4" />
                      Save
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyToClipboard}
                    disabled={!content}
                    className="flex items-center gap-1"
                  >
                    <Copy className="h-4 w-4" />
                    Copy
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadAsMarkdown}
                    disabled={!content}
                    className="flex items-center gap-1"
                  >
                    <Download className="h-4 w-4" />
                    MD
                  </Button>
                  
                  {content && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearContent}
                      className="flex items-center gap-1 text-destructive hover:bg-destructive/10"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Tabs>
        </CardHeader>
        
        <CardContent className="p-6">
          <Tabs value={activeTab} className="w-full">
            <TabsContent value="write" className="mt-0">
              <div className="relative">
                <Textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder={isGenerating ? "AI is generating content..." : placeholder}
                  disabled={isGenerating}
                  className="min-h-[500px] w-full resize-none border-0 bg-transparent text-base leading-relaxed focus-visible:ring-0 focus-visible:ring-offset-0"
                  style={{ 
                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
                  }}
                />
                
                {isGenerating && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
                      <span>Generating content...</span>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="preview" className="mt-0">
              <div className="min-h-[500px] w-full">
                {content ? (
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <ReactMarkdown
                      components={{
                        h1: ({ children }) => (
                          <h1 className="text-2xl font-bold mb-4 text-foreground border-b border-border pb-2">
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-xl font-semibold mb-3 mt-6 text-foreground">
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-lg font-medium mb-2 mt-4 text-foreground">
                            {children}
                          </h3>
                        ),
                        p: ({ children }) => (
                          <p className="mb-4 text-muted-foreground leading-relaxed">
                            {children}
                          </p>
                        ),
                        ul: ({ children }) => (
                          <ul className="mb-4 ml-6 list-disc space-y-1 text-muted-foreground">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="mb-4 ml-6 list-decimal space-y-1 text-muted-foreground">
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => (
                          <li className="text-muted-foreground">
                            {children}
                          </li>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-semibold text-foreground">
                            {children}
                          </strong>
                        ),
                        em: ({ children }) => (
                          <em className="italic text-muted-foreground">
                            {children}
                          </em>
                        ),
                        a: ({ children, href }) => (
                          <a 
                            href={href} 
                            className="text-primary hover:underline"
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            {children}
                          </a>
                        ),
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-4">
                            {children}
                          </blockquote>
                        ),
                        code: ({ children }) => (
                          <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono">
                            {children}
                          </code>
                        ),
                      }}
                    >
                      {content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[500px] text-muted-foreground">
                    <div className="text-center">
                      <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Start writing to see preview</p>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
};