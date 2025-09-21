import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  Edit3, 
  Globe, 
  FileText, 
  Clock,
  CheckCircle2,
  AlertCircle,
  Wand2,
  RotateCcw,
  Loader2,
  Sparkles,
  Zap,
  Smartphone
} from 'lucide-react';
import { ContentItemType } from '@/contexts/content/types';
import { ApprovalAITitleSuggestions } from './ai/ApprovalAITitleSuggestions';
import { SectionRegenerationTool } from './ai/SectionRegenerationTool';
import { ApprovalTimeline } from './ApprovalTimeline';
import { useContent } from '@/contexts/content';

interface FloatingToolsPanelProps {
  content: ContentItemType;
  editedTitle: string;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTitleSelect: (title: string) => void;
  onSectionRegenerated: (updatedContent: string) => void;
  mainKeyword: string;
}

export function FloatingToolsPanel({
  content,
  editedTitle,
  onTitleChange,
  onTitleSelect,
  onSectionRegenerated,
  mainKeyword
}: FloatingToolsPanelProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [activePopover, setActivePopover] = useState<string | null>(null);
  const [seoData, setSeoData] = useState({
    metaTitle: content.metadata?.metaTitle || '',
    metaDescription: content.metadata?.metaDescription || ''
  });
  const [isUpdatingSeo, setIsUpdatingSeo] = useState(false);

  const { updateContentItem } = useContent();

  // Sync SEO data when content changes
  useEffect(() => {
    setSeoData({
      metaTitle: content.metadata?.metaTitle || '',
      metaDescription: content.metadata?.metaDescription || ''
    });
  }, [content.metadata?.metaTitle, content.metadata?.metaDescription]);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            setActivePopover(activePopover === 'title' ? null : 'title');
            break;
          case '2':
            e.preventDefault();
            setActivePopover(activePopover === 'seo' ? null : 'seo');
            break;
          case '3':
            e.preventDefault();
            setActivePopover(activePopover === 'sections' ? null : 'sections');
            break;
          case '4':
            e.preventDefault();
            setActivePopover(activePopover === 'timeline' ? null : 'timeline');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [activePopover]);

  // SEO update handler
  const handleSeoUpdate = useCallback(async (field: 'metaTitle' | 'metaDescription', value: string) => {
    setSeoData(prev => ({ ...prev, [field]: value }));
    
    // Debounced update
    const timeoutId = setTimeout(async () => {
      try {
        setIsUpdatingSeo(true);
        await updateContentItem(content.id, {
          metadata: {
            ...content.metadata,
            [field]: value
          }
        });
        toast.success(`${field === 'metaTitle' ? 'Meta title' : 'Meta description'} updated`);
      } catch (error) {
        toast.error('Failed to update SEO data');
        console.error(error);
      } finally {
        setIsUpdatingSeo(false);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [content.id, content.metadata, updateContentItem]);
  // Calculate metrics for each tool
  const titleMetrics = useMemo(() => {
    const length = editedTitle.length;
    const hasKeyword = mainKeyword && editedTitle.toLowerCase().includes(mainKeyword.toLowerCase());
    const isOptimal = length >= 30 && length <= 60 && hasKeyword;
    
    return {
      isOptimal,
      hasKeyword,
      length,
      status: isOptimal ? 'good' : length > 60 ? 'warning' : 'info'
    };
  }, [editedTitle, mainKeyword]);

  const seoMetrics = useMemo(() => {
    const metaTitle = content.metadata?.metaTitle || '';
    const metaDescription = content.metadata?.metaDescription || '';
    const hasMetaTitle = metaTitle.length > 0;
    const hasMetaDescription = metaDescription.length > 0;
    const completeness = (hasMetaTitle ? 50 : 0) + (hasMetaDescription ? 50 : 0);
    
    return {
      completeness,
      hasMetaTitle,
      hasMetaDescription,
      status: completeness >= 100 ? 'good' : completeness >= 50 ? 'warning' : 'info'
    };
  }, [content.metadata]);

  const sectionsMetrics = useMemo(() => {
    const contentText = content.content || '';
    const sections = contentText.split(/(?=#{1,3}\s)/).filter(s => s.trim());
    const wordCount = contentText.trim().split(/\s+/).length;
    
    return {
      count: sections.length,
      wordCount,
      status: sections.length >= 3 && wordCount >= 800 ? 'good' : 'info'
    };
  }, [content.content]);

  const timelineMetrics = useMemo(() => {
    const status = content.approval_status;
    
    return {
      status: status || 'draft',
      hasHistory: true, // Always show timeline button
      statusColor: status === 'approved' ? 'good' : status === 'rejected' ? 'warning' : 'info'
    };
  }, [content.approval_status]);

  const tools = useMemo(() => [
    {
      id: 'title',
      icon: Edit3,
      label: 'Title',
      value: `${titleMetrics.length}/60`,
      status: titleMetrics.status,
      color: titleMetrics.status === 'good' ? 'text-emerald-400' : 
             titleMetrics.status === 'warning' ? 'text-amber-400' : 'text-blue-400',
      bgColor: titleMetrics.status === 'good' ? 'bg-emerald-500/20' : 
               titleMetrics.status === 'warning' ? 'bg-amber-500/20' : 'bg-blue-500/20'
    },
    {
      id: 'seo',
      icon: Globe,
      label: 'SEO',
      value: `${seoMetrics.completeness}%`,
      status: seoMetrics.status,
      color: seoMetrics.status === 'good' ? 'text-emerald-400' : 
             seoMetrics.status === 'warning' ? 'text-amber-400' : 'text-purple-400',
      bgColor: seoMetrics.status === 'good' ? 'bg-emerald-500/20' : 
               seoMetrics.status === 'warning' ? 'bg-amber-500/20' : 'bg-purple-500/20'
    },
    {
      id: 'sections',
      icon: FileText,
      label: 'Sections',
      value: sectionsMetrics.count,
      status: sectionsMetrics.status,
      color: sectionsMetrics.status === 'good' ? 'text-emerald-400' : 'text-rose-400',
      bgColor: sectionsMetrics.status === 'good' ? 'bg-emerald-500/20' : 'bg-rose-500/20'
    },
    {
      id: 'timeline',
      icon: Clock,
      label: 'Timeline',
      value: timelineMetrics.hasHistory ? '!' : '0',
      status: timelineMetrics.statusColor,
      color: timelineMetrics.statusColor === 'good' ? 'text-emerald-400' : 
             timelineMetrics.statusColor === 'warning' ? 'text-amber-400' : 'text-slate-400',
      bgColor: timelineMetrics.statusColor === 'good' ? 'bg-emerald-500/20' : 
               timelineMetrics.statusColor === 'warning' ? 'bg-amber-500/20' : 'bg-slate-500/20'
    }
  ], [titleMetrics, seoMetrics, sectionsMetrics, timelineMetrics]);

  const TitlePopoverContent = () => (
    <PopoverContent className="w-80 p-0 bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl" align="start">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Edit3 className="h-4 w-4 text-primary" />
            Title Optimization
          </h3>
          <div className="flex items-center gap-2">
            <Badge variant={titleMetrics.isOptimal ? "default" : "secondary"} className="text-xs">
              {titleMetrics.length}/60
            </Badge>
            <kbd className="text-xs bg-muted px-1.5 py-0.5 rounded">⌘1</kbd>
          </div>
        </div>
        
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Current Title</label>
            <Input
              value={editedTitle}
              onChange={onTitleChange}
              className="mt-1"
              placeholder="Enter your title..."
            />
            <div className="flex items-center gap-2 mt-1">
              {titleMetrics.hasKeyword ? (
                <div className="flex items-center gap-1 text-xs text-success">
                  <CheckCircle2 className="h-3 w-3" />
                  Keyword included
                </div>
              ) : (
                <div className="flex items-center gap-1 text-xs text-warning">
                  <AlertCircle className="h-3 w-3" />
                  Add "{mainKeyword}"
                </div>
              )}
              <div className={`text-xs ml-auto ${titleMetrics.length > 60 ? 'text-destructive' : titleMetrics.length > 50 ? 'text-warning' : 'text-muted-foreground'}`}>
                {titleMetrics.length <= 30 ? 'Too short' : titleMetrics.length > 60 ? 'Too long' : 'Good length'}
              </div>
            </div>
          </div>

          <div className="border-t border-border/50 pt-3">
            <ApprovalAITitleSuggestions
              content={content}
              onSelectTitle={onTitleSelect}
            />
          </div>
        </div>
      </div>
    </PopoverContent>
  );

  const SeoPopoverContent = () => (
    <PopoverContent className="w-80 p-0 bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl" align="start">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            SEO Optimization
            {isUpdatingSeo && <Loader2 className="h-3 w-3 animate-spin" />}
          </h3>
          <div className="flex items-center gap-2">
            <Badge variant={seoMetrics.completeness >= 100 ? "default" : "secondary"} className="text-xs">
              {seoMetrics.completeness}% Complete
            </Badge>
            <kbd className="text-xs bg-muted px-1.5 py-0.5 rounded">⌘2</kbd>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground flex items-center justify-between">
              Meta Title
              <span className={`text-xs ${seoData.metaTitle.length > 60 ? 'text-destructive' : seoData.metaTitle.length > 50 ? 'text-warning' : 'text-muted-foreground'}`}>
                {seoData.metaTitle.length}/60
              </span>
            </label>
            <Input
              value={seoData.metaTitle}
              onChange={(e) => handleSeoUpdate('metaTitle', e.target.value)}
              className="mt-1"
              placeholder="SEO title (50-60 characters optimal)"
            />
            <div className="flex items-center gap-2 mt-1">
              {seoData.metaTitle.includes(mainKeyword) ? (
                <div className="flex items-center gap-1 text-xs text-success">
                  <CheckCircle2 className="h-3 w-3" />
                  Keyword included
                </div>
              ) : (
                <div className="flex items-center gap-1 text-xs text-warning">
                  <AlertCircle className="h-3 w-3" />
                  Add "{mainKeyword}"
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground flex items-center justify-between">
              Meta Description
              <span className={`text-xs ${seoData.metaDescription.length > 160 ? 'text-destructive' : seoData.metaDescription.length > 140 ? 'text-warning' : 'text-muted-foreground'}`}>
                {seoData.metaDescription.length}/160
              </span>
            </label>
            <Textarea
              value={seoData.metaDescription}
              onChange={(e) => handleSeoUpdate('metaDescription', e.target.value)}
              className="mt-1 resize-none"
              rows={3}
              placeholder="SEO description (140-160 characters optimal)"
            />
            <div className="flex items-center gap-2 mt-1">
              {seoData.metaDescription.includes(mainKeyword) ? (
                <div className="flex items-center gap-1 text-xs text-success">
                  <CheckCircle2 className="h-3 w-3" />
                  Keyword included
                </div>
              ) : (
                <div className="flex items-center gap-1 text-xs text-warning">
                  <AlertCircle className="h-3 w-3" />
                  Add "{mainKeyword}"
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-border/50">
            <div className="text-xs font-medium text-muted-foreground mb-2">SEO Score</div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {seoMetrics.hasMetaTitle ? (
                  <CheckCircle2 className="h-3 w-3 text-success" />
                ) : (
                  <AlertCircle className="h-3 w-3 text-warning" />
                )}
                 <span className="text-xs text-muted-foreground">Meta Title Present</span>
              </div>
              <div className="flex items-center gap-2">
                {seoMetrics.hasMetaDescription ? (
                  <CheckCircle2 className="h-3 w-3 text-success" />
                ) : (
                  <AlertCircle className="h-3 w-3 text-warning" />
                )}
                <span className="text-xs text-muted-foreground">Meta Description Present</span>
              </div>
              <div className="flex items-center gap-2">
                {seoData.metaTitle.includes(mainKeyword) && seoData.metaDescription.includes(mainKeyword) ? (
                  <CheckCircle2 className="h-3 w-3 text-success" />
                ) : (
                  <AlertCircle className="h-3 w-3 text-warning" />
                )}
                <span className="text-xs text-muted-foreground">Keywords Optimized</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PopoverContent>
  );

  const SectionsPopoverContent = () => (
    <PopoverContent className="w-72 p-0 bg-black/95 backdrop-blur-xl border border-white/20">
      <SectionRegenerationTool 
        content={content} 
        onSectionRegenerated={onSectionRegenerated}
      />
    </PopoverContent>
  );

  const TimelinePopoverContent = () => (
    <PopoverContent className="w-64 p-0 bg-black/95 backdrop-blur-xl border border-white/20">
      <div className="p-3">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="h-3 w-3 text-blue-400" />
          <h3 className="text-xs font-medium text-white">Timeline</h3>
        </div>
        <ApprovalTimeline contentId={content.id} />
      </div>
    </PopoverContent>
  );

  // Mobile Bottom Drawer Component
  const MobileDrawer = () => (
    <AnimatePresence>
      {activePopover && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed inset-x-0 bottom-0 z-50 md:hidden"
        >
          <div className="bg-background/95 backdrop-blur-xl border-t border-border/50 rounded-t-2xl max-h-[80vh] overflow-hidden">
            <div className="p-4">
              <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-4" />
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setActivePopover(null)}
                className="absolute top-4 right-4"
              >
                ×
              </Button>
              
              {activePopover === 'title' && <TitlePopoverContent />}
              {activePopover === 'seo' && <SeoPopoverContent />}
              {activePopover === 'sections' && <SectionsPopoverContent />}
              {activePopover === 'timeline' && <TimelinePopoverContent />}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (isMobile) {
    return (
      <>
        {/* Mobile Bottom Toolbar */}
        <motion.div 
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="bg-background/20 backdrop-blur-xl border border-border/30 rounded-2xl p-2 shadow-2xl">
            <div className="flex gap-2">
              {tools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <TooltipProvider key={tool.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.button
                          onClick={() => setActivePopover(activePopover === tool.id ? null : tool.id)}
                          className={`
                            relative p-3 rounded-xl ${tool.bgColor} 
                            border border-white/10 backdrop-blur-sm
                            hover:scale-105 active:scale-95 transition-all duration-200
                            ${activePopover === tool.id ? 'scale-105 ring-2 ring-primary/50' : ''}
                            group cursor-pointer min-w-[48px] flex flex-col items-center
                          `}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Icon className={`h-4 w-4 ${tool.color} mb-1`} />
                          <div className={`text-xs font-mono font-bold ${tool.color}`}>
                            {tool.value}
                          </div>
                          
                          {tool.status === 'good' && (
                            <motion.div 
                              className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/20 to-emerald-400/10" 
                              initial={{ opacity: 0 }}
                              whileHover={{ opacity: 1 }}
                              transition={{ duration: 0.2 }}
                            />
                          )}
                        </motion.button>
                      </TooltipTrigger>
                      
                      <TooltipContent>
                        <div className="flex items-center gap-2">
                          <span>{tool.label}</span>
                          <kbd className="text-xs bg-muted px-1 py-0.5 rounded">⌘{tools.indexOf(tool) + 1}</kbd>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>
          </div>
        </motion.div>
        
        <MobileDrawer />
      </>
    );
  }
  // Desktop Floating Panel
  return (
    <TooltipProvider>
      <motion.div 
        className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="bg-background/20 backdrop-blur-xl border border-border/30 rounded-2xl p-3 shadow-2xl">
          <div className="flex flex-col gap-3">
            {tools.map((tool) => {
              const Icon = tool.icon;
              
              const popoverContent = {
                title: <TitlePopoverContent />,
                seo: <SeoPopoverContent />,
                sections: <SectionsPopoverContent />,
                timeline: <TimelinePopoverContent />
              }[tool.id];

              return (
                <Popover key={tool.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <PopoverTrigger asChild>
                        <motion.button
                          className={`
                            relative p-3 rounded-xl ${tool.bgColor} 
                            border border-white/10 backdrop-blur-sm
                            hover:scale-105 active:scale-95 transition-all duration-200
                            group cursor-pointer min-w-[52px] flex flex-col items-center
                            hover:shadow-lg hover:shadow-primary/20
                          `}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Icon className={`h-4 w-4 ${tool.color} mb-1`} />
                          <div className={`text-xs font-mono font-bold ${tool.color}`}>
                            {tool.value}
                          </div>
                          
                          {/* Enhanced glow for active metrics */}
                          {tool.status === 'good' && (
                            <motion.div 
                              className="absolute inset-0 rounded-xl bg-gradient-to-r from-success/20 to-success/10" 
                              initial={{ opacity: 0 }}
                              whileHover={{ opacity: 1 }}
                              transition={{ duration: 0.2 }}
                            />
                          )}
                          
                          {/* Loading indicator for SEO updates */}
                          {tool.id === 'seo' && isUpdatingSeo && (
                            <div className="absolute -top-1 -right-1">
                              <Loader2 className="h-3 w-3 animate-spin text-primary" />
                            </div>
                          )}
                        </motion.button>
                      </PopoverTrigger>
                    </TooltipTrigger>
                    
                    <TooltipContent side="left">
                      <div className="flex items-center gap-2">
                        <span>{tool.label}</span>
                        <kbd className="text-xs bg-muted px-1.5 py-0.5 rounded">⌘{tools.indexOf(tool) + 1}</kbd>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                  {popoverContent}
                </Popover>
              );
            })}
          </div>
        </div>
      </motion.div>
    </TooltipProvider>
  );
}