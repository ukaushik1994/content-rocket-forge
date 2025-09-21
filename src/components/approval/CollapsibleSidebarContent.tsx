import React, { useState } from 'react';
import { ContentItemType } from '@/contexts/content/types';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Edit3, Globe, Zap, CheckCircle2, AlertCircle, Clock, Star, History } from 'lucide-react';
import { TitleSidebarTile } from './tiles/TitleSidebarTile';
import { ApprovalMetadata } from './ApprovalMetadata';
import { ApprovalAITitleSuggestions } from './ai/ApprovalAITitleSuggestions';
import { SectionRegenerationTool } from './ai/SectionRegenerationTool';
import { ApprovalTimeline } from './ApprovalTimeline';
import { cn } from '@/lib/utils';

interface CollapsibleSidebarContentProps {
  content: ContentItemType;
  editedTitle: string;
  onTitleChange: (title: string) => void;
  onTitleSelect: (title: string) => void;
  onSectionRegenerated: (content: string) => void;
  mainKeyword: string;
}

interface SectionState {
  title: boolean;
  seo: boolean;
  sections: boolean;
  suggestions: boolean;
  timeline: boolean;
}

export const CollapsibleSidebarContent = ({
  content,
  editedTitle,
  onTitleChange,
  onTitleSelect,
  onSectionRegenerated,
  mainKeyword
}: CollapsibleSidebarContentProps) => {
  const [openSections, setOpenSections] = useState<SectionState>({
    title: true,
    seo: false,
    sections: false,
    suggestions: false,
    timeline: false
  });

  const [expandAll, setExpandAll] = useState(false);

  const handleToggleSection = (section: keyof SectionState) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleExpandAll = () => {
    const newState = !expandAll;
    setExpandAll(newState);
    setOpenSections({
      title: newState,
      seo: newState,
      sections: newState,
      suggestions: newState,
      timeline: newState
    });
  };

  // Status indicators
  const getTitleStatus = () => {
    if (!editedTitle) return { icon: AlertCircle, color: 'text-red-400', text: 'Missing' };
    if (editedTitle.length > 60) return { icon: AlertCircle, color: 'text-amber-400', text: 'Too long' };
    if (mainKeyword && !editedTitle.toLowerCase().includes(mainKeyword.toLowerCase())) {
      return { icon: AlertCircle, color: 'text-amber-400', text: 'Add keyword' };
    }
    return { icon: CheckCircle2, color: 'text-green-400', text: 'Optimized' };
  };

  const getSEOStatus = () => {
    const metaTitle = content.metadata?.metaTitle;
    const metaDescription = content.metadata?.metaDescription;
    
    if (!metaTitle || !metaDescription) {
      return { icon: AlertCircle, color: 'text-red-400', text: 'Missing' };
    }
    if (metaTitle.length > 60 || metaDescription.length > 160) {
      return { icon: AlertCircle, color: 'text-amber-400', text: 'Check length' };
    }
    return { icon: CheckCircle2, color: 'text-green-400', text: 'Ready' };
  };

  const titleStatus = getTitleStatus();
  const seoStatus = getSEOStatus();

  return (
    <div className="space-y-1 p-1">{/* Removed Expand/Collapse All section */}

      {/* Title Section */}
      <Collapsible
        open={openSections.title}
        onOpenChange={() => handleToggleSection('title')}
      >
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between p-1.5 h-8 hover:bg-muted/30 transition-colors rounded-sm"
          >
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <Edit3 className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              <span className="text-xs font-medium text-foreground truncate">Title</span>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Badge 
                variant="secondary" 
                className={cn(
                  "text-[10px] h-3.5 px-1 flex-shrink-0 font-medium",
                  titleStatus.color === 'text-green-400' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                  titleStatus.color === 'text-amber-400' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                  'bg-red-500/20 text-red-300 border-red-500/30'
                )}
              >
                {editedTitle ? `${editedTitle.length}` : '0'}
              </Badge>
              {openSections.title ? (
                <ChevronDown className="h-3 w-3 text-muted-foreground ml-1" />
              ) : (
                <ChevronRight className="h-3 w-3 text-muted-foreground ml-1" />
              )}
            </div>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="px-1.5 pb-1">
          <TitleSidebarTile 
            content={content} 
            value={editedTitle} 
            onChange={onTitleChange} 
            mainKeyword={mainKeyword} 
          />
        </CollapsibleContent>
      </Collapsible>

      {/* SEO Metadata Section */}
      <Collapsible
        open={openSections.seo}
        onOpenChange={() => handleToggleSection('seo')}
      >
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between p-1.5 h-8 hover:bg-muted/30 transition-colors rounded-sm"
          >
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <Globe className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              <span className="text-xs font-medium text-foreground truncate">SEO</span>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Badge 
                variant="secondary" 
                className={cn(
                  "text-[10px] h-3.5 px-1 flex-shrink-0 font-medium",
                  seoStatus.color === 'text-green-400' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                  seoStatus.color === 'text-amber-400' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                  'bg-red-500/20 text-red-300 border-red-500/30'
                )}
              >
                {seoStatus.text === 'Ready' ? '✓' : '!'}
              </Badge>
              {openSections.seo ? (
                <ChevronDown className="h-3 w-3 text-muted-foreground ml-1" />
              ) : (
                <ChevronRight className="h-3 w-3 text-muted-foreground ml-1" />
              )}
            </div>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="px-1.5 pb-1">
          <ApprovalMetadata content={content} compact />
        </CollapsibleContent>
      </Collapsible>

      {/* AI Title Suggestions */}
      <Collapsible
        open={openSections.suggestions}
        onOpenChange={() => handleToggleSection('suggestions')}
      >
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between p-1.5 h-8 hover:bg-muted/30 transition-colors rounded-sm"
          >
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <Star className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              <span className="text-xs font-medium text-foreground truncate">Ideas</span>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Badge variant="secondary" className="text-[10px] h-3.5 px-1 bg-violet-500/20 text-violet-300 border-violet-500/30 flex-shrink-0 font-medium">
                AI
              </Badge>
              {openSections.suggestions ? (
                <ChevronDown className="h-3 w-3 text-muted-foreground ml-1" />
              ) : (
                <ChevronRight className="h-3 w-3 text-muted-foreground ml-1" />
              )}
            </div>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="px-1.5 pb-1">
          <ApprovalAITitleSuggestions content={content} onSelectTitle={onTitleSelect} />
        </CollapsibleContent>
      </Collapsible>

      {/* Section Regeneration */}
      <Collapsible
        open={openSections.sections}
        onOpenChange={() => handleToggleSection('sections')}
      >
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between p-1.5 h-8 hover:bg-muted/30 transition-colors rounded-sm"
          >
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <Zap className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              <span className="text-xs font-medium text-foreground truncate">Tools</span>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Badge variant="secondary" className="text-[10px] h-3.5 px-1 bg-blue-500/20 text-blue-300 border-blue-500/30 flex-shrink-0 font-medium">
                4
              </Badge>
              {openSections.sections ? (
                <ChevronDown className="h-3 w-3 text-muted-foreground ml-1" />
              ) : (
                <ChevronRight className="h-3 w-3 text-muted-foreground ml-1" />
              )}
            </div>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="px-1.5 pb-1">
          <SectionRegenerationTool content={content} onSectionRegenerated={onSectionRegenerated} />
        </CollapsibleContent>
      </Collapsible>

      {/* Timeline Section */}
      <Collapsible
        open={openSections.timeline}
        onOpenChange={() => handleToggleSection('timeline')}
      >
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between p-1.5 h-8 hover:bg-muted/30 transition-colors rounded-sm"
          >
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <History className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              <span className="text-xs font-medium text-foreground truncate">History</span>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Badge variant="secondary" className="text-[10px] h-3.5 px-1 bg-slate-500/20 text-slate-300 border-slate-500/30 flex-shrink-0 font-medium">
                3
              </Badge>
              {openSections.timeline ? (
                <ChevronDown className="h-3 w-3 text-muted-foreground ml-1" />
              ) : (
                <ChevronRight className="h-3 w-3 text-muted-foreground ml-1" />
              )}
            </div>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="px-1.5 pb-1">
          <ApprovalTimeline contentId={content.id} />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};