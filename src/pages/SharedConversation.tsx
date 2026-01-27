import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  ArrowLeft, 
  Calendar, 
  Loader2, 
  AlertCircle,
  Lock,
  Share2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

interface SharedMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

interface SharedConversationData {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages: SharedMessage[];
}

const SharedConversation: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const [conversation, setConversation] = useState<SharedConversationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadConversation = async () => {
      if (!conversationId) {
        setError('No conversation ID provided');
        setIsLoading(false);
        return;
      }

      try {
        // Load conversation details
        const { data: convData, error: convError } = await supabase
          .from('ai_conversations')
          .select('*')
          .eq('id', conversationId)
          .single();

        if (convError) {
          if (convError.code === 'PGRST116') {
            setError('Conversation not found or has been deleted');
          } else {
            throw convError;
          }
          setIsLoading(false);
          return;
        }

        // Load messages
        const { data: messagesData, error: messagesError } = await supabase
          .from('ai_messages')
          .select('id, type, content, created_at')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });

        if (messagesError) throw messagesError;

        setConversation({
          ...convData,
          messages: (messagesData || []).map(msg => ({
            ...msg,
            type: msg.type as 'user' | 'assistant' | 'system'
          }))
        });

      } catch (err: any) {
        console.error('Error loading shared conversation:', err);
        setError(err.message || 'Failed to load conversation');
      } finally {
        setIsLoading(false);
      }
    };

    loadConversation();
  }, [conversationId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
          <h1 className="text-xl font-semibold mb-2">Unable to Load Conversation</h1>
          <p className="text-muted-foreground mb-6">
            {error || 'This conversation may have been deleted or is not accessible.'}
          </p>
          <Link to="/ai-chat">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go to AI Chat
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/ai-chat">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h1 className="text-lg font-semibold truncate max-w-[300px]">
                  {conversation.title}
                </h1>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Read Only
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDistanceToNow(new Date(conversation.created_at), { addSuffix: true })}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <ScrollArea className="h-[calc(100vh-180px)]">
          <div className="space-y-4 pb-8">
            {conversation.messages.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                <p className="text-muted-foreground">This conversation has no messages.</p>
              </div>
            ) : (
              conversation.messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "flex",
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-3",
                      message.type === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    <div className={cn(
                      "prose prose-sm max-w-none",
                      message.type === 'user' && 'prose-invert'
                    )}>
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                    <div className={cn(
                      "text-xs mt-2 opacity-60",
                      message.type === 'user' ? 'text-right' : 'text-left'
                    )}>
                      {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Footer Banner */}
      <div className="fixed bottom-0 left-0 right-0 bg-muted/80 backdrop-blur-sm border-t border-border/50 py-3">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            <Share2 className="h-4 w-4 inline mr-2" />
            This is a shared conversation view. Start your own chat to interact.
          </p>
          <Link to="/ai-chat">
            <Button size="sm">
              Start New Chat
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SharedConversation;
