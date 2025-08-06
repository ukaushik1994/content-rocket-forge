import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { FileText, Sparkles, AlertCircle } from 'lucide-react';

interface TemplateIndicatorProps {
  templateName?: string;
  isUsingTemplate: boolean;
  formatType: string;
  className?: string;
}

export const TemplateIndicator: React.FC<TemplateIndicatorProps> = ({
  templateName,
  isUsingTemplate,
  formatType,
  className = ''
}) => {
  if (isUsingTemplate && templateName) {
    return (
      <Tooltip>
        <TooltipTrigger>
          <Badge 
            variant="secondary" 
            className={`gap-1.5 text-xs bg-green-950/20 text-green-400 border-green-800/30 hover:bg-green-950/30 ${className}`}
          >
            <FileText className="h-3 w-3" />
            Custom Template
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">Using template: {templateName}</p>
          <p className="text-xs opacity-75">Format: {formatType}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger>
        <Badge 
          variant="outline" 
          className={`gap-1.5 text-xs bg-amber-950/20 text-amber-400 border-amber-800/30 hover:bg-amber-950/30 ${className}`}
        >
          <Sparkles className="h-3 w-3" />
          Default Prompt
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p className="font-medium">Using default prompt for {formatType}</p>
        <p className="text-xs opacity-75">Consider creating a custom template for better results</p>
      </TooltipContent>
    </Tooltip>
  );
};

interface TemplateStatusProps {
  templateCount: number;
  isLoading: boolean;
  error?: string | null;
  className?: string;
}

export const TemplateStatus: React.FC<TemplateStatusProps> = ({
  templateCount,
  isLoading,
  error,
  className = ''
}) => {
  if (isLoading) {
    return (
      <Badge variant="outline" className={`gap-1.5 text-xs animate-pulse ${className}`}>
        <Sparkles className="h-3 w-3 animate-spin" />
        Loading templates...
      </Badge>
    );
  }

  if (error) {
    return (
      <Tooltip>
        <TooltipTrigger>
          <Badge variant="destructive" className={`gap-1.5 text-xs ${className}`}>
            <AlertCircle className="h-3 w-3" />
            Template Error
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">Template initialization failed</p>
          <p className="text-xs opacity-75">{error}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger>
        <Badge variant="secondary" className={`gap-1.5 text-xs ${className}`}>
          <FileText className="h-3 w-3" />
          {templateCount} Templates Ready
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p className="font-medium">{templateCount} content templates available</p>
        <p className="text-xs opacity-75">Ready for content generation</p>
      </TooltipContent>
    </Tooltip>
  );
};