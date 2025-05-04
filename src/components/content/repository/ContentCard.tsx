
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ContentItemType } from '@/contexts/content';
import { Edit, ExternalLink, BarChart3, Clock, Tag } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { ScoreBadge } from './ScoreBadge';

interface ContentCardProps {
  item: ContentItemType;
  onEdit: () => void;
  onView: () => void;
  onAnalyze: () => void;
  onPublish?: () => void;
  onArchive?: () => void;
}

export const ContentCard: React.FC<ContentCardProps> = ({
  item,
  onEdit,
  onView,
  onAnalyze,
  onPublish,
  onArchive
}) => {
  // Format the date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card key={item.id} className="bg-glass border border-white/10 overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-white/20">
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-medium truncate">{item.title}</h3>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Updated {formatDate(item.updated_at)}</span>
            </div>
          </div>
          <StatusBadge status={item.status} />
        </div>
        
        <div className="flex flex-wrap gap-1 my-3 min-h-[28px]">
          {Array.isArray(item.keywords) && item.keywords.length > 0 ? (
            item.keywords.map((keyword, idx) => (
              <Badge key={idx} variant="outline" className="bg-white/5 text-xs">
                <Tag className="h-2.5 w-2.5 mr-1" />
                {keyword}
              </Badge>
            ))
          ) : (
            <div className="text-xs text-muted-foreground italic">No keywords</div>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <div>
            <div className="text-xs text-muted-foreground mb-1">SEO Score</div>
            <div className="flex items-center gap-1">
              <ScoreBadge score={item.seo_score} />
              <span className="text-xs font-medium">{item.seo_score}/100</span>
            </div>
          </div>
          
          <div className="flex gap-1">
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-8 w-8 p-0" 
              onClick={onEdit}
            >
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-8 w-8 p-0"
              onClick={onView}
            >
              <ExternalLink className="h-4 w-4" />
              <span className="sr-only">View</span>
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-8 w-8 p-0"
              onClick={onAnalyze}
            >
              <BarChart3 className="h-4 w-4" />
              <span className="sr-only">Analytics</span>
            </Button>
          </div>
        </div>
        
        {/* Status Action Buttons */}
        {item.status === 'draft' && onPublish && (
          <div className="mt-4 flex justify-end">
            <Button
              size="sm"
              variant="default"
              className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple"
              onClick={onPublish}
            >
              Publish
            </Button>
          </div>
        )}
        
        {item.status === 'published' && onArchive && (
          <div className="mt-4 flex justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={onArchive}
            >
              Archive
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
