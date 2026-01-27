import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StreamingChatInterface } from './StreamingChatInterface';
import { ConversationAnalyticsModal } from './ConversationAnalyticsModal';
import { PresenceIndicator } from './PresenceIndicator';
import { useChatContextBridge } from '@/contexts/ChatContextBridge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Activity, Database } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface EnhancedStreamingInterfaceProps {
  onClearConversation?: () => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

interface ConversationAnalytics {
  totalMessages: number;
  userMessages: number;
  assistantMessages: number;
  averageMessageLength: number;
  conversationDuration: number;
  actionsTriggered: number;
  hasVisualData: boolean;
  hasWorkflowData: boolean;
}

export const EnhancedStreamingInterface: React.FC<EnhancedStreamingInterfaceProps> = ({
  onClearConversation,
  onToggleSidebar,
  isSidebarOpen
}) => {
  const { updateActiveConversation, activeConversationId } = useChatContextBridge();
  const { user } = useAuth();
  const { toast } = useToast();
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('connected');
  const [contextScope, setContextScope] = useState<{
    scope: 'summary' | 'detailed' | 'full';
    estimatedTokens: number;
  }>({ scope: 'summary', estimatedTokens: 5000 });

  // Monitor connection status
  useEffect(() => {
    const channel = supabase.channel('connection_monitor');
    
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        setConnectionStatus('connected');
      } else if (status === 'CHANNEL_ERROR') {
        setConnectionStatus('disconnected');
        toast({
          title: "Connection Lost",
          description: "Attempting to reconnect...",
          variant: "destructive"
        });
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, toast]);

  const handleClear = () => {
    onClearConversation?.();
  };

  const handleShowAnalytics = () => {
    setShowAnalytics(true);
  };

  const handleLoadMoreContext = () => {
    setContextScope({ scope: 'full', estimatedTokens: 80000 });
    toast({
      title: "Loading Full Context",
      description: "All data will be available in your next message",
    });
  };

  // Fetch REAL analytics from database
  const getAnalytics = useCallback(async (): Promise<ConversationAnalytics | null> => {
    if (!activeConversationId) return null;
    
    try {
      const { data: messages, error } = await supabase
        .from('ai_messages')
        .select('type, content, created_at, message_status, visual_data, workflow_context')
        .eq('conversation_id', activeConversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching conversation analytics:', error);
        return null;
      }

      if (!messages || messages.length === 0) {
        return {
          totalMessages: 0,
          userMessages: 0,
          assistantMessages: 0,
          averageMessageLength: 0,
          conversationDuration: 0,
          actionsTriggered: 0,
          hasVisualData: false,
          hasWorkflowData: false
        };
      }

      const userMessages = messages.filter(m => m.type === 'user');
      const assistantMessages = messages.filter(m => m.type === 'assistant');
      
      const firstMsg = new Date(messages[0].created_at);
      const lastMsg = new Date(messages[messages.length - 1].created_at);
      
      const totalContentLength = messages.reduce((sum, m) => sum + (m.content?.length || 0), 0);
      
      const actionsTriggered = messages.filter(m => 
        m.message_status === 'action_triggered' || 
        m.message_status === 'action_completed'
      ).length;

      const hasVisualData = messages.some(m => m.visual_data !== null);
      const hasWorkflowData = messages.some(m => m.workflow_context !== null);

      return {
        totalMessages: messages.length,
        userMessages: userMessages.length,
        assistantMessages: assistantMessages.length,
        averageMessageLength: Math.round(totalContentLength / messages.length),
        conversationDuration: lastMsg.getTime() - firstMsg.getTime(),
        actionsTriggered,
        hasVisualData,
        hasWorkflowData
      };
    } catch (error) {
      console.error('Error calculating conversation analytics:', error);
      return null;
    }
  }, [activeConversationId]);

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-background to-muted/20">
      {/* Enhanced Header with Collaboration & Analytics */}
      <div className="flex items-center justify-between p-3 border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Badge variant={connectionStatus === 'connected' ? 'default' : 'destructive'} className="flex items-center gap-1">
            <Activity size={12} />
            {connectionStatus === 'connected' ? 'Live' : 'Offline'}
          </Badge>
          
          {/* Real-time Presence Indicator */}
          <PresenceIndicator 
            conversationId={activeConversationId || undefined}
            showTyping={true}
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShowAnalytics}
            className="flex items-center gap-1"
            disabled={!activeConversationId}
          >
            <BarChart3 size={16} />
            Analytics
          </Button>
        </div>
      </div>

      {/* Context Scope Indicator */}
      {contextScope && (
        <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Database size={14} className="text-muted-foreground" />
              <div className={`w-2 h-2 rounded-full ${
                contextScope.scope === 'summary' ? 'bg-green-500' :
                contextScope.scope === 'detailed' ? 'bg-yellow-500' :
                'bg-red-500'
              }`} />
              <span className="text-muted-foreground">
                Context: <strong className="text-foreground">{contextScope.scope}</strong> 
                <span className="ml-2 text-xs opacity-75">
                  (~{(contextScope.estimatedTokens / 1000).toFixed(1)}K tokens)
                </span>
              </span>
            </div>
            {contextScope.scope !== 'full' && (
              <button 
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs font-medium transition-colors"
                onClick={handleLoadMoreContext}
              >
                Load More Data →
              </button>
            )}
          </div>
        </div>
      )}

      <StreamingChatInterface
        onClearConversation={handleClear}
        onToggleSidebar={onToggleSidebar}
        isSidebarOpen={isSidebarOpen}
      />

      <ConversationAnalyticsModal
        isOpen={showAnalytics}
        onClose={() => setShowAnalytics(false)}
        onGetAnalytics={getAnalytics}
      />
    </div>
  );
};
