
import React, { useState } from 'react';
import { ContentItemType } from '@/contexts/content/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useContent } from '@/contexts/content';
import { toast } from 'sonner';
import { Link, ArrowUpRight, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface InterLinkingItemProps {
  suggestion: {
    sourceContent: ContentItemType;
    targetContent: ContentItemType;
    relevanceScore: number;
    suggestedAnchorText: string;
  };
  sourceContent: ContentItemType;
}

export const InterLinkingItem: React.FC<InterLinkingItemProps> = ({ 
  suggestion,
  sourceContent
}) => {
  const { targetContent, relevanceScore, suggestedAnchorText } = suggestion;
  const [anchorText, setAnchorText] = useState(suggestedAnchorText);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const { updateContentItem } = useContent();
  
  const handleAddLink = async () => {
    setIsAdding(true);
    
    try {
      // Create markdown link
      const markdownLink = `[${anchorText}](/content/${targetContent.id})`;
      
      // Append to the end of the content
      const updatedContent = `${sourceContent.content}\n\n### Related Content\n${markdownLink}`;
      
      // Update the content
      await updateContentItem(sourceContent.id, { content: updatedContent });
      
      toast.success(`Successfully linked to "${targetContent.title}"`);
      setIsAdded(true);
    } catch (error) {
      console.error('Error adding link:', error);
      toast.error('Failed to add link');
    } finally {
      setIsAdding(false);
    }
  };
  
  const getRelevanceBadgeColor = () => {
    if (relevanceScore > 85) return "bg-green-600/20 text-green-400 border-green-600/30";
    if (relevanceScore > 70) return "bg-neon-blue/20 text-neon-blue border-neon-blue/30";
    return "bg-amber-600/20 text-amber-400 border-amber-600/30";
  };
  
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden border-white/10 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm shadow-xl">
        <CardHeader className="pb-2 relative">
          <div className="absolute top-0 left-0 h-full w-1 bg-neon-blue" />
          
          <div className="flex flex-col gap-1 pl-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white/90 flex items-center gap-2">
                {targetContent.title}
                <ArrowUpRight className="h-4 w-4 text-white/50" />
              </h3>
              <Badge variant="outline" className={`${getRelevanceBadgeColor()}`}>
                {Math.round(relevanceScore)}% relevance
              </Badge>
            </div>
            
            <div className="flex flex-wrap gap-1 mt-1">
              {targetContent.keywords?.map((keyword, i) => (
                <Badge key={i} variant="outline" className="text-xs bg-white/5 border-white/20 text-white/70">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pb-4 pl-4">
          <p className="text-white/60 text-sm mb-4 line-clamp-2 border-l-2 border-white/10 pl-3">
            {targetContent.content?.substring(0, 150)}...
          </p>
          
          <div className="flex flex-col gap-2 bg-white/5 rounded-lg p-4 border border-white/10">
            <label htmlFor={`anchorText-${targetContent.id}`} className="text-sm font-medium text-white/80 flex items-center gap-2">
              <Link className="h-4 w-4 text-neon-blue" />
              Link Text
            </label>
            <Input 
              id={`anchorText-${targetContent.id}`}
              value={anchorText}
              onChange={(e) => setAnchorText(e.target.value)}
              placeholder="Enter anchor text for the link"
              className="bg-gray-800/50 border-white/10 focus-visible:ring-neon-blue/50"
              disabled={isAdded}
            />
          </div>
        </CardContent>
        
        <CardFooter className="border-t border-white/10 pt-4">
          <div className="flex gap-2 w-full justify-end">
            <Button 
              onClick={handleAddLink}
              disabled={isAdding || !anchorText || isAdded}
              className={isAdded ? 
                "bg-green-600 hover:bg-green-700" : 
                "bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple"
              }
            >
              {isAdded ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Link Added
                </>
              ) : (
                <>
                  <Link className="h-4 w-4 mr-2" />
                  Add Link
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};
