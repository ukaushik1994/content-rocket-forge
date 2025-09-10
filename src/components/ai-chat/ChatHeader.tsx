import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Menu, 
  MoreVertical, 
  Trash2, 
  Download, 
  Share2,
  Bot,
  Sparkles,
  Activity
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ChatHeaderProps {
  onClearConversation: () => void;
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
  hasMessages: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  onClearConversation,
  onToggleSidebar,
  sidebarOpen,
  hasMessages
}) => {
  const handleExportConversation = async () => {
    try {
      // Get conversation messages from localStorage or state
      const conversationData = {
        title: 'AI Chat Conversation',
        timestamp: new Date().toISOString(),
        messages: [], // This would come from props or context
        exported_at: new Date().toISOString()
      };
      
      const dataStr = JSON.stringify(conversationData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `ai-chat-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleShareConversation = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'AI Chat Conversation',
          text: 'Check out this AI conversation',
          url: window.location.href
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        // You might want to show a toast notification here
        console.log('Link copied to clipboard');
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  return (
    <motion.header 
      className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-background/95 to-background/90 backdrop-blur-sm"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Left Section */}
      <div className="flex items-center gap-3">
        {/* Sidebar Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSidebar}
          className="h-8 w-8 p-0 hover:bg-white/10"
        >
          <Menu className="h-4 w-4" />
        </Button>

        {/* AI Assistant Info */}
        <motion.div 
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-primary/20 border border-primary/30">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          
          <div>
            <h1 className="font-semibold text-sm flex items-center gap-2">
              AI Content Assistant
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles className="h-3 w-3 text-primary" />
              </motion.div>
            </h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Activity className="h-2.5 w-2.5" />
              Ready to help with content & strategy
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right Section */}
      <motion.div 
        className="flex items-center gap-2"
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        {/* Online Status Indicator */}
        <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-success/20 border border-success/30">
          <div className="w-2 h-2 bg-success rounded-full">
            <motion.div
              className="w-2 h-2 bg-success rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <span className="text-xs text-success font-medium">Online</span>
        </div>

        {/* Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-white/10"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-48 bg-background/95 backdrop-blur-sm border-white/20"
          >
            <DropdownMenuItem onClick={handleShareConversation}>
              <Share2 className="h-4 w-4 mr-2" />
              Share Conversation
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportConversation}>
              <Download className="h-4 w-4 mr-2" />
              Export Chat
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem 
              onClick={onClearConversation}
              disabled={!hasMessages}
              className="text-destructive hover:text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Conversation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>
    </motion.header>
  );
};