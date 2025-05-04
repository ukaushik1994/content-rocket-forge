
import React from 'react';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Save, Pencil } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { ContentItemType } from '@/contexts/content';
import { useNavigate } from 'react-router-dom';

type FormValues = {
  title: string;
  content: string;
  keywords: string;
};

interface ContentEditFormProps {
  content: ContentItemType | null;
  isSaving: boolean;
  onSubmit: (values: FormValues) => Promise<void>;
}

export const ContentEditForm: React.FC<ContentEditFormProps> = ({
  content,
  isSaving,
  onSubmit,
}) => {
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
  
  return (
    <Form {...form}>
      <form 
        className="flex flex-col flex-1 overflow-hidden" 
        onSubmit={form.handleSubmit(onSubmit)}
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
        
        <div className="pt-4 flex flex-col sm:flex-row sm:justify-end gap-2">
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
        </div>
      </form>
    </Form>
  );
};
