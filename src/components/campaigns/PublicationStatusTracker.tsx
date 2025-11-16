import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Calendar, Globe, CheckCircle2, Clock } from 'lucide-react';
import { ContentItemType } from '@/contexts/content/types';
import { format } from 'date-fns';

interface PublicationStatusTrackerProps {
  contentItems: ContentItemType[];
}

export const PublicationStatusTracker = ({ contentItems }: PublicationStatusTrackerProps) => {
  const publishedItems = contentItems.filter(item => 
    (item.metadata as any)?.published_url
  );
  const scheduledItems = contentItems.filter(item => 
    (item.metadata as any)?.scheduled_date && !(item.metadata as any)?.published_url
  );
  const pendingItems = contentItems.filter(item => 
    !(item.metadata as any)?.published_url && !(item.metadata as any)?.scheduled_date && item.approval_status === 'approved'
  );

  const getPublishedUrl = (item: ContentItemType) => {
    return (item.metadata as any)?.published_url as string | undefined;
  };

  const getPlatform = (item: ContentItemType) => {
    return (item.metadata as any)?.published_platform as string | undefined;
  };

  const getPublishedDate = (item: ContentItemType) => {
    return (item.metadata as any)?.published_at as string | undefined;
  };

  const getScheduledDate = (item: ContentItemType) => {
    return (item.metadata as any)?.scheduled_date as string | undefined;
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Publication Status</h3>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>{publishedItems.length} Published</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>{scheduledItems.length} Scheduled</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-500" />
              <span>{pendingItems.length} Ready</span>
            </div>
          </div>
        </div>

        {publishedItems.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Published Content</h4>
            <div className="space-y-2">
              {publishedItems.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-3 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{item.title}</div>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        {getPlatform(item) && (
                          <Badge variant="secondary" className="text-xs">
                            {getPlatform(item)}
                          </Badge>
                        )}
                        {getPublishedDate(item) && (
                          <span>
                            Published {format(new Date(getPublishedDate(item)!), 'MMM d, yyyy')}
                          </span>
                        )}
                      </div>
                    </div>
                    {getPublishedUrl(item) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                      >
                        <a
                          href={getPublishedUrl(item)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {scheduledItems.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Scheduled Content</h4>
            <div className="space-y-2">
              {scheduledItems.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-3 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 mt-1 text-blue-500" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{item.title}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Scheduled for {format(new Date(getScheduledDate(item)!), 'MMM d, yyyy')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {publishedItems.length === 0 && scheduledItems.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Globe className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No published or scheduled content yet</p>
          </div>
        )}
      </div>
    </Card>
  );
};
