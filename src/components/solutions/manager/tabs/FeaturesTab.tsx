
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Star, Target, AlertTriangle, Users } from 'lucide-react';
import { EnhancedSolution } from '@/contexts/content-builder/types/enhanced-solution-types';

interface FeaturesTabProps {
  formData: Partial<EnhancedSolution>;
  updateFormData: (updates: Partial<EnhancedSolution>) => void;
}

export const FeaturesTab: React.FC<FeaturesTabProps> = ({
  formData,
  updateFormData
}) => {
  const [newFeature, setNewFeature] = useState('');
  const [newUseCase, setNewUseCase] = useState('');
  const [newPainPoint, setNewPainPoint] = useState('');
  const [newAudience, setNewAudience] = useState('');
  const [newBenefit, setNewBenefit] = useState('');

  const addItem = (
    type: 'features' | 'useCases' | 'painPoints' | 'targetAudience' | 'benefits',
    value: string,
    setter: (value: string) => void
  ) => {
    if (!value.trim()) return;
    
    const currentItems = formData[type] || [];
    if (!currentItems.includes(value.trim())) {
      updateFormData({
        [type]: [...currentItems, value.trim()]
      });
    }
    setter('');
  };

  const removeItem = (
    type: 'features' | 'useCases' | 'painPoints' | 'targetAudience' | 'benefits',
    index: number
  ) => {
    const currentItems = formData[type] || [];
    updateFormData({
      [type]: currentItems.filter((_, i) => i !== index)
    });
  };

  const ItemSection = ({ 
    title, 
    icon: Icon, 
    items, 
    type, 
    newValue, 
    setNewValue, 
    placeholder,
    description 
  }: {
    title: string;
    icon: React.ElementType;
    items: string[];
    type: 'features' | 'useCases' | 'painPoints' | 'targetAudience' | 'benefits';
    newValue: string;
    setNewValue: (value: string) => void;
    placeholder: string;
    description: string;
  }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder={placeholder}
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addItem(type, newValue, setNewValue);
              }
            }}
          />
          <Button 
            type="button" 
            onClick={() => addItem(type, newValue, setNewValue)}
            disabled={!newValue.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        {items.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {items.map((item, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="flex items-center gap-1 pr-1"
              >
                {item}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => removeItem(type, index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}
        
        {items.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-sm">No {title.toLowerCase()} added yet</p>
            <p className="text-xs">Add items using the input above</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <ItemSection
        title="Key Features"
        icon={Star}
        items={formData.features || []}
        type="features"
        newValue={newFeature}
        setNewValue={setNewFeature}
        placeholder="e.g., Real-time data visualization"
        description="List the main features and capabilities of your solution"
      />
      
      <ItemSection
        title="Benefits"
        icon={Target}
        items={formData.benefits || []}
        type="benefits"
        newValue={newBenefit}
        setNewValue={setNewBenefit}
        placeholder="e.g., Reduces manual work by 80%"
        description="Highlight the key benefits and value propositions"
      />
      
      <ItemSection
        title="Use Cases"
        icon={Target}
        items={formData.useCases || []}
        type="useCases"
        newValue={newUseCase}
        setNewValue={setNewUseCase}
        placeholder="e.g., Performance monitoring and reporting"
        description="Describe common scenarios where your solution is used"
      />
      
      <ItemSection
        title="Pain Points Addressed"
        icon={AlertTriangle}
        items={formData.painPoints || []}
        type="painPoints"
        newValue={newPainPoint}
        setNewValue={setNewPainPoint}
        placeholder="e.g., Slow decision making due to data silos"
        description="What problems does your solution solve?"
      />
      
      <ItemSection
        title="Target Audience"
        icon={Users}
        items={formData.targetAudience || []}
        type="targetAudience"
        newValue={newAudience}
        setNewValue={setNewAudience}
        placeholder="e.g., Marketing directors and operations managers"
        description="Who are the ideal users of your solution?"
      />
    </div>
  );
};
