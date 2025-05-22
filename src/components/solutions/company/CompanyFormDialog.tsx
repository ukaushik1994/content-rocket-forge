
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { CompanyInfo } from '@/contexts/content-builder/types/company-types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { v4 as uuidv4 } from 'uuid';
import { Building2, Loader2 } from 'lucide-react';

// Define validation schema
const formSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  industry: z.string().min(1, "Industry is required"),
  founded: z.string().regex(/^\d{4}$/, "Please enter a valid year (e.g., 2023)"),
  size: z.string().min(1, "Company size is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  mission: z.string().min(10, "Mission statement must be at least 10 characters"),
  values: z.string().min(3, "Please enter at least one value"),
  website: z.string().url("Please enter a valid URL").or(z.string().length(0)).optional(),
  logoUrl: z.string().url("Please enter a valid URL").or(z.string().length(0)).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CompanyFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyInfo: CompanyInfo | null;
  onSave: (info: CompanyInfo) => void;
}

export const CompanyFormDialog: React.FC<CompanyFormDialogProps> = ({
  open,
  onOpenChange,
  companyInfo,
  onSave
}) => {
  const isNew = !companyInfo;
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: companyInfo ? {
      name: companyInfo.name,
      industry: companyInfo.industry,
      founded: companyInfo.founded,
      size: companyInfo.size,
      description: companyInfo.description,
      mission: companyInfo.mission,
      values: companyInfo.values.join(', '),
      website: companyInfo.website || '',
      logoUrl: companyInfo.logoUrl || '',
    } : {
      name: '',
      industry: '',
      founded: new Date().getFullYear().toString(),
      size: '',
      description: '',
      mission: '',
      values: '',
      website: '',
      logoUrl: '',
    }
  });
  
  // Reset form when dialog opens/closes or companyInfo changes
  React.useEffect(() => {
    if (open) {
      form.reset(companyInfo ? {
        name: companyInfo.name,
        industry: companyInfo.industry,
        founded: companyInfo.founded,
        size: companyInfo.size,
        description: companyInfo.description,
        mission: companyInfo.mission,
        values: companyInfo.values.join(', '),
        website: companyInfo.website || '',
        logoUrl: companyInfo.logoUrl || '',
      } : {
        name: '',
        industry: '',
        founded: new Date().getFullYear().toString(),
        size: '',
        description: '',
        mission: '',
        values: '',
        website: '',
        logoUrl: '',
      });
    }
  }, [open, companyInfo, form]);
  
  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      // Convert the values to match the CompanyInfo interface
      const companyData: CompanyInfo = {
        id: companyInfo?.id || uuidv4(),
        name: values.name,
        industry: values.industry,
        founded: values.founded,
        size: values.size,
        description: values.description,
        mission: values.mission,
        values: values.values.split(',').map(value => value.trim()),
        website: values.website || null,
        logoUrl: values.logoUrl || null,
      };
      
      onSave(companyData);
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
              <Building2 className="h-5 w-5" />
              {isNew ? 'Add Company Information' : 'Edit Company Information'}
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Inc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry</FormLabel>
                    <FormControl>
                      <Input placeholder="Technology" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="founded"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Founded Year</FormLabel>
                    <FormControl>
                      <Input placeholder="2023" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Size</FormLabel>
                    <FormControl>
                      <Input placeholder="50-100 employees" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Provide a brief description of your company..."
                      className="min-h-20 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="mission"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mission Statement</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Our mission is to..."
                      className="min-h-20 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="values"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Values</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Innovation, Integrity, Customer Focus"
                      {...field}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground mt-1">
                    Separate values with commas
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="logoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/logo.png" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Company Information'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
