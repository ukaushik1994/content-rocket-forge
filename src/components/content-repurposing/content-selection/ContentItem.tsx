
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { ContentItemType } from '@/contexts/content/types';
import ContentSummary from './ContentSummary';
import FormatsList from './FormatsList';
import SelectButton from './SelectButton';
import { FileText } from 'lucide-react';

interface ContentItemProps {
  item: ContentItemType;
  onSelectContent: (contentId: string) => void;
  onOpenRepurposedContent: (contentId: string, formatId: string) => void;
  viewType?: 'new' | 'repurposed';
}

const ContentItem: React.FC<ContentItemProps> = ({
  item,
  onSelectContent,
  onOpenRepurposedContent,
  viewType = 'new'
}) => {
  // Count repurposed formats
  const repurposedFormats = item.metadata?.repurposedFormats || [];
  const formatCount = repurposedFormats.length;
  
  const isRepurposed = formatCount > 0;
  const recentlyUpdated = new Date(item.updated_at).getTime() > Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.01 }}
      className="card-3d"
    >
      <Card 
        className={`cursor-pointer hover:bg-accent/5 overflow-hidden backdrop-blur-sm border transition-all duration-200
          ${viewType === 'repurposed' 
            ? 'bg-gradient-to-br from-neon-purple/10 to-neon-blue/5 border-neon-purple/20' 
            : 'bg-black/30 border-white/10'}`}
        onClick={() => onSelectContent(item.id)}
      >
        <CardContent className="p-4">
          <div className="flex flex-col">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 
                  ${viewType === 'repurposed' 
                    ? 'bg-gradient-to-r from-neon-purple to-neon-blue' 
                    : 'bg-white/10'}`}>
                  <FileText className={`h-4 w-4 ${viewType === 'repurposed' ? 'text-white' : 'text-gray-400'}`} />
                </div>
                {recentlyUpdated && (
                  <Badge className="bg-neon-purple text-white ml-2 h-5">New</Badge>
                )}
              </div>
              
              {isRepurposed && (
                <Badge className="bg-gradient-to-r from-neon-purple to-neon-blue text-white">
                  {formatCount} {formatCount === 1 ? 'Format' : 'Formats'}
                </Badge>
              )}
            </div>
            
            <ContentSummary title={item.title} content={item.content} />
            
            {/* Format indicators with animated, clickable icons */}
            <FormatsList 
              item={item}
              onOpenRepurposedContent={onOpenRepurposedContent}
            />
            
            <div className="flex justify-end mt-3">
              <SelectButton 
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectContent(item.id);
                }}
                viewType={viewType}
                isRepurposed={isRepurposed}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ContentItem;
