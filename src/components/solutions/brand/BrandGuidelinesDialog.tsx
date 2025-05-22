
import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { BrandGuidelines } from '@/contexts/content-builder/types/company-types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { v4 as uuidv4 } from 'uuid';
import { Loader2, Palette } from 'lucide-react';

// Define validation schema
const formSchema = z.object({
  primaryColor: z.string().min(1, "Primary color is required"),
  secondaryColor: z.string().min(1, "Secondary color is required"),
  fontFamily: z.string().min(1, "Font family is required"),
  tone: z.string().min(3, "Please enter at least one tone descriptor"),
  keywords: z.string().min(3, "Please enter at least one keyword"),
  doUse: z.string().min(3, "Please enter at least one 'do use' guideline"),
  dontUse: z.string().min(3, "Please enter at least one 'don't use' guideline"),
  logoUsageNotes: z.string().min(10, "Logo usage notes must be at least 10 characters"),
  brandAssetsUrl: z.string().url("Please enter a valid URL").or(z.string().length(0)).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface BrandGuidelinesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guidelines: BrandGuidelines | null;
  companyId: string;
  onSave: (guidelines: BrandGuidelines) => void;
}

export const BrandGuidelinesDialog: React.FC<BrandGuidelinesDialogProps> = ({
  open,
  onOpenChange,
  guidelines,
  companyId,
  onSave
}) => {
  const isNew = !guidelines;
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: guidelines ? {
      primaryColor: guidelines.primaryColor,
      secondaryColor: guidelines.secondaryColor,
      fontFamily: guidelines.fontFamily,
      tone: guidelines.tone.join(', '),
      keywords: guidelines.keywords.join(', '),
      doUse: guidelines.doUse.join(', '),
      dontUse: guidelines.dontUse.join(', '),
      logoUsageNotes: guidelines.logoUsageNotes,
      brandAssetsUrl: guidelines.brandAssetsUrl || '',
    } : {
      primaryColor: '#6366F1',
      secondaryColor: '#4F46E5',
      fontFamily: 'Inter, sans-serif',
      tone: 'Professional, Friendly, Helpful',
      keywords: 'Innovative, Solution, Quality',
      doUse: 'Clear language, Active voice, Benefits-focused',
      dontUse: 'Jargon, Passive voice, Technical language',
      logoUsageNotes: 'Maintain clear space around the logo. Do not distort or change colors.',
      brandAssetsUrl: '',
    }
  });
  
  // Reset form when dialog opens/closes or guidelines changes
  React.useEffect(() => {
    if (open) {
      form.reset(guidelines ? {
        primaryColor: guidelines.primaryColor,
        secondaryColor: guidelines.secondaryColor,
        fontFamily: guidelines.fontFamily,
        tone: guidelines.tone.join(', '),
        keywords: guidelines.keywords.join(', '),
        doUse: guidelines.doUse.join(', '),
        dontUse: guidelines.dontUse.join(', '),
        logoUsageNotes: guidelines.logoUsageNotes,
        brandAssetsUrl: guidelines.brandAssetsUrl || '',
      } : {
        primaryColor: '#6366F1',
        secondaryColor: '#4F46E5',
        fontFamily: 'Inter, sans-serif',
        tone: 'Professional, Friendly, Helpful',
        keywords: 'Innovative, Solution, Quality',
        doUse: 'Clear language, Active voice, Benefits-focused',
        dontUse: 'Jargon, Passive voice, Technical language',
        logoUsageNotes: 'Maintain clear space around the logo. Do not distort or change colors.',
        brandAssetsUrl: '',
      });
    }
  }, [open, guidelines, form]);
  
  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      // Convert the values to match the BrandGuidelines interface
      const brandData: BrandGuidelines = {
        id: guidelines?.id || uuidv4(),
        companyId,
        primaryColor: values.primaryColor,
        secondaryColor: values.secondaryColor,
        fontFamily: values.fontFamily,
        tone: values.tone.split(',').map(item => item.trim()),
        keywords: values.keywords.split(',').map(item => item.trim()),
        doUse: values.doUse.split(',').map(item => item.trim()),
        dontUse: values.dontUse.split(',').map(item => item.trim()),
        logoUsageNotes: values.logoUsageNotes,
        brandAssetsUrl: values.brandAssetsUrl || null,
      };
      
      onSave(brandData);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              {isNew ? 'Add Brand Guidelines' : 'Edit Brand Guidelines'}
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="primaryColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Color</FormLabel>
                    <div className="flex gap-2 items-center">
                      <FormControl>
                        <Input placeholder="#6366F1" {...field} />
                      </FormControl>
                      <div
                        className="h-6 w-6 rounded-full border"
                        style={{ backgroundColor: field.value }}
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="secondaryColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Secondary Color</FormLabel>
                    <div className="flex gap-2 items-center">
                      <FormControl>
                        <Input placeholder="#4F46E5" {...field} />
                      </FormControl>
                      <div
                        className="h-6 w-6 rounded-full border"
                        style={{ backgroundColor: field.value }}
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="fontFamily"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Font Family</FormLabel>
                  <FormControl>
                    <Input placeholder="Inter, sans-serif" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand Tone</FormLabel>
                    <FormControl>
                      <Input placeholder="Professional, Friendly, Helpful" {...field} />
                    </FormControl>
                    <p className="text-xs text-muted-foreground mt-1">
                      Separate with commas
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="keywords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand Keywords</FormLabel>
                    <FormControl>
                      <Input placeholder="Innovative, Solution, Quality" {...field} />
                    </FormControl>
                    <p className="text-xs text-muted-foreground mt-1">
                      Separate with commas
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="doUse"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Do Use</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Clear language, Active voice, Benefits-focused"
                      className="resize-none min-h-20"
                      {...field}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground mt-1">
                    Separate with commas
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="dontUse"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Don't Use</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Jargon, Passive voice, Technical language"
                      className="resize-none min-h-20"
                      {...field}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground mt-1">
                    Separate with commas
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="logoUsageNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo Usage Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Maintain clear space around the logo. Do not distort or change colors."
                      className="resize-none min-h-20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="brandAssetsUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand Assets URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://drive.google.com/brandAssets" {...field} />
                  </FormControl>
                  <p className="text-xs text-muted-foreground mt-1">
                    Link to downloadable brand assets (optional)
                  </p>
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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Brand Guidelines'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
