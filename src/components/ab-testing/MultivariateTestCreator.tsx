import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus } from 'lucide-react';
import { TestFactor, FactorValue, MultivariateTest } from '@/types/ab-testing-advanced';

interface MultivariateTestCreatorProps {
  onTestCreated: (test: Omit<MultivariateTest, 'id' | 'created_at'>) => void;
  onCancel: () => void;
}

export const MultivariateTestCreator: React.FC<MultivariateTestCreatorProps> = ({
  onTestCreated,
  onCancel
}) => {
  const [testName, setTestName] = useState('');
  const [description, setDescription] = useState('');
  const [factors, setFactors] = useState<TestFactor[]>([]);
  const [isGeneratingCombinations, setIsGeneratingCombinations] = useState(false);

  const addFactor = () => {
    const newFactor: TestFactor = {
      id: crypto.randomUUID(),
      name: '',
      type: 'content',
      values: []
    };
    setFactors([...factors, newFactor]);
  };

  const updateFactor = (factorId: string, updates: Partial<TestFactor>) => {
    setFactors(factors.map(factor => 
      factor.id === factorId ? { ...factor, ...updates } : factor
    ));
  };

  const removeFactor = (factorId: string) => {
    setFactors(factors.filter(factor => factor.id !== factorId));
  };

  const addFactorValue = (factorId: string) => {
    const newValue: FactorValue = {
      id: crypto.randomUUID(),
      name: '',
      value: '',
      description: ''
    };
    
    setFactors(factors.map(factor => 
      factor.id === factorId 
        ? { ...factor, values: [...factor.values, newValue] }
        : factor
    ));
  };

  const updateFactorValue = (factorId: string, valueId: string, updates: Partial<FactorValue>) => {
    setFactors(factors.map(factor => 
      factor.id === factorId 
        ? {
            ...factor,
            values: factor.values.map(value => 
              value.id === valueId ? { ...value, ...updates } : value
            )
          }
        : factor
    ));
  };

  const removeFactorValue = (factorId: string, valueId: string) => {
    setFactors(factors.map(factor => 
      factor.id === factorId 
        ? { ...factor, values: factor.values.filter(value => value.id !== valueId) }
        : factor
    ));
  };

  const generateCombinations = () => {
    setIsGeneratingCombinations(true);
    
    setTimeout(() => {
      const combinations = [];
      const factorValues = factors.map(factor => factor.values);
      
      // Generate all possible combinations
      const generateRecursive = (currentCombination: Record<string, string>, factorIndex: number) => {
        if (factorIndex >= factors.length) {
          const combinationName = Object.entries(currentCombination)
            .map(([factorId, valueId]) => {
              const factor = factors.find(f => f.id === factorId);
              const value = factor?.values.find(v => v.id === valueId);
              return `${factor?.name}: ${value?.name}`;
            })
            .join(' + ');

          combinations.push({
            id: crypto.randomUUID(),
            name: combinationName,
            factors: currentCombination,
            traffic_weight: 1 / (factorValues.reduce((acc, values) => acc * values.length, 1))
          });
          return;
        }

        const currentFactor = factors[factorIndex];
        currentFactor.values.forEach(value => {
          generateRecursive(
            { ...currentCombination, [currentFactor.id]: value.id },
            factorIndex + 1
          );
        });
      };

      generateRecursive({}, 0);
      setIsGeneratingCombinations(false);
      
      // Create the multivariate test
      const multivariateTest: Omit<MultivariateTest, 'id' | 'created_at'> = {
        name: testName,
        description,
        status: 'draft',
        type: 'multivariate',
        user_id: 'current-user', // This would be replaced with actual user ID
        test_type: 'content',
        target_metric: 'conversion_rate',
        confidence_level: 95,
        minimum_sample_size: 1000,
        started_at: null,
        ended_at: null,
        updated_at: new Date().toISOString(),
        traffic_allocation: combinations.reduce((acc, combo) => {
          acc[combo.id] = combo.traffic_weight;
          return acc;
        }, {} as Record<string, number>),
        metadata: {},
        factors,
        combinations,
        variants: combinations.map(combo => ({
          id: combo.id,
          name: combo.name,
          traffic_weight: combo.traffic_weight,
          test_id: '',
          is_control: false,
          content_data: combo.factors,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }))
      };

      onTestCreated(multivariateTest);
    }, 1000);
  };

  const canCreateTest = testName.trim() && factors.length >= 2 && 
    factors.every(factor => factor.name.trim() && factor.values.length >= 2);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="testName">Test Name</Label>
          <Input
            id="testName"
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
            placeholder="Enter multivariate test name"
          />
        </div>
        
        <div>
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what you're testing"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Test Factors</h3>
          <Button onClick={addFactor} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Factor
          </Button>
        </div>

        {factors.map((factor) => (
          <Card key={factor.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Factor Configuration</CardTitle>
                <Button
                  onClick={() => removeFactor(factor.id)}
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Factor Name</Label>
                  <Input
                    value={factor.name}
                    onChange={(e) => updateFactor(factor.id, { name: e.target.value })}
                    placeholder="e.g., Headline"
                  />
                </div>
                <div>
                  <Label>Factor Type</Label>
                  <Select
                    value={factor.type}
                    onValueChange={(value: any) => updateFactor(factor.id, { type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="content">Content</SelectItem>
                      <SelectItem value="style">Style</SelectItem>
                      <SelectItem value="layout">Layout</SelectItem>
                      <SelectItem value="functionality">Functionality</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Factor Values</Label>
                  <Button
                    onClick={() => addFactorValue(factor.id)}
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Value
                  </Button>
                </div>

                {factor.values.map((value) => (
                  <div key={value.id} className="flex items-center gap-2">
                    <Input
                      value={value.name}
                      onChange={(e) => updateFactorValue(factor.id, value.id, { name: e.target.value })}
                      placeholder="Value name"
                      className="flex-1"
                    />
                    <Input
                      value={value.value}
                      onChange={(e) => updateFactorValue(factor.id, value.id, { value: e.target.value })}
                      placeholder="Value content"
                      className="flex-1"
                    />
                    <Button
                      onClick={() => removeFactorValue(factor.id, value.id)}
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end space-x-2">
        <Button onClick={onCancel} variant="outline">
          Cancel
        </Button>
        <Button
          onClick={generateCombinations}
          disabled={!canCreateTest || isGeneratingCombinations}
        >
          {isGeneratingCombinations ? 'Generating Combinations...' : 'Create Multivariate Test'}
        </Button>
      </div>
    </div>
  );
};