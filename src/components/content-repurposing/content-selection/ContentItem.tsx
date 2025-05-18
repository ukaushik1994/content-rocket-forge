
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { ContentItemType } from '@/contexts/content/types';
import ContentSummary from './ContentSummary';
import FormatsList from './FormatsList';
import SelectButton from './SelectButton';
import { FileText, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DeleteConfirmationDialog } from '@/components/content/repository/DeleteConfirmationDialog';

interface ContentItemProps {
  item: ContentItemType;
  onSelectContent: (contentId: string) => void;
  onOpenRepurposedContent: (contentId: string, formatId: string) => void;
  onDeleteContent?: (contentId: string) => void;
  isDeleting?: boolean;
  viewType?: 'new' | 'repurposed';
}

const ContentItem: React.FC<ContentItemProps> = ({
  item,
  onSelectContent,
  onOpenRepurposedContent,
  onDeleteContent,
  isDeleting = false,
  viewType = 'new'
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

  const confirmDelete = () => {
    if (onDeleteContent) {
      onDeleteContent(item.id);
    }
    setIsDeleteDialogOpen(false);
  };
  
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
              
              <div className="flex justify-between items-center mt-3">
                {onDeleteContent && (
                  <motion.div 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                      onClick={handleDeleteClick}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </motion.div>
                )}
                
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
