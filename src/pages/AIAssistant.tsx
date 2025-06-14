
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
import { Helmet } from 'react-helmet-async';
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
        
        <div className={`rounded-2xl p-4 shadow-lg backdrop-blur-sm border card-glass ${
          message.type === 'user' 
            ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white border-white/20' 
            : message.status === 'error' 
              ? 'bg-red-50/80 border-red-200 text-red-800' 
              : 'bg-white/80 border-white/30 text-gray-800'
        }`}>
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm whitespace-pre-wrap leading-relaxed flex-1">{message.content}</p>
            <span className="ml-2 text-xs opacity-60">
              {getStatusIcon(message.status)}
            </span>
          </div>
          
          {/* Smart Suggestions Display */}
          {message.type === 'agent' && message.suggestions && message.suggestions.length > 0 && (
            <div className="mt-4 space-y-2">
              <div className="text-xs font-medium opacity-75 mb-2 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Smart Suggestions:
              </div>
              {message.suggestions.slice(0, 3).map((suggestion, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-black/5 rounded-lg p-3 text-xs border border-black/10 hover:bg-black/10 cursor-pointer transition-all hover:scale-105 card-3d"
                  onClick={() => {
                    if (suggestion.actionType === 'navigation') {
                      navigate(suggestion.actionData.page);
                    } else if (suggestion.actionType === 'function_call') {
                      setInputValue(suggestion.actionText);
                    }
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full ${
                      suggestion.priority === 'critical' ? 'bg-red-500 animate-pulse' :
                      suggestion.priority === 'high' ? 'bg-orange-500' :
                      suggestion.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}></span>
                    <span className="font-medium">{suggestion.title}</span>
                    {suggestion.confidence && (
                      <Badge variant="secondary" className="text-xs px-1 py-0">
                        {Math.round(suggestion.confidence * 100)}%
                      </Badge>
                    )}
                  </div>
                  <div className="opacity-75 mb-1">{suggestion.description}</div>
                  {suggestion.expectedImpact && (
                    <div className="text-xs opacity-60 italic">💡 {suggestion.expectedImpact}</div>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {/* Productivity Insights */}
          {message.type === 'agent' && message.insights && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 glass-panel rounded-lg p-3 text-xs border border-white/20"
            >
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-3 w-3 text-neon-purple" />
                <span className="font-medium text-gradient">Workflow Intelligence</span>
              </div>
              <div className="space-y-1 opacity-90">
                <div className="flex items-center gap-2">
                  <span>📊</span>
                  <span>Productivity Score: <span className="font-semibold">{message.insights.productivityScore}/100</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <span>⏱️</span>
                  <span>Est. Completion: <span className="font-semibold">{message.insights.timeToCompletion.estimated}</span></span>
                </div>
                {message.insights.predictions.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span>🔮</span>
                    <span>{message.insights.predictions.length} predictive insights available</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Function Calls */}
          {message.functionCalls && message.functionCalls.length > 0 && (
            <div className="mt-4 space-y-2">
              {message.functionCalls.map((call, idx) => (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass-panel rounded-lg p-3 text-xs border border-white/20"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={call.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                      {call.name}
                    </Badge>
                    {call.status === 'executing' && <Loader2 className="h-3 w-3 animate-spin text-neon-purple" />}
                  </div>
                  {call.result && (
                    <div className="opacity-75">
                      {call.status === 'error' ? 'Error: ' + call.result.error : 'Completed successfully'}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
          
          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-3 space-y-2">
              {message.attachments.map((att, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs opacity-75 glass-panel rounded-lg p-2 border border-white/20">
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

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { duration: 0.5, staggerChildren: 0.1 }
    },
    exit: { opacity: 0, transition: { duration: 0.3 } }
  };

  const itemVariants = {
    initial: { y: 20, opacity: 0 },
    animate: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  if (!user) {
    return (
      <motion.div 
        className="min-h-screen flex flex-col bg-background"
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <Helmet>
          <title>AI Assistant | ContentRocketForge</title>
          <meta name="description" content="Your intelligent AI assistant for content creation and optimization" />
        </Helmet>
        
        <Navbar />
        
        <main className="flex-1 container py-8">
          <motion.div variants={itemVariants} className="text-center py-12">
            <div className="relative mb-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center shadow-neon">
                <Bot className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4 text-gradient">AI Assistant</h1>
            <p className="text-muted-foreground mb-8 text-lg max-w-2xl mx-auto">
              Your intelligent companion with advanced workflow intelligence and predictive insights. 
              Sign in to unlock the full potential of AI-powered content creation.
            </p>
            <Button 
              onClick={() => navigate('/auth')} 
              className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-purple-600 hover:to-blue-600 text-white px-8 py-3 rounded-full shadow-neon hover:shadow-neon-strong transition-all duration-300"
              size="lg"
            >
              Sign In to Continue
            </Button>
          </motion.div>
        </main>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen flex flex-col bg-background futuristic-grid"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <Helmet>
        <title>AI Assistant | ContentRocketForge</title>
        <meta name="description" content="Your intelligent AI assistant for content creation and optimization" />
      </Helmet>
      
      <Navbar />
      
      <main className="flex-1 container py-8 max-w-7xl">
        <motion.div variants={itemVariants} className="mb-8">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold mb-4 text-gradient animate-pulse-glow">
              AI Assistant
            </h1>
            <p className="text-muted-foreground text-xl max-w-3xl mx-auto">
              Your intelligent companion with advanced workflow intelligence and predictive insights
            </p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 glass-panel">
              <TabsTrigger value="chat" className="text-sm">Chat</TabsTrigger>
              <TabsTrigger value="conversations" className="text-sm">History</TabsTrigger>
              <TabsTrigger value="actions" className="text-sm">Quick Actions</TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="mt-0">
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                {/* Main Chat Area */}
                <div className="xl:col-span-3">
                  <Card className="h-[75vh] flex flex-col shadow-neon border-0 card-glass">
                    <CardHeader className="border-b border-white/10 bg-gradient-to-r from-neon-purple/10 to-neon-blue/10 rounded-t-lg">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center shadow-neon animate-pulse-glow">
                            <Bot className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <div className="text-xl text-gradient">AI Assistant</div>
                            {currentConversation && (
                              <div className="text-sm font-normal text-muted-foreground">
                                {currentConversation.title}
                              </div>
                            )}
                          </div>
                        </CardTitle>
                        <div className="flex items-center gap-3">
                          {currentConversation && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={clearCurrentChat}
                              className="glass-panel border-white/20 hover:bg-white/10"
                            >
                              New Chat
                            </Button>
                          )}
                          <Badge 
                            variant="secondary" 
                            className={`text-xs glass-panel ${
                              isProcessing ? 'animate-pulse bg-neon-purple/20' : 'bg-green-500/20'
                            }`}
                          >
                            {isProcessing ? 'Processing...' : 'Ready'}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="flex-1 p-0 overflow-hidden">
                      <ScrollArea className="h-full p-6 custom-scrollbar">
                        {error && (
                          <Alert className="mb-4 border-red-400/50 bg-red-500/10 glass-panel">
                            <AlertCircle className="h-4 w-4 text-red-400" />
                            <AlertDescription className="text-red-200">{error}</AlertDescription>
                          </Alert>
                        )}
                        
                        <div className="space-y-4">
                          {messages.length === 0 && !currentConversation && (
                            <motion.div 
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-center py-16"
                            >
                              <div className="relative mb-6">
                                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center shadow-neon animate-float">
                                  <Bot className="h-10 w-10 text-white" />
                                </div>
                              </div>
                              <h3 className="text-2xl font-semibold mb-4 text-gradient">Welcome to AI Assistant!</h3>
                              <p className="text-muted-foreground mb-8 max-w-md mx-auto text-lg">
                                I'm here to help you with content creation, analytics, SERP analysis, and much more. 
                                Start by asking me anything or try one of the quick actions.
                              </p>
                            </motion.div>
                          )}
                          
                          <AnimatePresence>
                            {messages.map(renderMessage)}
                          </AnimatePresence>
                          
                          {isProcessing && (
                            <motion.div 
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex gap-4"
                            >
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center shadow-neon">
                                <Bot className="h-5 w-5 text-white" />
                              </div>
                              <div className="card-glass rounded-2xl p-4 shadow-neon border border-white/20">
                                <div className="flex items-center gap-3">
                                  <Loader2 className="h-5 w-5 animate-spin text-neon-purple" />
                                  <span className="text-sm text-gradient">AI is thinking...</span>
                                  <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-neon-purple rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-neon-blue rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-2 h-2 bg-neon-pink rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                          <div ref={messagesEndRef} />
                        </div>
                      </ScrollArea>
                    </CardContent>

                    {/* Enhanced Input Area */}
                    <div className="border-t border-white/10 bg-gradient-to-r from-neon-purple/5 to-neon-blue/5 p-6 rounded-b-lg">
                      <div className="flex gap-4">
                        <div className="flex-1 relative">
                          <Textarea 
                            ref={textareaRef}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask me anything about content creation, analytics, or platform features..."
                            className="min-h-[60px] resize-none pr-16 border-0 card-glass backdrop-blur-sm shadow-sm focus:ring-2 focus:ring-neon-purple/50 focus:border-neon-purple/50"
                            disabled={isProcessing}
                          />
                          <div className="absolute right-3 bottom-3 text-xs text-muted-foreground">
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
                            className="p-3 glass-panel border-white/20 hover:bg-white/10 hover:shadow-neon transition-all"
                            disabled={isProcessing}
                          >
                            <Upload className="h-4 w-4" />
                          </Button>
                          <Button 
                            onClick={handleSendMessage}
                            disabled={!inputValue.trim() || isProcessing}
                            size="sm"
                            className="p-3 bg-gradient-to-r from-neon-purple to-neon-blue hover:from-purple-600 hover:to-blue-600 shadow-neon hover:shadow-neon-strong transition-all"
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
                  <Card className="shadow-neon border-0 card-glass">
                    <CardHeader className="bg-gradient-to-r from-neon-purple/10 to-neon-blue/10 border-b border-white/10">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-neon-purple" />
                        Recent Conversations
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3 max-h-96 overflow-auto custom-scrollbar">
                      {isLoadingConversations ? (
                        <div className="text-center py-6">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto text-neon-purple" />
                        </div>
                      ) : conversations.length > 0 ? (
                        conversations.slice(0, 5).map((conv) => (
                          <motion.div
                            key={conv.id}
                            whileHover={{ scale: 1.02 }}
                            className={`p-3 rounded-lg cursor-pointer transition-all hover:shadow-neon border ${
                              currentConversation?.id === conv.id 
                                ? 'bg-neon-purple/20 border-neon-purple/50 shadow-neon' 
                                : 'card-glass border-white/20 hover:bg-white/10'
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
                                className="h-6 w-6 p-0 hover:bg-red-500/20 hover:text-red-400"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-6">
                          No conversations yet. Start chatting to see your history!
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="conversations" className="mt-0">
              <Card className="shadow-neon border-0 card-glass">
                <CardHeader className="bg-gradient-to-r from-neon-purple/10 to-neon-blue/10 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-gradient">Conversation History</CardTitle>
                    <Button 
                      onClick={handleCreateNewConversation} 
                      size="sm" 
                      className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-purple-600 hover:to-blue-600 shadow-neon"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New Chat
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {conversations.map((conv) => (
                      <motion.div
                        key={conv.id}
                        whileHover={{ scale: 1.01 }}
                        className="flex items-center justify-between p-4 border rounded-lg hover:shadow-neon cursor-pointer card-glass border-white/20"
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
                          className="hover:bg-red-500/20 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="actions" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {quickActions.map((action, idx) => (
                  <motion.div
                    key={idx}
                    variants={itemVariants}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Card 
                      className="cursor-pointer hover:shadow-neon transition-all duration-300 border-0 card-glass overflow-hidden group card-3d"
                      onClick={action.action}
                    >
                      <CardContent className="p-6 text-center relative">
                        <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />
                        <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-neon group-hover:shadow-neon-strong transition-all animate-float`}>
                          <action.icon className="h-8 w-8 text-white" />
                        </div>
                        <p className="font-semibold text-lg mb-2 text-gradient">{action.label}</p>
                        <p className="text-xs text-muted-foreground">Click to get started</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </motion.div>
  );
};

export default AIAssistant;
