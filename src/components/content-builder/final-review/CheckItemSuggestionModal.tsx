import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, ThumbsUp, ThumbsDown, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import AIServiceController from '@/services/aiService/AIServiceController';

interface CheckItemSuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  checkTitle: string;
  onFeedback?: (suggestion: string, helpful: boolean) => void;
}

interface Suggestion {
  id: string;
  text: string;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
}

export const CheckItemSuggestionModal = ({ 
  isOpen, 
  onClose, 
  checkTitle, 
  onFeedback 
}: CheckItemSuggestionModalProps) => {
  const { state } = useContentBuilder();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<string[]>([]);

  // Generate AI suggestions based on check title and content
  const generateAISuggestions = async (title: string): Promise<Suggestion[]> => {
    try {
      const prompt = `Analyze the following content issue and provide specific suggestions for improvement:

Check Issue: ${title}
Content: ${state.content || 'No content provided'}
Main Keyword: ${state.mainKeyword || 'Not specified'}
Meta Title: ${state.metaTitle || 'Not specified'}
Meta Description: ${state.metaDescription || 'Not specified'}

Please provide 3-5 actionable suggestions to address this specific issue.`;

      const response = await AIServiceController.generate({
        input: prompt,
        use_case: 'suggestion_generation',
        temperature: 0.7,
        max_tokens: 800
      });

      if (response?.content) {
        try {
          // Try to parse as JSON first
          const parsed = JSON.parse(response.content);
          if (Array.isArray(parsed)) {
            return parsed.map((item, index) => ({
              id: `ai-${index}`,
              text: item.text || item.suggestion || String(item),
              priority: item.priority || 'medium',
              actionable: item.actionable !== false
            }));
          }
        } catch (parseError) {
          // If JSON parsing fails, extract suggestions from text
          console.log('Parsing as text instead of JSON');
        }
        
        // Fallback: parse text response
        const suggestions = response.content
          .split('\n')
          .filter(line => line.trim() && (line.includes('-') || line.includes('•') || line.includes('1.') || line.includes('2.')))
          .slice(0, 5)
          .map((text, index) => ({
            id: `ai-${index}`,
            text: text.replace(/^[-•\d.]\s*/, '').trim(),
            priority: index === 0 ? 'high' : index < 3 ? 'medium' : 'low',
            actionable: true
          }));
          
        return suggestions.length > 0 ? suggestions : getFallbackSuggestions(title);
      }
      
      return getFallbackSuggestions(title);
    } catch (error) {
      console.error('AI suggestion generation failed:', error);
      return getFallbackSuggestions(title);
    }
  };

  // Fallback suggestions if AI fails
  const getFallbackSuggestions = (title: string): Suggestion[] => {
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('keyword')) {
      return [
        { id: '1', text: 'Add your primary keyword 2-3 more times naturally throughout the content', priority: 'high', actionable: true },
        { id: '2', text: 'Include keyword variations and synonyms for better relevance', priority: 'medium', actionable: true },
        { id: '3', text: 'Use the keyword in subheadings and the first paragraph', priority: 'medium', actionable: true }
      ];
    }
    
    if (titleLower.includes('meta')) {
      return [
        { id: '1', text: 'Create a compelling title under 60 characters with your main keyword', priority: 'high', actionable: true },
        { id: '2', text: 'Add emotional triggers or numbers to improve click-through rates', priority: 'medium', actionable: true },
        { id: '3', text: 'Ensure the title accurately represents your content', priority: 'low', actionable: true }
      ];
    }
    
    if (titleLower.includes('solution') || titleLower.includes('product')) {
      return [
        { id: '1', text: 'Highlight specific benefits and features of your solution', priority: 'high', actionable: true },
        { id: '2', text: 'Add customer testimonials or case studies for credibility', priority: 'medium', actionable: true },
        { id: '3', text: 'Include clear call-to-action buttons throughout the content', priority: 'high', actionable: true }
      ];
    }
    
    return [
      { id: '1', text: 'Review the specific requirements for this check', priority: 'high', actionable: true },
      { id: '2', text: 'Consult content guidelines for detailed optimization tips', priority: 'medium', actionable: true },
      { id: '3', text: 'Test different approaches and measure their impact', priority: 'low', actionable: true }
    ];
  };

  useEffect(() => {
    if (isOpen && checkTitle) {
      setIsLoading(true);
      setFeedbackGiven([]);
      
      generateAISuggestions(checkTitle).then((newSuggestions) => {
        setSuggestions(newSuggestions);
        setIsLoading(false);
      }).catch(() => {
        setSuggestions(getFallbackSuggestions(checkTitle));
        setIsLoading(false);
      });
    }
  }, [isOpen, checkTitle, state.content]);

  const handleFeedback = (suggestion: Suggestion, helpful: boolean) => {
    setFeedbackGiven(prev => [...prev, suggestion.id]);
    onFeedback?.(suggestion.text, helpful);
    
    toast.success(
      helpful ? 'Thanks for the positive feedback!' : 'Thanks for the feedback - we\'ll improve our suggestions',
      { id: `feedback-${suggestion.id}` }
    );
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'bg-red-50 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            AI Suggestions for: {checkTitle}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 overflow-y-auto max-h-[60vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
              <span className="text-muted-foreground">Generating personalized suggestions...</span>
            </div>
          ) : (
            <AnimatePresence>
              {suggestions.map((suggestion, index) => (
                <motion.div
                  key={suggestion.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-l-4 border-l-primary/30">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-3">
                        <Badge 
                          variant="outline" 
                          className={getPriorityColor(suggestion.priority)}
                        >
                          {suggestion.priority} priority
                        </Badge>
                        {suggestion.actionable && (
                          <Badge variant="secondary" className="text-xs">
                            Actionable
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm leading-relaxed mb-4">
                        {suggestion.text}
                      </p>
                      
                      {!feedbackGiven.includes(suggestion.id) && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Was this helpful?</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleFeedback(suggestion, true)}
                            className="h-7 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <ThumbsUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleFeedback(suggestion, false)}
                            className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <ThumbsDown className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                      
                      {feedbackGiven.includes(suggestion.id) && (
                        <div className="flex items-center gap-1 text-green-600 text-xs">
                          <CheckCircle className="h-3 w-3" />
                          <span>Thanks for your feedback!</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
        
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};