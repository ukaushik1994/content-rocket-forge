
import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { BrandGuidelines } from '@/contexts/content-builder/types/company-types';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { v4 as uuidv4 } from 'uuid';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

// Define validation schema
const formSchema = z.object({
  // Visual Identity
  primaryColor: z.string().min(1, "Primary color is required"),
  secondaryColor: z.string().min(1, "Secondary color is required"),
  accentColor: z.string().optional(),
  neutralColor: z.string().optional(),
  fontFamily: z.string().min(1, "Font family is required"),
  secondaryFontFamily: z.string().optional(),
  
  // Brand Voice
  tone: z.string().min(3, "Please enter at least one tone descriptor"),
  keywords: z.string().min(3, "Please enter at least one keyword"),
  brandPersonality: z.string().optional(),
  missionStatement: z.string().optional(),
  
  // Usage Guidelines
  doUse: z.string().min(3, "Please enter at least one 'do use' guideline"),
  dontUse: z.string().min(3, "Please enter at least one 'don't use' guideline"),
  logoUsageNotes: z.string().min(10, "Logo usage notes must be at least 10 characters"),
  imageryGuidelines: z.string().optional(),
  
  // Additional Information
  targetAudience: z.string().optional(),
  brandStory: z.string().optional(),
  brandValues: z.string().optional(),
  brandAssetsUrl: z.string().url("Please enter a valid URL").or(z.string().length(0)).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface BrandGuidelinesFormProps {
  initialData: BrandGuidelines | null;
  companyId: string;
  onSave: (guidelines: BrandGuidelines) => void;
  onCancel: () => void;
}

export const BrandGuidelinesForm: React.FC<BrandGuidelinesFormProps> = ({
  initialData,
  companyId,
  onSave,
  onCancel
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("visual-identity");
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      primaryColor: initialData.primaryColor,
      secondaryColor: initialData.secondaryColor,
      accentColor: initialData.accentColor || '',
      neutralColor: initialData.neutralColor || '',
      fontFamily: initialData.fontFamily,
      secondaryFontFamily: initialData.secondaryFontFamily || '',
      tone: initialData.tone.join(', '),
      keywords: initialData.keywords.join(', '),
      brandPersonality: initialData.brandPersonality || '',
      missionStatement: initialData.missionStatement || '',
      doUse: initialData.doUse.join(', '),
      dontUse: initialData.dontUse.join(', '),
      logoUsageNotes: initialData.logoUsageNotes,
      imageryGuidelines: initialData.imageryGuidelines || '',
      targetAudience: initialData.targetAudience || '',
      brandStory: initialData.brandStory || '',
      brandValues: initialData.brandValues || '',
      brandAssetsUrl: initialData.brandAssetsUrl || '',
    } : {
      primaryColor: '#6366F1',
      secondaryColor: '#4F46E5',
      accentColor: '#10B981',
      neutralColor: '#6B7280',
      fontFamily: 'Inter, sans-serif',
      secondaryFontFamily: 'Georgia, serif',
      tone: 'Professional, Friendly, Helpful, Knowledgeable',
      keywords: 'Innovative, Solution, Quality, Expertise, Reliable',
      brandPersonality: 'Trustworthy and forward-thinking',
      missionStatement: 'To provide exceptional value through innovative solutions',
      doUse: 'Clear language, Active voice, Benefits-focused, Concise statements',
      dontUse: 'Jargon, Passive voice, Technical language, Vague descriptions',
      logoUsageNotes: 'Maintain clear space around the logo. Do not distort or change colors. Use only approved logo variations.',
      imageryGuidelines: 'Use high-quality, authentic images that reflect our brand values. Avoid stock photos that look staged or inauthentic.',
      targetAudience: 'Business professionals aged 30-55 in management positions who value efficiency and innovation.',
      brandStory: 'Founded with a mission to simplify complex processes through technology innovation.',
      brandValues: 'Innovation, Quality, Integrity, Customer Focus',
      brandAssetsUrl: '',
    }
  });
  
  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      // Convert the values to match the BrandGuidelines interface with extended properties
      const brandData: BrandGuidelines = {
        id: initialData?.id || uuidv4(),
        companyId,
        primaryColor: values.primaryColor,
        secondaryColor: values.secondaryColor,
        accentColor: values.accentColor || null,
        neutralColor: values.neutralColor || null,
        fontFamily: values.fontFamily,
        secondaryFontFamily: values.secondaryFontFamily || null,
        tone: values.tone.split(',').map(item => item.trim()),
        keywords: values.keywords.split(',').map(item => item.trim()),
        brandPersonality: values.brandPersonality || null,
        missionStatement: values.missionStatement || null,
        doUse: values.doUse.split(',').map(item => item.trim()),
        dontUse: values.dontUse.split(',').map(item => item.trim()),
        logoUsageNotes: values.logoUsageNotes,
        imageryGuidelines: values.imageryGuidelines || null,
        targetAudience: values.targetAudience || null,
        brandStory: values.brandStory || null,
        brandValues: values.brandValues || null,
        brandAssetsUrl: values.brandAssetsUrl || null,
      };
      
      onSave(brandData);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Tabs defaultValue="visual-identity" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="visual-identity">Visual Identity</TabsTrigger>
            <TabsTrigger value="brand-voice">Brand Voice</TabsTrigger>
            <TabsTrigger value="usage-guidelines">Usage Guidelines</TabsTrigger>
            <TabsTrigger value="additional">Additional Info</TabsTrigger>
          </TabsList>
          
          <TabsContent value="visual-identity" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Color Palette</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="primaryColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Color*</FormLabel>
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
                          <FormLabel>Secondary Color*</FormLabel>
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
                    
                    <FormField
                      control={form.control}
                      name="accentColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Accent Color</FormLabel>
                          <div className="flex gap-2 items-center">
                            <FormControl>
                              <Input placeholder="#10B981" {...field} />
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
                      name="neutralColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Neutral Color</FormLabel>
                          <div className="flex gap-2 items-center">
                            <FormControl>
                              <Input placeholder="#6B7280" {...field} />
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
                  
                  <Separator className="my-4" />
                  
                  <h3 className="text-lg font-medium">Typography</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fontFamily"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Font Family*</FormLabel>
                          <FormControl>
                            <Input placeholder="Inter, sans-serif" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="secondaryFontFamily"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Secondary Font Family</FormLabel>
                          <FormControl>
                            <Input placeholder="Georgia, serif" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
              <Button type="button" onClick={() => setActiveTab("brand-voice")}>Next</Button>
            </div>
          </TabsContent>
          
          <TabsContent value="brand-voice" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="tone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand Tone*</FormLabel>
                        <FormControl>
                          <Input placeholder="Professional, Friendly, Helpful" {...field} />
                        </FormControl>
                        <p className="text-xs text-muted-foreground mt-1">
                          Separate with commas (e.g., Professional, Friendly, Helpful)
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
                        <FormLabel>Brand Keywords*</FormLabel>
                        <FormControl>
                          <Input placeholder="Innovative, Solution, Quality" {...field} />
                        </FormControl>
                        <p className="text-xs text-muted-foreground mt-1">
                          Separate with commas (e.g., Innovative, Solution, Quality)
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="brandPersonality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand Personality</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your brand's personality in a few sentences"
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
                    name="missionStatement"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mission Statement</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Your company's mission statement"
                            className="resize-none min-h-20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-between">
              <Button type="button" onClick={() => setActiveTab("visual-identity")}>Previous</Button>
              <Button type="button" onClick={() => setActiveTab("usage-guidelines")}>Next</Button>
            </div>
          </TabsContent>
          
          <TabsContent value="usage-guidelines" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="doUse"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Do Use*</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Clear language, Active voice, Benefits-focused"
                            className="resize-none min-h-20"
                            {...field}
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground mt-1">
                          Separate with commas (e.g., Clear language, Active voice)
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
                        <FormLabel>Don't Use*</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Jargon, Passive voice, Technical language"
                            className="resize-none min-h-20"
                            {...field}
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground mt-1">
                          Separate with commas (e.g., Jargon, Passive voice)
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
                        <FormLabel>Logo Usage Notes*</FormLabel>
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
                    name="imageryGuidelines"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Imagery Guidelines</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Guidelines for photography, illustrations, and other visual elements"
                            className="resize-none min-h-20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-between">
              <Button type="button" onClick={() => setActiveTab("brand-voice")}>Previous</Button>
              <Button type="button" onClick={() => setActiveTab("additional")}>Next</Button>
            </div>
          </TabsContent>
          
          <TabsContent value="additional" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="targetAudience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Audience</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your target audience or customer personas"
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
                    name="brandStory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand Story</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Share the story behind your brand"
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
                    name="brandValues"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand Values</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Core values that drive your brand (e.g., Innovation, Quality, Integrity)"
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
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-between">
              <Button type="button" onClick={() => setActiveTab("usage-guidelines")}>Previous</Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Brand Guidelines'
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
};
