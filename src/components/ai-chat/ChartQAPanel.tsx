import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Send, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ChartConfiguration } from '@/types/enhancedChat';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChartQAPanelProps {
  charts: ChartConfiguration[];
  context?: any;
  initialInsights?: any;
}

export const ChartQAPanel: React.FC<ChartQAPanelProps> = ({
  charts,
  context,
  initialInsights
}) => {
  const [input, setInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAskQuestion = async (question: string) => {
    if (!question.trim() || isLoading) return;

    setIsLoading(true);
    
    // Add user message immediately
    const userMessage: ChatMessage = { role: 'user', content: question };
    setChatHistory(prev => [...prev, userMessage]);
    setInput('');

    try {
      const { data, error } = await supabase.functions.invoke('chart-qa', {
        body: {
          question,
          charts: charts.map(c => ({
            title: c.title,
            type: c.type,
            data: c.data?.slice(0, 50) // Send sample data to avoid token limits
          })),
          context,
          previousInsights: initialInsights,
          conversationHistory: chatHistory
        }
      });

      if (error) throw error;

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.answer || 'I apologize, but I couldn\'t generate a response. Please try rephrasing your question.'
      };
      
      setChatHistory(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Error asking AI:', error);
      toast({
        title: 'Error',
        description: 'Failed to get AI response. Please try again.',
        variant: 'destructive'
      });
      
      // Remove the user message if failed
      setChatHistory(prev => prev.slice(0, -1));
      setInput(question); // Restore the question
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    "What's the main trend in this data?",
    "Why do we see these anomalies?",
    "What should I focus on next?",
    "Compare the performance across charts"
  ];

  return (
    <Card className="mt-4 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="w-5 h-5 text-primary" />
          Ask AI About Your Data
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Have questions? Ask me anything about the charts and data above.
        </p>
      </CardHeader>
      <CardContent>
        {/* Quick action buttons */}
        {chatHistory.length === 0 && (
          <div className="flex gap-2 mb-4 flex-wrap">
            {quickQuestions.map((q, idx) => (
              <Button
                key={idx}
                size="sm"
                variant="outline"
                onClick={() => handleAskQuestion(q)}
                disabled={isLoading}
                className="text-xs"
              >
                {q}
              </Button>
            ))}
          </div>
        )}

        {/* Chat messages */}
        {chatHistory.length > 0 && (
          <ScrollArea className="h-[300px] mb-4 pr-4">
            <div className="space-y-3">
              {chatHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "p-3 rounded-lg animate-in fade-in slide-in-from-bottom-2 duration-300",
                    msg.role === 'user'
                      ? "bg-primary/10 ml-8 border border-primary/20"
                      : "bg-muted mr-8"
                  )}
                >
                  <div className="flex items-start gap-2">
                    {msg.role === 'assistant' && (
                      <MessageSquare className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                    )}
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="bg-muted mr-8 p-3 rounded-lg animate-in fade-in">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">AI is thinking...</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}

        {/* Input area */}
        <div className="flex gap-2">
          <Input
            placeholder="Ask anything about your data..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAskQuestion(input);
              }
            }}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={() => handleAskQuestion(input)}
            disabled={!input.trim() || isLoading}
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

        {chatHistory.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setChatHistory([])}
            className="mt-2 text-xs"
          >
            Clear conversation
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
