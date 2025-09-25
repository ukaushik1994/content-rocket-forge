import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useABTest } from '@/contexts/ABTestContext';
import { toast } from 'sonner';
import { 
  Target, 
  Users, 
  TrendingUp, 
  Eye, 
  MousePointer, 
  ShoppingCart,
  FileText,
  Palette,
  Layout,
  Plus,
  X
} from 'lucide-react';

interface TestCreationWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: {
    name?: string;
    description?: string;
    type?: 'content' | 'ui' | 'seo';
    targetMetric?: string;
  };
}

const TEST_TEMPLATES = [
  {
    id: 'headline-test',
    name: 'Headline A/B Test',
    description: 'Test different headlines to improve click-through rates',
    type: 'content',
    targetMetric: 'click_rate',
    icon: FileText,
    variants: [
      { name: 'control', content: { headline: 'Original Headline' } },
      { name: 'variant_a', content: { headline: 'New Compelling Headline' } }
    ]
  },
  {
    id: 'cta-button-test',
    name: 'CTA Button Test',
    description: 'Test different call-to-action buttons for better conversions',
    type: 'ui',
    targetMetric: 'conversion_rate',
    icon: MousePointer,
    variants: [
      { name: 'control', content: { text: 'Learn More', color: 'primary' } },
      { name: 'variant_a', content: { text: 'Get Started Now', color: 'secondary' } }
    ]
  },
  {
    id: 'meta-description-test',
    name: 'Meta Description Test',
    description: 'Test different meta descriptions to improve SERP performance',
    type: 'seo',
    targetMetric: 'organic_ctr',
    icon: Eye,
    variants: [
      { name: 'control', content: { meta_description: 'Original meta description' } },
      { name: 'variant_a', content: { meta_description: 'Optimized meta description with keywords' } }
    ]
  },
  {
    id: 'layout-test',
    name: 'Page Layout Test',
    description: 'Test different page layouts for better user engagement',
    type: 'ui',
    targetMetric: 'time_on_page',
    icon: Layout,
    variants: [
      { name: 'control', content: { layout: 'sidebar' } },
      { name: 'variant_a', content: { layout: 'full-width' } }
    ]
  }
];

const METRICS = [
  { value: 'click_rate', label: 'Click Rate', icon: MousePointer },
  { value: 'conversion_rate', label: 'Conversion Rate', icon: TrendingUp },
  { value: 'time_on_page', label: 'Time on Page', icon: Eye },
  { value: 'bounce_rate', label: 'Bounce Rate', icon: Users },
  { value: 'organic_ctr', label: 'Organic CTR', icon: Target },
  { value: 'revenue', label: 'Revenue', icon: ShoppingCart }
];

