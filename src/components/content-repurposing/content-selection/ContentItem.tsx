
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ContentItemType } from '@/contexts/content/types';
import { TooltipProvider } from '@/components/ui/tooltip';
import { contentFormats } from '@/components/content-builder/final-review/tabs/RepurposeTab';
import ContentFormatIcon from './ContentFormatIcon';

interface ContentItemProps {
  item: ContentItemType;
  onSelectContent: (contentId: string) => void;
  onOpenRepurposedContent: (contentId: string, formatId: string) => void;
}

const ContentItem: React.FC<ContentItemProps> = ({
  item,
  onSelectContent,
  onOpenRepurposedContent
}) => {
  // Check if a content item has been repurposed for a specific format
  const hasRepurposedFormat = (item: ContentItemType, formatId: string): boolean => {
    // Check if this content has repurposed formats stored in metadata
    const repurposedFormats = item.metadata?.repurposedFormats || [];
    return repurposedFormats.includes(formatId);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.01 }}
      className="card-3d"
    >
      <Card 
        className="cursor-pointer hover:bg-accent/5 overflow-hidden backdrop-blur-sm bg-black/30 border border-white/10 transition-all duration-200"
        onClick={() => onSelectContent(item.id)}
      >
        <CardContent className="p-4">
          <div className="flex flex-col">
            <h3 className="font-medium text-white">{item.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {item.content?.substring(0, 120)}...
            </p>
            
            {/* Format indicators with animated, clickable icons */}
            <div className="flex flex-wrap gap-2 mt-3 mb-2">
              <TooltipProvider>
                {contentFormats.map(format => {
                  const isFormatUsed = hasRepurposedFormat(item, format.id);
                  return (
                    <ContentFormatIcon 
                      key={format.id}
                      formatId={format.id}
                      isFormatUsed={isFormatUsed}
                      onClick={(e) => {
                        if (isFormatUsed) {
                          e.stopPropagation();
                          onOpenRepurposedContent(item.id, format.id);
                        }
                      }}
                    />
                  );
                })}
              </TooltipProvider>
            </div>
            
            <div className="flex justify-end mt-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs text-neon-purple hover:text-neon-blue hover:bg-white/5"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectContent(item.id);
                }}
              >
                Select for Repurposing →
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ContentItem;
