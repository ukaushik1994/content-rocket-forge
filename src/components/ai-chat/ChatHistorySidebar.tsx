import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  MoreVertical, 
  Trash2, 
  ChevronDown,
  Loader2,
  Pin,
  Archive,
  Tag
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AIConversation } from '@/hooks/useEnhancedAIChatDB';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useResponsiveBreakpoint } from '@/hooks/useResponsiveBreakpoint';

interface ChatHistorySidebarProps {
  conversations: AIConversation[];
  activeConversation: string | null;
  onSelectConversation: (id: string) => void;
  onCreateConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onToggleSidebar: () => void;
  onArchiveConversation?: (id: string) => void;
  onPinConversation?: (id: string) => void;
  className?: string;
}

export const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({
  conversations,
  activeConversation,
  onSelectConversation,
  onCreateConversation,
  onDeleteConversation,
  onToggleSidebar,
  onArchiveConversation,
  onPinConversation,
  className = ""
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [displayLimit, setDisplayLimit] = useState(10);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const filteredConversations = conversations
    .filter(conv => {
      if (searchTerm && !conv.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      // Hide archived by default
      if (conv.archived) return false;
      return true;
    })
    .sort((a, b) => {
      // Pinned first, then recent
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

  const displayedConversations = filteredConversations.slice(0, displayLimit);
  const hasMoreConversations = filteredConversations.length > displayLimit;

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    setDisplayLimit(prev => prev + 10);
    setIsLoadingMore(false);
  };

  React.useEffect(() => {
    setDisplayLimit(10);
  }, [searchTerm]);

  const sidebarVariants = {
    hidden: { x: -320, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { type: "spring", damping: 25, stiffness: 300 }
    },
    exit: { 
      x: -320, 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  const { isMobile } = useResponsiveBreakpoint();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (diff > 50) {
      onToggleSidebar();
    }
    setTouchStartX(null);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobile && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggleSidebar}
        />
      )}
      
      <motion.div 
        ref={sidebarRef}
        className={cn(
          "fixed left-0 top-16 bottom-0 z-50",
          "w-full sm:w-72 lg:w-80",
          "bg-background/90 backdrop-blur-md",
          "border-r border-border/10 flex flex-col",
          className
        )}
        variants={sidebarVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Header */}
        <div className="p-4 border-b border-border/10">
          <p className="text-xs uppercase tracking-widest text-muted-foreground/50 mb-4">Chats</p>

          <Button
            onClick={onCreateConversation}
            variant="ghost"
            className="w-full border border-border/20 text-muted-foreground hover:text-foreground hover:border-border/40 rounded-full h-9"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-border/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-transparent border-border/20 text-foreground placeholder:text-muted-foreground/40 focus:border-border/40 focus-visible:ring-0 focus-visible:ring-offset-0 h-9 text-sm"
            />
          </div>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            <AnimatePresence mode="wait">
              {conversations && conversations.length > 0 ? (
                filteredConversations.length > 0 ? (
                  <>
                    {displayedConversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={cn(
                          "mb-1 p-3 cursor-pointer transition-colors duration-150 rounded-lg group",
                          activeConversation === conversation.id 
                            ? 'bg-muted/40' 
                            : 'hover:bg-muted/20'
                        )}
                        onClick={() => onSelectConversation(conversation.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {conversation.pinned && <Pin className="h-3 w-3 text-muted-foreground/40 flex-shrink-0" />}
                              <h3 className="text-sm font-medium text-foreground truncate">
                                {conversation.title}
                              </h3>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-muted-foreground/60">
                                {formatDistanceToNow(new Date(conversation.updated_at), { addSuffix: true })}
                              </p>
                              {conversation.tags && conversation.tags.length > 0 && (
                                <Badge variant="secondary" className="bg-muted/30 text-muted-foreground/60 text-xs h-5 px-1.5 border-0">
                                  {conversation.tags[0]}
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-background border-border/20">
                              {onPinConversation && (
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onPinConversation?.(conversation.id);
                                  }}
                                >
                                  <Pin className="h-4 w-4 mr-2" />
                                  {conversation.pinned ? 'Unpin' : 'Pin'}
                                </DropdownMenuItem>
                              )}
                              {onArchiveConversation && (
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onArchiveConversation(conversation.id);
                                  }}
                                >
                                  <Archive className="h-4 w-4 mr-2" />
                                  {conversation.archived ? 'Unarchive' : 'Archive'}
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteConversation(conversation.id);
                                }}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                    
                    {/* Load More */}
                    {hasMoreConversations && (
                      <div className="mt-3 px-2">
                        <Button
                          onClick={handleLoadMore}
                          disabled={isLoadingMore}
                          variant="ghost"
                          size="sm"
                          className="w-full text-muted-foreground/60 hover:text-foreground h-8 text-xs"
                        >
                          {isLoadingMore ? (
                            <>
                              <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-3 w-3 mr-2" />
                              Load More ({filteredConversations.length - displayLimit})
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8"
                  >
                    <Search className="h-5 w-5 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground/60 text-sm">No results</p>
                  </motion.div>
                )
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8"
                >
                  <p className="text-muted-foreground/50 text-sm">No conversations yet</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </motion.div>
    </>
  );
};
