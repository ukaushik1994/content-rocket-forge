import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CustomBadge } from '@/components/ui/custom-badge';
import { 
  CheckCircle2, 
  Calendar,
  TrendingUp,
  FileText,
  Sparkles,
  Eye,
  GitBranch,
  Clock,
  Target,
  BarChart3,
  Plus,
  Edit,
  Share
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDistanceToNow } from 'date-fns';

export interface EnhancedAIProposalCardProps {
  proposal: {
    id?: string;
    title: string;
    description?: string;
    primary_keyword: string;
    related_keywords?: string[];
    content_type?: string;
    priority_tag?: string;
    estimated_impressions?: number;
    created_at?: string;
    is_historical?: boolean;
    serp_data?: any;
    content_suggestions?: string[];
  };
  isSelected?: boolean;
  isNew?: boolean;
  onToggleSelect?: (proposalId: string) => void;
  onScheduleToCalendar?: (proposal: any) => void;
  onAddToPipeline?: (proposal: any) => void;
  onViewDetails?: (proposal: any) => void;
  onEdit?: (proposal: any) => void;
  showActions?: boolean;
}

const statusConfig = {
  'draft': { 
    label: 'Draft', 
    color: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    percentage: 25
  },
  'pending_review': { 
    label: 'Pending Review', 
    color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    percentage: 65
  },
  'ready': { 
    label: 'Ready', 
    color: 'bg-green-500/20 text-green-400 border-green-500/30',
    percentage: 95
  },
  'stale': { 
    label: 'STALE', 
    color: 'bg-red-500/20 text-red-400 border-red-500/30',
    percentage: 15
  }
};

const priorityConfig = {
  'quick_win': { 
    label: 'Quick Win', 
    color: 'bg-green-500/20 text-green-400 border-green-500/30',
    icon: '⚡'
  },
  'high_return': { 
    label: 'High Return', 
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    icon: '💰'
  },
  'evergreen': { 
    label: 'Evergreen', 
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    icon: '🌲'
  }
};

const contentTypeConfig = {
  'blog': { label: 'Blog Post', icon: '📝' },
  'article': { label: 'Article', icon: '📄' },
  'social': { label: 'Social Media', icon: '📱' },
  'video': { label: 'Video', icon: '🎬' },
  'email': { label: 'Email', icon: '✉️' }
};

