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

export const CollapsibleSidebarContent: React.FC<CollapsibleSidebarContentProps> = ({
  content,
  editedTitle,
  onTitleChange,
  onTitleSelect,
  onSectionRegenerated,
  mainKeyword
}) => {
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
    <div className="space-y-1">
      {/* Expand/Collapse All */}
      <div className="px-3 py-2 border-b border-white/10">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleExpandAll}
          className="w-full justify-start h-6 text-xs text-white/60 hover:text-white hover:bg-white/5"
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
            className="w-full justify-between p-3 h-auto hover:bg-white/5"
          >
            <div className="flex items-center gap-2">
              <Edit3 className="h-4 w-4 text-neon-purple" />
              <span className="text-sm font-medium text-white/90">Title</span>
              <Badge 
                variant="secondary" 
                className={cn(
                  "text-xs h-5 px-2",
                  titleStatus.color === 'text-green-400' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                  titleStatus.color === 'text-amber-400' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                  'bg-red-500/10 text-red-400 border-red-500/20'
                )}
              >
                <titleStatus.icon className="h-3 w-3 mr-1" />
                {titleStatus.text}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              {!openSections.title && (
                <span className="text-xs text-white/40 truncate max-w-[100px]">
                  {editedTitle || 'No title'}
                </span>
              )}
              {openSections.title ? (
                <ChevronDown className="h-4 w-4 text-white/40" />
              ) : (
                <ChevronRight className="h-4 w-4 text-white/40" />
              )}
            </div>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="px-3 pb-3">
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
            className="w-full justify-between p-3 h-auto hover:bg-white/5"
          >
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-neon-blue" />
              <span className="text-sm font-medium text-white/90">SEO Metadata</span>
              <Badge 
                variant="secondary" 
                className={cn(
                  "text-xs h-5 px-2",
                  seoStatus.color === 'text-green-400' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                  seoStatus.color === 'text-amber-400' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                  'bg-red-500/10 text-red-400 border-red-500/20'
                )}
              >
                <seoStatus.icon className="h-3 w-3 mr-1" />
                {seoStatus.text}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              {!openSections.seo && (
                <span className="text-xs text-white/40">
                  {content.metadata?.metaTitle ? 'Set' : 'Missing'}
                </span>
              )}
              {openSections.seo ? (
                <ChevronDown className="h-4 w-4 text-white/40" />
              ) : (
                <ChevronRight className="h-4 w-4 text-white/40" />
              )}
            </div>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="px-3 pb-3">
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
            className="w-full justify-between p-3 h-auto hover:bg-white/5"
          >
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-400" />
              <span className="text-sm font-medium text-white/90">Title Ideas</span>
              <Badge variant="secondary" className="text-xs h-5 px-2 bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
                <Zap className="h-3 w-3 mr-1" />
                AI
              </Badge>
            </div>
            {openSections.suggestions ? (
              <ChevronDown className="h-4 w-4 text-white/40" />
            ) : (
              <ChevronRight className="h-4 w-4 text-white/40" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="px-3 pb-3">
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
            className="w-full justify-between p-3 h-auto hover:bg-white/5"
          >
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-neon-purple" />
              <span className="text-sm font-medium text-white/90">Section Tools</span>
              <Badge variant="secondary" className="text-xs h-5 px-2 bg-neon-purple/10 text-neon-purple border-neon-purple/20">
                <Zap className="h-3 w-3 mr-1" />
                AI
              </Badge>
            </div>
            {openSections.sections ? (
              <ChevronDown className="h-4 w-4 text-white/40" />
            ) : (
              <ChevronRight className="h-4 w-4 text-white/40" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="px-3 pb-3">
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
            className="w-full justify-between p-3 h-auto hover:bg-white/5"
          >
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-white/90">History</span>
              <Badge variant="secondary" className="text-xs h-5 px-2 bg-blue-500/10 text-blue-400 border-blue-500/20">
                <Clock className="h-3 w-3 mr-1" />
                Timeline
              </Badge>
            </div>
            {openSections.timeline ? (
              <ChevronDown className="h-4 w-4 text-white/40" />
            ) : (
              <ChevronRight className="h-4 w-4 text-white/40" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="px-3 pb-3">
          <ApprovalTimeline contentId={content.id} />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};