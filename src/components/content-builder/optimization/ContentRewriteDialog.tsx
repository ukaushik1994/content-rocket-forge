
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

export interface ContentRewriteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: string;
  onContentChange: (content: string) => void;
}

export const ContentRewriteDialog: React.FC<ContentRewriteDialogProps> = ({
  open,
  onOpenChange,
  content,
  onContentChange
}) => {
  const [localContent, setLocalContent] = useState(content);
  const [isGenerating, setIsGenerating] = useState(false);
  const [tone, setTone] = useState('professional');

  // Reset local content when dialog opens
  React.useEffect(() => {
    if (open) {
      setLocalContent(content);
    }
  }, [open, content]);

  const handleRewrite = async () => {
    // In a real implementation, this would call an AI service to rewrite the content
    setIsGenerating(true);
    
    // Simulate a delay and rewrite
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // This is just a simple modification to simulate a rewrite
    const rewrittenContent = `${localContent}\n\n[This content has been rewritten with a ${tone} tone.]`;
    
    setLocalContent(rewrittenContent);
    setIsGenerating(false);
  };

  const handleSave = () => {
    onContentChange(localContent);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Rewrite Content</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <Button 
              variant={tone === 'professional' ? 'default' : 'outline'} 
              onClick={() => setTone('professional')}
              size="sm"
            >
              Professional
            </Button>
            <Button 
              variant={tone === 'friendly' ? 'default' : 'outline'} 
              onClick={() => setTone('friendly')}
              size="sm"
            >
              Friendly
            </Button>
            <Button 
              variant={tone === 'persuasive' ? 'default' : 'outline'} 
              onClick={() => setTone('persuasive')}
              size="sm"
            >
              Persuasive
            </Button>
          </div>
          
          <Textarea
            value={localContent}
            onChange={(e) => setLocalContent(e.target.value)}
            className="min-h-[300px] font-mono text-sm"
          />
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleRewrite} disabled={isGenerating}>
            {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Rewrite
          </Button>
          <Button onClick={handleSave} disabled={isGenerating}>
            Apply Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