export const EnhancedAIProposalCard: React.FC<EnhancedAIProposalCardProps> = ({
  proposal,
  isSelected = false,
  isNew = false,
  onToggleSelect,
  onScheduleToCalendar,
  onAddToPipeline,
  onViewDetails,
  onEdit,
  showActions = true
}) => {
  const proposalId = proposal.id || proposal.title.toLowerCase().replace(/\s+/g, '-');
  const priority = proposal.priority_tag || 'evergreen';
  const contentType = proposal.content_type || 'blog';
  
  // Simulate status based on various factors
  const getStatus = () => {
    if (proposal.is_historical) return 'stale';
    if (proposal.created_at) {
      const daysSinceCreated = Math.floor((Date.now() - new Date(proposal.created_at).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceCreated > 30) return 'stale';
      if (daysSinceCreated > 7) return 'pending_review';
    }
    return Math.random() > 0.5 ? 'draft' : 'ready';
  };

  const status = getStatus();
  const statusInfo = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
  const priorityInfo = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.evergreen;
  const typeInfo = contentTypeConfig[contentType as keyof typeof contentTypeConfig] || contentTypeConfig.blog;
  
  const estimatedWords = proposal.description ? proposal.description.split(/\s+/).length * 15 : 850; // Estimate based on description
  const readingTime = Math.ceil(estimatedWords / 200);
  const seoScore = Math.floor(Math.random() * 40) + 60; // Random score between 60-100
  const seoGrade = seoScore >= 90 ? 'Excellent' : seoScore >= 75 ? 'Good' : 'Fair';

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't select if clicking on buttons
    if (e.target instanceof Element && e.target.closest('button')) {
      return;
    }
    if (onToggleSelect) {
      onToggleSelect(proposalId);
    }
  };

  return (
    <Card
      className={`p-4 cursor-pointer hover:shadow-md transition-all duration-200 group ${
        isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
      } animate-fade-in relative overflow-hidden bg-background/60 backdrop-blur-xl`}
      onClick={handleCardClick}
    >
      {/* Header with status and actions */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex flex-wrap gap-2">
          <CustomBadge className={statusInfo.color} animated>
            {statusInfo.label} {statusInfo.percentage}%
          </CustomBadge>
          <CustomBadge className="bg-primary/10 text-primary border-primary/20">
            SEO: {seoGrade}
          </CustomBadge>
        </div>
        
        {/* Quick actions dropdown - matches content card style */}
        <div className="opacity-60 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Title and content preview */}
      <div className="mb-3">
        <h3 className="font-medium text-base mb-1 line-clamp-2 group-hover:text-primary/90 transition-colors">
          {proposal.title}
        </h3>
        
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2 group-hover:line-clamp-3 transition-all">
          {proposal.description || 'AI-generated content proposal with strategic keyword targeting'}
        </p>
      </div>

      {/* Keywords section */}
      {proposal.related_keywords && proposal.related_keywords.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex text-[10px] px-1.5 py-0.5 bg-primary/20 text-primary rounded hover:bg-primary/30 transition-colors cursor-help">
                  {proposal.primary_keyword}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Primary keyword</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {proposal.related_keywords.slice(0, 2).map((keyword, i) => (
            <TooltipProvider key={i}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex text-[10px] px-1.5 py-0.5 bg-secondary/30 rounded hover:bg-secondary/40 transition-colors cursor-help">
                    {keyword}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Related keyword</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
          
          {proposal.related_keywords.length > 2 && (
            <span className="inline-flex text-[10px] px-1.5 py-0.5 bg-secondary/10 rounded cursor-help">
              +{proposal.related_keywords.length - 2}
            </span>
          )}
        </div>
      )}

      {/* Content stats */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="text-[10px] text-muted-foreground flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-primary/30"></span>
          ~{estimatedWords.toLocaleString()} words
        </div>
        <div className="text-[10px] text-muted-foreground flex items-center gap-1 justify-end">
          <span className="inline-block w-2 h-2 rounded-full bg-secondary/40"></span>
          {readingTime} min read
        </div>
      </div>

      {/* SEO Metadata Section */}
      <div className="mb-3 p-2 rounded-lg bg-background/40 border border-border/30">
        <h4 className="text-[10px] font-semibold text-muted-foreground mb-2 uppercase tracking-wide">SEO METADATA</h4>
        <div className="space-y-1">
          <div className="text-xs">
            <span className="text-muted-foreground">Title: </span>
            <span className="text-foreground">{proposal.title}</span>
          </div>
          <div className="text-xs">
            <span className="text-muted-foreground">Description: </span>
            <span className="text-foreground line-clamp-1">{proposal.description || 'Auto-generated description'}</span>
          </div>
        </div>
      </div>

      {/* AI Analysis Progress */}
      <div className="mb-3 p-2 rounded-lg bg-primary/5 border border-primary/20">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-[10px] font-semibold text-primary uppercase tracking-wide">AI Analysis</h4>
          <span className="text-xs text-primary font-bold">{seoScore}%</span>
        </div>
        <Progress 
          value={seoScore} 
          className="h-1.5 mb-1" 
        />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>Content Quality</span>
          <span className={seoScore >= 80 ? 'text-green-400' : seoScore >= 60 ? 'text-yellow-400' : 'text-red-400'}>
            {seoGrade}
          </span>
        </div>
      </div>

      {/* Footer with timestamp and actions */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/30">
        <div className="text-xs text-muted-foreground">
          {proposal.created_at ? (
            `Created ${formatDistanceToNow(new Date(proposal.created_at), { addSuffix: true })}`
          ) : (
            'Just created'
          )}
        </div>
        
        {/* Action icons - bottom right like in the reference image */}
        {showActions && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 rounded-full" 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      onEdit?.(proposal); 
                    }}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <span className="text-xs">Edit</span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 rounded-full" 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      onViewDetails?.(proposal); 
                    }}
                  >
                    <BarChart3 className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <span className="text-xs">Analytics</span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 rounded-full" 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      onScheduleToCalendar?.(proposal); 
                    }}
                  >
                    <Calendar className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <span className="text-xs">Schedule</span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 rounded-full" 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      // Share functionality
                    }}
                  >
                    <Share className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <span className="text-xs">Share</span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>

      {/* New badge */}
      {isNew && (
        <motion.div
          className="absolute top-2 left-2 z-10"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <CustomBadge className="bg-primary text-primary-foreground font-bold text-xs" animated icon={<Sparkles className="h-3 w-3" />}>
            NEW
          </CustomBadge>
        </motion.div>
      )}

      {/* Selection indicator */}
      {isSelected && (
        <motion.div
          className="absolute top-2 right-2 z-10"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/50 text-primary">
            <CheckCircle2 className="h-3 w-3" />
            <span className="text-xs font-bold">Selected</span>
          </div>
        </motion.div>
      )}

      {/* Hover glow effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        initial={false}
      />
    </Card>
  );
};