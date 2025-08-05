import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, MessageCircle } from 'lucide-react';
import { sendChatRequest } from '@/services/aiService/aiService';
import { AiProvider } from '@/services/aiService/types';
import { toast } from 'sonner';

interface AIChatTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: AiProvider | null;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export function AIChatTestModal({ isOpen, onClose, provider }: AIChatTestModalProps) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Early return if provider is null
  if (!provider) {
    return null;
  }

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: message.trim(),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      const response = await sendChatRequest(provider, {
        messages: [{ role: 'user', content: userMessage.content }],
        temperature: 0.7,
        maxTokens: 150
      });

      if (response?.choices?.[0]?.message?.content) {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: response.choices[0].message.content,
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, assistantMessage]);
        toast.success(`${provider} responded successfully!`);
      } else {
        throw new Error('No response content received');
      }
    } catch (error: any) {
      console.error(`AI chat test failed for ${provider}:`, error);
      toast.error(`${provider} test failed: ${error.message}`);
      
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: `Error: ${error.message}`,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClose = () => {
    setMessages([]);
    setMessage('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Test {provider.charAt(0).toUpperCase() + provider.slice(1)} Chat
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4">
          <ScrollArea className="flex-1 border rounded-lg p-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                Send a message to test your {provider} integration
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-3 py-2 ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : msg.content.startsWith('Error:')
                          ? 'bg-destructive text-destructive-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="text-sm">{msg.content}</div>
                      <div className="text-xs opacity-70 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <div className="flex gap-2">
            <Input
              placeholder="Type a test message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || isLoading}
              size="icon"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}