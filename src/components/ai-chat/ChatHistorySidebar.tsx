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
    await new Promise(resolve => setTimeout(resolve, 300)); // Smooth loading animation
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
      transition: { type: "spring", damping: 20, stiffness: 300 }
    },
    exit: { 
      x: -320, 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3
      }
    })
  };

  return (
    <motion.div 
      className={`fixed left-0 top-16 bottom-0 w-80 bg-background/80 backdrop-blur-xl border-r border-border/50 flex flex-col z-40 ${className}`}
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-white/70" />
            <h2 className="text-lg font-semibold text-white">Chat History</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="text-white/60 hover:text-white hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* New Chat Button */}
        <Button
          onClick={onCreateConversation}
          className="w-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 border border-white/20 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-white/10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
          <Input
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-purple-500/50"
          />
        </div>
        
        {/* Filters and Sort */}
        <div className="flex gap-2 mt-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10 text-xs">
                <Filter className="h-3 w-3 mr-1" />
                {filterBy === 'all' ? 'All' : filterBy === 'pinned' ? 'Pinned' : 'Archived'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-background/90 backdrop-blur-sm border-white/20">
              <DropdownMenuItem onClick={() => setFilterBy('all')}>All Chats</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterBy('pinned')}>Pinned</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterBy('archived')}>Archived</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10 text-xs">
                <SortAsc className="h-3 w-3 mr-1" />
                {sortBy === 'recent' ? 'Recent' : sortBy === 'title' ? 'Title' : 'Pinned'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-background/90 backdrop-blur-sm border-white/20">
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
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card 
                      className={`mb-2 p-3 cursor-pointer transition-all duration-200 group border-white/10 hover:border-purple-500/30 ${
                        activeConversation === conversation.id 
                          ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-purple-500/50' 
                          : 'bg-white/5 hover:bg-white/10'
                      }`}
                      onClick={() => onSelectConversation(conversation.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {conversation.pinned && <Pin className="h-3 w-3 text-warning fill-warning" />}
                            <MessageSquare className="h-4 w-4 text-white/60 flex-shrink-0" />
                            <h3 className="text-sm font-medium text-white truncate">
                              {conversation.title}
                            </h3>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-white/50">
                              {formatDistanceToNow(new Date(conversation.updated_at), { addSuffix: true })}
                            </p>
                            {conversation.tags && conversation.tags.length > 0 && (
                              <Badge variant="secondary" className="bg-white/10 text-white/70 text-xs h-5">
                                <Tag className="h-2 w-2 mr-1" />
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
                              className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0 text-white/60 hover:text-white hover:bg-white/20"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-background/90 backdrop-blur-sm border-white/20">
                            {onPinConversation && (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onPinConversation(conversation.id);
                                }}
                                className="text-white/70 hover:text-white focus:text-white"
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
                                className="text-white/70 hover:text-white focus:text-white"
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
                              className="text-red-400 focus:text-red-300 focus:bg-red-500/20"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </Card>
                  </motion.div>
                  ))}
                  
                  {/* Load More Button */}
                  {hasMoreConversations && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 px-2"
                    >
                      <Button
                        onClick={handleLoadMore}
                        disabled={isLoadingMore}
                        variant="ghost"
                        className="w-full text-white/60 hover:text-white hover:bg-white/10 border border-white/20 hover:border-white/30"
                      >
                        {isLoadingMore ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4 mr-2" />
                            Load More ({filteredConversations.length - displayLimit} remaining)
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
                  <Search className="h-12 w-12 text-white/30 mx-auto mb-3" />
                  <p className="text-white/60 text-sm">No conversations found</p>
                  <p className="text-white/40 text-xs mt-1">Try a different search term</p>
                </motion.div>
              )
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <MessageSquare className="h-12 w-12 text-white/30 mx-auto mb-3" />
                <p className="text-white/60 text-sm">No conversations yet</p>
                <p className="text-white/40 text-xs mt-1">Start a new chat to begin</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center justify-between text-xs text-white/50 mb-3">
          <span>
            {filteredConversations.length > 0 
              ? `${Math.min(displayLimit, filteredConversations.length)} of ${filteredConversations.length} shown`
              : `${conversations.length} conversations`
            }
          </span>
          <Badge variant="secondary" className="bg-success/20 text-success border-success/30">
            <div className="w-2 h-2 bg-success rounded-full mr-1" />
            Synced
          </Badge>
        </div>
        <Button
          onClick={() => window.open('/ai-settings', '_blank')}
          variant="ghost"
          size="sm"
          className="w-full text-white/60 hover:text-white hover:bg-white/10 text-xs"
        >
          <Settings className="h-3 w-3 mr-2" />
          AI Settings
        </Button>
      </div>
    </motion.div>
  );
};