
import React, { useState, useEffect } from 'react';
import { ContentItemType } from '@/contexts/content/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useContent } from '@/contexts/content';
import { ContentEditor } from '@/components/content/ContentEditor';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  FileText, CheckCircle, Wand, History, 
  ThumbsUp, AlertCircle, Search, PanelRight, Clock, Sparkles, RefreshCw, CheckCircle2, AlertCircle as AlertIcon, RotateCcw
} from 'lucide-react';
import { ApprovalMetadata } from './ApprovalMetadata';
import { useApproval } from './context/ApprovalContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion } from 'framer-motion';
import { ApprovalSerpSummary } from './serp/ApprovalSerpSummary';
import { ApprovalAITitleSuggestions } from './ai/ApprovalAITitleSuggestions';
import { SectionRegenerationTool } from './ai/SectionRegenerationTool';
import { ApprovalTimeline } from './ApprovalTimeline';
import { StatusBadge } from './StatusBadge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { InlineAiEditor } from './ai/InlineAiEditor';

interface ContentApprovalEditorProps {
  content: ContentItemType;
}

export const ContentApprovalEditor: React.FC<ContentApprovalEditorProps> = ({ content }) => {
  const [editedContent, setEditedContent] = useState(content.content);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [activeTab, setActiveTab] = useState('edit');
  const [showSidebar, setShowSidebar] = useState(false);
  const [activeSidebarTab, setActiveSidebarTab] = useState('timeline');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editedTitle, setEditedTitle] = useState(content.title);
  const [titleOpen, setTitleOpen] = useState(false);
  const [titleLoading, setTitleLoading] = useState(false);
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [undoContent, setUndoContent] = useState<string | null>(null);
  const mainKeyword = (content.metadata?.mainKeyword || content.keywords?.[0] || '').toString().trim();
  
  const { 
    updateContentItem, 
    approveContent, 
    rejectContent, 
    requestChanges,
    submitForReview
  } = useContent();
  
  const { 
    improveContentWithAI, 
    isImproving,
    serpData,
    isFetchingSerp,
    fetchSerpData,
    generateTitleSuggestions,
    generateMetadata
  } = useApproval();
  
  // Fetch SERP data on load if we have keywords
  useEffect(() => {
    if (content.keywords && content.keywords.length > 0) {
      fetchSerpData(content.keywords[0]);
    }
  }, [content.keywords, fetchSerpData]);

  // Autosave content and title
  useEffect(() => {
    const handler = setTimeout(async () => {
      try {
        await updateContentItem(content.id, { content: editedContent, title: editedTitle });
        setLastSavedAt(new Date());
      } catch (e) {
        console.error('Autosave failed', e);
      }
    }, 1200);
    return () => clearTimeout(handler);
  }, [editedContent, editedTitle, content.id, updateContentItem]);
  
  const handleContentChange = (newContent: string) => {
    setEditedContent(newContent);
  };
  
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedTitle(e.target.value);
  };
  
  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await updateContentItem(content.id, { 
        content: editedContent,
        title: editedTitle 
      });
      toast.success('Content saved successfully', {
        icon: <ThumbsUp className="h-4 w-4 text-green-500" />
      });
    } catch (error) {
      toast.error('Failed to save content', {
        icon: <AlertCircle className="h-4 w-4 text-red-500" />
      });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await approveContent(content.id, approvalNotes || undefined);
      toast.success('Content approved and published successfully', {
        icon: <CheckCircle className="h-4 w-4 text-green-500" />
      });
    } catch (error) {
      toast.error('Failed to approve content', {
        icon: <AlertCircle className="h-4 w-4 text-red-500" />
      });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!approvalNotes.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await rejectContent(content.id, approvalNotes);
      toast.success('Content rejected with feedback provided', {
        icon: <AlertCircle className="h-4 w-4 text-red-500" />
      });
    } catch (error) {
      toast.error('Failed to reject content');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestChanges = async () => {
    if (!approvalNotes.trim()) {
      toast.error('Please provide specific change requests');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await requestChanges(content.id, approvalNotes);
      toast.success('Change request sent to author', {
        icon: <AlertCircle className="h-4 w-4 text-orange-500" />
      });
    } catch (error) {
      toast.error('Failed to request changes');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitForReview = async () => {
    setIsSubmitting(true);
    try {
      await submitForReview(content.id, approvalNotes || undefined);
      toast.success('Content submitted for review');
    } catch (error) {
      toast.error('Failed to submit for review');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleImproveContent = async () => {
    try {
      if (!content) return;
      
      const improvedContent = await improveContentWithAI(content);
      if (improvedContent) {
        setEditedContent(improvedContent);
        toast.success('Content improved with AI assistance', {
          icon: <Wand className="h-4 w-4 text-neon-purple" />
        });
      }
    } catch (error) {
      toast.error('Failed to improve content');
      console.error(error);
    }
  };
  
  const handleTitleSelect = (title: string) => {
    setEditedTitle(title);
  };
  
  const handleSectionRegenerated = (updatedContent: string) => {
    setEditedContent(updatedContent);
  };
  
  const handleAddToContent = (content: string, type: string) => {
    let insertText = '';
    
    switch (type) {
      case 'keyword':
        insertText = `${content} `;
        break;
      case 'question':
        insertText = `\n\n## ${content}\n\n`;
        break;
      case 'heading':
        insertText = `\n\n## ${content}\n\n`;
        break;
      case 'entity':
        insertText = `${content} `;
        break;
      default:
        insertText = `${content} `;
    }
    
    setEditedContent(prev => prev + insertText);
    toast.success(`Added ${type} to content`);
  };

  const getActionButtons = () => {
    switch (content.approval_status) {
      case 'draft':
        return (
          <Button 
            onClick={handleSubmitForReview} 
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Submit for Review
          </Button>
        );
      case 'pending_review':
      case 'in_review':
        return (
          <div className="flex gap-2">
            <Button 
              onClick={handleApprove} 
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve & Publish
            </Button>
            <Button 
              onClick={handleRequestChanges} 
              disabled={isSubmitting || !approvalNotes.trim()}
              variant="outline"
              className="bg-orange-600/10 border-orange-600/30 text-orange-400 hover:bg-orange-600/20"
            >
              Request Changes
            </Button>
            <Button 
              onClick={handleReject} 
              disabled={isSubmitting || !approvalNotes.trim()}
              variant="destructive"
              className="bg-red-600/10 border-red-600/30 text-red-400 hover:bg-red-600/20"
            >
              Reject
            </Button>
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Compact Title Card */}
      <Card className="border-white/10 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-white/70">Title ({editedTitle.length}/60)</label>
                {mainKeyword && (
                  <div className={`text-[10px] ${editedTitle.toLowerCase().includes(mainKeyword.toLowerCase()) ? 'text-green-400' : 'text-amber-400'}`}>
                    {editedTitle.toLowerCase().includes(mainKeyword.toLowerCase()) ? (
                      <span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Keyword included</span>
                    ) : (
                      <span className="inline-flex items-center gap-1"><AlertIcon className="h-3 w-3" /> Add keyword</span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Input
                  value={editedTitle}
                  onChange={handleTitleChange}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="Content title..."
                  maxLength={60}
                />
                <Popover open={titleOpen} onOpenChange={setTitleOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="bg-white/5 border-white/10">
                      <Sparkles className="h-4 w-4 text-neon-purple mr-1" /> AI Suggest
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="text-sm mb-2">Suggestions</div>
                    <div className="space-y-2">
                      {titleLoading ? (
                        <div className="text-xs text-muted-foreground">Loading...</div>
                      ) : (
                        titleSuggestions.slice(0,3).map((t,i) => (
                          <button
                            key={i}
                            className="block w-full text-left text-sm p-2 rounded-md hover:bg-accent"
                            onClick={() => {
                              const prev = editedTitle;
                              setEditedTitle(t);
                              setTitleOpen(false);
                              toast.success('Title applied', {
                                action: { label: 'Undo', onClick: () => setEditedTitle(prev) },
                                duration: 5000
                              });
                            }}
                          >{t}</button>
                        ))
                      )}
                      <Button size="sm" variant="ghost" onClick={async () => {
                        setTitleLoading(true);
                        const list = await generateTitleSuggestions(content);
                        setTitleSuggestions(list);
                        setTitleLoading(false);
                      }}>
                        <RefreshCw className="h-3 w-3 mr-1" /> Refresh
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <StatusBadge status={content.approval_status} showIcon={true} />
                {content.keywords?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {content.keywords.map((keyword, i) => (
                      <Badge key={i} variant="secondary" className="text-xs bg-neon-purple/20 text-neon-purple border border-neon-purple/30">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleSave} 
                disabled={isSubmitting}
                className="bg-white/5 border-white/10 hover:bg-white/10 text-white/80"
              >
                <History className="mr-2 h-4 w-4" />
                Save Draft
              </Button>
              {getActionButtons()}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* SEO Metadata Section (compact) */}
      <ApprovalMetadata content={content} />
      
      <div className="flex gap-6">
        {/* Main Editor */}
        <Card className="relative border-white/10 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm shadow-xl flex-1">
          <CardHeader className="pb-2 border-b border-white/10">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-white/80">Generated Content</CardTitle>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleImproveContent}
                  disabled={isImproving}
                  className="flex items-center gap-1 text-white/70 hover:text-white hover:bg-white/10"
                >
                  <Wand className="h-4 w-4 text-neon-purple" />
                  {isImproving ? 'Improving...' : 'Improve with AI'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSidebar(!showSidebar)}
                  className={`flex items-center gap-1 ${showSidebar ? 'text-neon-blue' : 'text-white/70'} hover:text-white hover:bg-white/10`}
                >
                  <PanelRight className="h-4 w-4" />
                  {showSidebar ? 'Hide Tools' : 'Show Tools'}
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2 mx-4 my-2 bg-gray-900/60">
                <TabsTrigger value="edit" className="data-[state=active]:bg-neon-purple/20 data-[state=active]:text-neon-purple">Edit</TabsTrigger>
                <TabsTrigger value="preview" className="data-[state=active]:bg-neon-purple/20 data-[state=active]:text-neon-purple">Preview</TabsTrigger>
              </TabsList>
              
              <TabsContent value="edit" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                <div className="h-[60vh]">
                  <InlineAiEditor
                    value={editedContent}
                    onChange={handleContentChange}
                    onAiApplied={(prev) => {
                      setUndoContent(prev);
                      setTimeout(() => setUndoContent(null), 5000);
                    }}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="preview" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                <div className="h-[60vh] p-6 overflow-y-auto prose prose-slate dark:prose-invert prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg max-w-none text-white/90">
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
              </TabsContent>
            </Tabs>
          </CardContent>
          
          {/* Last saved + undo */}
          <div className="px-4 py-2 text-[11px] text-white/60 flex items-center justify-between border-t border-white/10">
            <div>{lastSavedAt ? `Last saved ${lastSavedAt.toLocaleTimeString()}` : 'Autosaving...'}</div>
            {undoContent && (
              <button className="text-primary hover:underline" onClick={() => { setEditedContent(undoContent); setUndoContent(null); }}>
                <span className="inline-flex items-center gap-1"><RotateCcw className="h-3 w-3" /> Undo</span>
              </button>
            )}
          </div>
          
          <CardFooter className="border-t border-white/10 p-4">
            <div className="w-full space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2 text-white/80">
                  {(content.approval_status === 'pending_review' || content.approval_status === 'in_review') 
                    ? 'Review Notes & Feedback' 
                    : 'Notes'}
                </h4>
                <Textarea 
                  placeholder={
                    (content.approval_status === 'pending_review' || content.approval_status === 'in_review')
                      ? "Provide feedback, suggestions, or reasons for your decision..."
                      : "Add any notes about this content..."
                  }
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  className="min-h-[100px] bg-gray-800/30 border-white/10 focus-visible:ring-neon-purple/50"
                />
              </div>
              
              <Alert className="border-amber-600/30 bg-amber-600/10">
                <FileText className="h-4 w-4 text-amber-500" />
                <AlertDescription className="text-amber-200">
                  {(content.approval_status === 'pending_review' || content.approval_status === 'in_review')
                    ? 'Review the content carefully before making your decision. Your feedback will be sent to the content author.'
                    : 'Review and update the content before proceeding. Changes will be saved automatically.'}
                </AlertDescription>
              </Alert>
            </div>
          </CardFooter>
        </Card>
        
        {/* Enhanced Sidebar with Timeline */}
        {showSidebar && (
          <motion.div 
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            className="w-80 space-y-4"
          >
            <Tabs defaultValue={activeSidebarTab} onValueChange={setActiveSidebarTab} className="w-full">
              <TabsList className="w-full grid grid-cols-4">
                <TabsTrigger value="timeline" className="text-xs">
                  <Clock className="h-4 w-4 mr-1" />
                  Timeline
                </TabsTrigger>
                <TabsTrigger value="serp" className="text-xs">
                  <Search className="h-4 w-4 mr-1" />
                  SERP
                </TabsTrigger>
                <TabsTrigger value="titles" className="text-xs">
                  <FileText className="h-4 w-4 mr-1" />
                  Titles
                </TabsTrigger>
                <TabsTrigger value="sections" className="text-xs">
                  <Wand className="h-4 w-4 mr-1" />
                  Sections
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="timeline" className="mt-4">
                <ApprovalTimeline contentId={content.id} />
              </TabsContent>
              
              <TabsContent value="serp" className="mt-4">
                <ApprovalSerpSummary
                  serpData={serpData}
                  isLoading={isFetchingSerp}
                  mainKeyword={content.keywords?.[0] || 'keyword'}
                  onAddToContent={handleAddToContent}
                />
              </TabsContent>
              
              <TabsContent value="titles" className="mt-4">
                <ApprovalAITitleSuggestions
                  content={content}
                  onSelectTitle={handleTitleSelect}
                />
              </TabsContent>
              
              <TabsContent value="sections" className="mt-4">
                <SectionRegenerationTool
                  content={content}
                  onSectionRegenerated={handleSectionRegenerated}
                />
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
