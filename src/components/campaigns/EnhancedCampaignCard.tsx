import React from 'react';
import { SavedCampaign } from '@/services/campaignService';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  FileText,
  Eye,
  Calendar,
  Target,
  MoreVertical,
  Pencil,
  Trash2,
  Archive,
  CheckCircle2,
  Clock,
  TrendingUp,
  Share2,
  Sparkles,
  Circle,
  Zap,
  ArrowRight,
  BarChart3,
} from 'lucide-react';
import { getPlatformConfig } from '@/utils/platformIcons';
import { format, formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Utility function to format reach values intelligently
const formatReach = (reach: string | number): string => {
  if (reach === '—' || !reach) return '—';
  
  const reachStr = String(reach);
  
  // Handle ranges like "60,000-80,000 impressions over 4 weeks" or "60,000-80,000"
  const rangeMatch = reachStr.match(/(\d[\d,\-]+)/);
  
  if (rangeMatch) {
    const numbers = rangeMatch[1];
    
    // Convert "60,000-80,000" to "60K-80K"
    const formatted = numbers
      .split('-')
      .map(n => {
        const num = parseInt(n.replace(/,/g, ''));
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${Math.round(num / 1000)}K`;
        return n;
      })
      .join('-');
    
    return formatted;
  }
  
  return reachStr;
};

interface EnhancedCampaignCardProps {
  campaign: SavedCampaign;
  onView: (id: string) => void;
  onStartEdit: () => void;
  onDelete: () => void;
  onArchive: () => void;
  isEditing: boolean;
  editingName: string;
  onEditingNameChange: (name: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
}

const statusConfig = {
  draft: {
    icon: Circle,
    iconColor: 'text-muted-foreground',
    color: 'bg-muted/50 text-muted-foreground border-muted-foreground/30',
    label: 'Draft',
    pulse: false,
  },
  planned: {
    icon: Clock,
    iconColor: 'text-blue-400',
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    label: 'Planned',
    pulse: false,
  },
  active: {
    icon: Zap,
    iconColor: 'text-primary',
    color: 'bg-primary/10 text-primary border-primary/30',
    label: 'Active',
    pulse: true,
  },
  completed: {
    icon: CheckCircle2,
    iconColor: 'text-green-400',
    color: 'bg-green-500/10 text-green-400 border-green-500/30',
    label: 'Completed',
    pulse: false,
  },
  archived: {
    icon: Archive,
    iconColor: 'text-muted-foreground',
    color: 'bg-muted/50 text-muted-foreground border-muted-foreground/30',
    label: 'Archived',
    pulse: false,
  },
};

// Helper to get channel config with full styling
const getChannelConfig = (channel: string) => {
  const normalized = channel.toLowerCase().trim().replace(/\s+/g, '-');
  return getPlatformConfig(normalized);
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.3, ease: "easeOut" }
  },
};

export const EnhancedCampaignCard: React.FC<EnhancedCampaignCardProps> = ({
  campaign,
  onView,
  onStartEdit,
  onDelete,
  onArchive,
  isEditing,
  editingName,
  onEditingNameChange,
  onSaveEdit,
  onCancelEdit,
}) => {
  const config = statusConfig[campaign.status as keyof typeof statusConfig] || statusConfig.draft;
  const contentCount = campaign.contentCount || 0;
  const plannedCount = campaign.plannedCount || 0;
  const progressPercentage = plannedCount > 0 ? Math.round((contentCount / plannedCount) * 100) : 0;
  const estimatedReach = campaign.estimatedReach || '—';
  const reachValue = formatReach(estimatedReach);
  const daysRemaining = campaign.daysRemaining !== undefined ? campaign.daysRemaining : '—';
  const goalDisplay = campaign.goal || campaign.selected_strategy?.expectedEngagement || 'Awareness';
  const nextAction = campaign.nextAction;
  const distributionChannels = campaign.distributionChannels || [];

  // Format date nicely
  const createdDate = new Date(campaign.created_at);
  const relativeDate = formatDistanceToNow(createdDate, { addSuffix: true });

  return (
    <motion.div
      variants={itemVariants}
      className="group"
    >
      <GlassCard
        className={cn(
          "relative overflow-hidden transition-all duration-300 cursor-pointer",
          "bg-gradient-to-br from-background/80 via-background/60 to-background/40",
          "backdrop-blur-xl",
          "border border-border/50 hover:border-primary/30",
          "shadow-lg hover:shadow-2xl hover:shadow-primary/5",
          "hover:scale-[1.02]",
          "ring-0 hover:ring-1 hover:ring-primary/10"
        )}
        onClick={() => onView(campaign.id)}
      >
        {/* Subtle gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:via-transparent group-hover:to-transparent transition-all duration-500 pointer-events-none" />
        
        <div className="relative p-6 space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Solution Badge (if exists) */}
              {campaign.solution && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center">
                    {campaign.solution.logo_url ? (
                      <img 
                        src={campaign.solution.logo_url} 
                        alt={campaign.solution.name}
                        className="h-4 w-4 rounded object-contain"
                      />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                    )}
                  </div>
                  <span className="text-xs font-medium text-primary/80">
                    Promoting {campaign.solution.name}
                  </span>
                </div>
              )}
              
              {/* Title */}
              <h3 className="text-lg md:text-xl font-bold mb-2 group-hover:text-primary transition-colors leading-tight">
                {campaign.selected_strategy?.title || campaign.name}
              </h3>
              
              {/* Objective as subtitle */}
              {campaign.objective && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {campaign.objective}
                </p>
              )}
              
              {/* Status and Date */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
                  config.color,
                  config.pulse && "animate-pulse"
                )}>
                  <config.icon className={cn("h-3.5 w-3.5", config.iconColor)} />
                  {config.label}
                </span>
                <span className="text-xs text-muted-foreground" title={format(createdDate, 'PPP')}>
                  {relativeDate}
                </span>
              </div>
            </div>
            
            {/* Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 hover:bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStartEdit(); }}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Rename
                </DropdownMenuItem>
                {campaign.status !== 'archived' && (
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onArchive(); }}>
                    <Archive className="h-4 w-4 mr-2" />
                    Archive
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-destructive focus:text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Key Metrics Grid - Premium styling */}
          <div className="grid grid-cols-2 gap-3">
            {/* Content Progress */}
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 hover:border-purple-500/40 transition-all group/metric min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-4 w-4 text-purple-400" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">Content</span>
              </div>
              <p className="text-xl font-bold bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent">
                {contentCount}/{plannedCount}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">pieces</p>
            </div>

            {/* Estimated Reach */}
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 hover:border-blue-500/40 transition-all min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Eye className="h-4 w-4 text-blue-400" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">Reach</span>
              </div>
              <p className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent" title={String(estimatedReach)}>
                {reachValue}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">impressions</p>
            </div>

            {/* Timeline */}
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 hover:border-green-500/40 transition-all min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-4 w-4 text-green-400" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">Timeline</span>
              </div>
              <p className="text-xl font-bold bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">
                {daysRemaining}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">days left</p>
            </div>

            {/* Goal */}
            <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 hover:border-amber-500/40 transition-all min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <Target className="h-4 w-4 text-amber-400" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">Goal</span>
              </div>
              <p className="text-base font-bold text-amber-400 truncate" title={goalDisplay}>
                {goalDisplay.length > 12 ? goalDisplay.slice(0, 10) + '...' : goalDisplay}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">focus</p>
            </div>
          </div>

          {/* Progress Bar - Premium with milestones */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Campaign Progress</span>
              <span className={cn(
                "text-sm font-bold",
                progressPercentage >= 70 ? "text-green-400" : 
                progressPercentage >= 30 ? "text-amber-400" : "text-muted-foreground"
              )}>
                {progressPercentage}%
              </span>
            </div>
            <div className="relative h-3 bg-muted/30 rounded-full overflow-hidden">
              {/* Milestone markers */}
              <div className="absolute inset-0 flex items-center justify-around pointer-events-none z-10">
                {[25, 50, 75].map((milestone) => (
                  <div 
                    key={milestone}
                    className={cn(
                      "w-0.5 h-full",
                      progressPercentage >= milestone ? "bg-white/20" : "bg-white/10"
                    )}
                  />
                ))}
              </div>
              
              {/* Progress fill */}
              <motion.div
                className={cn(
                  "h-full rounded-full relative overflow-hidden",
                  progressPercentage < 30 && "bg-gradient-to-r from-red-500 to-red-400",
                  progressPercentage >= 30 && progressPercentage < 70 && "bg-gradient-to-r from-amber-500 to-amber-400",
                  progressPercentage >= 70 && "bg-gradient-to-r from-green-500 to-emerald-400"
                )}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" 
                  style={{ 
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 2s infinite linear'
                  }} 
                />
              </motion.div>
            </div>
          </div>

          {/* Distribution Channels - Premium with proper icons */}
          {distributionChannels.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Distribution Channels</p>
              <TooltipProvider delayDuration={200}>
                <div className="flex gap-2 flex-wrap">
                  {distributionChannels.slice(0, 5).map((channel, idx) => {
                    const channelConfig = getChannelConfig(channel);
                    const Icon = channelConfig.icon || Share2;
                    return (
                      <Tooltip key={idx}>
                        <TooltipTrigger asChild>
                          <motion.div 
                            className={cn(
                              "h-10 w-10 rounded-xl flex items-center justify-center cursor-pointer",
                              "border transition-all duration-200",
                              channelConfig.bgColor || "bg-primary/10",
                              "border-border/50 hover:border-primary/50",
                              "hover:scale-110 hover:shadow-lg"
                            )}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Icon className={cn("h-5 w-5", channelConfig.color || "text-primary")} />
                          </motion.div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="font-medium">
                          {channelConfig.name || channel}
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                  {distributionChannels.length > 5 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="h-10 w-10 rounded-xl bg-muted/50 border border-border/50 flex items-center justify-center">
                          <span className="text-sm font-bold text-muted-foreground">
                            +{distributionChannels.length - 5}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        {distributionChannels.slice(5).join(', ')}
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </TooltipProvider>
            </div>
          )}

          {/* Next Action CTA - Premium styling */}
          {nextAction && (
            <motion.div 
              className="pt-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className={cn(
                "relative overflow-hidden rounded-xl",
                "bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20",
                "border border-primary/30",
                "p-4 group/cta cursor-pointer",
                "hover:from-primary/30 hover:via-primary/20 hover:to-primary/30",
                "transition-all duration-300"
              )}>
                {/* Animated background glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent opacity-0 group-hover/cta:opacity-100 transition-opacity" />
                
                <div className="relative flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                    <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-primary/70 mb-0.5">Next Step</p>
                    <p className="text-sm font-semibold text-foreground truncate">{nextAction}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-primary shrink-0 group-hover/cta:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          )}

          {/* Action Footer - Clear labels */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-border/50">
            <Button 
              onClick={(e) => { e.stopPropagation(); onView(campaign.id); }} 
              variant="default" 
              size="sm"
              className="flex-1 bg-primary/10 hover:bg-primary/20 text-primary border-0"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Campaign
            </Button>
            
            <TooltipProvider delayDuration={200}>
              <div className="flex gap-1.5">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-9 w-9 hover:bg-muted"
                      onClick={(e) => { e.stopPropagation(); onStartEdit(); }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Edit Campaign</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-9 w-9 hover:bg-muted"
                      onClick={(e) => { e.stopPropagation(); }}
                    >
                      <BarChart3 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Analytics</TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};
