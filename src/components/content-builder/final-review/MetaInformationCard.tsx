
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Info, Sparkles } from 'lucide-react';

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
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Info className="h-4 w-4" />
          Meta Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="meta-title" className="text-sm font-medium">
            Meta Title
            <span className="text-xs ml-2 text-muted-foreground">(Recommended: 50-60 characters)</span>
          </label>
          <Input
            id="meta-title"
            value={metaTitle}
            onChange={(e) => onMetaTitleChange(e.target.value)}
            placeholder="Enter meta title"
            className="font-medium"
          />
          <p className="text-xs text-muted-foreground text-right">
            {metaTitle.length}/60 characters
          </p>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="meta-description" className="text-sm font-medium">
            Meta Description
            <span className="text-xs ml-2 text-muted-foreground">(Recommended: 150-160 characters)</span>
          </label>
          <Textarea
            id="meta-description"
            value={metaDescription}
            onChange={(e) => onMetaDescriptionChange(e.target.value)}
            placeholder="Enter meta description"
            rows={4}
          />
          <p className="text-xs text-muted-foreground text-right">
            {metaDescription.length}/160 characters
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          className="w-full flex items-center gap-2"
          onClick={onGenerateMeta}
        >
          <Sparkles className="h-4 w-4" /> Generate Meta Info
        </Button>
      </CardFooter>
    </Card>
  );
};
