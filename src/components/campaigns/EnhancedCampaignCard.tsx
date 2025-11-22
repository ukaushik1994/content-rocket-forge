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
  AlertTriangle,
  TrendingUp,
  Share2,
  Mail,
  Video,
  DollarSign,
  MessageCircle,
  Search,
  Sparkles,
} from 'lucide-react';
import { format } from 'date-fns';
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
    dot: '⚪',
    color: 'from-gray-500/20 to-gray-500/30 text-gray-300',
    label: 'Draft',
  },
  planned: {
    dot: '🔵',
    color: 'from-blue-500/20 to-blue-500/30 text-blue-300',
    label: 'Planned',
  },
  active: {
    dot: '🟣',
    color: 'from-purple-500/20 to-purple-500/30 text-purple-300',
    label: 'Active',
  },
  completed: {
    dot: '🟢',
    color: 'from-green-500/20 to-green-500/30 text-green-300',
    label: 'Completed',
  },
  archived: {
    dot: '⚫',
    color: 'from-gray-500/20 to-gray-500/30 text-gray-300',
    label: 'Archived',
  },
};

const channelIcons = {
  'social': Share2,
  'email': Mail,
  'webinars': Video,
  'blog': FileText,
  'paid ads': DollarSign,
  'events': Calendar,
  'seo': Search,
  'direct outreach': MessageCircle,
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
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

  return (
    <motion.div
      variants={itemVariants}
      className="group"
    >
      <GlassCard
        className={cn(
          "relative overflow-hidden transition-all duration-300 cursor-pointer",
          "bg-background/60 backdrop-blur-xl",
          "border border-border/50 hover:border-border",
          "shadow-md hover:shadow-xl",
          "hover:scale-[1.01]"
        )}
        onClick={() => onView(campaign.id)}
      >
        <div className="p-5 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {/* Solution Badge (if exists) */}
              {campaign.solution && (
                <div className="flex items-center gap-2 mb-2">
                  {campaign.solution.logo_url ? (
                    <img 
                      src={campaign.solution.logo_url} 
                      alt={campaign.solution.name}
                      className="h-5 w-5 rounded object-contain"
                    />
                  ) : (
                    <Sparkles className="h-4 w-4 text-primary" />
                  )}
                  <span className="text-xs text-muted-foreground">Promoting {campaign.solution.name}</span>
                </div>
              )}
              
              {/* Title */}
              <h3 className="text-base md:text-lg font-bold mb-1 group-hover:text-primary transition-colors line-clamp-2">
                {campaign.selected_strategy?.title || campaign.name}
              </h3>
              
              {/* Objective as subtitle */}
              {campaign.objective && (
                <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                  {campaign.objective}
                </p>
              )}
              
              {/* Status and Date */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                  "bg-gradient-to-r backdrop-blur-sm",
                  config.color
                )}>
                  <span className="text-sm">{config.dot}</span>
                  {config.label}
                </span>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(campaign.created_at), 'MMM d, yyyy')}
                </span>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
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
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-red-400">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Key Metrics Grid - Single row on desktop, stacked on mobile */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            {/* Content Progress */}
            <div className="p-3 rounded-lg bg-card/40 border border-border/50 hover:bg-card/60 transition-all min-w-[120px]">
              <div className="flex items-center gap-2 mb-1.5">
                <FileText className="h-4 w-4 text-purple-400 flex-shrink-0" />
                <p className="text-xs text-muted-foreground truncate">Content</p>
              </div>
              <p className="text-lg md:text-xl font-bold">{contentCount}/{plannedCount}</p>
              <p className="text-xs text-muted-foreground">pieces</p>
            </div>

            {/* Estimated Reach */}
            <div className="p-3 rounded-lg bg-card/40 border border-border/50 hover:bg-card/60 transition-all min-w-[120px]">
              <div className="flex items-center gap-2 mb-1.5">
                <Eye className="h-4 w-4 text-blue-400 flex-shrink-0" />
                <p className="text-xs text-muted-foreground truncate">Reach</p>
              </div>
              <p className="text-lg md:text-xl font-bold truncate">{reachValue}</p>
              <p className="text-xs text-muted-foreground">impressions</p>
            </div>

            {/* Timeline */}
            <div className="p-3 rounded-lg bg-card/40 border border-border/50 hover:bg-card/60 transition-all min-w-[120px]">
              <div className="flex items-center gap-2 mb-1.5">
                <Calendar className="h-4 w-4 text-green-400 flex-shrink-0" />
                <p className="text-xs text-muted-foreground truncate">Timeline</p>
              </div>
              <p className="text-lg md:text-xl font-bold">{daysRemaining}</p>
              <p className="text-xs text-muted-foreground">days left</p>
            </div>

            {/* Goal */}
            <div className="p-3 rounded-lg bg-card/40 border border-border/50 hover:bg-card/60 transition-all min-w-[120px]">
              <div className="flex items-center gap-2 mb-1.5">
                <Target className="h-4 w-4 text-amber-400 flex-shrink-0" />
                <p className="text-xs text-muted-foreground truncate">Goal</p>
              </div>
              <Badge variant="secondary" className="text-xs px-2 py-0.5 whitespace-nowrap mt-1">
                {goalDisplay}
              </Badge>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Progress</span>
              <span className="text-xs font-bold text-primary">{progressPercentage}%</span>
            </div>
            <div className="h-2.5 bg-muted/50 rounded-full overflow-hidden">
              <motion.div
                className={cn(
                  "h-full rounded-full transition-all duration-700",
                  progressPercentage < 30 && "bg-red-500",
                  progressPercentage >= 30 && progressPercentage < 70 && "bg-amber-500",
                  progressPercentage >= 70 && "bg-gradient-to-r from-green-500 to-emerald-400"
                )}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Distribution Channels */}
          {distributionChannels.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-xs text-muted-foreground">Channels:</p>
              <div className="flex gap-1.5">
                {distributionChannels.slice(0, 4).map((channel, idx) => {
                  const Icon = channelIcons[channel as keyof typeof channelIcons] || Share2;
                  return (
                    <div 
                      key={idx} 
                      className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
                      title={channel}
                    >
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                  );
                })}
                {distributionChannels.length > 4 && (
                  <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                    <span className="text-xs font-medium">+{distributionChannels.length - 4}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Next Action */}
          {nextAction && (
            <div className="pt-3 border-t border-border/50">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
                <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-primary/70">Next:</p>
                  <p className="text-xs font-medium truncate">{nextAction}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Footer - Icon buttons only */}
          <div className="flex items-center justify-between gap-2 pt-3 border-t border-border/50">
            <Button 
              onClick={(e) => { e.stopPropagation(); onView(campaign.id); }} 
              variant="ghost" 
              size="sm"
              className="flex-1 justify-start hover:bg-primary/10"
            >
              <Eye className="h-4 w-4 mr-2" />
              View
            </Button>
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8 hover:bg-primary/10"
                onClick={(e) => { e.stopPropagation(); }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8 hover:bg-primary/10"
                onClick={(e) => { e.stopPropagation(); }}
              >
                <TrendingUp className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};