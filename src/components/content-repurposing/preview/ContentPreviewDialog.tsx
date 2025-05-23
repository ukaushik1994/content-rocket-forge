
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Edit, Save } from 'lucide-react';
import { toast } from 'sonner';

interface ContentPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  formatName: string;
  onSave?: (editedContent: string) => Promise<boolean>;
  isReadOnly?: boolean;
}

export const ContentPreviewDialog: React.FC<ContentPreviewDialogProps> = ({
  isOpen,
  onClose,
  content,
  formatName,
  onSave,
  isReadOnly = false
}) => {
  const [editedContent, setEditedContent] = useState(content);
  const [activeTab, setActiveTab] = useState<'preview' | 'edit'>(isReadOnly ? 'preview' : 'edit');
  const [isSaving, setIsSaving] = useState(false);

  // Reset the edited content when the dialog opens with new content
  React.useEffect(() => {
    setEditedContent(content);
  }, [content, isOpen]);

  const handleSave = async () => {
    if (!onSave) return;
    
    setIsSaving(true);
    try {
      const success = await onSave(editedContent);
      if (success) {
        toast.success('Content saved successfully');
        onClose();
      }
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('Failed to save content');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">{formatName} Preview</DialogTitle>
          <DialogDescription>
            View and edit your repurposed content
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'preview' | 'edit')} className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="preview" className="flex items-center gap-1.5">
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="edit" disabled={isReadOnly} className="flex items-center gap-1.5">
              <Edit className="h-4 w-4" />
              Edit
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="preview" className="mt-4">
            <div className="bg-muted/20 rounded-md p-4 max-h-[50vh] overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm">{activeTab === 'edit' ? editedContent : content}</pre>
            </div>
          </TabsContent>
          
          <TabsContent value="edit" className="mt-4">
            <Textarea 
              value={editedContent} 
              onChange={(e) => setEditedContent(e.target.value)} 
              className="min-h-[50vh] font-mono text-sm" 
              placeholder={`Edit your ${formatName} content here...`} 
            />
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {!isReadOnly && onSave && (
            <Button onClick={handleSave} disabled={isSaving || content === editedContent} className="gap-1.5">
              {isSaving ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ContentPreviewDialog;
