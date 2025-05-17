
import React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PromptTemplate } from '@/services/userPreferencesService';
import { Image, Carousel } from 'lucide-react';
import { getFormatTypeLabel } from '@/components/settings/prompt-templates/types';

interface ContentTemplateCardProps {
  template: PromptTemplate;
  onSelectTemplate: (template: PromptTemplate) => void;
}

export const ContentTemplateCard: React.FC<ContentTemplateCardProps> = ({
  template,
  onSelectTemplate
}) => {
  // Get the appropriate icon based on template format type
  const getTemplateIcon = () => {
    switch (template.formatType) {
      case 'carousel':
        return <Carousel className="h-5 w-5" />;
      case 'meme':
        return <Image className="h-5 w-5" />;
      default:
        return null;
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="mb-1">
            <div className="flex items-center gap-1">
              {getTemplateIcon()}
              <span>{getFormatTypeLabel(template.formatType)}</span>
            </div>
          </Badge>
        </div>
        <h3 className="text-lg font-medium">{template.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-3">
          {template.description}
        </p>
      </CardHeader>
      <CardContent className="pb-2 flex-grow">
        <div className="bg-muted rounded-md p-3 h-28 overflow-hidden">
          <p className="text-xs text-muted-foreground line-clamp-7">
            {template.promptTemplate.substring(0, 200)}
            {template.promptTemplate.length > 200 ? '...' : ''}
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={() => onSelectTemplate(template)}
        >
          Use Template
        </Button>
      </CardFooter>
    </Card>
  );
};
