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
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface EnhancedCampaignCardProps {
  campaign: SavedCampaign;
  onView: () => void;
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
    gradient: 'from-gray-500/20 to-gray-600/20',
    border: 'border-gray-500/30',
    badge: 'bg-gray-500/20 text-gray-400 border-gray-400/30',
    label: 'Draft',
  },
  planned: {
    gradient: 'from-blue-500/20 to-cyan-500/20',
    border: 'border-blue-500/30',
    badge: 'bg-blue-500/20 text-blue-400 border-blue-400/30',
    label: 'Planned',
  },
  active: {
    gradient: 'from-purple-500/20 to-pink-500/20',
    border: 'border-purple-500/30',
    badge: 'bg-purple-500/20 text-purple-400 border-purple-400/30',
    label: 'Active',
  },
  completed: {
    gradient: 'from-green-500/20 to-emerald-500/20',
    border: 'border-green-500/30',
    badge: 'bg-green-500/20 text-green-400 border-green-400/30',
    label: 'Completed',
  },
  archived: {
    gradient: 'from-gray-500/20 to-gray-600/20',
    border: 'border-gray-500/30',
    badge: 'bg-gray-500/20 text-gray-400 border-gray-400/30',
    label: 'Archived',
  },
};

const timelineStatusConfig = {
  'on-track': { icon: CheckCircle2, color: 'text-green-400', label: 'On track' },
  'behind': { icon: Clock, color: 'text-amber-400', label: 'Behind' },
  'overdue': { icon: AlertTriangle, color: 'text-red-400', label: 'Overdue' },
  'unknown': { icon: Clock, color: 'text-gray-400', label: 'TBD' },
};

const healthConfig = {
  healthy: 'border-green-500/30',
  warning: 'border-amber-500/30',
  critical: 'border-red-500/30',
};

const channelIcons: Record<string, React.ReactNode> = {
  'social': <Share2 className="h-3.5 w-3.5" />,
  'email': <Mail className="h-3.5 w-3.5" />,
  'webinars': <Video className="h-3.5 w-3.5" />,
  'blog': <FileText className="h-3.5 w-3.5" />,
  'paid ads': <DollarSign className="h-3.5 w-3.5" />,
  'events': <Calendar className="h-3.5 w-3.5" />,
  'seo': <Search className="h-3.5 w-3.5" />,
  'direct outreach': <MessageCircle className="h-3.5 w-3.5" />,
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
  const timelineConfig = timelineStatusConfig[campaign.timelineStatus || 'unknown'];
  const healthIndicator = campaign.healthIndicator || 'warning';
  const hasStrategy = !!campaign.selected_strategy;

  const progressPercentage = campaign.progressPercentage || 0;
  const progressColor = 
    progressPercentage >= 71 ? 'bg-green-500' :
    progressPercentage >= 31 ? 'bg-amber-500' :
    'bg-red-500';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <GlassCard
        className={cn(
          'p-6 bg-gradient-to-br border-2 hover:shadow-xl transition-all duration-300',
          config.gradient,
          config.border,
          healthConfig[healthIndicator]
        )}
      >
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={editingName}
                    onChange={(e) => onEditingNameChange(e.target.value)}
                    className="text-lg font-bold"
                    autoFocus
                  />
                  <Button size="sm" onClick={onSaveEdit}>Save</Button>
                  <Button size="sm" variant="outline" onClick={onCancelEdit}>Cancel</Button>
                </div>
              ) : (
                <h3 className="text-xl font-bold mb-1 line-clamp-2">{campaign.name}</h3>
              )}
              <div className="flex items-center gap-2 mt-2">
                <Badge className={config.badge}>{config.label}</Badge>
                {campaign.timelineStatus && (
                  <div className="flex items-center gap-1.5 text-sm">
                    <timelineConfig.icon className={`h-4 w-4 ${timelineConfig.color}`} />
                    <span className={timelineConfig.color}>{timelineConfig.label}</span>
                  </div>
                )}
                {campaign.created_at && (
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(campaign.created_at), { addSuffix: true })}
                  </span>
                )}
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onStartEdit}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Rename
                </DropdownMenuItem>
                {campaign.status !== 'archived' && (
                  <DropdownMenuItem onClick={onArchive}>
                    <Archive className="h-4 w-4 mr-2" />
                    Archive
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={onDelete} className="text-red-400">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Next Action Badge */}
          {campaign.nextAction && (
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm">
                <span className="text-muted-foreground">Next: </span>
                <span className="font-medium text-primary">{campaign.nextAction}</span>
              </p>
            </div>
          )}

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Content Progress */}
            <div className="p-3 rounded-lg bg-background/40">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Content Progress</span>
              </div>
              <p className="text-2xl font-bold">
                {campaign.contentCount || 0}
                <span className="text-sm text-muted-foreground">/{campaign.plannedCount || 0}</span>
              </p>
            </div>

            {/* Estimated Reach */}
            <div className="p-3 rounded-lg bg-background/40">
              <div className="flex items-center gap-2 mb-1">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Estimated Reach</span>
              </div>
              <p className="text-2xl font-bold">
                {campaign.estimatedReach || 'TBD'}
              </p>
            </div>

            {/* Timeline */}
            <div className="p-3 rounded-lg bg-background/40">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Timeline</span>
              </div>
              <p className="text-lg font-bold">
                {campaign.daysRemaining !== undefined
                  ? campaign.daysRemaining > 0
                    ? `${campaign.daysRemaining}d left`
                    : `${Math.abs(campaign.daysRemaining)}d overdue`
                  : campaign.timeline || 'TBD'}
              </p>
            </div>

            {/* Goal */}
            <div className="p-3 rounded-lg bg-background/40">
              <div className="flex items-center gap-2 mb-1">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Goal</span>
              </div>
              <p className="text-sm font-medium line-clamp-2">
                {campaign.goal || campaign.selected_strategy?.expectedEngagement || 'Awareness'}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Completion</span>
              <span className="text-sm font-bold">{progressPercentage}%</span>
            </div>
            <div className="h-2 bg-background/60 rounded-full overflow-hidden">
              <div
                className={`h-full ${progressColor} transition-all duration-500`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Distribution Channels */}
          {campaign.distributionChannels && campaign.distributionChannels.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Distribution Channels</p>
              <div className="flex gap-2">
                {campaign.distributionChannels.slice(0, 4).map((channel) => (
                  <Badge key={channel} variant="outline" className="text-xs">
                    {channel}
                  </Badge>
                ))}
                {campaign.distributionChannels.length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{campaign.distributionChannels.length - 4} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center gap-2 pt-4 border-t border-border/30">
            <Button onClick={onView} className="flex-1">
              View Campaign
            </Button>
            <Button variant="outline" size="icon" onClick={() => {}}>
              <TrendingUp className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};
