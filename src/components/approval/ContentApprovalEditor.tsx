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
import { saveApprovalSafetyCopy, getApprovalSafetyCopy, clearApprovalSafetyCopy, type SafetyCopy } from '@/services/smart-actions/safetyCopy';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

import { ApprovalAITitleSuggestions } from './ai/ApprovalAITitleSuggestions';
import { SectionRegenerationTool } from './ai/SectionRegenerationTool';

import { StatusBadge } from './StatusBadge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { InlineAiEditor } from './ai/InlineAiEditor';
import { TitleSidebarTile } from './tiles/TitleSidebarTile';
import { SmartActionBar } from '@/components/smart-actions/SmartActionBar';
import { useSmartApprovalRecommendation } from '@/hooks/approval/useSmartApprovalRecommendation';
import { ApprovalTimeline } from '@/components/approval/ApprovalTimeline';
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
const [safetyCopy, setSafetyCopy] = useState<SafetyCopy | null>(null);
useEffect(() => {
  setSafetyCopy(getApprovalSafetyCopy(content.id));
}, [content.id]);
  const mainKeyword = (content.metadata?.mainKeyword || content.keywords?.[0] || '').toString().trim();
  const {
    updateContentItem,
    approveContent,
    rejectContent,
    requestChanges,
    submitForReview
  } = useContent();
  const { improveContentWithAI, isImproving } = useApproval();
  const { recommendation } = useSmartApprovalRecommendation({
    content,
    editedContent,
    editedTitle,
    mainKeyword,
    notes: approvalNotes,
  });

  const queryClient = useQueryClient();
  useEffect(() => {
    const id = content.id;
    queryClient.prefetchQuery({
      queryKey: ['approval-actions', id],
      queryFn: async () => {
        const { data } = await supabase
          .from('approval_actions_log')
          .select('id, action, accepted_recommendation, latency_ms, created_at')
          .eq('content_id', id)
          .order('created_at', { ascending: false })
          .limit(200);
        return data ?? [];
      },
    });
    queryClient.prefetchQuery({
      queryKey: ['approval-recs', id],
      queryFn: async () => {
        const { data } = await supabase
          .from('approval_recommendations')
          .select('id, action, confidence, created_at')
          .eq('content_id', id)
          .order('created_at', { ascending: false })
          .limit(200);
        return data ?? [];
      },
    });
  }, [content.id, queryClient]);
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

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isMeta = e.metaKey || e.ctrlKey;
      const key = e.key;

      // Save
      if (isMeta && (key === 's' || key === 'S')) {
        e.preventDefault();
        if (!isSubmitting) handleSave();
        return;
      }

      // Approve (or Submit when draft)
      if (isMeta && key === 'Enter') {
        e.preventDefault();
        if (!isSubmitting) {
          if (content.approval_status === 'draft') {
            handleSubmitForReview();
          } else {
            handleApprove();
          }
        }
        return;
      }

      // Request changes
      if (isMeta && e.shiftKey && (key === 'R' || key === 'r')) {
        e.preventDefault();
        if (approvalNotes.trim()) {
          if (!isSubmitting) handleRequestChanges();
        } else {
          toast.error('Please provide specific change requests');
        }
        return;
      }

      // Reject
      if (isMeta && e.shiftKey && (key === 'X' || key === 'x')) {
        e.preventDefault();
        if (approvalNotes.trim()) {
          if (!isSubmitting) handleReject();
        } else {
          toast.error('Please provide a reason for rejection');
        }
        return;
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isSubmitting, approvalNotes, content.approval_status]);

  // Breadcrumb: indicate v2 UI is active
  useEffect(() => {
    console.info('Editor UI v2 active');
  }, []);

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
    // safety copy
    saveApprovalSafetyCopy({ id: content.id, action: 'approve', title: editedTitle, content: editedContent, notes: approvalNotes, createdAt: new Date().toISOString() });
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
    // safety copy
    saveApprovalSafetyCopy({ id: content.id, action: 'reject', title: editedTitle, content: editedContent, notes: approvalNotes, createdAt: new Date().toISOString() });
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
    // safety copy
    saveApprovalSafetyCopy({ id: content.id, action: 'request_changes', title: editedTitle, content: editedContent, notes: approvalNotes, createdAt: new Date().toISOString() });
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
    // safety copy
    saveApprovalSafetyCopy({ id: content.id, action: 'submit_for_review', title: editedTitle, content: editedContent, notes: approvalNotes, createdAt: new Date().toISOString() });
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
  return <motion.div className="space-y-6" initial={{
    opacity: 0
  }} animate={{
    opacity: 1
  }} transition={{
    duration: 0.3
  }}>
      {safetyCopy && (
        <Alert className="mb-3 border-amber-600/30 bg-amber-600/10 animate-fade-in">
          <FileText className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-amber-200">
            We found a safety copy from {new Date(safetyCopy.createdAt).toLocaleString()}.
          </AlertDescription>
          <div className="mt-2 flex gap-2">
            <Button size="sm" onClick={() => {
              setEditedTitle(safetyCopy.title);
              setEditedContent(safetyCopy.content);
              if (typeof safetyCopy.notes === 'string') setApprovalNotes(safetyCopy.notes);
              clearApprovalSafetyCopy(content.id);
              setSafetyCopy(null);
              toast.success('Restored from safety copy');
            }}>Restore</Button>
            <Button size="sm" variant="ghost" onClick={() => {
              clearApprovalSafetyCopy(content.id);
              setSafetyCopy(null);
            }}>Dismiss</Button>
          </div>
        </Alert>
      )}
      {/* Compact Title Card */}
      <Card className="border-gray-700/50 bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm shadow-lg">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-medium bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Title ({editedTitle.length}/60)
                </label>
                {mainKeyword && <div className={`text-[10px] ${editedTitle.toLowerCase().includes(mainKeyword.toLowerCase()) ? 'text-green-400' : 'text-amber-400'}`}>
                    {editedTitle.toLowerCase().includes(mainKeyword.toLowerCase()) ? <span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Keyword included</span> : <span className="inline-flex items-center gap-1"><AlertIcon className="h-3 w-3" /> Add keyword</span>}
                  </div>}
              </div>
              <div className="space-y-2">
                <div className="text-sm text-white/90 truncate font-medium" title={editedTitle}>{editedTitle}</div>
                <div className="text-[11px] text-white/60">Edit the title from the right sidebar.</div>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <StatusBadge status={content.approval_status} showIcon={true} />
                {content.keywords?.length > 0 && <div className="flex flex-wrap gap-1">
                    {content.keywords.map((keyword, i) => <Badge key={i} variant="secondary" className="text-xs bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border border-blue-500/30 hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-200">
                        {keyword}
                      </Badge>)}
                  </div>}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSave} disabled={isSubmitting} className="bg-gray-800/50 border-gray-600/50 hover:bg-gray-700/50 text-white/80 hover:text-white transition-all duration-200">
                <History className="mr-2 h-4 w-4" />
                Save Draft
              </Button>
