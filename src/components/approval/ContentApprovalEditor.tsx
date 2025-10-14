import React, { useState, useEffect } from 'react';
import { ContentItemType } from '@/contexts/content/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useContent } from '@/contexts/content';
import { FileText, CheckCircle, Wand, History, ThumbsUp, AlertCircle, Search, Clock, CheckCircle2, AlertCircle as AlertIcon, RotateCcw, Edit3, Globe, Zap, ChevronDown, ChevronRight } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ApprovalMetadata } from './ApprovalMetadata';
import { useApproval } from './context/ApprovalContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion } from 'framer-motion';
import { saveApprovalSafetyCopy, getApprovalSafetyCopy, clearApprovalSafetyCopy, type SafetyCopy } from '@/services/smart-actions/safetyCopy';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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
  return (
    <motion.div className="space-y-6" initial={{
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
      
      {/* Main Editor - Full Width */}
      <Card className="relative border-white/10 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm shadow-xl w-full flex flex-col h-full">
          <CardHeader className="sticky top-0 z-10 pb-2 border-b border-border bg-card/80 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-medium text-white/80">Generated Content</CardTitle>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">New UI</span>
              </div>
              <div className="flex gap-2 items-center">
                  <ToggleGroup type="single" value={activeTab} onValueChange={setActiveTab} size="sm" className="bg-card/60 p-0.5 rounded-md">
                    <ToggleGroupItem value="edit" className="h-6 px-2 text-[11px] data-[state=on]:bg-neon-purple/20 data-[state=on]:text-neon-purple">
                      <Edit3 className="h-3 w-3 mr-1" />
                      Edit
                    </ToggleGroupItem>
                    <ToggleGroupItem value="preview" className="h-6 px-2 text-[11px] data-[state=on]:bg-neon-purple/20 data-[state=on]:text-neon-purple">
                      <Globe className="h-3 w-3 mr-1" />
                      Preview
                    </ToggleGroupItem>
                  </ToggleGroup>
                  <Button variant="ghost" size="sm" onClick={handleImproveContent} disabled={isImproving} className="flex items-center gap-1 text-white/70 hover:text-white hover:bg-white/10">
                    <Wand className="h-4 w-4 text-neon-purple" />
                    {isImproving ? 'Improving...' : 'Improve with AI'}
                  </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0 flex-1 flex flex-col min-h-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
              
              <TabsContent value="edit" className="mt-0 focus-visible:outline-none focus-visible:ring-0 flex-1 min-h-0 flex flex-col">
                <div className="flex-1 min-h-0">
                  <InlineAiEditor 
                    value={editedContent} 
                    onChange={handleContentChange}
                    className="flex-1 min-h-0"
                    onAiApplied={prev => {
                      setUndoContent(prev);
                      setTimeout(() => setUndoContent(null), 5000);
                    }} 
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="preview" className="mt-0 focus-visible:outline-none focus-visible:ring-0 flex-1 min-h-0 flex flex-col">
                <div className="flex-1 min-h-0 p-6 overflow-y-scroll prose prose-slate dark:prose-invert prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg max-w-none text-white/90 scrollbar-thin scrollbar-thumb-black scrollbar-track-transparent">
                  {editedContent.split('\n\n').map((paragraph, idx) => paragraph.startsWith('# ') ? <h1 key={idx}>{paragraph.substring(2)}</h1> : paragraph.startsWith('## ') ? <h2 key={idx}>{paragraph.substring(3)}</h2> : paragraph.startsWith('### ') ? <h3 key={idx}>{paragraph.substring(4)}</h3> : paragraph ? <p key={idx}>{paragraph}</p> : <br key={idx} />)}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          
          {/* Last saved + undo */}
          <div className="px-4 py-2 text-[11px] text-white/60 flex items-center justify-between border-t border-white/10 mt-auto">
            <div>{lastSavedAt ? `Last saved ${lastSavedAt.toLocaleTimeString()}` : 'Autosaving...'}</div>
            {undoContent && <button className="text-primary hover:underline" onClick={() => {
            setEditedContent(undoContent);
            setUndoContent(null);
          }}>
                <span className="inline-flex items-center gap-1"><RotateCcw className="h-3 w-3" /> Undo</span>
              </button>}
          </div>
          
        </Card>
      </motion.div>
    );
  };