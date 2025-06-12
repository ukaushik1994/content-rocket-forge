
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, FileText, Upload, Plus, Trash2, MessageSquare, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Navbar from '@/components/layout/Navbar';
import { useEnhancedAIAgent, type EnhancedMessage } from '@/hooks/useEnhancedAIAgent';

const AIAssistant = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const {
    isProcessing,
    conversations,
    currentConversation,
    messages,
    isLoadingConversations,
    error,
    sendMessage,
    executeFunction,
    loadConversations,
    createNewConversation,
    loadConversation,
    deleteConversation,
    clearCurrentChat
  } = useEnhancedAIAgent();
  
  const [inputValue, setInputValue] = useState('');
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

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user, loadConversations]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing) return;

    const messageContent = inputValue;
    setInputValue('');

    const response = await sendMessage(messageContent);
    
    // Execute any function calls
    if (response?.functionCalls?.length) {
      await executeFunctionCalls(response.functionCalls);
    }
  };

  const executeFunctionCalls = async (functionCalls: any[]) => {
    for (const call of functionCalls) {
      try {
        const result = await executeFunction(call.name, call.parameters);
        
        if (result.notification) {
          toast.success(result.notification);
        }
        
        // Handle navigation commands
        if (result.navigate) {
          navigate(result.navigate);
        }
      } catch (error: any) {
        toast.error(`Function ${call.name} failed: ${error.message}`);
      }
    }
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
      toast.info('File upload functionality coming soon!');
    }
  };

  const handleCreateNewConversation = async () => {
    await createNewConversation();
  };

  const quickActions = [
    { 
      icon: FileText, 
      label: 'Create Content', 
      action: () => setInputValue('Help me create new content about '),
      gradient: 'from-blue-500 to-cyan-500'
    },
    { 
      icon: Sparkles, 
      label: 'Analyze Performance', 
      action: () => setInputValue('Show me my content analytics and performance metrics'),
      gradient: 'from-purple-500 to-pink-500'
    },
    { 
      icon: MessageSquare, 
      label: 'Content Ideas', 
      action: () => setInputValue('Give me 5 content ideas for my industry'),
      gradient: 'from-green-500 to-emerald-500'
    },
    { 
      icon: Bot, 
      label: 'Platform Help', 
      action: () => setInputValue('How do I use this platform effectively?'),
      gradient: 'from-orange-500 to-red-500'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✓';
      case 'error':
        return '✗';
      case 'processing':
        return <Loader2 className="h-3 w-3 animate-spin" />;
      default:
        return '○';
    }
  };

  const renderMessage = (message: EnhancedMessage) => (
    <motion.div
      key={message.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-4 mb-6 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex gap-4 max-w-[85%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ${
          message.type === 'user' 
            ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white' 
            : 'bg-gradient-to-br from-emerald-500 to-cyan-600 text-white border-2 border-white/20'
        }`}>
          {message.type === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
        </div>
        
        <div className={`rounded-2xl p-4 shadow-lg backdrop-blur-sm border ${
          message.type === 'user' 
            ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white border-white/20' 
            : message.status === 'error'
            ? 'bg-red-50 border-red-200 text-red-800'
            : 'bg-white/80 border-gray-200 text-gray-800'
        }`}>
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm whitespace-pre-wrap leading-relaxed flex-1">{message.content}</p>
            <span className="ml-2 text-xs opacity-60">
              {getStatusIcon(message.status)}
            </span>
          </div>
          
          {message.functionCalls && message.functionCalls.length > 0 && (
            <div className="mt-4 space-y-2">
              {message.functionCalls.map((call, idx) => (
                <div key={idx} className="bg-black/10 rounded-lg p-3 text-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge 
                      variant={call.status === 'completed' ? 'default' : 'secondary'} 
                      className="text-xs"
                    >
                      {call.name}
                    </Badge>
                    {call.status === 'executing' && <Loader2 className="h-3 w-3 animate-spin" />}
                  </div>
                  {call.result && (
                    <div className="opacity-75">
                      {call.status === 'error' ? 'Error: ' + call.result.error : 'Completed successfully'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-3 space-y-2">
              {message.attachments.map((att, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs opacity-75 bg-black/10 rounded-lg p-2">
                  <FileText className="h-3 w-3" />
                  <span>{att.name}</span>
                </div>
              ))}
            </div>
          )}
          
          <div className="text-xs opacity-50 mt-3">
            {new Date(message.created_at).toLocaleTimeString()}
          </div>
        </div>
      </div>
    </motion.div>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <Bot className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">AI Assistant</h1>
          <p className="text-muted-foreground mb-6">Please sign in to start chatting with your AI assistant.</p>
          <Button onClick={() => navigate('/auth')} className="bg-gradient-to-r from-blue-500 to-purple-600">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            AI Assistant
          </h1>
          <p className="text-muted-foreground text-lg">
            Your intelligent companion for content creation and platform management
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="chat" className="text-sm">Chat</TabsTrigger>
            <TabsTrigger value="conversations" className="text-sm">History</TabsTrigger>
            <TabsTrigger value="actions" className="text-sm">Quick Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="mt-0">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              {/* Main Chat Area */}
              <div className="xl:col-span-3">
                <Card className="h-[75vh] flex flex-col shadow-xl border-0 bg-white/60 backdrop-blur-sm">
                  <CardHeader className="border-b bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-t-lg">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center">
                          <Bot className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="text-lg">AI Assistant</div>
                          {currentConversation && (
                            <div className="text-sm font-normal text-muted-foreground">
                              {currentConversation.title}
                            </div>
                          )}
                        </div>
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {currentConversation && (
                          <Button variant="outline" size="sm" onClick={clearCurrentChat}>
                            New Chat
                          </Button>
                        )}
                        <Badge variant="secondary" className="text-xs">
                          {isProcessing ? 'Processing...' : 'Ready'}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 p-0 overflow-hidden">
                    <ScrollArea className="h-full p-6">
                      {error && (
                        <Alert className="mb-4 border-red-200 bg-red-50">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          <AlertDescription className="text-red-800">{error}</AlertDescription>
                        </Alert>
                      )}
                      
                      <div className="space-y-4">
                        {messages.length === 0 && !currentConversation && (
                          <div className="text-center py-12">
                            <Bot className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <h3 className="text-xl font-semibold mb-2 text-gray-700">Welcome to AI Assistant!</h3>
                            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                              I'm here to help you with content creation, analytics, SERP analysis, and much more. 
                              Start by asking me anything or try one of the quick actions.
                            </p>
                          </div>
                        )}
                        
                        {messages.map(renderMessage)}
                        
                        {isProcessing && (
                          <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center">
                              <Bot className="h-5 w-5 text-white" />
                            </div>
                            <div className="bg-white/80 border border-gray-200 rounded-2xl p-4 shadow-lg">
                              <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                                <span className="text-sm text-gray-600">AI is thinking...</span>
                              </div>
                            </div>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>
                  </CardContent>

                  {/* Enhanced Input Area */}
                  <div className="border-t bg-gradient-to-r from-blue-500/5 to-purple-500/5 p-4 rounded-b-lg">
                    <div className="flex gap-3">
                      <div className="flex-1 relative">
                        <Textarea
                          ref={textareaRef}
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Ask me anything about content creation, analytics, or platform features..."
                          className="min-h-[60px] resize-none pr-12 border-0 bg-white/80 backdrop-blur-sm shadow-sm focus:ring-2 focus:ring-blue-500/20"
                          disabled={isProcessing}
                        />
                        <div className="absolute right-2 bottom-2 text-xs text-muted-foreground">
                          {inputValue.length}/1000
                        </div>
                      </div>
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
                          className="p-2 hover:bg-blue-50"
                          disabled={isProcessing}
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={handleSendMessage}
                          disabled={!inputValue.trim() || isProcessing}
                          size="sm"
                          className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Enhanced Sidebar */}
              <div className="xl:col-span-1">
                <Card className="shadow-xl border-0 bg-white/60 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Recent Conversations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3 max-h-96 overflow-auto">
                    {isLoadingConversations ? (
                      <div className="text-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-500" />
                      </div>
                    ) : conversations.length > 0 ? (
                      conversations.slice(0, 5).map((conv) => (
                        <div
                          key={conv.id}
                          className={`p-3 rounded-lg cursor-pointer transition-all hover:bg-blue-50 border ${
                            currentConversation?.id === conv.id 
                              ? 'bg-blue-100 border-blue-200' 
                              : 'bg-white/50 border-gray-200'
                          }`}
                          onClick={() => loadConversation(conv.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{conv.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(conv.updated_at).toLocaleDateString()}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteConversation(conv.id);
                              }}
                              className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No conversations yet. Start chatting to see your history!
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="conversations" className="mt-0">
            <Card className="shadow-xl border-0 bg-white/60 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                <div className="flex items-center justify-between">
                  <CardTitle>Conversation History</CardTitle>
                  <Button onClick={handleCreateNewConversation} size="sm" className="bg-gradient-to-r from-blue-500 to-purple-600">
                    <Plus className="h-4 w-4 mr-2" />
                    New Chat
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {conversations.map((conv) => (
                    <div
                      key={conv.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => loadConversation(conv.id)}
                    >
                      <div>
                        <h3 className="font-medium">{conv.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(conv.updated_at).toLocaleString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(conv.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action, idx) => (
                <Card 
                  key={idx} 
                  className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 bg-white/60 backdrop-blur-sm overflow-hidden group"
                  onClick={action.action}
                >
                  <CardContent className="p-6 text-center relative">
                    <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />
                    <div className={`w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-lg`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <p className="font-semibold text-gray-800 mb-2">{action.label}</p>
                    <p className="text-xs text-muted-foreground">Click to get started</p>
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