export const TestCreationWizard: React.FC<TestCreationWizardProps> = ({
  open,
  onOpenChange,
  initialData
}) => {
  const { createTest, createVariant } = useABTest();
  const [step, setStep] = useState<'template' | 'details' | 'variants'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<typeof TEST_TEMPLATES[0] | null>(null);
  const [customVariants, setCustomVariants] = useState<Array<{ name: string; content: any }>>([]);
  const [testDetails, setTestDetails] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    target_metric: initialData?.targetMetric || '',
    traffic_allocation: 50,
    duration_days: 14,
    minimum_sample_size: 1000
  });

  const handleTemplateSelect = (template: typeof TEST_TEMPLATES[0]) => {
    setSelectedTemplate(template);
    setTestDetails(prev => ({
      ...prev,
      name: template.name,
      description: template.description,
      target_metric: template.targetMetric
    }));
    setCustomVariants(template.variants);
    setStep('details');
  };

  const handleCustomTest = () => {
    setSelectedTemplate(null);
    setCustomVariants([
      { name: 'control', content: {} },
      { name: 'variant_a', content: {} }
    ]);
    setStep('details');
  };

  const addVariant = () => {
    const variantLetter = String.fromCharCode(97 + customVariants.length - 1); // a, b, c, etc.
    setCustomVariants(prev => [...prev, { 
      name: `variant_${variantLetter}`, 
      content: {} 
    }]);
  };

  const removeVariant = (index: number) => {
    if (customVariants.length > 2) {
      setCustomVariants(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateVariant = (index: number, updates: Partial<{ name: string; content: any }>) => {
    setCustomVariants(prev => prev.map((variant, i) => 
      i === index ? { ...variant, ...updates } : variant
    ));
  };

  const handleCreateTest = async () => {
    try {
      const testData = {
        name: testDetails.name,
        description: testDetails.description,
        target_metric: testDetails.target_metric,
        traffic_allocation: testDetails.traffic_allocation,
        duration_days: testDetails.duration_days,
        minimum_sample_size: testDetails.minimum_sample_size,
        confidence_level: 0.95, // Add missing required field
        status: 'draft' as const,
        test_type: (selectedTemplate?.type || 'custom') as 'content' | 'ui' | 'serp' | 'cta' | 'layout',
        metadata: {
          template_id: selectedTemplate?.id,
          created_via: 'wizard'
        }
      };

      const newTest = await createTest(testData);
      if (!newTest) {
        throw new Error('Failed to create test');
      }

      // Create variants
      for (const variant of customVariants) {
        await createVariant({
          test_id: newTest.id,
          name: variant.name,
          description: `${variant.name} variant`,
          traffic_weight: Math.floor(100 / customVariants.length),
          content_data: variant.content, // Use content_data as per interface
          is_control: variant.name === 'control'
        });
      }

      toast.success('A/B Test created successfully!');
      onOpenChange(false);
      
      // Reset state
      setStep('template');
      setSelectedTemplate(null);
      setCustomVariants([]);
      setTestDetails({
        name: '',
        description: '',
        target_metric: '',
        traffic_allocation: 50,
        duration_days: 14,
        minimum_sample_size: 1000
      });
    } catch (error) {
      console.error('Error creating test:', error);
      toast.error('Failed to create A/B test');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Create A/B Test
          </DialogTitle>
        </DialogHeader>

        <Tabs value={step} onValueChange={(value) => setStep(value as any)}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="template">Choose Template</TabsTrigger>
            <TabsTrigger value="details" disabled={!selectedTemplate && customVariants.length === 0}>
              Test Details
            </TabsTrigger>
            <TabsTrigger value="variants" disabled={step === 'template'}>
              Configure Variants
            </TabsTrigger>
          </TabsList>

          <TabsContent value="template" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TEST_TEMPLATES.map((template) => {
                const Icon = template.icon;
                return (
                  <Card 
                    key={template.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Icon className="h-5 w-5" />
                        {template.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        {template.description}
                      </p>
                      <div className="flex gap-2">
                        <Badge variant="secondary">{template.type}</Badge>
                        <Badge variant="outline">{template.targetMetric}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            <div className="pt-4 border-t">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleCustomTest}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Custom Test
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="test-name">Test Name</Label>
                <Input
                  id="test-name"
                  value={testDetails.name}
                  onChange={(e) => setTestDetails(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter test name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="target-metric">Target Metric</Label>
                <Select 
                  value={testDetails.target_metric} 
                  onValueChange={(value) => setTestDetails(prev => ({ ...prev, target_metric: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select metric" />
                  </SelectTrigger>
                  <SelectContent>
                    {METRICS.map((metric) => {
                      const Icon = metric.icon;
                      return (
                        <SelectItem key={metric.value} value={metric.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {metric.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={testDetails.description}
                onChange={(e) => setTestDetails(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what you're testing and why"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="traffic">Traffic Split (%)</Label>
                <Input
                  id="traffic"
                  type="number"
                  value={testDetails.traffic_allocation}
                  onChange={(e) => setTestDetails(prev => ({ ...prev, traffic_allocation: parseInt(e.target.value) }))}
                  min="10"
                  max="100"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (days)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={testDetails.duration_days}
                  onChange={(e) => setTestDetails(prev => ({ ...prev, duration_days: parseInt(e.target.value) }))}
                  min="1"
                  max="90"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sample-size">Min Sample Size</Label>
                <Input
                  id="sample-size"
                  type="number"
                  value={testDetails.minimum_sample_size}
                  onChange={(e) => setTestDetails(prev => ({ ...prev, minimum_sample_size: parseInt(e.target.value) }))}
                  min="100"
                />
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep('template')}>
                Back
              </Button>
              <Button onClick={() => setStep('variants')}>
                Next: Configure Variants
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="variants" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Test Variants</h3>
              <Button variant="outline" size="sm" onClick={addVariant}>
                <Plus className="h-4 w-4 mr-2" />
                Add Variant
              </Button>
            </div>

            <div className="space-y-4">
              {customVariants.map((variant, index) => (
                <Card key={index}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        {variant.name === 'control' ? (
                          <Badge variant="default">Control</Badge>
                        ) : (
                          <Badge variant="secondary">Variant</Badge>
                        )}
                        <Input
                          value={variant.name}
                          onChange={(e) => updateVariant(index, { name: e.target.value })}
                          className="w-32 h-8"
                        />
                      </CardTitle>
                      {customVariants.length > 2 && variant.name !== 'control' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeVariant(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Configure variant content (JSON or description)"
                      value={typeof variant.content === 'string' ? variant.content : JSON.stringify(variant.content, null, 2)}
                      onChange={(e) => {
                        try {
                          const parsed = JSON.parse(e.target.value);
                          updateVariant(index, { content: parsed });
                        } catch {
                          updateVariant(index, { content: e.target.value });
                        }
                      }}
                      rows={3}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep('details')}>
                Back
              </Button>
              <Button onClick={handleCreateTest}>
                Create Test
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};