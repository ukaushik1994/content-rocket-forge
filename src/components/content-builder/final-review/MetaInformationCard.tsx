
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface MetaInformationCardProps {
  metaTitle: string;
  metaDescription: string;
  onMetaTitleChange: (value: string) => void;
  onMetaDescriptionChange: (value: string) => void;
  onGenerateMeta: () => void;
}

export const MetaInformationCard = ({
  metaTitle,
  metaDescription,
  onMetaTitleChange,
  onMetaDescriptionChange,
  onGenerateMeta
}: MetaInformationCardProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleGenerateWithAI = async () => {
    setIsGenerating(true);
    try {
      // Call the existing onGenerateMeta function that was passed as prop
      onGenerateMeta();
      // This is handled by the parent component's useMetaGenerator hook
    } catch (error) {
      console.error('Error generating meta information:', error);
      toast.error('Failed to generate meta information');
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-2 border-b">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
          Meta Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4 overflow-hidden">
        <div className="space-y-2">
          <label htmlFor="meta-title" className="text-sm font-medium flex justify-between">
            <span>Meta Title</span>
            <span className={`text-xs ${metaTitle.length > 60 || metaTitle.length < 50 ? 'text-destructive' : 'text-muted-foreground'}`}>
              {metaTitle.length}/60 characters{metaTitle.length < 50 ? ' (too short, min 50)' : ''}
            </span>
          </label>
          <Input
            id="meta-title"
            value={metaTitle}
            onChange={(e) => onMetaTitleChange(e.target.value)}
            placeholder="Enter meta title"
            className={`font-medium ${metaTitle.length > 60 || metaTitle.length < 50 ? 'border-destructive' : ''}`}
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="meta-description" className="text-sm font-medium flex justify-between">
            <span>Meta Description</span>
            <span className={`text-xs ${metaDescription.length > 160 ? 'text-destructive' : 'text-muted-foreground'}`}>
              {metaDescription.length}/160 characters
            </span>
          </label>
          <Textarea
            id="meta-description"
            value={metaDescription}
            onChange={(e) => onMetaDescriptionChange(e.target.value)}
            placeholder="Enter meta description"
            rows={4}
            className={metaDescription.length > 160 ? 'border-destructive' : ''}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          className="w-full flex items-center gap-2 bg-secondary/20 hover:bg-secondary/40"
          onClick={handleGenerateWithAI}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" /> Generate Meta Info
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
