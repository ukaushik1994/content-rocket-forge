import React, { useState } from 'react';
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
import { Loader2, Image as ImageIcon, X, Plus, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { Solution } from '@/contexts/content-builder/types';
import { z } from 'zod';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
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
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Define validation schema
const formSchema = z.object({
  name: z.string().min(1, "Solution name is required").max(100, "Name is too long"),
  category: z.string().min(1, "Category is required"),
  features: z.string().max(1000, "Features text is too long"),
  useCases: z.string().max(1000, "Use cases text is too long"),
  painPoints: z.string().max(1000, "Pain points text is too long"),
  targetAudience: z.string().max(1000, "Target audience text is too long"),
  externalUrl: z.string().url("Please enter a valid URL").or(z.string().length(0)).optional(),
  resources: z.array(z.object({
    title: z.string().min(1, "Title is required"),
    url: z.string().url("Please enter a valid URL")
  })).optional().default([]),
});

type FormValues = z.infer<typeof formSchema>;

// Solution categories
const SOLUTION_CATEGORIES = [
  "Business Solution",
  "Analytics Tool",
  "Marketing Platform",
  "Collaboration Tool",
  "Customer Service",
  "E-Commerce",
  "Development Tool",
  "Integration Tool",
  "Other"
];

interface SolutionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FormValues, logoFile?: File) => void;
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
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(solution?.logoUrl || null);
  
  // Initialize the form with react-hook-form and zod validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: solution?.name || '',
      category: solution?.category || 'Business Solution',
      features: solution?.features?.join(', ') || '',
      useCases: solution?.useCases?.join(', ') || '',
      painPoints: solution?.painPoints?.join(', ') || '',
      targetAudience: solution?.targetAudience?.join(', ') || '',
      externalUrl: solution?.externalUrl || '',
      resources: solution?.resources || [],
    },
  });
  
  // Set up field array for resources
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "resources"
  });

  // Reset form when solution changes or dialog opens/closes
  React.useEffect(() => {
    if (open) {
      form.reset({
        name: solution?.name || '',
        category: solution?.category || 'Business Solution',
        features: solution?.features?.join(', ') || '',
        useCases: solution?.useCases?.join(', ') || '',
        painPoints: solution?.painPoints?.join(', ') || '',
        targetAudience: solution?.targetAudience?.join(', ') || '',
        externalUrl: solution?.externalUrl || '',
        resources: solution?.resources || [],
      });
      setLogoPreview(solution?.logoUrl || null);
      setLogoFile(null);
    }
  }, [open, solution, form]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
    }
  };

  const handleSubmit = (data: FormValues) => {
    onSubmit(data, logoFile || undefined);
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
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
      <DialogContent className="glass-panel sm:max-w-lg max-h-[90vh] overflow-y-auto">
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
            {/* Logo Upload Section */}
            <div className="space-y-2">
              <Label>Solution Logo</Label>
              <div className="flex items-center gap-4">
                {logoPreview ? (
                  <div className="relative h-24 w-24 rounded-md border border-border overflow-hidden group">
                    <img src={logoPreview} alt="Logo preview" className="h-full w-full object-contain" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-white" onClick={removeLogo} type="button">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="h-24 w-24 rounded-md border border-dashed border-border flex items-center justify-center bg-muted/30">
                    <ImageIcon className="h-10 w-10 text-muted-foreground/50" />
                  </div>
                )}
                <div>
                  <Input 
                    id="logo-upload" 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleLogoChange} 
                  />
                  <Label htmlFor="logo-upload" className="cursor-pointer">
                    <Button type="button" variant="outline" size="sm" asChild>
                      <span>
                        {logoPreview ? 'Change Logo' : 'Upload Logo'}
                      </span>
                    </Button>
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Recommended size: 512x512px. Max 5MB.
                  </p>
                </div>
              </div>
            </div>
            
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

            {/* Category selection */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SOLUTION_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the category that best describes your solution
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="externalUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>External URL</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="https://yoursolution.com" className="pl-10" {...field} />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Link to your solution's website or landing page
                  </FormDescription>
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
            
            {/* Resources Section */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label>Additional Resources</Label>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => append({ title: '', url: '' })}
                  className="h-8 text-xs flex items-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Resource
                </Button>
              </div>
              
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-3 items-end">
                  <div className="grid gap-1 flex-1">
                    <Label className="text-xs" htmlFor={`resources.${index}.title`}>Title</Label>
                    <Controller
                      name={`resources.${index}.title`}
                      control={form.control}
                      render={({ field }) => <Input {...field} placeholder="Documentation" />}
                    />
                  </div>
                  <div className="grid gap-1 flex-1">
                    <Label className="text-xs" htmlFor={`resources.${index}.url`}>URL</Label>
                    <Controller
                      name={`resources.${index}.url`}
                      control={form.control}
                      render={({ field }) => <Input {...field} placeholder="https://example.com/docs" />}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    className="flex-shrink-0 h-9 w-9"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </div>
              ))}
              
              {fields.length === 0 && (
                <div className="border border-dashed border-border rounded-md p-4 text-center text-muted-foreground">
                  <p className="text-sm">No resources added yet</p>
                  <p className="text-xs mt-1">Add links to documentation, videos, or other helpful resources</p>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
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
