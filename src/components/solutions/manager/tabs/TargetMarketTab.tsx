import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X, Globe, TrendingUp, Shield, Users, DollarSign } from 'lucide-react';
import { EnhancedSolution } from '@/contexts/content-builder/types/enhanced-solution-types';

interface TargetMarketTabProps {
  formData: Partial<EnhancedSolution>;
  updateFormData: (updates: Partial<EnhancedSolution>) => void;
}

export const TargetMarketTab: React.FC<TargetMarketTabProps> = ({
  formData,
  updateFormData
}) => {
  const [newGeography, setNewGeography] = useState('');
  const [newCompliance, setNewCompliance] = useState('');
  const [newDifferentiator, setNewDifferentiator] = useState('');
  const [newValueProp, setNewValueProp] = useState('');

  const addArrayItem = (
    field: string,
    value: string,
    setter: (value: string) => void
  ) => {
    if (!value.trim()) return;
    
    const currentData = formData.marketData || {};
    const currentItems = (currentData as any)[field] || [];
    
    if (!currentItems.includes(value.trim())) {
      updateFormData({
        marketData: {
          ...currentData,
          [field]: [...currentItems, value.trim()]
        }
      });
    }
    setter('');
  };

  const removeArrayItem = (field: string, index: number) => {
    const currentData = formData.marketData || {};
    const currentItems = (currentData as any)[field] || [];
    
    updateFormData({
      marketData: {
        ...currentData,
        [field]: currentItems.filter((_: any, i: number) => i !== index)
      }
    });
  };

  const addStringArrayItem = (
    field: 'uniqueValuePropositions' | 'keyDifferentiators',
    value: string,
    setter: (value: string) => void
  ) => {
    if (!value.trim()) return;
    
    const currentItems = formData[field] || [];
    if (!currentItems.includes(value.trim())) {
      updateFormData({
        [field]: [...currentItems, value.trim()]
      });
    }
    setter('');
  };

  const removeStringArrayItem = (
    field: 'uniqueValuePropositions' | 'keyDifferentiators',
    index: number
  ) => {
    const currentItems = formData[field] || [];
    updateFormData({
      [field]: currentItems.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-6">
      {/* Market Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Market Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="market-size">Market Size</Label>
              <Input
                id="market-size"
                placeholder="e.g., $2.5B globally"
                value={formData.marketData?.size || ''}
                onChange={(e) => updateFormData({
                  marketData: {
                    ...formData.marketData,
                    size: e.target.value
                  }
                })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="growth-rate">Annual Growth Rate</Label>
              <Input
                id="growth-rate"
                placeholder="e.g., 15% CAGR"
                value={formData.marketData?.growthRate || ''}
                onChange={(e) => updateFormData({
                  marketData: {
                    ...formData.marketData,
                    growthRate: e.target.value
                  }
                })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Geographic Availability */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Geographic Availability
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add geographic region or country"
              value={newGeography}
              onChange={(e) => setNewGeography(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addArrayItem('geographicAvailability', newGeography, setNewGeography);
                }
              }}
            />
            <Button 
              type="button" 
              onClick={() => addArrayItem('geographicAvailability', newGeography, setNewGeography)}
              disabled={!newGeography.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {formData.marketData?.geographicAvailability && formData.marketData.geographicAvailability.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.marketData.geographicAvailability.map((geo, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1 pr-1">
                  {geo}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => removeArrayItem('geographicAvailability', index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compliance Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Compliance & Certifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add compliance requirement or certification"
              value={newCompliance}
              onChange={(e) => setNewCompliance(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addArrayItem('complianceRequirements', newCompliance, setNewCompliance);
                }
              }}
            />
            <Button 
              type="button" 
              onClick={() => addArrayItem('complianceRequirements', newCompliance, setNewCompliance)}
              disabled={!newCompliance.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {formData.marketData?.complianceRequirements && formData.marketData.complianceRequirements.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.marketData.complianceRequirements.map((comp, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1 pr-1">
                  {comp}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => removeArrayItem('complianceRequirements', index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Unique Value Propositions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Unique Value Propositions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="What makes your solution unique?"
              value={newValueProp}
              onChange={(e) => setNewValueProp(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addStringArrayItem('uniqueValuePropositions', newValueProp, setNewValueProp);
                }
              }}
            />
            <Button 
              type="button" 
              onClick={() => addStringArrayItem('uniqueValuePropositions', newValueProp, setNewValueProp)}
              disabled={!newValueProp.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {formData.uniqueValuePropositions && formData.uniqueValuePropositions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.uniqueValuePropositions.map((uvp, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1 pr-1">
                  {uvp}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => removeStringArrayItem('uniqueValuePropositions', index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Key Differentiators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Key Differentiators
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="What sets you apart from competitors?"
              value={newDifferentiator}
              onChange={(e) => setNewDifferentiator(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addStringArrayItem('keyDifferentiators', newDifferentiator, setNewDifferentiator);
                }
              }}
            />
            <Button 
              type="button" 
              onClick={() => addStringArrayItem('keyDifferentiators', newDifferentiator, setNewDifferentiator)}
              disabled={!newDifferentiator.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {formData.keyDifferentiators && formData.keyDifferentiators.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.keyDifferentiators.map((diff, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1 pr-1">
                  {diff}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => removeStringArrayItem('keyDifferentiators', index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Positioning Statement */}
      <Card>
        <CardHeader>
          <CardTitle>Market Positioning Statement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="positioning">How do you position your solution in the market?</Label>
            <Textarea
              id="positioning"
              placeholder="For [target audience], our solution is the [category] that [key benefit] because [key differentiator]..."
              className="min-h-[100px] resize-none"
              value={formData.positioningStatement || ''}
              onChange={(e) => updateFormData({ positioningStatement: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};