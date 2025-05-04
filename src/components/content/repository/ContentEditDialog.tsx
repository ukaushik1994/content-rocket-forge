
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { ContentItemType } from '@/contexts/content';
import { Loader2, Save, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ContentEditDialogProps {
  open: boolean;
  content: ContentItemType | null;
  onOpenChange: (open: boolean) => void;
  onSave: (values: Partial<ContentItemType>) => Promise<void>;
}

type FormValues = {
  title: string;
  content: string;
  keywords: string;
};

export const ContentEditDialog: React.FC<ContentEditDialogProps> = ({
  open,
  content,
  onOpenChange,
  onSave
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  
  const form = useForm<FormValues>({
    defaultValues: {
      title: content?.title || '',
      content: content?.content || '',
      keywords: content?.keywords?.join(', ') || '',
    }
  });
  
  const handleAdvancedEdit = () => {
    if (content) {
      navigate(`/content-builder?edit=${content.id}`);
    }
  };
  
  const handleSubmit = async (values: FormValues) => {
    try {
      setIsSaving(true);
      
      // Process keywords into array
      const keywordsArray = values.keywords
        .split(',')
        .map(k => k.trim())
        .filter(Boolean);
        
      await onSave({
        title: values.title,
        content: values.content,
        keywords: keywordsArray
      });
      
      toast.success('Content updated successfully');
      onOpenChange(false);
    } catch (error: any) {
      toast.error('Failed to save content: ' + (error.message || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Content</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form 
            className="flex flex-col flex-1 overflow-hidden" 
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <div className="space-y-4 flex-1 overflow-y-auto px-1 py-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Content title" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="keywords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Keywords (comma-separated)</FormLabel>
                    <FormControl>
                      <Input placeholder="keyword1, keyword2, keyword3" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter your content here..."
                        className="min-h-[300px] flex-1 resize-none"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter className="pt-4 flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleAdvancedEdit}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Advanced Edit in Content Builder
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
