
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  MessageSquare, 
  Search, 
  Trash2, 
  X,
  ChevronLeft,
  Bot,
  Sparkles
} from 'lucide-react';
import { ChatConversation } from '@/hooks/useAIChat';
import { formatDistanceToNow } from 'date-fns';

interface ChatSidebarProps {
  conversations: ChatConversation[];
  activeConversation: string | null;
  onSelectConversation: (id: string) => void;
  onCreateConversation: (title?: string) => void;
  onDeleteConversation: (id: string) => void;
  onToggleSidebar: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  conversations,
  activeConversation,
  onSelectConversation,
  onCreateConversation,
  onDeleteConversation,
  onToggleSidebar
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredConversation, setHoveredConversation] = useState<string | null>(null);

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sidebarVariants = {
    hidden: { x: -320 },
    visible: { 
      x: 0,
      transition: { 
        type: "spring" as const, 
        stiffness: 300, 
        damping: 30 
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        type: "spring" as const, 
        stiffness: 400, 
        damping: 25 
      }
    }
  };

  return (
    <motion.div 
      className="h-full flex flex-col bg-gradient-to-b from-background/95 to-background/80 backdrop-blur-sm border-r border-white/10"
      initial="hidden"
      animate="visible"
      variants={sidebarVariants}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <motion.div 
            className="flex items-center gap-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-sm">AI Assistant</h2>
              <p className="text-xs text-muted-foreground">Content & Strategy</p>
            </div>
          </motion.div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="h-8 w-8 p-0 hover:bg-white/10"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* New Chat Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button 
            onClick={() => onCreateConversation()}
            className="w-full justify-start gap-2 bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/20 hover:from-primary/30 hover:to-primary/20 text-white"
          >
            <Plus className="h-4 w-4" />
            New Conversation
            <Sparkles className="h-3 w-3 ml-auto text-primary" />
          </Button>
        </motion.div>

        {/* Search */}
        <motion.div 
          className="mt-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white/5 border-white/10 focus:border-primary/50"
            />
          </div>
        </motion.div>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1 px-2">
        <div className="p-2 space-y-1">
          <AnimatePresence mode="popLayout">
            {filteredConversations.map((conversation, index) => (
              <motion.div
                key={conversation.id}
                layout
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, x: -20, scale: 0.95 }}
                variants={itemVariants}
                transition={{ delay: index * 0.05 }}
                onHoverStart={() => setHoveredConversation(conversation.id)}
                onHoverEnd={() => setHoveredConversation(null)}
                className={`
                  group relative p-3 rounded-lg cursor-pointer transition-all duration-200
                  ${activeConversation === conversation.id 
                    ? 'bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30' 
                    : 'hover:bg-white/5 border border-transparent hover:border-white/10'
                  }
                `}
                onClick={() => onSelectConversation(conversation.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={`
                    flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0 transition-colors
                    ${activeConversation === conversation.id 
                      ? 'bg-primary/30 text-primary' 
                      : 'bg-white/10 text-muted-foreground group-hover:bg-white/20'
                    }
                  `}>
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className={`
                      font-medium text-sm truncate transition-colors
                      ${activeConversation === conversation.id 
                        ? 'text-primary' 
                        : 'text-foreground group-hover:text-white'
                      }
                    `}>
                      {conversation.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(conversation.updated_at), { addSuffix: true })}
                    </p>
                  </div>

                  {/* Delete Button */}
                  <AnimatePresence>
                    {hoveredConversation === conversation.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteConversation(conversation.id);
                          }}
                          className="h-6 w-6 p-0 hover:bg-destructive/20 hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Active Indicator */}
                {activeConversation === conversation.id && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Empty State */}
          {filteredConversations.length === 0 && (
            <motion.div 
              className="text-center py-8 text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {searchQuery ? (
                <div>
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No conversations found</p>
                </div>
              ) : (
                <div>
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Start your first conversation</p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <motion.div 
          className="text-xs text-muted-foreground text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          AI-powered content assistant
        </motion.div>
      </div>
    </motion.div>
  );
};
