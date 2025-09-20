
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ContentEditor } from '@/components/content/ContentEditor';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Eye, Edit, FileText, Save, Wand, Sparkles, CheckCircle, Loader2, Badge } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


interface ContentReviewCardProps {
  content: string;
}

export const ContentReviewCard: React.FC<ContentReviewCardProps> = ({ content }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [activeTab, setActiveTab] = useState('preview');
  const { setContent } = useContentBuilder();
  
  
  // Enhanced button states
  const [hasOptimized, setHasOptimized] = useState(false);
  
  // Remove optimization functionality
  const isAnalyzing = false;
  const analyzeContent = () => {};
  const getTotalSuggestionCount = () => 0;
  const analysisError = null;

  // Handle content changes
  const handleContentChange = (newContent: string) => {
    setEditedContent(newContent);
  };

  // Save changes
  const handleSave = () => {
    setContent(editedContent);
    setIsEditing(false);
    toast.success("Content updated successfully");
  };

  // Handle mode toggle
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditedContent(content);
    }
  };
  
  // Format markdown headings for display
  const formatContentForDisplay = (text: string) => {
    return text
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-3 mt-4">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold mb-2 mt-4">$2</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold mb-2 mt-3">$1</h3>')
      .replace(/^#### (.*$)/gm, '<h4 class="text-md font-bold mb-1 mt-2">$1</h4>')
      .split('\n\n')
      .map(paragraph => paragraph ? `<p class="mb-3">${paragraph}</p>` : '')
      .join('');
  };

  // Enhanced auto-optimize handler
  const handleAutoOptimize = async () => {
    try {
      // Run the real analysis
      await analyzeContent();
    } catch (error) {
      console.error('Failed to start analysis:', error);
      toast.error('Failed to start analysis. Please try again.');
    }
  };

  // Handle content update from auto-optimize dialog
  const handleContentUpdate = (newContent: string) => {
    setEditedContent(newContent);
    setContent(newContent);
    setHasOptimized(true);
    
    // Switch to preview tab to show the optimized content
    setActiveTab('preview');
    
    toast.success("Content optimized successfully", {
      description: "The content has been updated with the optimized version."
    });
    
    // Reset optimization state after success animation
    setTimeout(() => {
      setHasOptimized(false);
    }, 3000);
  };

  // Reset states when content changes
  useEffect(() => {
    setHasOptimized(false);
  }, [editedContent]);

  // Get button text based on state
  const getButtonText = () => {
    if (isAnalyzing) return 'Analyzing...';
    if (hasOptimized) return 'Optimized!';
    if (analysisError) return 'Retry';
    return 'Auto-optimize';
  };

  // Get button icon based on state
  const getButtonIcon = () => {
    if (isAnalyzing) return <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />;
    if (hasOptimized) return <CheckCircle className="h-3.5 w-3.5 mr-1" />;
    if (analysisError) return <Wand className="h-3.5 w-3.5 mr-1" />;
    return <Sparkles className="h-3.5 w-3.5 mr-1" />;
  };

  // Get current suggestion count
  const suggestionCount = getTotalSuggestionCount();

  return (
    <Card className="shadow-lg overflow-hidden glass-panel flex flex-col border-neon-border h-full">
      <CardHeader className="pb-2 border-b bg-gradient-to-r from-purple-500/10 to-transparent flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
          Content Review
        </CardTitle>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="flex justify-between items-center px-4 py-1 border-b">
          <TabsList className="bg-transparent p-0">
            <TabsTrigger value="preview" className="data-[state=active]:bg-muted/30 data-[state=active]:shadow-none">
              <Eye className="h-4 w-4 mr-1" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="edit" className="data-[state=active]:bg-muted/30 data-[state=active]:shadow-none">
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </TabsTrigger>
            <TabsTrigger value="source" className="data-[state=active]:bg-muted/30 data-[state=active]:shadow-none">
              <FileText className="h-4 w-4 mr-1" />
              Source
            </TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            {activeTab === 'edit' && (
              <Button
                size="sm"
                className="text-xs bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple"
                onClick={handleSave}
              >
                <Save className="h-3.5 w-3.5 mr-1" />
                Save
              </Button>
            )}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <Button 
                      size="sm"
                      disabled={isAnalyzing}
                      className={`
                        text-xs relative overflow-hidden group transition-all duration-300 ease-out
                        ${hasOptimized 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white' 
                          : analysisError
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white'
                          : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white'
                        }
                        hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25
                        ${isAnalyzing ? 'animate-pulse' : ''}
                        before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300
                      `}
                      onClick={handleAutoOptimize}
                    >
                      <div className="relative z-10 flex items-center">
                        {getButtonIcon()}
                        <span className="font-medium">{getButtonText()}</span>
                        {suggestionCount > 0 && !isAnalyzing && !hasOptimized && (
                          <span className="ml-1 bg-white/20 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                            {suggestionCount}
                          </span>
                        )}
                      </div>
                      
                      {/* Animated background effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Success celebration effect */}
                      {hasOptimized && (
                        <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 animate-pulse" />
                      )}
                    </Button>
                    
                    {/* Progress indicator for analyzing state */}
                    {isAnalyzing && (
                      <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full overflow-hidden">
                        <div className="h-full bg-white/50 animate-[slide-in-right_2s_ease-in-out_infinite]" />
                      </div>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-background border border-border">
                  <div className="text-xs">
                    {isAnalyzing ? (
                      'Analyzing content for optimization opportunities...'
                    ) : hasOptimized ? (
                      'Content has been successfully optimized!'
                    ) : suggestionCount > 0 ? (
                      `${suggestionCount} optimization${suggestionCount > 1 ? 's' : ''} available`
                    ) : (
                      'Click to analyze and optimize your content with AI'
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        <TabsContent value="preview" className="flex-1 m-0 p-0 data-[state=active]:flex flex-col">
          <ScrollArea className="flex-1 p-4 h-[85vh]">
            <div className="prose prose-slate dark:prose-invert prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg max-w-none">
              {editedContent.split('\n\n').map((paragraph, idx) => (
                paragraph.startsWith('# ') ? (
                  <h1 key={idx}>{paragraph.substring(2)}</h1>
                ) : paragraph.startsWith('## ') ? (
                  <h2 key={idx}>{paragraph.substring(3)}</h2>
                ) : paragraph.startsWith('### ') ? (
                  <h3 key={idx}>{paragraph.substring(4)}</h3>
                ) : paragraph ? (
                  <p key={idx}>{paragraph}</p>
                ) : <br key={idx} />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="edit" className="flex-1 m-0 p-0 data-[state=active]:flex flex-col">
          <ContentEditor 
            content={editedContent}
            onContentChange={handleContentChange}
          />
        </TabsContent>
        
        <TabsContent value="source" className="flex-1 m-0 p-0 data-[state=active]:flex flex-col">
          <ScrollArea className="flex-1 h-[85vh]">
            <pre className="p-5 text-xs font-mono whitespace-pre-wrap bg-secondary/10">{editedContent}</pre>
          </ScrollArea>
        </TabsContent>
      </Tabs>

    </Card>
  );
}
