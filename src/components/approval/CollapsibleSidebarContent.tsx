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
    <div className="space-y-0.5 p-2">
      {/* Expand/Collapse All */}
      <div className="px-2 py-1.5 border-b border-border/20 mb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleExpandAll}
          className="w-full justify-start h-7 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          {expandAll ? 'Collapse All' : 'Expand All'}
        </Button>
      </div>

      {/* Title Section */}
      <Collapsible
        open={openSections.title}
        onOpenChange={() => handleToggleSection('title')}
      >
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between p-2.5 h-auto hover:bg-muted/50 transition-colors rounded-md"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Edit3 className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-sm font-medium text-foreground truncate">Title</span>
              <Badge 
                variant="secondary" 
                className={cn(
                  "text-xs h-4 px-1.5 flex-shrink-0",
                  titleStatus.color === 'text-green-400' ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20' :
                  titleStatus.color === 'text-amber-400' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' :
                  'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
                )}
              >
                <titleStatus.icon className="h-3 w-3 mr-0.5" />
                {editedTitle ? `${editedTitle.length}/60` : '0/60'}
              </Badge>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {openSections.title ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="px-2 pb-2">
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
            className="w-full justify-between p-2.5 h-auto hover:bg-muted/50 transition-colors rounded-md"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Globe className="h-4 w-4 text-blue-500 flex-shrink-0" />
              <span className="text-sm font-medium text-foreground truncate">SEO</span>
              <Badge 
                variant="secondary" 
                className={cn(
                  "text-xs h-4 px-1.5 flex-shrink-0",
                  seoStatus.color === 'text-green-400' ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20' :
                  seoStatus.color === 'text-amber-400' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' :
                  'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
                )}
              >
                <seoStatus.icon className="h-3 w-3 mr-0.5" />
                {seoStatus.text === 'Ready' ? '100%' : seoStatus.text}
              </Badge>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {openSections.seo ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="px-2 pb-2">
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
            className="w-full justify-between p-2.5 h-auto hover:bg-muted/50 transition-colors rounded-md"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Star className="h-4 w-4 text-yellow-500 flex-shrink-0" />
              <span className="text-sm font-medium text-foreground truncate">Ideas</span>
              <Badge variant="secondary" className="text-xs h-4 px-1.5 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20 flex-shrink-0">
                <Zap className="h-3 w-3 mr-0.5" />
                AI
              </Badge>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {openSections.suggestions ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="px-2 pb-2">
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
            className="w-full justify-between p-2.5 h-auto hover:bg-muted/50 transition-colors rounded-md"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Zap className="h-4 w-4 text-purple-500 flex-shrink-0" />
              <span className="text-sm font-medium text-foreground truncate">Tools</span>
              <Badge variant="secondary" className="text-xs h-4 px-1.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 flex-shrink-0">
                44
              </Badge>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {openSections.sections ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="px-2 pb-2">
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
            className="w-full justify-between p-2.5 h-auto hover:bg-muted/50 transition-colors rounded-md"
          >
            <div className="flex items-center gap-2 min-w-0">
              <History className="h-4 w-4 text-blue-500 flex-shrink-0" />
              <span className="text-sm font-medium text-foreground truncate">History</span>
              <Badge variant="secondary" className="text-xs h-4 px-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 flex-shrink-0">
                1
              </Badge>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {openSections.timeline ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="px-2 pb-2">
          <ApprovalTimeline contentId={content.id} />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};