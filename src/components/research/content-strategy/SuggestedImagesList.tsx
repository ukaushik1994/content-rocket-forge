import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Image as ImageIcon, LayoutDashboard, Monitor, PenTool, BarChart2 } from 'lucide-react';

interface SuggestedImage {
  type: 'hero' | 'infographic' | 'diagram' | 'screenshot' | 'illustration';
  description: string;
  purpose: string;
}

interface SuggestedImagesListProps {
  images: SuggestedImage[];
  compact?: boolean;
}

const getImageIcon = (type: string) => {
  switch (type) {
    case 'hero':
      return <ImageIcon className="h-3 w-3" />;
    case 'infographic':
      return <BarChart2 className="h-3 w-3" />;
    case 'diagram':
      return <LayoutDashboard className="h-3 w-3" />;
    case 'screenshot':
      return <Monitor className="h-3 w-3" />;
    case 'illustration':
      return <PenTool className="h-3 w-3" />;
    default:
      return <ImageIcon className="h-3 w-3" />;
  }
};

const getImageTypeColor = (type: string) => {
  switch (type) {
    case 'hero':
      return 'text-blue-400 bg-blue-500/10 border-blue-400/30';
    case 'infographic':
      return 'text-green-400 bg-green-500/10 border-green-400/30';
    case 'diagram':
      return 'text-purple-400 bg-purple-500/10 border-purple-400/30';
    case 'screenshot':
      return 'text-orange-400 bg-orange-500/10 border-orange-400/30';
    case 'illustration':
      return 'text-pink-400 bg-pink-500/10 border-pink-400/30';
    default:
      return 'text-muted-foreground bg-muted/10 border-border';
  }
};

export const SuggestedImagesList: React.FC<SuggestedImagesListProps> = ({ images, compact = false }) => {
  if (!images || images.length === 0) {
    return null;
  }

  if (compact) {
    return (
      <div className="flex items-center gap-1 flex-wrap">
        {images.slice(0, 3).map((image, index) => (
          <Badge
            key={index}
            variant="outline"
            className={`text-xs gap-1 ${getImageTypeColor(image.type)}`}
            title={image.description}
          >
            {getImageIcon(image.type)}
            {image.type}
          </Badge>
        ))}
        {images.length > 3 && (
          <Badge variant="outline" className="text-xs text-muted-foreground border-border bg-muted/10">
            +{images.length - 3} more
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {images.map((image, index) => (
        <div 
          key={index} 
          className="p-3 rounded-lg bg-muted/5 border border-border"
        >
          <div className="flex items-center gap-2 mb-1">
            <Badge
              variant="outline"
              className={`text-xs gap-1 ${getImageTypeColor(image.type)}`}
            >
              {getImageIcon(image.type)}
              {image.type}
            </Badge>
          </div>
          <p className="text-sm text-foreground mb-1">{image.description}</p>
          <p className="text-xs text-muted-foreground">{image.purpose}</p>
        </div>
      ))}
    </div>
  );
};