<SmartActionBar
  context={{ approvalStatus: content.approval_status, contentId: content.id }}
  disabled={isSubmitting}
  hasNotes={Boolean(approvalNotes.trim())}
  recommendation={recommendation}
  onApprove={handleApprove}
  onRequestChanges={handleRequestChanges}
  onReject={handleReject}
  onSubmitForReview={handleSubmitForReview}
/>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex gap-6">
        {/* Main Editor */}
        <Card className="relative border-gray-700/50 bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm shadow-xl flex-1">
          <CardHeader className="sticky top-0 z-10 pb-3 border-b border-gray-700/50 bg-gradient-to-r from-gray-800/90 to-gray-900/90 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CardTitle className="text-sm font-medium bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Generated Content
                </CardTitle>
                <span className="text-[10px] px-2 py-1 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border border-blue-500/30 font-medium">
                  Enhanced Editor
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={handleImproveContent} disabled={isImproving} className="flex items-center gap-1 text-white/70 hover:text-white hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-blue-500/20 border border-transparent hover:border-purple-500/30 transition-all duration-200">
                  <Wand className="h-4 w-4 text-purple-400" />
                  {isImproving ? 'Improving...' : 'Improve with AI'}
                </Button>
                {!hideToolsToggle && (
                  <Button variant="ghost" size="sm" onClick={() => setShowSidebar(!showSidebar)} className={`flex items-center gap-1 ${showSidebar ? 'text-blue-400 bg-blue-500/20 border-blue-500/30' : 'text-white/70 border-transparent'} hover:text-white hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-500/20 border hover:border-blue-500/30 transition-all duration-200`}>
                    <PanelRight className="h-4 w-4" />
                    {showSidebar ? 'Hide Tools' : 'Show Tools'}
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2 mx-4 my-3 bg-gray-800/60 border border-gray-700/50 h-8 rounded-lg">
                <TabsTrigger value="edit" className="h-7 px-3 text-xs font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/30 data-[state=active]:to-blue-500/30 data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-purple-500/50 text-white/70 transition-all duration-200">
                  Edit
                </TabsTrigger>
                <TabsTrigger value="preview" className="h-7 px-3 text-xs font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/30 data-[state=active]:to-blue-500/30 data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-purple-500/50 text-white/70 transition-all duration-200">
                  Preview
                </TabsTrigger>
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
          <div className="px-4 py-2 text-[11px] text-white/60 flex items-center justify-between border-t border-gray-700/50 bg-gray-800/30">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {lastSavedAt ? `Last saved ${lastSavedAt.toLocaleTimeString()}` : 'Autosaving...'}
            </div>
            {undoContent && <button className="text-blue-400 hover:text-blue-300 hover:underline transition-colors duration-200" onClick={() => {
            setEditedContent(undoContent);
            setUndoContent(null);
          }}>
                <span className="inline-flex items-center gap-1"><RotateCcw className="h-3 w-3" /> Undo</span>
              </button>}
          </div>
          
          <CardFooter className="border-t border-gray-700/50 p-4 bg-gradient-to-br from-gray-800/40 to-gray-900/40">
            <div className="w-full space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {content.approval_status === 'pending_review' || content.approval_status === 'in_review' ? 'Review Notes & Feedback' : 'Notes'}
                </h4>
                <Textarea 
                  placeholder={content.approval_status === 'pending_review' || content.approval_status === 'in_review' ? "Provide feedback, suggestions, or reasons for your decision..." : "Add any notes about this content..."} 
                  value={approvalNotes} 
                  onChange={e => setApprovalNotes(e.target.value)} 
                  className="min-h-[100px] bg-gray-800/60 border-gray-600/50 focus-visible:ring-purple-500/50 focus-visible:border-purple-500/50 text-white placeholder:text-white/40 transition-all duration-200" 
                />
              </div>
              
              <Alert className="border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10 backdrop-blur-sm">
                <FileText className="h-4 w-4 text-amber-400" />
                <AlertDescription className="text-amber-100">
                  {content.approval_status === 'pending_review' || content.approval_status === 'in_review' ? 'Review the content carefully before making your decision. Your feedback will be sent to the content author.' : 'Review and update the content before proceeding. Changes will be saved automatically.'}
                </AlertDescription>
              </Alert>
            </div>
          </CardFooter>
        </Card>
        
        {/* Enhanced Sidebar with Timeline */}
        {showSidebar && <motion.div 
          initial={{ opacity: 0, width: 0 }} 
          animate={{ opacity: 1, width: 'auto' }} 
          exit={{ opacity: 0, width: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="w-80 space-y-4"
        >
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/50 rounded-lg p-1 backdrop-blur-sm">
                <TitleSidebarTile content={content} value={editedTitle} onChange={setEditedTitle} mainKeyword={mainKeyword} />
              </div>
              <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/50 rounded-lg p-1 backdrop-blur-sm">
                <ApprovalMetadata content={content} compact />
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/50 rounded-lg backdrop-blur-sm">
              <Tabs defaultValue={activeSidebarTab} onValueChange={setActiveSidebarTab} className="w-full">
                <TabsList className="w-full grid grid-cols-2 m-2 bg-gray-800/60 border border-gray-700/50">
                  <TabsTrigger value="titles" className="text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/30 data-[state=active]:to-blue-500/30 data-[state=active]:text-white transition-all duration-200">
                    <Wand className="h-4 w-4 mr-1" />
                    Titles
                  </TabsTrigger>
                  <TabsTrigger value="sections" className="text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/30 data-[state=active]:to-blue-500/30 data-[state=active]:text-white transition-all duration-200">
                    <Wand className="h-4 w-4 mr-1" />
                    Sections
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="titles" className="m-4 mt-2">
                  <ApprovalAITitleSuggestions content={content} onSelectTitle={handleTitleSelect} />
                </TabsContent>
                
                <TabsContent value="sections" className="m-4 mt-2">
                  <SectionRegenerationTool content={content} onSectionRegenerated={handleSectionRegenerated} />
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>}
      </div>
      <div className="mt-6">
        <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/50 rounded-lg backdrop-blur-sm p-1">
          <ApprovalTimeline contentId={content.id} />
        </div>
      </div>
    </motion.div>;
};