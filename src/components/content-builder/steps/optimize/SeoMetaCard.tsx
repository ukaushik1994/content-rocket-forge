
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Search, Edit } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export function SeoMetaCard() {
  const { state, setMetaTitle, setMetaDescription } = useContentBuilder();
  const { metaTitle, metaDescription, mainKeyword } = state;
  
  const [title, setTitle] = useState(metaTitle || '');
  const [description, setDescription] = useState(metaDescription || '');
  const [isEditing, setIsEditing] = useState(false);

  const handleSaveMetaData = () => {
    setMetaTitle(title);
    setMetaDescription(description);
    setIsEditing(false);
  };
  
  return (
    <Card className="border border-white/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-primary" />
            SEO Meta Information
          </div>
          {!isEditing && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 w-7 p-0" 
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium">Meta Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter meta title"
                className="h-8 text-sm"
              />
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">
                  {mainKeyword ? `Include "${mainKeyword}"` : 'Use your main keyword'}
                </span>
                <span className={`${title.length > 60 ? 'text-red-400' : 'text-muted-foreground'}`}>
                  {title.length}/60 characters
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium">Meta Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter meta description"
                className="text-sm min-h-[80px]"
              />
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Include main keyword and CTA</span>
                <span className={`${description.length > 160 ? 'text-red-400' : 'text-muted-foreground'}`}>
                  {description.length}/160 characters
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={handleSaveMetaData}
              >
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium mb-1">Meta Title</p>
              <div className="p-2 rounded bg-white/5 border border-white/10 text-sm">
                {metaTitle || <span className="text-muted-foreground">No meta title set</span>}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium mb-1">Meta Description</p>
              <div className="p-2 rounded bg-white/5 border border-white/10 text-sm">
                {metaDescription || <span className="text-muted-foreground">No meta description set</span>}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
