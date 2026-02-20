import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CustomBadge } from '@/components/ui/custom-badge';
import { 
  CheckCircle2, 
  Calendar,
  TrendingUp,
  Sparkles,
  Eye,
  Edit,
  Share,
  BarChart3
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
    status?: string;
  };
  isSelected?: boolean;
  isNew?: boolean;
  onToggleSelect?: (proposalId: string) => void;
  onScheduleToCalendar?: (proposal: any) => void;
  onAddToPipeline?: (proposal: any) => void;
  onViewDetails?: (proposal: any) => void;
  onEdit?: (proposal: any) => void;
  showActions?: boolean;
  actionSlot?: React.ReactNode;
}

const priorityConfig = {
  'quick_win': { 
    label: 'Quick Win', 
    color: 'bg-green-500/20 text-green-400 border-green-500/30',
    icon: '⚡'
  },
  'growth_opportunity': { 
    label: 'Growth Opportunity', 
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    icon: '🌱'
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
  showActions = true,
  actionSlot
}) => {
  const proposalId = proposal.id || proposal.title.toLowerCase().replace(/\s+/g, '-');
  const priority = proposal.priority_tag || 'evergreen';
  const contentType = proposal.content_type || 'blog';
  
  const priorityInfo = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.evergreen;
  const typeInfo = contentTypeConfig[contentType as keyof typeof contentTypeConfig] || contentTypeConfig.blog;

  const handleCardClick = (e: React.MouseEvent) => {
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
      {/* Header with NEW badge, priority tag, content type, and eye icon */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex flex-wrap gap-1.5">
          {isNew && (
            <CustomBadge className="bg-primary text-primary-foreground font-bold text-xs" animated icon={<Sparkles className="h-3 w-3" />}>
              NEW
            </CustomBadge>
          )}
          <CustomBadge className={priorityInfo.color} animated>
            {priorityInfo.icon} {priorityInfo.label}
          </CustomBadge>
          <CustomBadge className="bg-secondary/20 text-secondary-foreground border-secondary/30">
            {typeInfo.icon} {typeInfo.label}
          </CustomBadge>
        </div>
        
        <div className="opacity-60 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); onViewDetails?.(proposal); }}>
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Title and description */}
      <div className="mb-3">
        <h3 className="font-medium text-base mb-1 line-clamp-2 group-hover:text-primary/90 transition-colors">
          {proposal.title}
        </h3>
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2 group-hover:line-clamp-3 transition-all">
          {proposal.description || 'AI-generated content proposal with strategic keyword targeting'}
        </p>
      </div>

      {/* Keywords section — primary keyword first, then related */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex text-[10px] px-1.5 py-0.5 bg-primary/20 text-primary rounded hover:bg-primary/30 transition-colors cursor-help font-medium">
                {typeof proposal.primary_keyword === 'string' ? proposal.primary_keyword : (proposal.primary_keyword as any)?.keyword || String(proposal.primary_keyword)}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Primary keyword</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {proposal.related_keywords && proposal.related_keywords.slice(0, 2).map((keyword: any, i: number) => (
          <TooltipProvider key={i}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex text-[10px] px-1.5 py-0.5 bg-secondary/30 rounded hover:bg-secondary/40 transition-colors cursor-help">
                  {typeof keyword === 'string' ? keyword : keyword?.keyword || String(keyword)}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Related keyword</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}

        {proposal.related_keywords && proposal.related_keywords.length > 2 && (
          <span className="inline-flex text-[10px] px-1.5 py-0.5 bg-secondary/10 rounded cursor-help">
            +{proposal.related_keywords.length - 2}
          </span>
        )}
      </div>

      {/* Estimated impressions — only shown when real data exists */}
      {proposal.estimated_impressions != null && proposal.estimated_impressions > 0 && (
        <div className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <TrendingUp className="h-3.5 w-3.5 text-primary" />
          <span>Est. <span className="font-semibold text-foreground">{proposal.estimated_impressions.toLocaleString()}</span> impressions/mo</span>
        </div>
      )}

      {/* Footer with timestamp and actions */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/30">
        <div className="text-xs text-muted-foreground">
          {proposal.created_at ? (
            `Created ${formatDistanceToNow(new Date(proposal.created_at), { addSuffix: true })}`
          ) : (
            'Just created'
          )}
        </div>
        
        {showActions && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={(e) => { e.stopPropagation(); onEdit?.(proposal); }}>
                    <Edit className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><span className="text-xs">Edit</span></TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={(e) => { e.stopPropagation(); onViewDetails?.(proposal); }}>
                    <BarChart3 className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><span className="text-xs">Analytics</span></TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={(e) => { e.stopPropagation(); onScheduleToCalendar?.(proposal); }}>
                    <Calendar className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><span className="text-xs">Schedule</span></TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={(e) => { e.stopPropagation(); }}>
                    <Share className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><span className="text-xs">Share</span></TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}

        {actionSlot}
      </div>

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
