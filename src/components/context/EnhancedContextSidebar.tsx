import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  History, 
  BookmarkPlus, 
  Brain, 
  Filter,
  Clock,
  Tag,
  ArrowRight,
  Lightbulb,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { enhancedContextManager } from '@/services/context/EnhancedContextManager';
import { useChatContextBridge } from '@/contexts/ChatContextBridge';
import { useAuth } from '@/contexts/AuthContext';

interface SmartSuggestion {
  id: string;
  type: 'context_switch' | 'related_conversation' | 'workflow_continuation' | 'performance_insight';
  title: string;
  description: string;
  confidence: number;
  actionData: Record<string, any>;
  priority: 'high' | 'medium' | 'low';
}

interface ContextSearchResult {
  conversationId: string;
  title: string;
  relevantMessages: Array<{ content: string; relevance: number }>;
  lastActivity: Date;
}

interface EnhancedContextSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentConversationId?: string;
  onNavigateToConversation: (conversationId: string) => void;
}

export const EnhancedContextSidebar: React.FC<EnhancedContextSidebarProps> = ({
  isOpen,
  onClose,
  currentConversationId,
  onNavigateToConversation
}) => {
  const { user } = useAuth();
  const { sharedMessages, persistentContext } = useChatContextBridge();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ContextSearchResult[]>([]);
  const [smartSuggestions, setSmartSuggestions] = useState<SmartSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('suggestions');

  // Initialize context manager with user ID
  useEffect(() => {
    if (user) {
      enhancedContextManager.setUserId(user.id);
    }
  }, [user]);

  // Load smart suggestions
  useEffect(() => {
    if (user && isOpen) {
      loadSmartSuggestions();
    }
  }, [user, isOpen, sharedMessages]);

  const loadSmartSuggestions = async () => {
    setIsLoading(true);
    try {
      const suggestions = await enhancedContextManager.getSmartSuggestions(
        currentConversationId,
        sharedMessages.slice(-5)
      );
      setSmartSuggestions(suggestions);
    } catch (error) {
      console.error('Error loading smart suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || !user) return;

    setIsLoading(true);
    try {
      const results = await enhancedContextManager.searchContextAcrossSessions(
        searchQuery,
        {
          dateRange: {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
            end: new Date()
          }
        }
      );
      setSearchResults(results);
      setActiveTab('search');
    } catch (error) {
      console.error('Error searching context:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: SmartSuggestion) => {
    switch (suggestion.type) {
      case 'related_conversation':
        if (suggestion.actionData.conversationId) {
          onNavigateToConversation(suggestion.actionData.conversationId);
          onClose();
        }
        break;
      case 'workflow_continuation':
        // Handle workflow continuation
        console.log('Continue workflow:', suggestion.actionData);
        break;
      case 'performance_insight':
        // Handle performance insight action
        console.log('Performance action:', suggestion.actionData);
        break;
      default:
        console.log('Handle suggestion:', suggestion);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'related_conversation': return History;
      case 'workflow_continuation': return Zap;
      case 'performance_insight': return TrendingUp;
      case 'context_switch': return ArrowRight;
      default: return Lightbulb;
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ x: -400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -400, opacity: 0 }}
      className="fixed left-0 top-0 h-full w-80 bg-background border-r border-border z-50 shadow-lg"
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Smart Context</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>

          {/* Search */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button
              size="sm"
              onClick={handleSearch}
              disabled={isLoading || !searchQuery.trim()}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3 m-4 mb-0">
              <TabsTrigger value="suggestions" className="text-xs">
                Suggestions
              </TabsTrigger>
              <TabsTrigger value="search" className="text-xs">
                Search
              </TabsTrigger>
              <TabsTrigger value="history" className="text-xs">
                History
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden">
              {/* Smart Suggestions Tab */}
              <TabsContent value="suggestions" className="h-full m-0">
                <ScrollArea className="h-full p-4">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : smartSuggestions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm">No suggestions available</p>
                      <p className="text-xs mt-1">Continue chatting to get smart recommendations</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <AnimatePresence>
                        {smartSuggestions.map((suggestion, index) => {
                          const IconComponent = getTypeIcon(suggestion.type);
                          return (
                            <motion.div
                              key={suggestion.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <Card 
                                className="cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => handleSuggestionClick(suggestion)}
                              >
                                <CardContent className="p-3">
                                  <div className="flex items-start gap-3">
                                    <div className="p-1.5 bg-primary/10 rounded-md flex-shrink-0">
                                      <IconComponent className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-medium text-sm truncate">
                                          {suggestion.title}
                                        </h4>
                                        <Badge 
                                          variant={getPriorityColor(suggestion.priority)}
                                          className="text-xs flex-shrink-0"
                                        >
                                          {suggestion.confidence}%
                                        </Badge>
                                      </div>
                                      <p className="text-xs text-muted-foreground line-clamp-2">
                                        {suggestion.description}
                                      </p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              {/* Search Results Tab */}
              <TabsContent value="search" className="h-full m-0">
                <ScrollArea className="h-full p-4">
                  {searchResults.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm">No search results</p>
                      <p className="text-xs mt-1">Try different keywords</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {searchResults.map((result) => (
                        <Card 
                          key={result.conversationId}
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => {
                            onNavigateToConversation(result.conversationId);
                            onClose();
                          }}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-sm truncate flex-1">
                                {result.title}
                              </h4>
                              <Badge variant="outline" className="text-xs ml-2">
                                {result.relevantMessages.length} matches
                              </Badge>
                            </div>
                            
                            {result.relevantMessages.slice(0, 2).map((message, index) => (
                              <div key={index} className="mb-1">
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                  {message.content}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <div 
                                    className="h-1 bg-primary rounded-full"
                                    style={{ width: `${message.relevance * 100}%` }}
                                  />
                                  <span className="text-xs text-muted-foreground">
                                    {Math.round(message.relevance * 100)}%
                                  </span>
                                </div>
                              </div>
                            ))}
                            
                            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{result.lastActivity.toLocaleDateString()}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              {/* History Tab */}
              <TabsContent value="history" className="h-full m-0">
                <ScrollArea className="h-full p-4">
                  <div className="space-y-3">
                    {/* Context Snapshots */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <BookmarkPlus className="h-4 w-4" />
                          Recent Contexts
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="text-xs text-muted-foreground">
                          No saved contexts yet
                        </div>
                        <Button variant="outline" size="sm" className="w-full text-xs">
                          Save Current Context
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Workflow States */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          Active Workflows
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-xs text-muted-foreground">
                          No active workflows
                        </div>
                      </CardContent>
                    </Card>

                    {/* Persistent Context */}
                    {Object.keys(persistentContext).length > 0 && (
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Tag className="h-4 w-4" />
                            Persistent Data
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-1">
                            {Object.entries(persistentContext).map(([key, value]) => (
                              <div key={key} className="text-xs">
                                <span className="font-mono text-muted-foreground">{key}:</span>
                                <span className="ml-1 truncate">
                                  {typeof value === 'string' ? value : JSON.stringify(value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </motion.div>
  );
};