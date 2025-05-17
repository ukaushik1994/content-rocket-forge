
import React from 'react';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Copy, FileText, Image } from 'lucide-react';
import { PromptTemplate } from '@/services/userPreferences';
import { getFormatTypeLabel } from './types';

interface TemplateCardProps {
  template: PromptTemplate;
  onEdit: (template: PromptTemplate) => void;
  onDuplicate: (template: PromptTemplate) => void;
  onDelete: (template: PromptTemplate) => void;
  onPreview: (template: PromptTemplate) => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onEdit,
  onDuplicate,
  onDelete,
  onPreview
}) => {
  // Get the appropriate icon based on template format type
  const getFormatIcon = () => {
    switch (template.formatType) {
      case 'carousel':
        return <span className="flex items-center">📊</span>;
      case 'meme':
        return <Image className="h-4 w-4 mr-1" />;
      default:
        return <FileText className="h-4 w-4 mr-1" />;
    }
  };

  return (
    <Card key={template.id} className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge variant="outline">
            <div className="flex items-center">
              {getFormatIcon()}
              <span>{getFormatTypeLabel(template.formatType)}</span>
            </div>
          </Badge>
          <div className="flex space-x-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={() => onEdit(template)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={() => onDuplicate(template)}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-destructive hover:text-destructive" 
              onClick={() => onDelete(template)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardTitle className="text-lg mt-2">{template.name}</CardTitle>
        {template.description && (
          <CardDescription className="line-clamp-2">{template.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="pb-2">
        <div className="bg-muted rounded-md p-3 overflow-hidden">
          <p className="text-xs text-muted-foreground line-clamp-4">{template.promptTemplate}</p>
        </div>
      </CardContent>
      <CardFooter className="pt-1">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full" 
          onClick={() => onPreview(template)}
        >
          Preview Template
        </Button>
      </CardFooter>
    </Card>
  );
};
