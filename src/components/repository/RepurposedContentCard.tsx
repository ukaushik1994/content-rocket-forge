import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Link2 } from 'lucide-react';
import { UnifiedContentItem } from '@/hooks/useRepositoryContent';
import { getPlatformConfig } from '@/utils/platformIcons';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';

interface RepurposedContentCardProps {
  item: UnifiedContentItem;
  onView: () => void;
  onViewSource?: () => void;
}

export const RepurposedContentCard: React.FC<RepurposedContentCardProps> = ({
  item,
  onView,
  onViewSource,
}) => {
  const platform = getPlatformConfig(item.formatCode);
  const IconComponent = platform.icon;

  const preview = item.content
    ?.replace(/[#*_`>\-\[\]()]/g, '')
    ?.substring(0, 150)
    ?.trim();

  const item_variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.div variants={item_variants} whileHover={{ y: -6, scale: 1.02 }} className="h-full">
      <Card className="glass-card hover:neon-border transition-all duration-500 overflow-hidden group h-full
        hover:shadow-[0_20px_40px_rgba(155,135,245,0.3)]">
        <CardContent className="p-5 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2.5 rounded-xl ${platform.bgColor || 'bg-muted'} ${platform.color}`}>
              {IconComponent && <IconComponent className="h-5 w-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <Badge variant="outline" className="text-xs mb-1">
                {platform.name}
              </Badge>
            </div>
            <Badge
              variant="secondary"
              className="text-xs bg-accent/50 text-accent-foreground"
            >
              {item.status}
            </Badge>
          </div>

          {/* Title */}
          <h3 className="text-sm font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {item.title}
          </h3>

          {/* Preview */}
          {preview && (
            <p className="text-xs text-muted-foreground line-clamp-3 mb-3 flex-1">
              {preview}...
            </p>
          )}

          {/* Source link badge */}
          {item.sourceContentTitle && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewSource?.();
              }}
              className="inline-flex items-center gap-1.5 text-xs text-primary/80 hover:text-primary 
                bg-primary/10 hover:bg-primary/20 rounded-full px-3 py-1.5 mb-3 transition-colors w-fit"
            >
              <Link2 className="h-3 w-3" />
              <span className="truncate max-w-[180px]">From: {item.sourceContentTitle}</span>
            </button>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-border/30 mt-auto">
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
            </span>
            <Button variant="outline" size="sm" onClick={onView}
              className="glass-card border-primary/30 text-xs hover:border-primary/60 hover:bg-primary/10">
              <Eye className="h-3.5 w-3.5 mr-1" />
              View
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
