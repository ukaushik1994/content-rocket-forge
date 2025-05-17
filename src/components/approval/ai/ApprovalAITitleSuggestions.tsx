
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ContentItemType } from '@/contexts/content/types';
import { useApproval } from '../context/ApprovalContext';
import { Wand2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface ApprovalAITitleSuggestionsProps {
  content: ContentItemType;
  onSelectTitle: (title: string) => void;
}

export const ApprovalAITitleSuggestions: React.FC<ApprovalAITitleSuggestionsProps> = ({ 
  content, 
  onSelectTitle 
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
  
  const { generateTitleSuggestions } = useApproval();
  
  useEffect(() => {
    generateTitles();
  }, [content]);
  
  const generateTitles = async () => {
    setIsLoading(true);
    try {
      const titles = await generateTitleSuggestions(content);
      setSuggestions(titles);
    } catch (error) {
      console.error('Error generating titles:', error);
      toast.error('Failed to generate title suggestions');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSelectTitle = (title: string) => {
    setSelectedTitle(title);
    onSelectTitle(title);
    toast.success('Title selected');
  };
  
  const handleRefreshTitles = () => {
    generateTitles();
    toast.success('Refreshing title suggestions');
  };
  
  return (
    <Card className="border-white/10 bg-black/20 backdrop-blur-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-white/10 bg-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-neon-purple" />
            <h3 className="text-sm font-medium">AI Title Suggestions</h3>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRefreshTitles} 
            disabled={isLoading}
            className="text-xs h-7 px-2 text-white/70 hover:text-white"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-white"></div>
            ) : (
              'Refresh'
            )}
          </Button>
        </div>
      </div>
      
      <CardContent className="p-3 space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-neon-purple"></div>
          </div>
        ) : (
          <>
            {suggestions.length > 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.1 }}
                className="space-y-2"
              >
                {suggestions.map((title, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className={`w-full justify-between text-left font-normal ${
                        selectedTitle === title 
                          ? 'bg-neon-purple/20 border-neon-purple/50 text-white' 
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                      onClick={() => handleSelectTitle(title)}
                    >
                      <span className="line-clamp-1">{title}</span>
                      {selectedTitle === title && (
                        <Check className="h-4 w-4 text-neon-purple ml-2" />
                      )}
                    </Button>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="text-center p-6">
                <p className="text-sm text-muted-foreground">No title suggestions available</p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
