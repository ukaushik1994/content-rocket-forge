
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useApproval } from './context/ApprovalContext';
import { ContentItemType } from '@/contexts/content/types';

interface ApprovalMetadataProps {
  content?: ContentItemType;
  metaTitle?: string;
  metaDescription?: string;
  onUpdate?: (metadata: { metaTitle: string; metaDescription: string }) => void;
}

export const ApprovalMetadata: React.FC<ApprovalMetadataProps> = ({
  content,
  metaTitle: initialMetaTitle = '',
  metaDescription: initialMetaDescription = '',
  onUpdate
}) => {
  const [metaTitle, setMetaTitle] = useState(content?.metaTitle || initialMetaTitle);
  const [metaDescription, setMetaDescription] = useState(content?.metaDescription || initialMetaDescription);
  const [isSaving, setIsSaving] = useState(false);
  const { generateSeoAnalysis } = useApproval();

  // Update state when content changes
  useEffect(() => {
    if (content) {
      setMetaTitle(content.metaTitle || '');
      setMetaDescription(content.metaDescription || '');
    }
  }, [content]);

  const handleSave = () => {
    setIsSaving(true);
    
    // Call the provided update function if available
    if (onUpdate) {
      onUpdate({ metaTitle, metaDescription });
    }
    
    // Generate SEO analysis with the new metadata
    generateSeoAnalysis();
    
    setIsSaving(false);
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">SEO Metadata</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="meta-title" className="text-sm font-medium">
            Meta Title
          </label>
          <Input
            id="meta-title"
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            placeholder="Enter meta title"
            maxLength={60}
          />
          <div className="text-xs text-muted-foreground text-right">
            {metaTitle.length}/60
          </div>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="meta-description" className="text-sm font-medium">
            Meta Description
          </label>
          <Textarea
            id="meta-description"
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            placeholder="Enter meta description"
            maxLength={160}
            className="resize-none h-24"
          />
          <div className="text-xs text-muted-foreground text-right">
            {metaDescription.length}/160
          </div>
        </div>
        
        <Button 
          onClick={handleSave} 
          disabled={isSaving} 
          size="sm" 
          className="w-full"
        >
          {isSaving ? 'Saving...' : 'Update Metadata'}
        </Button>
      </CardContent>
    </Card>
  );
};
