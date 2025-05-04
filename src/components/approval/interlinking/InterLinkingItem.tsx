
import React, { useState } from 'react';
import { ContentItemType } from '@/contexts/content/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useContent } from '@/contexts/content';
import { toast } from 'sonner';
import { Link } from 'lucide-react';

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
    } catch (error) {
      console.error('Error adding link:', error);
      toast.error('Failed to add link');
    } finally {
      setIsAdding(false);
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{targetContent.title}</h3>
            <Badge variant={relevanceScore > 70 ? "default" : "secondary"}>
              {Math.round(relevanceScore)}% relevance
            </Badge>
          </div>
          
          <div className="flex flex-wrap gap-1 mt-1">
            {targetContent.keywords?.map((keyword, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {keyword}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-4">
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {targetContent.content?.substring(0, 150)}...
        </p>
        
        <div className="flex flex-col gap-2">
          <label htmlFor={`anchorText-${targetContent.id}`} className="text-sm font-medium">
            Link Text
          </label>
          <Input 
            id={`anchorText-${targetContent.id}`}
            value={anchorText}
            onChange={(e) => setAnchorText(e.target.value)}
            placeholder="Enter anchor text for the link"
          />
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-4">
        <div className="flex gap-2 w-full justify-end">
          <Button 
            onClick={handleAddLink}
            disabled={isAdding || !anchorText}
            className="gap-1"
          >
            <Link className="h-4 w-4" />
            Add Link
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
