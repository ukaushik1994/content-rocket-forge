
import React, { useState } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Wand2 } from 'lucide-react';
import { toast } from 'sonner';

export const SeoMetaCard = () => {
  const { state, dispatch, generateSeoMeta } = useContentBuilder();
  const { metaTitle, metaDescription, mainKeyword, content } = state;
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'SET_META_TITLE', payload: e.target.value });
  };
  
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    dispatch({ type: 'SET_META_DESCRIPTION', payload: e.target.value });
  };

  const handleGenerateSeoMeta = async () => {
    if (!mainKeyword || !content) {
      toast.error('Need main keyword and content to generate SEO meta');
      return;
    }
    
    setIsGenerating(true);
    try {
      // Generate SEO meta using AI based on content and keyword
      const result = await generateSeoMeta();
      if (result) {
        toast.success('Generated SEO meta information');
      }
    } catch (error) {
      toast.error('Failed to generate SEO meta');
      console.error('Error generating SEO meta:', error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <Card className="border border-white/20 bg-card/30 backdrop-blur-sm shadow-lg">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-medium">SEO Meta Information</CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1 border-neon-purple/50 bg-neon-purple/10 hover:bg-neon-purple/20 text-neon-purple"
          onClick={handleGenerateSeoMeta}
          disabled={isGenerating}
        >
          <Wand2 className="h-3.5 w-3.5" />
          {isGenerating ? 'Generating...' : 'Generate'}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="meta-title" className="text-xs text-muted-foreground">Meta Title</Label>
          <Input 
            id="meta-title"
            value={metaTitle} 
            onChange={handleTitleChange}
            placeholder="Enter SEO optimized title"
            className="bg-white/5 border-white/10 focus-visible:ring-primary/30"
          />
          <div className="text-xs text-muted-foreground">
            {metaTitle?.length || 0}/60 characters
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="meta-description" className="text-xs text-muted-foreground">Meta Description</Label>
          <Textarea 
            id="meta-description"
            value={metaDescription} 
            onChange={handleDescriptionChange}
            placeholder="Enter SEO optimized description"
            className="bg-white/5 border-white/10 focus-visible:ring-primary/30"
            rows={3}
          />
          <div className="text-xs text-muted-foreground">
            {metaDescription?.length || 0}/160 characters
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
