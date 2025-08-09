import React, { useState, useEffect } from 'react';
import { ContentItemType } from '@/contexts/content/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useContent } from '@/contexts/content';
import { FileText, CheckCircle, Wand, History, ThumbsUp, AlertCircle, Search, PanelRight, Clock, CheckCircle2, AlertCircle as AlertIcon, RotateCcw } from 'lucide-react';
import { ApprovalMetadata } from './ApprovalMetadata';
import { useApproval } from './context/ApprovalContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion } from 'framer-motion';

import { ApprovalAITitleSuggestions } from './ai/ApprovalAITitleSuggestions';
import { SectionRegenerationTool } from './ai/SectionRegenerationTool';

import { StatusBadge } from './StatusBadge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { InlineAiEditor } from './ai/InlineAiEditor';
import { TitleSidebarTile } from './tiles/TitleSidebarTile';
interface ContentApprovalEditorProps {
  content: ContentItemType;
  hideToolsToggle?: boolean;
  defaultShowSidebar?: boolean;
}
export const ContentApprovalEditor: React.FC<ContentApprovalEditorProps> = ({
  content,
  hideToolsToggle = false,
  defaultShowSidebar = true
}) => {
  const [editedContent, setEditedContent] = useState(content.content);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [activeTab, setActiveTab] = useState('edit');
  const [showSidebar, setShowSidebar] = useState(defaultShowSidebar);
  const [activeSidebarTab, setActiveSidebarTab] = useState('sections');
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
  const { improveContentWithAI, isImproving } = useApproval();


  // Autosave content and title (guarded and stable)
  useEffect(() => {
    // Only autosave when user has actually changed content or title
    if (editedContent === content.content && editedTitle === content.title) {
      return;
    }
    const handler = setTimeout(async () => {
      try {
        await updateContentItem(content.id, {
          content: editedContent,
          title: editedTitle
        });
        setLastSavedAt(new Date());
      } catch (e) {
        console.error('Autosave failed', e);
      }
    }, 1200);
    return () => clearTimeout(handler);
    // Intentionally omit updateContentItem from deps to avoid identity-change loops
  }, [editedContent, editedTitle, content.id]);
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
  const getActionButtons = () => {
    switch (content.approval_status) {
      case 'draft':
        return <Button onClick={handleSubmitForReview} disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
            <CheckCircle className="mr-2 h-4 w-4" />
            Submit for Review
          </Button>;
      case 'pending_review':
      case 'in_review':
        return <div className="flex gap-2">
            <Button onClick={handleApprove} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 text-white">
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve & Publish
            </Button>
            <Button onClick={handleRequestChanges} disabled={isSubmitting || !approvalNotes.trim()} variant="outline" className="bg-orange-600/10 border-orange-600/30 text-orange-400 hover:bg-orange-600/20">
              Request Changes
            </Button>
            <Button onClick={handleReject} disabled={isSubmitting || !approvalNotes.trim()} variant="destructive" className="bg-red-600/10 border-red-600/30 text-red-400 hover:bg-red-600/20">
              Reject
            </Button>
          </div>;
      default:
        return null;
    }
  };
  return <motion.div className="space-y-6" initial={{
    opacity: 0
  }} animate={{
    opacity: 1
  }} transition={{
    duration: 0.3
  }}>
      {/* Compact Title Card */}
      <Card className="border-white/10 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-white/70">Title ({editedTitle.length}/60)</label>
                {mainKeyword && <div className={`text-[10px] ${editedTitle.toLowerCase().includes(mainKeyword.toLowerCase()) ? 'text-green-400' : 'text-amber-400'}`}>
                    {editedTitle.toLowerCase().includes(mainKeyword.toLowerCase()) ? <span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Keyword included</span> : <span className="inline-flex items-center gap-1"><AlertIcon className="h-3 w-3" /> Add keyword</span>}
                  </div>}
              </div>
              <div className="space-y-1">
                <div className="text-sm text-white/90 truncate" title={editedTitle}>{editedTitle}</div>
                <div className="text-[11px] text-muted-foreground">Edit the title from the right sidebar.</div>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <StatusBadge status={content.approval_status} showIcon={true} />
                {content.keywords?.length > 0 && <div className="flex flex-wrap gap-1">
                    {content.keywords.map((keyword, i) => <Badge key={i} variant="secondary" className="text-xs bg-neon-purple/20 text-neon-purple border border-neon-purple/30">
                        {keyword}
                      </Badge>)}
                  </div>}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSave} disabled={isSubmitting} className="bg-white/5 border-white/10 hover:bg-white/10 text-white/80">
                <History className="mr-2 h-4 w-4" />
                Save Draft
              </Button>
              {getActionButtons()}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex gap-6">
        {/* Main Editor */}
        <Card className="relative border-white/10 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm shadow-xl flex-1">
          <CardHeader className="pb-2 border-b border-white/10">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-white/80">Generated Content</CardTitle>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={handleImproveContent} disabled={isImproving} className="flex items-center gap-1 text-white/70 hover:text-white hover:bg-white/10">
                  <Wand className="h-4 w-4 text-neon-purple" />
                  {isImproving ? 'Improving...' : 'Improve with AI'}
                </Button>
                {!hideToolsToggle && (
                  <Button variant="ghost" size="sm" onClick={() => setShowSidebar(!showSidebar)} className={`flex items-center gap-1 ${showSidebar ? 'text-neon-blue' : 'text-white/70'} hover:text-white hover:bg-white/10`}>
                    <PanelRight className="h-4 w-4" />
                    {showSidebar ? 'Hide Tools' : 'Show Tools'}
                  </Button>
                )}
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
                  <InlineAiEditor value={editedContent} onChange={handleContentChange} onAiApplied={prev => {
                  setUndoContent(prev);
                  setTimeout(() => setUndoContent(null), 5000);
                }} />
                </div>
              </TabsContent>
              
              <TabsContent value="preview" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                <div className="h-[60vh] p-6 overflow-y-auto prose prose-slate dark:prose-invert prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg max-w-none text-white/90">
                  {editedContent.split('\n\n').map((paragraph, idx) => paragraph.startsWith('# ') ? <h1 key={idx}>{paragraph.substring(2)}</h1> : paragraph.startsWith('## ') ? <h2 key={idx}>{paragraph.substring(3)}</h2> : paragraph.startsWith('### ') ? <h3 key={idx}>{paragraph.substring(4)}</h3> : paragraph ? <p key={idx}>{paragraph}</p> : <br key={idx} />)}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          
          {/* Last saved + undo */}
          <div className="px-4 py-2 text-[11px] text-white/60 flex items-center justify-between border-t border-white/10">
            <div>{lastSavedAt ? `Last saved ${lastSavedAt.toLocaleTimeString()}` : 'Autosaving...'}</div>
            {undoContent && <button className="text-primary hover:underline" onClick={() => {
            setEditedContent(undoContent);
            setUndoContent(null);
          }}>
                <span className="inline-flex items-center gap-1"><RotateCcw className="h-3 w-3" /> Undo</span>
              </button>}
          </div>
          
          <CardFooter className="border-t border-white/10 p-4">
            <div className="w-full space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2 text-white/80">
                  {content.approval_status === 'pending_review' || content.approval_status === 'in_review' ? 'Review Notes & Feedback' : 'Notes'}
                </h4>
                <Textarea placeholder={content.approval_status === 'pending_review' || content.approval_status === 'in_review' ? "Provide feedback, suggestions, or reasons for your decision..." : "Add any notes about this content..."} value={approvalNotes} onChange={e => setApprovalNotes(e.target.value)} className="min-h-[100px] bg-gray-800/30 border-white/10 focus-visible:ring-neon-purple/50" />
              </div>
              
              <Alert className="border-amber-600/30 bg-amber-600/10">
                <FileText className="h-4 w-4 text-amber-500" />
                <AlertDescription className="text-amber-200">
                  {content.approval_status === 'pending_review' || content.approval_status === 'in_review' ? 'Review the content carefully before making your decision. Your feedback will be sent to the content author.' : 'Review and update the content before proceeding. Changes will be saved automatically.'}
                </AlertDescription>
              </Alert>
            </div>
          </CardFooter>
        </Card>
        
        {/* Enhanced Sidebar with Timeline */}
        {showSidebar && <motion.div initial={{
        opacity: 0,
        width: 0
      }} animate={{
        opacity: 1,
        width: 'auto'
      }} exit={{
        opacity: 0,
        width: 0
      }} className="w-80 space-y-4">
            <div className="space-y-4">
              <TitleSidebarTile content={content} value={editedTitle} onChange={setEditedTitle} mainKeyword={mainKeyword} />
              <ApprovalMetadata content={content} compact />
            </div>

            <Tabs defaultValue={activeSidebarTab} onValueChange={setActiveSidebarTab} className="w-full">
              <TabsList className="w-full grid grid-cols-1">
                
                
                <TabsTrigger value="sections" className="text-xs">
                  <Wand className="h-4 w-4 mr-1" />
                  Sections
                </TabsTrigger>
              </TabsList>
              
              
              
              <TabsContent value="titles" className="mt-4">
                <ApprovalAITitleSuggestions content={content} onSelectTitle={handleTitleSelect} />
              </TabsContent>
              
              <TabsContent value="sections" className="mt-4">
                <SectionRegenerationTool content={content} onSectionRegenerated={handleSectionRegenerated} />
              </TabsContent>
            </Tabs>
          </motion.div>}
      </div>
    </motion.div>;
};