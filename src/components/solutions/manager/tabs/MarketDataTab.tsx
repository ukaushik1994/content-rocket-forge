import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, X, TrendingUp, Globe, Users, DollarSign } from 'lucide-react';
import { EnhancedSolution } from '@/contexts/content-builder/types/enhanced-solution-types';
import { DropdownWithOther } from '../shared/DropdownWithOther';

interface MarketDataTabProps {
  formData: Partial<EnhancedSolution>;
  updateFormData: (updates: Partial<EnhancedSolution>) => void;
}

export const MarketDataTab: React.FC<MarketDataTabProps> = ({
  formData,
  updateFormData
}) => {
  const marketData = formData.marketData || {};
  const [newGeography, setNewGeography] = useState('');
  const [newCompliance, setNewCompliance] = useState('');

  const updateMarketData = (updates: any) => {
    const newMarketData = { ...marketData, ...updates };
    console.log('Market data updated:', newMarketData);
    updateFormData({ marketData: newMarketData });
  };

  const addArrayItem = (field: string, value: string, setter: (value: string) => void) => {
    if (!value.trim()) return;
    
    const currentItems = (marketData as any)[field] || [];
    if (!currentItems.includes(value.trim())) {
      updateMarketData({
        [field]: [...currentItems, value.trim()]
      });
    }
    setter('');
  };

  const removeArrayItem = (field: string, index: number) => {
    const currentItems = (marketData as any)[field] || [];
    updateMarketData({
      [field]: currentItems.filter((_: any, i: number) => i !== index)
    });
  };

  // Geographic regions options
  const geographicOptions = [
    { value: 'north-america', label: 'North America' },
    { value: 'europe', label: 'Europe' },
    { value: 'asia-pacific', label: 'Asia-Pacific' },
    { value: 'latin-america', label: 'Latin America' },
    { value: 'middle-east-africa', label: 'Middle East & Africa' },
    { value: 'global', label: 'Global' }
  ];

  // Compliance standards options
  const complianceOptions = [
    { value: 'gdpr', label: 'GDPR' },
    { value: 'hipaa', label: 'HIPAA' },
    { value: 'soc2', label: 'SOC 2' },
    { value: 'iso27001', label: 'ISO 27001' },
    { value: 'pci-dss', label: 'PCI DSS' },
    { value: 'ccpa', label: 'CCPA' }
  ];

  return (
    <div className="space-y-6">
      {/* Market Size & Growth */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Market Size & Growth
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="market-size">Total Addressable Market</Label>
              <Input
                id="market-size"
                placeholder="e.g., $50B globally"
                value={marketData.size || ''}
                onChange={(e) => updateMarketData({ size: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="growth-rate">Annual Growth Rate</Label>
              <Input
                id="growth-rate"
                placeholder="e.g., 15% CAGR"
                value={marketData.growthRate || ''}
                onChange={(e) => updateMarketData({ growthRate: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Geographic Markets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Geographic Markets
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <DropdownWithOther
              label="Add Geographic Region"
              placeholder="Select a region"
              options={geographicOptions}
              value={newGeography}
              onValueChange={setNewGeography}
              showCustomInput={false}
            />
            <Button 
              type="button" 
              onClick={() => {
                if (newGeography === 'Other') return; // Handle Other separately
                addArrayItem('geographicAvailability', newGeography, setNewGeography);
              }}
              disabled={!newGeography.trim()}
              className="mt-8"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {marketData.geographicAvailability && marketData.geographicAvailability.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {marketData.geographicAvailability.map((geo, index) => (
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

          <div className="flex gap-2">
            <Input
              placeholder="Or add custom region"
              value=""
              onChange={(e) => setNewGeography(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                  e.preventDefault();
                  addArrayItem('geographicAvailability', e.currentTarget.value, () => {});
                  e.currentTarget.value = '';
                }
              }}
            />
            <Button 
              type="button" 
              onClick={(e) => {
                const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                if (input?.value.trim()) {
                  addArrayItem('geographicAvailability', input.value, () => {});
                  input.value = '';
                }
              }}
              disabled={false}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Compliance & Regulations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <DropdownWithOther
              label="Add Compliance Standard"
              placeholder="Select a standard"
              options={complianceOptions}
              value={newCompliance}
              onValueChange={setNewCompliance}
              showCustomInput={false}
            />
            <Button 
              type="button" 
              onClick={() => {
                if (newCompliance === 'Other') return;
                addArrayItem('complianceRequirements', newCompliance, setNewCompliance);
              }}
              disabled={!newCompliance.trim()}
              className="mt-8"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {marketData.complianceRequirements && marketData.complianceRequirements.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {marketData.complianceRequirements.map((comp, index) => (
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

          <div className="flex gap-2">
            <Input
              placeholder="Or add custom compliance requirement"
              value=""
              onChange={(e) => setNewCompliance(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                  e.preventDefault();
                  addArrayItem('complianceRequirements', e.currentTarget.value, () => {});
                  e.currentTarget.value = '';
                }
              }}
            />
            <Button 
              type="button" 
              onClick={(e) => {
                const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                if (input?.value.trim()) {
                  addArrayItem('complianceRequirements', input.value, () => {});
                  input.value = '';
                }
              }}
              disabled={false}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};