
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { Solution } from '@/contexts/content-builder/types';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form';

// Define validation schema
const formSchema = z.object({
  name: z.string().min(1, "Solution name is required").max(100, "Name is too long"),
  features: z.string().max(1000, "Features text is too long"),
  useCases: z.string().max(1000, "Use cases text is too long"),
  painPoints: z.string().max(1000, "Pain points text is too long"),
  targetAudience: z.string().max(1000, "Target audience text is too long"),
});

type FormValues = z.infer<typeof formSchema>;

interface SolutionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FormValues) => void;
  solution: Solution | null;
  isSubmitting?: boolean;
}

export const SolutionFormDialog: React.FC<SolutionFormDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  solution,
  isSubmitting = false
}) => {
  // Initialize the form with react-hook-form and zod validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: solution?.name || '',
      features: solution?.features?.join(', ') || '',
      useCases: solution?.useCases?.join(', ') || '',
      painPoints: solution?.painPoints?.join(', ') || '',
      targetAudience: solution?.targetAudience?.join(', ') || '',
    },
  });

  // Reset form when solution changes or dialog opens/closes
  React.useEffect(() => {
    if (open) {
      form.reset({
        name: solution?.name || '',
        features: solution?.features?.join(', ') || '',
        useCases: solution?.useCases?.join(', ') || '',
        painPoints: solution?.painPoints?.join(', ') || '',
        targetAudience: solution?.targetAudience?.join(', ') || '',
      });
    }
  }, [open, solution, form]);

  const handleSubmit = (data: FormValues) => {
    onSubmit(data);
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpen) => {
        // Prevent closing while submitting
        if (isSubmitting && !newOpen) {
          return;
        }
        onOpenChange(newOpen);
      }}
    >
      <DialogContent className="glass-panel sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{solution ? `Edit ${solution.name}` : 'Add New Solution'}</DialogTitle>
          <DialogDescription>
            {solution 
              ? 'Update your business solution details below.'
              : 'Create a new business solution to use in your content.'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 pt-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Solution Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Enterprise Analytics Dashboard" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="features"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Key Features</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="e.g., Real-time data visualization, Custom report builder, Role-based access control"
                      className="resize-none min-h-20"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Separate each feature with a comma.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="useCases"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Use Cases</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="e.g., Performance monitoring, Budget planning, Customer insights"
                      className="resize-none min-h-20"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Separate each use case with a comma.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="painPoints"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pain Points Addressed</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="e.g., Slow decision making, Data silos, Manual reporting"
                      className="resize-none min-h-20"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Separate each pain point with a comma.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="targetAudience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Audience</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="e.g., Marketing directors, Operations managers, Enterprise businesses"
                      className="resize-none min-h-20"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Separate each audience segment with a comma.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !form.formState.isDirty}>
                {isSubmitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {solution ? 'Updating...' : 'Creating...'}</>
                ) : (
                  solution ? 'Update Solution' : 'Create Solution'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
