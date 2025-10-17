import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { contentFormats } from '@/components/content-repurposing/formats';
import { motion } from 'framer-motion';

interface RepurposedContentIconsProps {
  repurposedFormats: string[];
  onFormatClick: (formatId: string) => void;
  className?: string;
}

export const RepurposedContentIcons: React.FC<RepurposedContentIconsProps> = ({
  repurposedFormats,
  onFormatClick,
  className = ''
}) => {
  // Safety check: ensure repurposedFormats is an array
  if (!Array.isArray(repurposedFormats) || repurposedFormats.length === 0) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className={`space-y-3 ${className}`}>
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium text-foreground">Repurposed Content</h4>
          <Badge variant="outline" className="text-xs">
            {repurposedFormats.length} format{repurposedFormats.length !== 1 ? 's' : ''}
          </Badge>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {repurposedFormats.map((formatId) => {
            const format = contentFormats.find(f => f.id === formatId);
            if (!format) return null;
            
            const IconComponent = format.icon;
            
            return (
              <Tooltip key={formatId}>
                <TooltipTrigger asChild>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onFormatClick(formatId)}
                      className="h-10 w-10 p-0 hover:bg-primary/10 hover:border-primary/50 transition-colors"
                    >
                      <IconComponent className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View {format.name}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
};