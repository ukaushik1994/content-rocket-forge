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
const formatReach = (reach: string | number): { value: string; period?: string } => {
  if (reach === '—' || !reach) return { value: '—' };
  
  const reachStr = String(reach);
  
  // Handle ranges like "60,000-80,000 impressions over 4 weeks"
  const rangeMatch = reachStr.match(/(\d[\d,\-]+)\s*(?:impressions?)?\s*(?:over\s+(.+))?/i);
  
  if (rangeMatch) {
    const numbers = rangeMatch[1];
    const period = rangeMatch[2];
    
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
    
    return {
      value: formatted,
      period: period || undefined
    };
  }
  
  return { value: reachStr };
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
  const { value: reachValue, period: reachPeriod } = formatReach(estimatedReach);
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
          "relative overflow-hidden transition-all duration-500 cursor-pointer",
          "bg-gradient-to-br from-background/40 via-background/60 to-background/40",
          "backdrop-blur-2xl backdrop-saturate-150",
          "border-2 border-white/5 hover:border-white/10",
          "shadow-2xl hover:shadow-3xl hover:shadow-primary/10",
          "ring-1 ring-white/5 hover:ring-white/10",
          "hover:-translate-y-1"
        )}
        onClick={() => onView(campaign.id)}
      >
        <div className="p-8 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h3 className="text-xl md:text-2xl lg:text-3xl font-extrabold mb-2 group-hover:text-primary transition-colors line-clamp-3 tracking-tight leading-tight">
                {campaign.selected_strategy?.title || campaign.name}
              </h3>
              <div className="flex items-center gap-3">
                <span className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold",
                  "bg-gradient-to-r backdrop-blur-sm shadow-sm transition-all duration-300",
                  config.color,
                  campaign.status === 'active' && "shadow-primary/30 animate-pulse-slow"
                )}>
                  <span className="text-base">{config.dot}</span>
                  {config.label}
                </span>
                <span className="text-xs text-muted-foreground/60 uppercase tracking-wider">
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

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-6">
            {/* Content Progress */}
            <div className="group/metric p-4 rounded-xl bg-gradient-to-br from-card/30 to-card/60 border border-white/5 hover:border-white/10 hover:from-card/40 hover:to-card/70 transition-all duration-300 min-w-0 overflow-hidden">
              <div className="flex items-center gap-3 mb-3 min-w-0">
                <div className="p-2.5 rounded-full bg-purple-500/10 group-hover/metric:bg-purple-500/20 transition-colors flex-shrink-0">
                  <FileText className="h-5 w-5 text-purple-400" />
                </div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground/60 font-medium truncate">Content</p>
              </div>
              <p className="text-2xl lg:text-3xl font-black leading-tight">{contentCount}/{plannedCount}</p>
              <p className="text-xs text-muted-foreground/70 mt-1.5 truncate">pieces created</p>
            </div>

            {/* Estimated Reach */}
            <div className="group/metric p-4 rounded-xl bg-gradient-to-br from-card/30 to-card/60 border border-white/5 hover:border-white/10 hover:from-card/40 hover:to-card/70 transition-all duration-300 min-w-0 overflow-hidden">
              <div className="flex items-center gap-3 mb-3 min-w-0">
                <div className="p-2.5 rounded-full bg-blue-500/10 group-hover/metric:bg-blue-500/20 transition-colors flex-shrink-0">
                  <Eye className="h-5 w-5 text-blue-400" />
                </div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground/60 font-medium truncate">Est. Reach</p>
              </div>
              <p className="text-xl lg:text-2xl font-bold leading-tight break-words">{reachValue}</p>
              <p className="text-xs text-muted-foreground/70 mt-1.5 truncate">
                {reachPeriod ? `over ${reachPeriod}` : 'impressions'}
              </p>
            </div>

            {/* Timeline */}
            <div className="group/metric p-4 rounded-xl bg-gradient-to-br from-card/30 to-card/60 border border-white/5 hover:border-white/10 hover:from-card/40 hover:to-card/70 transition-all duration-300 min-w-0 overflow-hidden">
              <div className="flex items-center gap-3 mb-3 min-w-0">
                <div className="p-2.5 rounded-full bg-green-500/10 group-hover/metric:bg-green-500/20 transition-colors flex-shrink-0">
                  <Calendar className="h-5 w-5 text-green-400" />
                </div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground/60 font-medium truncate">Timeline</p>
              </div>
              <p className="text-2xl lg:text-3xl font-black leading-tight">{daysRemaining}</p>
              <p className="text-xs text-muted-foreground/70 mt-1.5 truncate">days remaining</p>
            </div>

            {/* Goal */}
            <div className="group/metric p-4 rounded-xl bg-gradient-to-br from-card/30 to-card/60 border border-white/5 hover:border-white/10 hover:from-card/40 hover:to-card/70 transition-all duration-300 min-w-0 overflow-hidden">
              <div className="flex items-center gap-3 mb-3 min-w-0">
                <div className="p-2.5 rounded-full bg-amber-500/10 group-hover/metric:bg-amber-500/20 transition-colors flex-shrink-0">
                  <Target className="h-5 w-5 text-amber-400" />
                </div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground/60 font-medium truncate">Goal</p>
              </div>
              <Badge variant="secondary" className="mt-2 text-sm font-bold px-3 py-1 truncate max-w-full">
                {goalDisplay}
              </Badge>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold tracking-wide">Campaign Progress</span>
              <span className="text-sm font-black text-primary">{progressPercentage}%</span>
            </div>
            <div className="h-4 bg-gradient-to-r from-background/40 to-background/80 rounded-full overflow-hidden border border-white/5">
              <motion.div
                className={cn(
                  "h-full rounded-full transition-all duration-700 ease-out relative",
                  progressPercentage < 30 && "bg-gradient-to-r from-red-500 to-red-400 shadow-lg shadow-red-500/30",
                  progressPercentage >= 30 && progressPercentage < 70 && "bg-gradient-to-r from-amber-500 to-amber-400 shadow-lg shadow-amber-500/30",
                  progressPercentage >= 70 && "bg-gradient-to-r from-green-500 to-emerald-400 shadow-lg shadow-green-500/30"
                )}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Distribution Channels */}
          {distributionChannels.length > 0 && (
            <div className="flex items-center gap-3">
              <p className="text-xs uppercase tracking-wider text-muted-foreground/60 font-medium">Channels:</p>
              <div className="flex gap-2.5">
                {distributionChannels.slice(0, 5).map((channel, idx) => {
                  const Icon = channelIcons[channel as keyof typeof channelIcons] || Share2;
                  return (
                    <div 
                      key={idx} 
                      className="group/channel h-10 w-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 border border-primary/20 flex items-center justify-center hover:from-primary/20 hover:to-primary/30 hover:scale-110 transition-all duration-300 cursor-pointer"
                      title={channel}
                    >
                      <Icon className="h-5 w-5 text-primary group-hover/channel:scale-110 transition-transform" />
                    </div>
                  );
                })}
                {distributionChannels.length > 5 && (
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-muted/50 to-muted border border-border/50 flex items-center justify-center">
                    <span className="text-xs font-bold">+{distributionChannels.length - 5}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Next Action */}
          {nextAction && (
            <div className="pt-6 border-t border-white/5">
              <div className="group/action relative flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 border-l-4 border-primary shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all duration-300 animate-pulse-slow">
                <div className="p-2 rounded-lg bg-primary/20 group-hover/action:scale-110 transition-transform">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-primary/70 font-medium">Next Action</p>
                  <p className="text-sm font-bold text-foreground">{nextAction}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center gap-3 pt-6 border-t border-white/5">
            <Button onClick={(e) => { e.stopPropagation(); onView(campaign.id); }} className="flex-1 font-bold hover:scale-105 transition-transform">
              View Campaign
            </Button>
            <Button variant="outline" size="icon" className="hover:bg-primary/10 hover:scale-110 transition-all">
              <TrendingUp className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};