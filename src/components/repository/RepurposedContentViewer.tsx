import React, { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Copy, 
  Download, 
  Edit, 
  Trash2, 
  Clock,
  User,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import { RepurposedContentRecord } from '@/services/repurposedContentService';
import { contentFormats, getFormatByIdOrDefault } from '@/components/content-repurposing/formats';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { MediaAssetsSection, MediaAsset } from '@/components/content/MediaAssetsSection';

interface RepurposedContentViewerProps {
  open: boolean;
  onClose: () => void;
  content: RepurposedContentRecord | null;
  availableFormats: string[];
  isLoading?: boolean;
  onFormatChange: (formatId: string) => void;
  onCopy: (content: string) => void;
  onDownload: (content: string, formatName: string) => void;
  onDelete: (contentId: string, formatId: string) => Promise<boolean>;
}

export const RepurposedContentViewer: React.FC<RepurposedContentViewerProps> = ({
  open,
  onClose,
  content,
  availableFormats,
  isLoading = false,
  onFormatChange,
  onCopy,
  onDownload,
  onDelete
}) => {
  const [isDeleting, setIsDeleting] = React.useState(false);

  if (!content) return null;

  const format = getFormatByIdOrDefault(content.format_code);
  const IconComponent = format.icon;
  const personas = content.metadata?.personas || [];
  
  // Get any images associated with repurposed content
  const generatedImages: MediaAsset[] = useMemo(() => {
    const images = content.metadata?.generated_images || [];
    if (!Array.isArray(images)) return [];
    return images.map((img: any, index: number) => ({
      id: img.id || `image-${index}`,
      url: img.url,
      type: 'image' as const,
      prompt: img.prompt,
      alt: img.alt || img.prompt
    }));
  }, [content]);

  const handleCopy = () => {
    onCopy(content.content);
    toast.success('Content copied to clipboard');
  };

  const handleDownload = () => {
    onDownload(content.content, format.name);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const success = await onDelete(content.content_id, content.format_code);
      if (success) {
        onClose();
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <IconComponent className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl text-foreground">
                {format.name}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                {format.description}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 space-y-4">
          {/* Format Selector */}
          {Array.isArray(availableFormats) && availableFormats.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {availableFormats.map(formatId => {
                const fmt = contentFormats.find(f => f.id === formatId);
                if (!fmt) return null;
                
                return (
                  <Button
                    key={formatId}
                    variant={formatId === content.format_code ? "default" : "outline"}
                    size="sm"
                    onClick={() => onFormatChange(formatId)}
                    className="flex-shrink-0"
                  >
                    <fmt.icon className="h-3.5 w-3.5 mr-1" />
                    {fmt.name}
                  </Button>
                );
              })}
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-muted/5">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Created</span>
                </div>
                <p className="text-sm font-medium mt-1">
                  {formatDistanceToNow(new Date(content.created_at), { addSuffix: true })}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-muted/5">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Personas</span>
                </div>
                <p className="text-sm font-medium mt-1">
                  {personas.length > 0 ? `${personas.length} persona${personas.length !== 1 ? 's' : ''}` : 'Default'}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-muted/5">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline" className="text-xs">
                    v{content.version}
                  </Badge>
                  <span className="text-muted-foreground text-sm">Version</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Media Assets Section */}
          {generatedImages.length > 0 && (
            <Card className="bg-muted/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-primary" />
                  Associated Media
                  <Badge variant="secondary" className="text-xs">{generatedImages.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MediaAssetsSection
                  images={generatedImages}
                  isCollapsible={false}
                  showVideoPlaceholder={true}
                  showEmptyState={false}
                  compact={true}
                />
              </CardContent>
            </Card>
          )}

          {/* Content */}
          <Card className="flex-1 min-h-0">
            <CardHeader>
              <CardTitle className="text-lg">Generated Content</CardTitle>
            </CardHeader>
            <CardContent className="h-full min-h-0">
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <ScrollArea className="h-full min-h-[200px] border rounded-lg">
                  <div className="p-4 text-sm whitespace-pre-wrap text-foreground leading-relaxed">
                    {content.content}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy}>
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-destructive hover:text-destructive"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-1" />
                )}
                Delete
              </Button>
              <Button onClick={onClose}>Close</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};