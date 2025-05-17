
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Pencil, Trash, Eye, LayoutGrid, Image } from 'lucide-react';
import { PromptTemplate } from '@/services/userPreferences';
import { getFormatTypeLabel } from './types';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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
  const getFormatIcon = (formatType: string) => {
    switch (formatType) {
      case 'carousel':
        return <LayoutGrid className="h-4 w-4 mr-1" />;
      case 'meme':
        return <Image className="h-4 w-4 mr-1" />;
      default:
        return null;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className="flex items-center">
            {getFormatIcon(template.formatType)}
            {getFormatTypeLabel(template.formatType)}
          </Badge>
        </div>
        <CardTitle className="text-lg">{template.name}</CardTitle>
        <CardDescription className="line-clamp-2">{template.description}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="bg-muted p-3 rounded-md h-[100px] overflow-hidden text-xs text-muted-foreground">
          <div className="line-clamp-5">
            {template.promptTemplate.substring(0, 200)}
            {template.promptTemplate.length > 200 ? '...' : ''}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div className="text-xs text-muted-foreground">
          {new Date(template.updatedAt).toLocaleDateString()}
        </div>
        
        <div className="flex gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => onPreview(template)}>
                <Eye className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Preview</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => onEdit(template)}>
                <Pencil className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => onDuplicate(template)}>
                <Copy className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Duplicate</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => onDelete(template)}>
                <Trash className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete</TooltipContent>
          </Tooltip>
        </div>
      </CardFooter>
    </Card>
  );
};
