
import React, { useState, useEffect } from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Edit, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export function ContentTitleCard() {
  const { state, dispatch } = useContentBuilder();
  const { contentTitle } = state;
  
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(contentTitle || '');
  
  useEffect(() => {
    setEditedTitle(contentTitle || '');
  }, [contentTitle]);
  
  const handleSaveTitle = () => {
    dispatch({ type: 'SET_CONTENT_TITLE', payload: editedTitle });
    setIsEditingTitle(false);
    toast.success("Title updated");
  };

  if (!contentTitle) return null;

  return (
    <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/10 border border-white/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-400" />
            Content Title
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 px-2 hover:bg-white/10"
            onClick={() => setIsEditingTitle(true)}
          >
            <Edit className="h-3.5 w-3.5 mr-1" />
            <span className="text-xs">Edit</span>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="bg-clip-text text-transparent bg-gradient-to-r from-neon-purple to-neon-blue font-medium text-lg">
          {contentTitle}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          This title will be used in the final content and can be updated here or in the final review.
        </p>
        
        <Dialog open={isEditingTitle} onOpenChange={setIsEditingTitle}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Edit Content Title</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground mb-4">
                Update your content title to better reflect your topic.
              </p>
              <Input 
                value={editedTitle} 
                onChange={(e) => setEditedTitle(e.target.value)}
                placeholder="Enter a descriptive title for your content"
                className="w-full"
              />
            </div>
            <DialogFooter>
              <Button
                onClick={handleSaveTitle}
                className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple"
              >
                Save Title
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
