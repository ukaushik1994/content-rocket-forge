
import React from 'react';
import { ContentItemType } from '@/contexts/content';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { StatusBadge } from './StatusBadge';
import { ScoreBadge } from './ScoreBadge';
import { Edit, BarChart2, Archive, FileText, Copy, Trash } from 'lucide-react';
import { toast } from 'sonner';

interface ContentDetailViewProps {
  item: ContentItemType | null;
  onEdit: (id: string) => void;
  onAnalyze: (id: string) => void;
  onPublish: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
}

export const ContentDetailView: React.FC<ContentDetailViewProps> = ({
  item,
  onEdit,
  onAnalyze,
  onPublish,
  onArchive,
  onDelete
}) => {
  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] border rounded-lg border-dashed border-border/60 bg-background/50">
        <FileText className="h-10 w-10 text-muted-foreground/40 mb-2" />
        <h3 className="text-lg font-medium text-muted-foreground">No Content Selected</h3>
        <p className="text-sm text-muted-foreground/60 mt-1">Select a content item to view details</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return 'Unknown date';
    }
  };

  const copyToClipboard = () => {
    if (item.content) {
      navigator.clipboard.writeText(item.content);
      toast.success('Content copied to clipboard');
    } else {
      toast.error('No content to copy');
    }
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader>
        <div className="flex flex-wrap gap-2 mb-2">
          <StatusBadge status={item.status} />
          <ScoreBadge score={item.seo_score || 0} />
          <span className="text-xs px-2 py-0.5 bg-secondary/50 rounded-md">
            Updated {formatDate(item.updated_at)}
          </span>
        </div>
        <CardTitle className="text-xl">{item.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto py-4">
        {item.keywords && item.keywords.length > 0 && (
          <div className="mb-4">
            <div className="text-sm font-medium mb-2">Keywords</div>
            <div className="flex flex-wrap gap-1.5">
              {item.keywords.map((keyword, i) => (
                <span
                  key={i}
                  className="inline-flex text-xs px-2 py-0.5 bg-secondary/50 rounded text-secondary-foreground"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}
        
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {item.content ? (
            <div className="whitespace-pre-wrap">{item.content}</div>
          ) : (
            <div className="italic text-muted-foreground">No content available</div>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t pt-3 flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={() => onEdit(item.id)}
        >
          <Edit className="h-3.5 w-3.5" />
          Edit
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={() => onAnalyze(item.id)}
        >
          <BarChart2 className="h-3.5 w-3.5" />
          Analyze
        </Button>
        {item.status === 'draft' && (
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => onPublish(item.id)}
          >
            <span className="text-xs">📤</span>
            Publish
          </Button>
        )}
        {item.status !== 'archived' && (
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => onArchive(item.id)}
          >
            <Archive className="h-3.5 w-3.5" />
            Archive
          </Button>
        )}
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={() => onDelete(item.id)}
        >
          <Trash className="h-3.5 w-3.5" />
          Delete
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1 ml-auto"
          onClick={copyToClipboard}
        >
          <Copy className="h-3.5 w-3.5" />
          Copy
        </Button>
      </CardFooter>
    </Card>
  );
};
