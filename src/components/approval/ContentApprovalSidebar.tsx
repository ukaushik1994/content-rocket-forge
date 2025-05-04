
import React from 'react';
import { ContentItemType } from '@/contexts/content/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { FileText, Calendar } from 'lucide-react';

interface ContentApprovalSidebarProps {
  contentItems: ContentItemType[];
  selectedContent: ContentItemType | null;
  onSelectContent: (content: ContentItemType | null) => void;
}

export const ContentApprovalSidebar: React.FC<ContentApprovalSidebarProps> = ({
  contentItems,
  selectedContent,
  onSelectContent
}) => {
  return (
    <div className="h-[calc(100vh-12rem)] rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-white/10 overflow-hidden shadow-xl">
      <div className="p-4 border-b border-white/10 backdrop-blur-sm bg-black/20">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-neon-purple" />
          <h3 className="font-medium text-sm text-white">
            Pending Approval ({contentItems.length})
          </h3>
        </div>
      </div>
      
      <ScrollArea className="h-[calc(100%-3.5rem)]">
        <div className="p-0">
          {contentItems.map((item) => (
            <motion.div
              key={item.id}
              className={cn(
                "p-4 border-b border-white/10 last:border-0 cursor-pointer hover:bg-white/5 transition-colors relative overflow-hidden",
                selectedContent?.id === item.id && "bg-white/10"
              )}
              onClick={() => onSelectContent(item)}
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-medium line-clamp-2 text-white/90">{item.title}</h4>
              </div>
              
              <div className="flex items-center justify-between text-xs text-white/50 mt-2">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {item.updated_at ? (
                      `Updated ${formatDistanceToNow(new Date(item.updated_at), { addSuffix: true })}`
                    ) : 'Recently updated'}
                  </span>
                </div>
                <Badge 
                  variant="outline" 
                  className="ml-2 border-white/20 text-white/60"
                >
                  {item.status}
                </Badge>
              </div>
              
              {selectedContent?.id === item.id && (
                <motion.div 
                  layoutId="sidebar-highlight"
                  className="absolute left-0 top-0 h-full w-1 bg-neon-purple"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </motion.div>
          ))}
          
          {contentItems.length === 0 && (
            <div className="p-4 text-center text-white/50">
              No content items pending approval
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
