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
import { FloatingToolsPanel } from './FloatingToolsPanel';

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
      
      {/* Main Editor - Optimized Full Width */}
      <Card className="relative border-border/50 bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-sm shadow-lg w-full">
          <CardHeader className="sticky top-0 z-10 pb-3 border-b border-border/30 bg-card/95 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CardTitle className="text-base font-semibold text-foreground">Content Editor</CardTitle>
                <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-primary/10 text-primary border border-primary/20">
                  Enhanced
                </Badge>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="flex justify-center mx-4 mt-2 mb-1">
              <div className="inline-flex bg-muted/50 rounded-md p-0.5 h-7">
                <Button
                  variant={activeTab === 'edit' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('edit')}
                  className={`h-6 px-3 text-xs font-medium rounded-sm transition-all duration-200 ${
                    activeTab === 'edit' 
                      ? 'bg-primary/20 text-primary shadow-sm' 
                      : 'hover:bg-muted/80 text-muted-foreground'
                  }`}
                >
                  Edit
                </Button>
                <Button
                  variant={activeTab === 'preview' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('preview')}
                  className={`h-6 px-3 text-xs font-medium rounded-sm transition-all duration-200 ${
                    activeTab === 'preview' 
                      ? 'bg-primary/20 text-primary shadow-sm' 
                      : 'hover:bg-muted/80 text-muted-foreground'
                  }`}
                >
                  Preview
                </Button>
              </div>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              
              <TabsContent value="edit" className="mt-2 focus-visible:outline-none focus-visible:ring-0">
                <div className="h-[75vh] border-t border-border/20">
                  <InlineAiEditor 
                    value={editedContent} 
                    onChange={handleContentChange} 
                    onAiApplied={prev => {
                      setUndoContent(prev);
                      setTimeout(() => setUndoContent(null), 5000);
                    }} 
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="preview" className="mt-2 focus-visible:outline-none focus-visible:ring-0">
                <div className="h-[75vh] p-6 overflow-y-auto prose prose-slate dark:prose-invert prose-headings:font-semibold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg max-w-none text-foreground/90 border-t border-border/20">
                  {editedContent.split('\n\n').map((paragraph, idx) => 
                    paragraph.startsWith('# ') ? (
                      <h1 key={idx} className="gradient-text">{paragraph.substring(2)}</h1>
                    ) : paragraph.startsWith('## ') ? (
                      <h2 key={idx}>{paragraph.substring(3)}</h2>
                    ) : paragraph.startsWith('### ') ? (
                      <h3 key={idx}>{paragraph.substring(4)}</h3>
                    ) : paragraph ? (
                      <p key={idx} className="leading-relaxed">{paragraph}</p>
                    ) : (
                      <br key={idx} />
                    )
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          
          {/* Status Bar */}
          <div className="px-4 py-2.5 text-xs text-muted-foreground flex items-center justify-between border-t border-border/30 bg-muted/20">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
              {lastSavedAt ? `Saved ${lastSavedAt.toLocaleTimeString()}` : 'Auto-saving changes...'}
            </div>
            {undoContent && (
              <button 
                className="text-primary hover:text-primary/80 transition-colors duration-200 flex items-center gap-1" 
                onClick={() => {
                  setEditedContent(undoContent);
                  setUndoContent(null);
                }}
              >
                <RotateCcw className="h-3 w-3" />
                <span>Undo AI change</span>
              </button>
            )}
          </div>
        </Card>
        
      </motion.div>
    );
  };