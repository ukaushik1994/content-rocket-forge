import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useABTest } from '@/contexts/ABTestContext';
import { useContentBuilder } from '@/contexts/content-builder/ContentBuilderContext';
import { TestTube, Plus, Users, Target, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface ABTestIntegrationProps {
  contentTitle: string;
  contentData: any;
}

export const ABTestIntegration: React.FC<ABTestIntegrationProps> = ({
  contentTitle,
  contentData
}) => {
  const { createTest, createVariant, activeTests } = useABTest();
  const { state } = useContentBuilder();
  
  const [enableTesting, setEnableTesting] = useState(false);
  const [testName, setTestName] = useState('');
  const [variants, setVariants] = useState<Array<{
    name: string;
    title: string;
    content: string;
    trafficWeight: number;
  }>>([
    { name: 'Control', title: contentTitle, content: contentData?.content || '', trafficWeight: 50 },
    { name: 'Variant A', title: '', content: '', trafficWeight: 50 }
  ]);

  const [creatingTest, setCreatingTest] = useState(false);

  const handleCreateTest = async () => {
    if (!testName || variants.some(v => !v.title || !v.content)) {
      toast.error('Please fill in all test details and variant content');
      return;
    }

    setCreatingTest(true);
    try {
      // Create the A/B test
      const test = await createTest({
        name: testName,
        description: `A/B test for content: ${contentTitle}`,
        test_type: 'content',
        target_metric: 'conversion',
        status: 'draft',
        traffic_allocation: 1.0,
        minimum_sample_size: 100,
        confidence_level: 0.95,
        metadata: {
          contentType: 'content-builder',
          originalContent: contentData,
          serpData: state.serpData
        }
      });

      if (test) {
        // Create variants
        for (const variant of variants) {
          await createVariant({
            test_id: test.id,
            name: variant.name,
            description: `${variant.name} variant for ${testName}`,
            traffic_weight: variant.trafficWeight / 100,
            is_control: variant.name === 'Control',
            content_data: {
              title: variant.title,
              content: variant.content,
              metadata: contentData?.metadata || {}
            }
          });
        }

        toast.success('A/B test created successfully!');
        setEnableTesting(false);
        setTestName('');
      }
    } catch (error) {
      console.error('Failed to create A/B test:', error);
      toast.error('Failed to create A/B test');
    } finally {
      setCreatingTest(false);
    }
  };

  const updateVariant = (index: number, field: string, value: string | number) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const addVariant = () => {
    const newVariant = {
      name: `Variant ${String.fromCharCode(65 + variants.length - 1)}`,
      title: '',
      content: '',
      trafficWeight: Math.floor(100 / (variants.length + 1))
    };
    
    // Redistribute traffic weights
    const updatedVariants = variants.map(v => ({
      ...v,
      trafficWeight: Math.floor(100 / (variants.length + 1))
    }));
    
    setVariants([...updatedVariants, newVariant]);
  };

  const removeVariant = (index: number) => {
    if (variants.length <= 2) return;
    
    const updated = variants.filter((_, i) => i !== index);
    // Redistribute traffic weights
    const equalWeight = Math.floor(100 / updated.length);
    const redistributed = updated.map(v => ({ ...v, trafficWeight: equalWeight }));
    
    setVariants(redistributed);
  };

  const existingTests = activeTests.filter(test => 
    test.metadata?.contentType === 'content-builder' &&
    test.metadata?.originalContent?.title === contentTitle
  );

  return (
    <Card className="bg-card/50 backdrop-blur-xl border-border/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TestTube className="w-5 h-5 text-purple-400" />
            <CardTitle className="text-lg">A/B Testing</CardTitle>
          </div>
          <Switch
            checked={enableTesting}
            onCheckedChange={setEnableTesting}
            disabled={creatingTest}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Existing Tests */}
        {existingTests.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Active Tests</h4>
            {existingTests.map(test => (
              <div key={test.id} className="p-3 rounded-lg bg-muted/50 border border-border/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{test.name}</span>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                    {test.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>Traffic: {(test.traffic_allocation * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    <span>Target: {test.target_metric}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BarChart3 className="w-3 h-3" />
                    <span>Sample: {test.minimum_sample_size}</span>
                  </div>
                </div>
              </div>
            ))
            }
            <Separator />
          </div>
        )}

        <AnimatePresence>
          {enableTesting && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-6"
            >
              {/* Test Configuration */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="testName">Test Name</Label>
                  <Input
                    id="testName"
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                    placeholder="e.g., Homepage Hero A/B Test"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Variants Configuration */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Test Variants</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addVariant}
                    disabled={variants.length >= 5}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Variant
                  </Button>
                </div>

                {variants.map((variant, index) => (
                  <motion.div
                    key={`${variant.name}-${index}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 rounded-lg border border-border/30 bg-card/30 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <Label className="font-medium">{variant.name}</Label>
                      {index > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeVariant(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Title</Label>
                        <Input
                          value={variant.title}
                          onChange={(e) => updateVariant(index, 'title', e.target.value)}
                          placeholder="Variant title"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Traffic %</Label>
                        <Input
                          type="number"
                          value={variant.trafficWeight}
                          onChange={(e) => updateVariant(index, 'trafficWeight', parseInt(e.target.value))}
                          min="0"
                          max="100"
                          className="mt-1"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-xs">Content Preview</Label>
                      <textarea
                        value={variant.content}
                        onChange={(e) => updateVariant(index, 'content', e.target.value)}
                        placeholder="Variant content..."
                        className="mt-1 w-full p-2 text-sm rounded border border-border/30 bg-background/50 resize-none"
                        rows={3}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleCreateTest}
                  disabled={creatingTest}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                >
                  {creatingTest ? 'Creating...' : 'Create A/B Test'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEnableTesting(false)}
                  disabled={creatingTest}
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};
