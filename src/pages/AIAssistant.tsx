
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, FileText, Upload, Mic, MicOff, Home, FileIcon, BarChart3, Settings, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { aiAgentService } from '@/services/aiAgentService';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Navbar from '@/components/layout/Navbar';

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

const AIAssistant = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'agent',
      content: `Hi ${user?.user_metadata?.first_name || 'there'}! 👋 I'm your AI Assistant. I can help you with anything on this platform - from creating content and analyzing SEO to managing workflows and building integrations. 

Here's what I can do for you:
• Create and optimize content
• Analyze SERP data and keywords
• Generate content outlines and ideas
• Help with workflow automation
• Provide analytics insights
• Manage your solutions and projects

What would you like to work on today?`,
      timestamp: new Date(),
      status: 'completed'
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentContext, setCurrentContext] = useState<any>(null);
  const [isListening, setIsListening] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Set context based on current page
  useEffect(() => {
    const pageContext = {
      currentPage: location.pathname,
      pageName: getPageName(location.pathname),
      timestamp: new Date().toISOString(),
      userInfo: {
        name: user?.user_metadata?.first_name || 'User',
        email: user?.email
      }
    };
    setCurrentContext(pageContext);
  }, [location.pathname, user]);

  const getPageName = (pathname: string) => {
    const routes = {
      '/': 'Dashboard',
      '/content-builder': 'Content Builder',
      '/settings': 'Settings',
      '/analytics': 'Analytics',
      '/solutions': 'Solutions',
      '/drafts': 'Drafts',
      '/ai-assistant': 'AI Assistant'
    };
    return routes[pathname] || 'Unknown Page';
  };

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
        
        // Handle navigation commands
        if (result.navigate) {
          navigate(result.navigate);
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Handle file upload
      toast.info('File upload functionality coming soon!');
    }
  };

  const quickActions = [
    { icon: FileText, label: 'Create Content', action: () => setInputValue('Help me create new content') },
    { icon: BarChart3, label: 'Analyze Performance', action: () => setInputValue('Show me my content analytics') },
    { icon: Lightbulb, label: 'Content Ideas', action: () => setInputValue('Give me some content ideas') },
    { icon: Settings, label: 'Platform Help', action: () => setInputValue('How do I use this platform?') }
  ];

  const renderMessage = (message: Message) => (
    <motion.div
      key={message.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-4 mb-6 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex gap-4 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
          message.type === 'user' 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-secondary border-2 border-primary/20'
        }`}>
          {message.type === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5 text-primary" />}
        </div>
        
        <div className={`rounded-xl p-4 ${
          message.type === 'user' 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-secondary border border-border'
        }`}>
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
          
          {message.functionCalls && (
            <div className="mt-4 space-y-2">
              {message.functionCalls.map((call, idx) => (
                <div key={idx} className="bg-white/10 rounded-lg p-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Badge variant={call.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                      {call.name}
                    </Badge>
                    {call.status === 'executing' && <Loader2 className="h-3 w-3 animate-spin" />}
                  </div>
                  {call.result && (
                    <div className="mt-2 opacity-75">
                      {call.status === 'error' ? 'Error: ' + call.result.error : 'Completed successfully'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {message.attachments && (
            <div className="mt-3 space-y-2">
              {message.attachments.map((att, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs opacity-75 bg-white/10 rounded-lg p-2">
                  <FileText className="h-3 w-3" />
                  <span>{att.name}</span>
                </div>
              ))}
            </div>
          )}
          
          <div className="text-xs opacity-50 mt-3">
            {message.timestamp.toLocaleTimeString()}
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gradient mb-2">AI Assistant</h1>
          <p className="text-muted-foreground">
            Your intelligent companion for content creation and platform management
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="context">Context</TabsTrigger>
            <TabsTrigger value="actions">Quick Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Chat Area */}
              <div className="lg:col-span-3">
                <Card className="h-[70vh] flex flex-col">
                  <CardHeader className="border-b">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Bot className="h-5 w-5 text-primary" />
                        AI Assistant Chat
                      </CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {currentContext ? 'Context Active' : 'Ready'}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 p-0">
                    <ScrollArea className="h-full p-6">
                      <div className="space-y-4">
                        {messages.map(renderMessage)}
                        {isLoading && (
                          <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-secondary border-2 border-primary/20 flex items-center justify-center">
                              <Bot className="h-5 w-5 text-primary" />
                            </div>
                            <div className="bg-secondary border border-border rounded-xl p-4">
                              <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                <span className="text-sm">Thinking...</span>
                              </div>
                            </div>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>
                  </CardContent>

                  {/* Input Area */}
                  <div className="border-t p-4">
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
                      <div className="flex flex-col gap-2">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileUpload}
                          multiple
                          className="hidden"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          className="p-2"
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={handleSendMessage}
                          disabled={!inputValue.trim() || isLoading}
                          size="sm"
                          className="p-2"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Context Sidebar */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Current Context</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {currentContext && (
                      <>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Current Page</p>
                          <p className="text-sm">{currentContext.pageName}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">User</p>
                          <p className="text-sm">{currentContext.userInfo?.name}</p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="context" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Context Information</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto">
                  {JSON.stringify(currentContext, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions" className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action, idx) => (
                <Card key={idx} className="cursor-pointer hover:shadow-md transition-shadow" onClick={action.action}>
                  <CardContent className="p-6 text-center">
                    <action.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium">{action.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AIAssistant;
