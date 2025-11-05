
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
import { Building2, Loader2, Upload, X } from 'lucide-react';

// Define validation schema (removed logoUrl)
const formSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  industry: z.string().min(1, "Industry is required"),
  founded: z.string().regex(/^\d{4}$/, "Please enter a valid year (e.g., 2023)"),
  size: z.string().min(1, "Company size is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  mission: z.string().min(10, "Mission statement must be at least 10 characters"),
  values: z.string().min(3, "Please enter at least one value"),
  website: z.string().url("Please enter a valid URL").or(z.string().length(0)).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CompanyFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyInfo: CompanyInfo | null;
  onSave: (info: CompanyInfo) => void;
  prefilledData?: CompanyInfo | null;
  extractionMetadata?: any;
}

export const CompanyFormDialog: React.FC<CompanyFormDialogProps> = ({
  open,
  onOpenChange,
  companyInfo,
  onSave,
  prefilledData,
  extractionMetadata
}) => {
  const isNew = !companyInfo;
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [logoFile, setLogoFile] = React.useState<File | null>(null);
  const [logoPreview, setLogoPreview] = React.useState<string | null>(companyInfo?.logoUrl || null);
  
  // Use prefilledData if available, otherwise use companyInfo
  const dataToUse = prefilledData || companyInfo;
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: dataToUse ? {
      name: dataToUse.name,
      industry: dataToUse.industry,
      founded: dataToUse.founded,
      size: dataToUse.size,
      description: dataToUse.description,
      mission: dataToUse.mission,
      values: dataToUse.values.join(', '),
      website: dataToUse.website || '',
    } : {
      name: '',
      industry: '',
      founded: new Date().getFullYear().toString(),
      size: '',
      description: '',
      mission: '',
      values: '',
      website: '',
    }
  });

  // Handle logo file upload
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove logo
  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
  };
  
  // Reset form when dialog opens/closes or data changes
  React.useEffect(() => {
    if (open) {
      const dataToUse = prefilledData || companyInfo;
      form.reset(dataToUse ? {
        name: dataToUse.name,
        industry: dataToUse.industry,
        founded: dataToUse.founded,
        size: dataToUse.size,
        description: dataToUse.description,
        mission: dataToUse.mission,
        values: dataToUse.values.join(', '),
        website: dataToUse.website || '',
      } : {
        name: '',
        industry: '',
        founded: new Date().getFullYear().toString(),
        size: '',
        description: '',
        mission: '',
        values: '',
        website: '',
      });
      setLogoPreview(dataToUse?.logoUrl || null);
      setLogoFile(null);
    }
  }, [open, companyInfo, prefilledData, form]);
  
  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      // Convert logo file to base64 data URL if uploaded
      let logoUrl = logoPreview;
      if (logoFile) {
        const reader = new FileReader();
        logoUrl = await new Promise((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(logoFile);
        });
      }
      
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
        logoUrl: logoUrl || null,
      };
      
      onSave(companyData);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-background to-neon-purple/5 border border-white/10">
        <DialogHeader className="border-b border-white/10 pb-4">
          <DialogTitle>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-neon-purple/20 to-neon-blue/20 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-neon-purple" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gradient">
                  {isNew ? 'Add Company Information' : 'Edit Company Information'}
                </h2>
                <p className="text-sm text-muted-foreground font-normal">
                  {prefilledData && extractionMetadata ? (
                    <>
                      AI-extracted from {extractionMetadata.pagesAnalyzed} pages • Review and edit before saving
                    </>
                  ) : (
                    'Define your brand identity and company details'
                  )}
                </p>
              </div>
              {prefilledData && (
                <span className="px-3 py-1 text-xs font-medium bg-neon-purple/20 text-neon-purple rounded-full border border-neon-purple/30">
                  AI-Extracted
                </span>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 py-2">
            {/* Logo Upload Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gradient">Company Logo</h3>
              <div className="flex items-center gap-6">
                <div className="flex-shrink-0">
                  {logoPreview ? (
                    <div className="relative group">
                      <div className="h-20 w-20 rounded-xl overflow-hidden bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20">
                        <img 
                          src={logoPreview} 
                          alt="Company logo preview" 
                          className="h-full w-full object-contain p-2"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-neon-purple/20 to-neon-blue/20 flex items-center justify-center backdrop-blur-sm border border-white/20">
                      <Building2 className="h-8 w-8 text-neon-purple" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <label htmlFor="logo-upload" className="cursor-pointer">
                    <div className="border-2 border-dashed border-neon-purple/30 rounded-lg p-4 hover:border-neon-purple/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Upload className="h-5 w-5 text-neon-purple" />
                        <div>
                          <p className="text-sm font-medium">Upload Company Logo</p>
                          <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                        </div>
                      </div>
                    </div>
                  </label>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gradient">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Acme Inc." {...field} className="bg-background/50 border-white/10" />
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
                        <Input placeholder="Technology" {...field} className="bg-background/50 border-white/10" />
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
                        <Input placeholder="2023" {...field} className="bg-background/50 border-white/10" />
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
                        <Input placeholder="50-100 employees" {...field} className="bg-background/50 border-white/10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Company Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gradient">Company Details</h3>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Provide a brief description of your company..."
                        className="min-h-24 resize-none bg-background/50 border-white/10"
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
                        className="min-h-24 resize-none bg-background/50 border-white/10"
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
                        className="bg-background/50 border-white/10"
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
              
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} className="bg-background/50 border-white/10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter className="border-t border-white/10 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple"
              >
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
