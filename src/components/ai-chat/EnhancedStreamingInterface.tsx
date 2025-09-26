import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StreamingChatInterface } from './StreamingChatInterface';
import { useChatContextBridge } from '@/contexts/ChatContextBridge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface EnhancedStreamingInterfaceProps {
  onClearConversation?: () => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const EnhancedStreamingInterface: React.FC<EnhancedStreamingInterfaceProps> = ({
  onClearConversation,
  onToggleSidebar,
  isSidebarOpen
}) => {
  const { updateActiveConversation, activeConversationId } = useChatContextBridge();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleClear = () => {
    onClearConversation?.();
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-background to-muted/20">
      <StreamingChatInterface
        onClearConversation={handleClear}
        onToggleSidebar={onToggleSidebar}
        isSidebarOpen={isSidebarOpen}
      />
    </div>
  );
};