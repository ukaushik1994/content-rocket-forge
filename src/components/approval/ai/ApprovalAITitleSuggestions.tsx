
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Heading, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useApproval } from '../context/ApprovalContext';
import { ContentItemType } from '@/contexts/content/types';

interface ApprovalAITitleSuggestionsProps {
  content: ContentItemType;
  onSelectTitle: (title: string) => void;
  className?: string;
}

export const ApprovalAITitleSuggestions: React.FC<ApprovalAITitleSuggestionsProps> = ({
  content,
  onSelectTitle,
  className = ''
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
  const { generateTitleSuggestions } = useApproval();

  const handleGenerateTitles = async () => {
    setIsGenerating(true);
    try {
      const suggestions = await generateTitleSuggestions(content);
      setTitleSuggestions(suggestions);
    } catch (error) {
      console.error('Failed to generate titles:', error);
      toast.error('Failed to generate title suggestions');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectTitle = (title: string) => {
    onSelectTitle(title);
    toast.success('Title applied successfully');
  };

  return (
    <Card className={`border-white/10 bg-gradient-to-br from-purple-900/20 to-black/20 backdrop-blur-sm overflow-hidden ${className}`}>
      <CardHeader className="pb-2 border-b border-white/10">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Heading className="h-4 w-4 text-neon-purple" /> 
          AI Title Suggestions
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-4">
        {titleSuggestions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-4">
            <Button 
              onClick={handleGenerateTitles}
              disabled={isGenerating}
              variant="outline" 
              className="bg-white/5 border-neon-purple/30 hover:bg-white/10"
            >
              <Sparkles className="h-4 w-4 mr-2 text-neon-purple" />
              {isGenerating ? 'Generating...' : 'Generate Title Suggestions'}
            </Button>
            {isGenerating && (
              <p className="text-xs text-white/50 mt-2">Analyzing content for optimal titles...</p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-white/70 mb-2">
              Select one of the AI-generated titles below:
            </p>
            {titleSuggestions.map((title, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="group flex items-center justify-between p-2 border border-white/10 rounded-md hover:bg-white/5"
              >
                <p className="text-sm">{title}</p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleSelectTitle(title)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Check className="h-4 w-4" />
                </Button>
              </motion.div>
            ))}
            <div className="flex justify-center mt-4">
              <Button
                onClick={handleGenerateTitles}
                disabled={isGenerating}
                variant="outline"
                size="sm" 
                className="bg-white/5 border-neon-purple/30 hover:bg-white/10"
              >
                <Sparkles className="h-4 w-4 mr-2 text-neon-purple" />
                Regenerate
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
