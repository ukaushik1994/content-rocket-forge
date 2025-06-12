
import React, { useState, useRef, useEffect } from 'react';
import { Send, Minimize2, Bot, User, Loader2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { aiAgentService } from '@/services/aiAgentService';
import { toast } from 'sonner';

interface Message {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: Date;
  functionCalls?: FunctionCall[];
  attachments?: Attachment[];
  status?: 'sending' | 'processing' | 'completed' | 'error';
}

interface FunctionCall {
  name: string;
  parameters: any;
  result?: any;
  status: 'pending' | 'executing' | 'completed' | 'error';
}

interface Attachment {
  type: 'file' | 'image' | 'data';
  name: string;
  content: any;
}

export const AIAgentChat = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'agent',
      content: "Hi! I'm your AI agent. I can help you with anything on this platform - from creating content and analyzing SEO to managing workflows and building integrations. What would you like to do today?",
      timestamp: new Date(),
      status: 'completed'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentContext, setCurrentContext] = useState<any>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Enhanced event listener with debugging
  useEffect(() => {
    const handleOpenAIChat = (event: Event) => {
      console.log('🤖 AI Chat event received:', event);
      setIsExpanded(true);
      toast.success('AI Assistant opened!');
    };

    console.log('🤖 Setting up AI Chat event listener');
    document.addEventListener('open-ai-chat', handleOpenAIChat);
    
    return () => {
      console.log('🤖 Cleaning up AI Chat event listener');
      document.removeEventListener('open-ai-chat', handleOpenAIChat);
    };
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
      status: 'completed'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await aiAgentService.processMessage(inputValue, {
        conversationHistory: messages,
        currentContext,
        userPreferences: {}
      });

      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: response.content,
        timestamp: new Date(),
        functionCalls: response.functionCalls,
        attachments: response.attachments,
        status: 'completed'
      };

      setMessages(prev => [...prev, agentMessage]);
      
      if (response.context) {
        setCurrentContext(response.context);
      }

      // Execute any function calls
      if (response.functionCalls?.length) {
        await executeFunctionCalls(response.functionCalls, agentMessage.id);
      }

    } catch (error) {
      console.error('Error processing message:', error);
      toast.error('Sorry, I encountered an error. Please try again.');
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'agent',
        content: "I apologize, but I encountered an error processing your request. Could you please try rephrasing or let me know if you need help with something specific?",
        timestamp: new Date(),
        status: 'error'
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const executeFunctionCalls = async (functionCalls: FunctionCall[], messageId: string) => {
    for (const call of functionCalls) {
      try {
        call.status = 'executing';
        updateMessageFunctionCall(messageId, call);

        const result = await aiAgentService.executeFunction(call.name, call.parameters);
        call.result = result;
        call.status = 'completed';
        
        updateMessageFunctionCall(messageId, call);
        
        if (result.notification) {
          toast.success(result.notification);
        }
      } catch (error) {
        call.status = 'error';
        call.result = { error: error.message };
        updateMessageFunctionCall(messageId, call);
        toast.error(`Function ${call.name} failed: ${error.message}`);
      }
    }
  };

  const updateMessageFunctionCall = (messageId: string, updatedCall: FunctionCall) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId && msg.functionCalls) {
        return {
          ...msg,
          functionCalls: msg.functionCalls.map(call => 
            call.name === updatedCall.name ? updatedCall : call
          )
        };
      }
      return msg;
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderMessage = (message: Message) => (
    <motion.div
      key={message.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex gap-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          message.type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'
        }`}>
          {message.type === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </div>
        
        <div className={`rounded-lg p-3 ${
          message.type === 'user' 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-secondary'
        }`}>
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          
          {message.functionCalls && (
            <div className="mt-3 space-y-2">
              {message.functionCalls.map((call, idx) => (
                <div key={idx} className="bg-white/10 rounded p-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Badge variant={call.status === 'completed' ? 'default' : 'secondary'}>
                      {call.name}
                    </Badge>
                    {call.status === 'executing' && <Loader2 className="h-3 w-3 animate-spin" />}
                  </div>
                  {call.result && (
                    <div className="mt-1 opacity-75">
                      {call.status === 'error' ? 'Error: ' + call.result.error : 'Completed'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {message.attachments && (
            <div className="mt-3 space-y-1">
              {message.attachments.map((att, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs opacity-75">
                  <FileText className="h-3 w-3" />
                  <span>{att.name}</span>
                </div>
              ))}
            </div>
          )}
          
          <div className="text-xs opacity-50 mt-1">
            {message.timestamp.toLocaleTimeString()}
          </div>
        </div>
      </div>
    </motion.div>
  );

  // Debug logging
  console.log('🤖 AIAgentChat render - isExpanded:', isExpanded);

  return (
    <div className="fixed bottom-4 right-4 z-[9999]">
      <AnimatePresence mode="wait">
        {isExpanded ? (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2 }}
            className="w-96 h-[600px] bg-background border rounded-lg shadow-2xl flex flex-col"
            style={{ zIndex: 9999 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-background rounded-t-lg">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">AI Agent</h3>
                <Badge variant="secondary" className="text-xs">
                  {currentContext ? 'Context Active' : 'Ready'}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  console.log('🤖 Closing AI Chat');
                  setIsExpanded(false);
                }}
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map(renderMessage)}
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="bg-secondary rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span className="text-sm">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t bg-background rounded-b-lg">
              <div className="flex gap-2">
                <Textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about the platform..."
                  className="min-h-[60px] resize-none"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  size="sm"
                  className="px-3"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="collapsed"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              onClick={() => {
                console.log('🤖 Opening AI Chat via button click');
                setIsExpanded(true);
              }}
              className="rounded-full w-14 h-14 shadow-xl bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-105"
              size="lg"
            >
              <Bot className="h-6 w-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
