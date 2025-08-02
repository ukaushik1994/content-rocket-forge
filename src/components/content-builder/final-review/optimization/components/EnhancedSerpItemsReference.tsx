import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Globe, TrendingUp, Users, MapPin, Image, Video } from 'lucide-react';
import { useContentBuilder } from '@/contexts/content-builder/ContentBuilderContext';

interface EnhancedSerpItemsReferenceProps {
  onIncorporateAllSerp: () => void;
}

export const EnhancedSerpItemsReference: React.FC<EnhancedSerpItemsReferenceProps> = ({
  onIncorporateAllSerp
}) => {
  const { state } = useContentBuilder();
  const { serpSelections } = state;
  
  const selectedItems = serpSelections?.filter(item => item.selected) || [];
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'localBusiness': return <MapPin className="h-3 w-3" />;
      case 'multimedia_image': return <Image className="h-3 w-3" />;
      case 'multimedia_video': return <Video className="h-3 w-3" />;
      case 'featuredSnippet': return <TrendingUp className="h-3 w-3" />;
      case 'relatedEntity': return <Users className="h-3 w-3" />;
      default: return <Globe className="h-3 w-3" />;
    }
  };
  
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'localBusiness': return 'bg-green-500/10 text-green-500 border-green-500/30';
      case 'multimedia_image': return 'bg-purple-500/10 text-purple-500 border-purple-500/30';
      case 'multimedia_video': return 'bg-red-500/10 text-red-500 border-red-500/30';
      case 'featuredSnippet': return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
      case 'relatedEntity': return 'bg-amber-500/10 text-amber-500 border-amber-500/30';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };
  
  const formatTypeName = (type: string) => {
    return type.replace(/([A-Z])/g, ' $1')
              .replace(/_/g, ' ')
              .replace(/^./, str => str.toUpperCase());
  };

  if (selectedItems.length === 0) {
    return (
      <Card className="bg-background/50 border-border/50">
        <CardContent className="p-4 text-center">
          <Globe className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
          <p className="text-sm text-muted-foreground">No SERP items selected</p>
          <p className="text-xs text-muted-foreground mt-1">
            Select SERP items in the research step to include them in optimization
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-background/50 border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Selected SERP Items ({selectedItems.length})
          </CardTitle>
          <Button 
            size="sm" 
            variant="outline"
            onClick={onIncorporateAllSerp}
            className="text-xs h-7 px-2"
          >
            Incorporate All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-32">
          <div className="space-y-2">
            {selectedItems.map((item, index) => (
              <div 
                key={`serp-${index}-${item.type}`}
                className="flex items-start gap-2 p-2 bg-background/30 rounded-md border border-border/30"
              >
                <div className="mt-0.5">
                  {getTypeIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getTypeColor(item.type)}`}
                    >
                      {formatTypeName(item.type)}
                    </Badge>
                  </div>
                  <p className="text-xs text-foreground/80 line-clamp-2">
                    {item.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
