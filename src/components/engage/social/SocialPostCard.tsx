import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Calendar, MoreVertical, Pencil, Trash2, Clock, CheckCircle2, AlertCircle, FileEdit,
  Twitter, Linkedin, Instagram, Facebook, Copy, BarChart3,
} from 'lucide-react';

interface SocialPostCardProps {
  post: any;
  index: number;
  onEdit?: (post: any) => void;
  onDelete?: (postId: string) => void;
  onDuplicate?: (post: any) => void;
}

const statusConfig: Record<string, { label: string; icon: React.ElementType; className: string }> = {
  draft: { label: 'Draft', icon: FileEdit, className: 'bg-muted/50 text-muted-foreground border-border/50' },
  scheduled: { label: 'Scheduled', icon: Clock, className: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  posted: { label: 'Posted', icon: CheckCircle2, className: 'bg-green-500/10 text-green-400 border-green-500/30' },
  failed: { label: 'Failed', icon: AlertCircle, className: 'bg-destructive/10 text-destructive border-destructive/30' },
};

const channelIcons: Record<string, React.ElementType> = {
  twitter: Twitter, linkedin: Linkedin, instagram: Instagram, facebook: Facebook,
};

const channelColors: Record<string, string> = {
  twitter: 'text-blue-400', linkedin: 'text-blue-500', instagram: 'text-pink-400', facebook: 'text-blue-600',
};

export const SocialPostCard: React.FC<SocialPostCardProps> = ({ post, index, onEdit, onDelete, onDuplicate }) => {
  const status = statusConfig[post.status] || statusConfig.draft;
  const StatusIcon = status.icon;
  const targets = post.social_post_targets || [];
  const charCount = post.content?.length || 0;
  const mediaUrls: string[] = post.media_urls || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <GlassCard className="p-4 hover:scale-[1.01] hover:border-primary/30 hover:shadow-xl transition-all duration-300 cursor-pointer group">
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0 space-y-2.5">
            <p className="text-sm text-foreground line-clamp-2 leading-relaxed">{post.content}</p>

            {/* Media Thumbnails */}
            {mediaUrls.length > 0 && (
              <div className="flex gap-1.5">
                {mediaUrls.slice(0, 4).map((url, i) => (
                  <img key={i} src={url} alt="" className="h-12 w-12 object-cover rounded-md border border-border/50" />
                ))}
                {mediaUrls.length > 4 && (
                  <div className="h-12 w-12 rounded-md border border-border/50 bg-muted/50 flex items-center justify-center text-xs text-muted-foreground">
                    +{mediaUrls.length - 4}
                  </div>
                )}
              </div>
            )}

            {/* Channel Icons + Schedule */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {targets.length > 0 && (
                <div className="flex items-center gap-1.5">
                  {targets.map((t: any) => {
                    const Icon = channelIcons[t.provider];
                    return Icon ? (
                      <div key={t.id} className={`p-1 rounded-md bg-background/60 ${channelColors[t.provider] || ''}`}>
                        <Icon className="h-3 w-3" />
                      </div>
                    ) : null;
                  })}
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{post.scheduled_at ? format(new Date(post.scheduled_at), 'MMM d, HH:mm') : 'Not scheduled'}</span>
              </div>
              <span className="text-muted-foreground/60">{charCount} chars</span>
            </div>

            {/* Analytics placeholder for posted items */}
            {post.status === 'posted' && (
              <div className="flex items-center gap-1.5">
                <Badge variant="outline" className="text-[10px] gap-1 bg-muted/30 text-muted-foreground border-border/30">
                  <BarChart3 className="h-2.5 w-2.5" /> Engagement: Coming Soon
                </Badge>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge variant="outline" className={`gap-1 text-xs ${status.className}`}>
              <StatusIcon className="h-3 w-3" />
              {status.label}
            </Badge>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(post)}>
                  <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDuplicate?.(post)}>
                  <Copy className="h-3.5 w-3.5 mr-2" /> Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onDelete?.(post.id)} className="text-destructive">
                  <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};
