import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X, DollarSign, CreditCard, Star, Minus } from 'lucide-react';
import { EnhancedSolution, PricingModel } from '@/contexts/content-builder/types/enhanced-solution-types';
import { DropdownWithOther } from '../shared/DropdownWithOther';

interface PricingTabProps {
  formData: Partial<EnhancedSolution>;
  updateFormData: (updates: Partial<EnhancedSolution>) => void;
}

const PRICING_MODELS: Array<{ value: string; label: string }> = [
  { value: 'subscription', label: 'Subscription' },
  { value: 'one-time', label: 'One-time Purchase' },
  { value: 'usage-based', label: 'Usage-based' },
  { value: 'freemium', label: 'Freemium' },
  { value: 'enterprise', label: 'Enterprise' },
  { value: 'custom', label: 'Custom Pricing' }
];

export const PricingTab: React.FC<PricingTabProps> = ({
  formData,
  updateFormData
}) => {
  const [newTier, setNewTier] = useState({
    name: '',
    price: '',
    features: '',
    limitations: ''
  });
  const [customPricingModel, setCustomPricingModel] = useState('');

  const pricing = formData.pricing || {
    model: 'subscription',
    tiers: [],
    customPricing: false
  };

  const updatePricing = (updates: Partial<PricingModel>) => {
    updateFormData({
      pricing: {
        ...pricing,
        ...updates
      }
    });
  };

  const addTier = () => {
    if (!newTier.name.trim() || !newTier.price.trim()) return;

    const tier = {
      name: newTier.name.trim(),
      price: newTier.price.trim(),
      features: newTier.features.split(',').map(f => f.trim()).filter(f => f),
      limitations: newTier.limitations.split(',').map(l => l.trim()).filter(l => l)
    };

    updatePricing({
      tiers: [...pricing.tiers, tier]
    });

    setNewTier({ name: '', price: '', features: '', limitations: '' });
  };

  const removeTier = (index: number) => {
    updatePricing({
      tiers: pricing.tiers.filter((_, i) => i !== index)
    });
  };

  const updateTier = (index: number, updates: any) => {
    updatePricing({
      tiers: pricing.tiers.map((tier, i) => 
        i === index ? { ...tier, ...updates } : tier
      )
    });
  };

  const addTierFeature = (tierIndex: number, feature: string) => {
    if (!feature.trim()) return;
    
    const tier = pricing.tiers[tierIndex];
    if (!tier.features.includes(feature.trim())) {
      updateTier(tierIndex, {
        features: [...tier.features, feature.trim()]
      });
    }
  };

  const removeTierFeature = (tierIndex: number, featureIndex: number) => {
    const tier = pricing.tiers[tierIndex];
    updateTier(tierIndex, {
      features: tier.features.filter((_, i) => i !== featureIndex)
    });
  };

  return (
    <div className="space-y-6">
      {/* Pricing Model */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Pricing Model
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DropdownWithOther
              id="pricing-model"
              label="Business Model"
              placeholder="Select pricing model"
              options={PRICING_MODELS}
              value={pricing.model}
              onValueChange={(value) => updatePricing({ model: value as PricingModel['model'] })}
              customValue={customPricingModel}
              onCustomValueChange={setCustomPricingModel}
              customInputLabel="Specify pricing model"
              customInputPlaceholder="Enter custom pricing model"
            />
            
            <div className="space-y-2">
              <Label htmlFor="starting-price">Starting Price</Label>
              <Input
                id="starting-price"
                placeholder="e.g., $29/month"
                value={pricing.startingPrice || ''}
                onChange={(e) => updatePricing({ startingPrice: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="custom-pricing"
                checked={pricing.customPricing || false}
                onCheckedChange={(checked) => updatePricing({ customPricing: checked })}
              />
              <Label htmlFor="custom-pricing">Custom pricing available</Label>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="trial-duration">Free Trial Duration</Label>
              <Input
                id="trial-duration"
                placeholder="e.g., 14 days"
                value={pricing.freeTrialDuration || ''}
                onChange={(e) => updatePricing({ freeTrialDuration: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add New Pricing Tier */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Pricing Tier
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tier-name">Tier Name *</Label>
              <Input
                id="tier-name"
                placeholder="e.g., Professional"
                value={newTier.name}
                onChange={(e) => setNewTier(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tier-price">Price *</Label>
              <Input
                id="tier-price"
                placeholder="e.g., $99/month"
                value={newTier.price}
                onChange={(e) => setNewTier(prev => ({ ...prev, price: e.target.value }))}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tier-features">Features (comma-separated)</Label>
            <Textarea
              id="tier-features"
              placeholder="e.g., Unlimited users, Advanced analytics, Priority support"
              value={newTier.features}
              onChange={(e) => setNewTier(prev => ({ ...prev, features: e.target.value }))}
              className="resize-none"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tier-limitations">Limitations (comma-separated, optional)</Label>
            <Textarea
              id="tier-limitations"
              placeholder="e.g., 100GB storage, No custom branding"
              value={newTier.limitations}
              onChange={(e) => setNewTier(prev => ({ ...prev, limitations: e.target.value }))}
              className="resize-none"
              rows={2}
            />
          </div>
          
          <Button 
            onClick={addTier}
            disabled={!newTier.name.trim() || !newTier.price.trim()}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Pricing Tier
          </Button>
        </CardContent>
      </Card>

      {/* Pricing Tiers List */}
      {pricing.tiers.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Pricing Tiers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pricing.tiers.map((tier, index) => (
              <Card key={index} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      {tier.name}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTier(index)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-2xl font-bold text-primary">{tier.price}</div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Features */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-1">
                      <Star className="h-4 w-4 text-green-500" />
                      Features
                    </Label>
                    {tier.features.length > 0 ? (
                      <div className="space-y-1">
                        {tier.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center gap-2 text-sm">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0" />
                            <span className="flex-1">{feature}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No features specified</p>
                    )}
                  </div>

                  {/* Limitations */}
                  {tier.limitations && tier.limitations.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-1">
                        <Minus className="h-4 w-4 text-orange-500" />
                        Limitations
                      </Label>
                      <div className="space-y-1">
                        {tier.limitations.map((limitation, limitationIndex) => (
                          <div key={limitationIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full flex-shrink-0" />
                            <span className="flex-1">{limitation}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Edit Tier */}
                  <div className="pt-3 border-t space-y-3">
                    <div className="space-y-2">
                      <Label className="text-xs">Tier Name</Label>
              <Input
                value={tier.name}
                onChange={(e) => updateTier(index, { name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Price</Label>
              <Input
                value={tier.price}
                onChange={(e) => updateTier(index, { price: e.target.value })}
              />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="space-y-3">
              <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-medium">No pricing tiers added yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Add pricing tiers to showcase your solution's value
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};