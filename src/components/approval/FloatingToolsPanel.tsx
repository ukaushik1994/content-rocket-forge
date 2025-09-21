import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
  Edit3, 
  Globe, 
  FileText, 
  Clock,
  CheckCircle2,
  AlertCircle,
  Wand2,
  RotateCcw
} from 'lucide-react';
import { ContentItemType } from '@/contexts/content/types';
import { ApprovalAITitleSuggestions } from './ai/ApprovalAITitleSuggestions';
import { SectionRegenerationTool } from './ai/SectionRegenerationTool';
import { ApprovalTimeline } from './ApprovalTimeline';

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
    <PopoverContent className="w-80 p-0 bg-background/95 backdrop-blur-xl border-border/50" align="start">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Edit3 className="h-4 w-4 text-blue-400" />
            Title Optimization
          </h3>
          <Badge variant={titleMetrics.isOptimal ? "default" : "secondary"} className="text-xs">
            {titleMetrics.length}/60 chars
          </Badge>
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
                <div className="flex items-center gap-1 text-xs text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" />
                  Keyword included
                </div>
              ) : (
                <div className="flex items-center gap-1 text-xs text-amber-400">
                  <AlertCircle className="h-3 w-3" />
                  Add "{mainKeyword}"
                </div>
              )}
            </div>
          </div>

          <ApprovalAITitleSuggestions
            content={content}
            onSelectTitle={onTitleSelect}
          />
        </div>
      </div>
    </PopoverContent>
  );

  const SeoPopoverContent = () => (
    <PopoverContent className="w-80 p-0 bg-background/95 backdrop-blur-xl border-border/50" align="start">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Globe className="h-4 w-4 text-purple-400" />
            SEO Optimization
          </h3>
          <Badge variant="secondary" className="text-xs">
            {seoMetrics.completeness}% Complete
          </Badge>
        </div>
        
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Meta Title</label>
            <Input
              value={content.metadata?.metaTitle || ''}
              className="mt-1"
              placeholder="SEO title (50-60 characters)"
            />
            <div className="text-xs text-muted-foreground mt-1">
              {(content.metadata?.metaTitle || '').length}/60 characters
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Meta Description</label>
            <Input
              value={content.metadata?.metaDescription || ''}
              className="mt-1"
              placeholder="SEO description (140-160 characters)"
            />
            <div className="text-xs text-muted-foreground mt-1">
              {(content.metadata?.metaDescription || '').length}/160 characters
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {seoMetrics.hasMetaTitle ? (
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              ) : (
                <AlertCircle className="h-3 w-3 text-amber-400" />
              )}
              <span className="text-xs text-muted-foreground">Meta Title</span>
            </div>
            <div className="flex items-center gap-2">
              {seoMetrics.hasMetaDescription ? (
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              ) : (
                <AlertCircle className="h-3 w-3 text-amber-400" />
              )}
              <span className="text-xs text-muted-foreground">Meta Description</span>
            </div>
          </div>
        </div>
      </div>
    </PopoverContent>
  );

  const SectionsPopoverContent = () => (
    <PopoverContent className="w-80 p-0 bg-background/95 backdrop-blur-xl border-border/50" align="start">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <FileText className="h-4 w-4 text-rose-400" />
            Section Tools
          </h3>
          <Badge variant="secondary" className="text-xs">
            {sectionsMetrics.count} sections
          </Badge>
        </div>
        
        <ScrollArea className="h-60">
          <SectionRegenerationTool
            content={content}
            onSectionRegenerated={onSectionRegenerated}
          />
        </ScrollArea>
      </div>
    </PopoverContent>
  );

  const TimelinePopoverContent = () => (
    <PopoverContent className="w-80 p-0 bg-background/95 backdrop-blur-xl border-border/50" align="start">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-400" />
            Approval Timeline
          </h3>
          <Badge variant="secondary" className="text-xs capitalize">
            {timelineMetrics.status}
          </Badge>
        </div>
        
        <ScrollArea className="h-60">
          <ApprovalTimeline 
            contentId={content.id}
          />
        </ScrollArea>
      </div>
    </PopoverContent>
  );

  return (
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
                <PopoverTrigger asChild>
                  <motion.button
                    className={`
                      relative p-3 rounded-xl ${tool.bgColor} 
                      border border-white/10 backdrop-blur-sm
                      hover:scale-105 active:scale-95 transition-all duration-200
                      group cursor-pointer min-w-[52px] flex flex-col items-center
                    `}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className={`h-4 w-4 ${tool.color} mb-1`} />
                    <div className={`text-xs font-mono font-bold ${tool.color}`}>
                      {tool.value}
                    </div>
                    
                    {/* Subtle glow for active metrics */}
                    {tool.status === 'good' && (
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/20 to-emerald-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    )}
                  </motion.button>
                </PopoverTrigger>
                {popoverContent}
              </Popover>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}