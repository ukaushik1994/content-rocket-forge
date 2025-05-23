
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ContentItemType } from '@/contexts/content/types';
import { useApproval } from './context/ApprovalContext';
import { FileText, Wand2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useContent } from '@/contexts/content';

interface ApprovalMetadataProps {
  content: ContentItemType;
}

export const ApprovalMetadata: React.FC<ApprovalMetadataProps> = ({ content }) => {
  const [metaTitle, setMetaTitle] = useState(content.metadata?.metaTitle || '');
  const [metaDescription, setMetaDescription] = useState(content.metadata?.metaDescription || content.metadata?.description || '');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { generateMetadata } = useApproval();
  const { updateContentItem } = useContent();
  
  useEffect(() => {
    setMetaTitle(content.metadata?.metaTitle || '');
    setMetaDescription(content.metadata?.metaDescription || content.metadata?.description || '');
  }, [content]);
  
  const handleGenerateMetadata = async () => {
    setIsGenerating(true);
    try {
      const metadata = await generateMetadata(content);
      setMetaTitle(metadata.title);
      setMetaDescription(metadata.description);
      toast.success('Generated SEO metadata');
    } catch (error) {
      console.error('Error generating metadata:', error);
      toast.error('Failed to generate metadata');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleSaveMetadata = async () => {
    try {
      await updateContentItem(content.id, {
        metadata: {
          ...content.metadata,
          metaTitle,
          metaDescription
        }
      });
      toast.success('Metadata saved successfully');
    } catch (error) {
      console.error('Error saving metadata:', error);
      toast.error('Failed to save metadata');
    }
  };
  
  return (
    <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-white/10">
      <CardContent className="p-5 space-y-4">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="w-full md:w-1/3 space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-4 w-4 text-indigo-400" />
              <p className="text-sm font-medium">SEO Metadata</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full bg-white/5 border-white/10 hover:bg-white/10"
              onClick={handleGenerateMetadata}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2 text-neon-purple" />
                  Generate with AI
                </>
              )}
            </Button>
          </div>
          
          <div className="w-full md:w-2/3 space-y-3">
            <div>
              <label htmlFor="meta-title" className="text-xs text-white/70 mb-1 block">
                Meta Title ({metaTitle.length}/60)
              </label>
              <Input
                id="meta-title"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                className="bg-white/5 border-white/10"
                maxLength={60}
                placeholder="SEO-optimized title for search results"
              />
            </div>
            
            <div>
              <label htmlFor="meta-description" className="text-xs text-white/70 mb-1 block">
                Meta Description ({metaDescription.length}/160)
              </label>
              <Textarea
                id="meta-description"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                className="bg-white/5 border-white/10 resize-none"
                maxLength={160}
                rows={2}
                placeholder="Brief description for search engine results"
              />
            </div>
            
            <div className="flex justify-end">
              <Button 
                size="sm" 
                onClick={handleSaveMetadata}
                className="bg-white/10 hover:bg-white/20 text-white"
              >
                Save Metadata
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
