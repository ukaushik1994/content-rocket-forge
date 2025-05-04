
import React, { useState } from 'react';
import { ContentItemType } from '@/contexts/content/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useContent } from '@/contexts/content';

interface ApprovalMetadataProps {
  content: ContentItemType;
}

export const ApprovalMetadata: React.FC<ApprovalMetadataProps> = ({ content }) => {
  const [metaTitle, setMetaTitle] = useState(content.title || '');
  const [metaDescription, setMetaDescription] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const { updateContentItem } = useContent();
  
  const handleSaveMetadata = async () => {
    setIsUpdating(true);
    try {
      await updateContentItem(content.id, { title: metaTitle });
      toast.success('Metadata updated successfully');
    } catch (error) {
      toast.error('Failed to update metadata');
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-2 border-b">
        <CardTitle className="text-sm font-medium">SEO Metadata</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4 pt-4">
        <div className="space-y-2">
          <Label htmlFor="metaTitle">Title</Label>
          <Input 
            id="metaTitle"
            value={metaTitle} 
            onChange={(e) => setMetaTitle(e.target.value)} 
            placeholder="SEO Title" 
            maxLength={60}
          />
          <div className="text-xs text-muted-foreground flex justify-between">
            <span>Recommended: 50-60 characters</span>
            <span>{metaTitle.length}/60</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="metaDescription">Meta Description</Label>
          <Input
            id="metaDescription"
            value={metaDescription} 
            onChange={(e) => setMetaDescription(e.target.value)} 
            placeholder="SEO Meta Description" 
            maxLength={160}
          />
          <div className="text-xs text-muted-foreground flex justify-between">
            <span>Recommended: 140-160 characters</span>
            <span>{metaDescription.length}/160</span>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button 
            onClick={handleSaveMetadata} 
            disabled={isUpdating}
            size="sm"
          >
            Save Metadata
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
