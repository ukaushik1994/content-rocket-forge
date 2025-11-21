import React, { useState } from 'react';
import { SavedCampaign } from '@/services/campaignService';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { CampaignStatusBadge } from './CampaignStatusBadge';
import { CampaignStatus } from '@/types/campaign-types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Calendar,
  MoreVertical,
  Pencil,
  Trash2,
  Archive,
  Eye,
  FileText,
  Target,
  Clock,
  TrendingUp,
  CheckCircle2,
  Share2,
  Mail,
  Video,
  DollarSign,
  MessageCircle,
  Search,
} from 'lucide-react';
import { format } from 'date-fns';
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
  const hasStrategy = !!campaign.selected_strategy;
  const contentCount = campaign.contentCount || 0;
  const plannedCount = campaign.plannedCount || 0;
  const progressPercentage = campaign.progressPercentage || 0;
  const estimatedReach = campaign.estimatedReach || 'TBD';
  const timeline = campaign.timeline || campaign.selected_strategy?.timeline || 'Ongoing';
  const goal = campaign.goal || 'Brand Awareness';
  const channels = campaign.distributionChannels || [];

  // Progress bar color based on percentage
  const getProgressColor = () => {
    if (progressPercentage >= 70) return 'bg-emerald-500';
    if (progressPercentage >= 30) return 'bg-amber-500';
    return 'bg-red-500';
  };

  // Status border color
  const getStatusBorderColor = () => {
    switch (campaign.status) {
      case 'active':
        return 'border-primary/40 hover:border-primary/60';
      case 'completed':
        return 'border-emerald-500/40 hover:border-emerald-500/60';
      case 'archived':
        return 'border-muted/40 hover:border-muted/60';
      default:
        return 'border-border/40 hover:border-border/60';
    }
  };

  return (
    <GlassCard
      className={cn(
        'p-5 transition-all group relative overflow-hidden',
        getStatusBorderColor()
      )}
    >
      {/* Gradient overlay based on status */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className={cn(
          'absolute inset-0',
          campaign.status === 'active' && 'bg-gradient-to-br from-primary/5 to-transparent',
          campaign.status === 'completed' && 'bg-gradient-to-br from-emerald-500/5 to-transparent',
        )} />
      </div>

      <div className="relative space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="flex gap-2">
                <Input
                  value={editingName}
                  onChange={(e) => onEditingNameChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onSaveEdit();
                    if (e.key === 'Escape') onCancelEdit();
                  }}
                  className="h-9 text-sm"
                  autoFocus
                />
                <Button
                  size="sm"
                  onClick={onSaveEdit}
                  className="h-9 w-9 p-0"
                >
                  <CheckCircle2 className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                {campaign.name}
              </h3>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-60 group-hover:opacity-100">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onView}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
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
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Status & Date Row */}
        <div className="flex items-center justify-between">
          <CampaignStatusBadge status={campaign.status as CampaignStatus || 'draft'} />
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            {campaign.created_at ? format(new Date(campaign.created_at), 'MMM d, yyyy') : 'N/A'}
          </div>
        </div>

        {hasStrategy ? (
          <>
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {/* Content Progress */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <FileText className="h-3.5 w-3.5" />
                  <span className="font-medium">Content</span>
                </div>
                <p className="text-sm font-semibold">
                  {contentCount} of {plannedCount}
                </p>
              </div>

              {/* Estimated Reach */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span className="font-medium">Reach</span>
                </div>
                <p className="text-sm font-semibold truncate">
                  {estimatedReach}
                </p>
              </div>

              {/* Timeline */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span className="font-medium">Timeline</span>
                </div>
                <p className="text-sm font-semibold truncate">
                  {timeline}
                </p>
              </div>

              {/* Goal */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Target className="h-3.5 w-3.5" />
                  <span className="font-medium">Goal</span>
                </div>
                <Badge variant="secondary" className="text-xs px-2 py-0.5 truncate max-w-full">
                  {goal}
                </Badge>
              </div>
            </div>

            {/* Progress Bar */}
            {plannedCount > 0 && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-medium">Progress</span>
                  <span className="font-semibold">{progressPercentage}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            )}

            {/* Distribution Channels */}
            {channels.length > 0 && (
              <div className="flex items-center gap-2 pt-2">
                <span className="text-xs text-muted-foreground font-medium">Channels:</span>
                <div className="flex items-center gap-1.5">
                  {channels.slice(0, 4).map((channel, idx) => {
                    const normalizedChannel = channel.toLowerCase();
                    const icon = channelIcons[normalizedChannel] || <Share2 className="h-3.5 w-3.5" />;
                    return (
                      <div
                        key={idx}
                        className="p-1.5 rounded-md bg-primary/10 text-primary"
                        title={channel}
                      >
                        {icon}
                      </div>
                    );
                  })}
                  {channels.length > 4 && (
                    <span className="text-xs text-muted-foreground ml-1">
                      +{channels.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          /* No Strategy State */
          <div className="py-4 text-center border border-dashed border-border/50 rounded-lg">
            <p className="text-sm text-muted-foreground">Strategy Pending</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Complete conversation to generate strategy
            </p>
          </div>
        )}

        {/* View Campaign Button */}
        <Button
          onClick={onView}
          variant="outline"
          size="sm"
          className="w-full mt-2"
        >
          <Eye className="h-4 w-4 mr-2" />
          View Campaign
        </Button>
      </div>
    </GlassCard>
  );
};
