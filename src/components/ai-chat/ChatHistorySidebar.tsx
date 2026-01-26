import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Search, 
  Plus, 
  MoreVertical, 
  Trash2, 
  X,
  History,
  Settings,
  ChevronDown,
  Loader2,
  Pin,
  Archive,
  Filter,
  SortAsc,
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
  const [sortBy, setSortBy] = useState<'recent' | 'title' | 'pinned'>('recent');
  const [filterBy, setFilterBy] = useState<'all' | 'pinned' | 'archived'>('all');

  const filteredConversations = conversations
    .filter(conv => {
      // Text search
      if (searchTerm && !conv.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Filter by type
      if (filterBy === 'pinned' && !conv.pinned) return false;
      if (filterBy === 'archived' && !conv.archived) return false;
      if (filterBy === 'all' && conv.archived) return false;
      
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'pinned') {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      // Default to recent
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

  // Reset pagination when search term changes
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

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.03,
        duration: 0.2
      }
    })
  };

  return (
    <motion.div 
      className={`fixed left-0 top-16 bottom-0 w-80 bg-background/95 backdrop-blur-xl border-r border-border/30 flex flex-col z-40 ${className}`}
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      {/* Header - Cleaner */}
      <div className="p-4 border-b border-border/30">
        <div className="flex items-center gap-2 mb-4">
          <History className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-medium text-foreground">History</h2>
        </div>

        {/* New Chat Button - Simplified */}
        <Button
          onClick={onCreateConversation}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Search - Refined */}
      <div className="p-4 border-b border-border/30">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-muted/30 border-border/30 text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:ring-1 focus:ring-primary/20 h-9 text-sm"
          />
        </div>
        
        {/* Filters and Sort - Minimal */}
        <div className="flex gap-2 mt-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground h-7 text-xs px-2">
                <Filter className="h-3 w-3 mr-1" />
                {filterBy === 'all' ? 'All' : filterBy === 'pinned' ? 'Pinned' : 'Archived'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-background border-border/50">
              <DropdownMenuItem onClick={() => setFilterBy('all')}>All Chats</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterBy('pinned')}>Pinned</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterBy('archived')}>Archived</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground h-7 text-xs px-2">
                <SortAsc className="h-3 w-3 mr-1" />
                {sortBy === 'recent' ? 'Recent' : sortBy === 'title' ? 'Title' : 'Pinned'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-background border-border/50">
              <DropdownMenuItem onClick={() => setSortBy('recent')}>Recent</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('title')}>Title</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('pinned')}>Pinned First</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          <AnimatePresence mode="wait">
            {conversations && conversations.length > 0 ? (
              filteredConversations.length > 0 ? (
                <>
                  {displayedConversations.map((conversation, index) => (
                  <motion.div
                    key={conversation.id}
                    custom={index}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  >
                    <div 
                      className={`mb-1.5 p-3 cursor-pointer transition-all duration-200 rounded-lg group ${
                        activeConversation === conversation.id 
                          ? 'bg-muted border-l-2 border-l-primary' 
                          : 'hover:bg-muted/50 border-l-2 border-l-transparent'
                      }`}
                      onClick={() => onSelectConversation(conversation.id)}
                    >
                      <div className="flex items-start justify-between">
                         <div className="flex-1 min-w-0">
                           <div className="flex items-center gap-2 mb-1">
                             {conversation.pinned && <Pin className="h-3 w-3 text-primary" />}
                             <MessageSquare className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                             <h3 className="text-sm font-medium text-foreground truncate">
                               {conversation.title}
                             </h3>
                           </div>
                           <div className="flex items-center justify-between">
                             <p className="text-xs text-muted-foreground">
                               {formatDistanceToNow(new Date(conversation.updated_at), { addSuffix: true })}
                             </p>
                             {conversation.tags && conversation.tags.length > 0 && (
                               <Badge variant="secondary" className="bg-muted text-muted-foreground text-xs h-5 px-1.5">
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
                              className="opacity-50 group-hover:opacity-100 h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-background border-border/50">
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
                  </motion.div>
                  ))}
                  
                  {/* Load More Button */}
                  {hasMoreConversations && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-3 px-2"
                    >
                      <Button
                        onClick={handleLoadMore}
                        disabled={isLoadingMore}
                        variant="ghost"
                        size="sm"
                        className="w-full text-muted-foreground hover:text-foreground h-8 text-xs"
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
                    </motion.div>
                  )}
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8"
                >
                  <Search className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">No conversations found</p>
                  <p className="text-muted-foreground/60 text-xs mt-1">Try a different search</p>
                </motion.div>
              )
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <MessageSquare className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No conversations yet</p>
                <p className="text-muted-foreground/60 text-xs mt-1">Start a new chat</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Footer - Minimal */}
      <div className="p-4 border-t border-border/30">
        <div className="flex items-center justify-between text-xs text-muted-foreground/60 mb-3">
          <span>
            {filteredConversations.length > 0 
              ? `${Math.min(displayLimit, filteredConversations.length)} of ${filteredConversations.length}`
              : `${conversations.length} total`
            }
          </span>
        </div>
        <Button
          onClick={() => {
            window.dispatchEvent(new CustomEvent('openSettings', { detail: { tab: 'api' } }));
          }}
          variant="ghost"
          size="sm"
          className="w-full text-muted-foreground hover:text-foreground h-8 text-xs"
        >
          <Settings className="h-3 w-3 mr-2" />
          Settings
        </Button>
      </div>
    </motion.div>
  );
};
