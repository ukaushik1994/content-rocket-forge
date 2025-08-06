import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { FileText, Sparkles, AlertCircle } from 'lucide-react';
import { TemplatePopup } from './template-popup';

interface TemplateIndicatorProps {
  templateName?: string;
  isUsingTemplate: boolean;
  formatType: string;
  className?: string;
  onTemplateSelect?: (template: any) => void;
}

export const TemplateIndicator: React.FC<TemplateIndicatorProps> = ({
  templateName,
  isUsingTemplate,
  formatType,
  className = '',
  onTemplateSelect
}) => {
  const [showTemplatePopup, setShowTemplatePopup] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowTemplatePopup(true);
  };

  if (isUsingTemplate && templateName) {
    return (
      <>
        <Tooltip>
          <TooltipTrigger>
            <Badge 
              variant="secondary" 
              className={`gap-1.5 text-xs bg-green-950/20 text-green-400 border-green-800/30 hover:bg-green-950/30 cursor-pointer ${className}`}
              onClick={handleClick}
            >
              <FileText className="h-3 w-3" />
              Custom Template
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-medium">Using template: {templateName}</p>
            <p className="text-xs opacity-75">Format: {formatType}</p>
            <p className="text-xs opacity-75 mt-1">Click to view all templates</p>
          </TooltipContent>
        </Tooltip>
        
        <TemplatePopup 
          open={showTemplatePopup}
          onOpenChange={setShowTemplatePopup}
          selectedFormatType={formatType}
          onTemplateSelect={onTemplateSelect}
        />
      </>
    );
  }

  return (
    <>
      <Tooltip>
        <TooltipTrigger>
          <Badge 
            variant="outline" 
            className={`gap-1.5 text-xs bg-amber-950/20 text-amber-400 border-amber-800/30 hover:bg-amber-950/30 cursor-pointer ${className}`}
            onClick={handleClick}
          >
            <Sparkles className="h-3 w-3" />
            Default Prompt
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">Using default prompt for {formatType}</p>
          <p className="text-xs opacity-75">Consider creating a custom template for better results</p>
          <p className="text-xs opacity-75 mt-1">Click to view templates</p>
        </TooltipContent>
      </Tooltip>
      
      <TemplatePopup 
        open={showTemplatePopup}
        onOpenChange={setShowTemplatePopup}
        selectedFormatType={formatType}
        onTemplateSelect={onTemplateSelect}
      />
    </>
  );
};

interface TemplateStatusProps {
  templateCount: number;
  isLoading: boolean;
  error?: string | null;
  className?: string;
  onTemplateSelect?: (template: any) => void;
}

export const TemplateStatus: React.FC<TemplateStatusProps> = ({
  templateCount,
  isLoading,
  error,
  className = '',
  onTemplateSelect
}) => {
  const [showTemplatePopup, setShowTemplatePopup] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoading && !error) {
      setShowTemplatePopup(true);
    }
  };

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
    <>
      <Tooltip>
        <TooltipTrigger>
          <Badge 
            variant="secondary" 
            className={`gap-1.5 text-xs cursor-pointer hover:bg-secondary/80 ${className}`}
            onClick={handleClick}
          >
            <FileText className="h-3 w-3" />
            {templateCount} Templates Ready
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">{templateCount} content templates available</p>
          <p className="text-xs opacity-75">Ready for content generation</p>
          <p className="text-xs opacity-75 mt-1">Click to view all templates</p>
        </TooltipContent>
      </Tooltip>
      
      <TemplatePopup 
        open={showTemplatePopup}
        onOpenChange={setShowTemplatePopup}
        onTemplateSelect={onTemplateSelect}
      />
    </>
  );
};