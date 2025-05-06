
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

interface ContentDetailsCardProps {
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (description: string) => void;
  socialShare: boolean;
  setSocialShare: (share: boolean) => void;
}

export const ContentDetailsCard: React.FC<ContentDetailsCardProps> = ({
  title,
  setTitle,
  description,
  setDescription,
  socialShare,
  setSocialShare
}) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Content Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Content Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a compelling title..."
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Meta Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter meta description..."
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            {description.length}/160 characters (recommended: 120-155)
          </p>
        </div>
        
        <div className="flex items-center justify-between pt-2">
          <div className="space-y-0.5">
            <Label htmlFor="social-share">Share on Social Media</Label>
            <p className="text-xs text-muted-foreground">
              Automatically post to connected accounts
            </p>
          </div>
          <Switch
            id="social-share"
            checked={socialShare}
            onCheckedChange={setSocialShare}
          />
        </div>
      </CardContent>
    </Card>
  );
};
