
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { ContentItemType } from '@/contexts/content/types';
import ContentSummary from './ContentSummary';
import FormatsList from './FormatsList';
import SelectButton from './SelectButton';
import { FileText, Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DeleteConfirmationDialog } from '@/components/content/repository/DeleteConfirmationDialog';
import { formatDistance } from 'date-fns';

interface ContentItemProps {
  item: ContentItemType;
  onSelectContent: (contentId: string) => void;
  onOpenRepurposedContent: (contentId: string, formatId: string) => void;
  onDeleteContent?: (contentId: string, formatId: string) => Promise<boolean>;
  isDeleting?: boolean;
  viewType?: 'new' | 'repurposed';
  isSelected?: boolean;
}

const ContentItem: React.FC<ContentItemProps> = ({
  item,
  onSelectContent,
  onOpenRepurposedContent,
  onDeleteContent,
  isDeleting = false,
  viewType = 'new',
  isSelected = false
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Count repurposed formats
  const repurposedFormats = item.metadata?.repurposedFormats || [];
  const formatCount = repurposedFormats.length;
  
  const isRepurposed = formatCount > 0;
  const recentlyUpdated = new Date(item.updated_at).getTime() > Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days
  
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (onDeleteContent) {
      await onDeleteContent(item.id, '');
    }
    setIsDeleteDialogOpen(false);
  };

  // Calculate how long ago the content was updated
  const timeAgo = formatDistance(
    new Date(item.updated_at),
    new Date(),
    { addSuffix: true }
  );
  
  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ scale: 1.01 }}
        className="card-3d relative"
      >
        <Card 
          className={`
            cursor-pointer overflow-hidden backdrop-blur-md border transition-all duration-300
            ${isSelected 
              ? 'border-neon-purple ring-1 ring-neon-purple/30 bg-gradient-to-br from-neon-purple/10 to-neon-blue/5' 
              : 'border-white/10 hover:border-white/20 bg-black/40 hover:bg-black/50'}
          `}
          onClick={() => onSelectContent(item.id)}
        >
          <CardContent className="p-4">
            <div className="flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center mr-2 
                    ${viewType === 'repurposed' || isSelected
                      ? 'bg-gradient-to-r from-neon-purple to-neon-blue' 
                      : 'bg-white/10'}
                  `}>
                    <FileText className={`h-4 w-4 ${(viewType === 'repurposed' || isSelected) ? 'text-white' : 'text-gray-400'}`} />
                  </div>
                  
                  <div className="flex flex-col">
                    <h3 className="text-sm font-medium line-clamp-1">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{timeAgo}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {recentlyUpdated && (
                    <Badge className="bg-neon-purple text-white h-5">New</Badge>
                  )}
                  
                  {isRepurposed && (
                    <Badge className="bg-gradient-to-r from-neon-purple to-neon-blue text-white">
                      {formatCount} {formatCount === 1 ? 'Format' : 'Formats'}
                    </Badge>
                  )}
                </div>
              </div>
              
              <ContentSummary title={item.title} content={item.content} />
              
              {/* Format indicators with animated, clickable icons */}
              <FormatsList 
                item={item}
                onOpenRepurposedContent={onOpenRepurposedContent}
              />
              
              <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/5">
                {onDeleteContent && (
                  <motion.div 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-400 hover:bg-red-500/10 h-8 px-2"
                      onClick={handleDeleteClick}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </motion.div>
                )}
                
                <div className="ml-auto">
                  <SelectButton 
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectContent(item.id);
                    }}
                    viewType={viewType}
                    isRepurposed={isRepurposed}
                    isSelected={isSelected}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        title={item.title}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default ContentItem;
