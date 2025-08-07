import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TrendingUp, Globe, Users, DollarSign } from 'lucide-react';
import { EnhancedSolution } from '@/contexts/content-builder/types/enhanced-solution-types';

interface MarketDataTabProps {
  formData: Partial<EnhancedSolution>;
  updateFormData: (updates: Partial<EnhancedSolution>) => void;
}

export const MarketDataTab: React.FC<MarketDataTabProps> = ({
  formData,
  updateFormData
}) => {
  const marketData = formData.marketData || {};

  const updateMarketData = (updates: any) => {
    const newMarketData = { ...marketData, ...updates };
    console.log('Market data updated:', newMarketData);
    updateFormData({ marketData: newMarketData });
  };

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
          <div className="space-y-2">
            <Label htmlFor="geographic-availability">Geographic Availability</Label>
            <Textarea
              id="geographic-availability"
              placeholder="e.g., North America, Europe, Asia-Pacific"
              value={marketData.geographicAvailability?.join(', ') || ''}
              onChange={(e) => updateMarketData({ 
                geographicAvailability: e.target.value.split(',').map(s => s.trim()).filter(s => s)
              })}
              rows={3}
            />
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
          <div className="space-y-2">
            <Label htmlFor="compliance-requirements">Compliance Requirements</Label>
            <Textarea
              id="compliance-requirements"
              placeholder="e.g., GDPR, HIPAA, SOC 2, ISO 27001"
              value={marketData.complianceRequirements?.join(', ') || ''}
              onChange={(e) => updateMarketData({ 
                complianceRequirements: e.target.value.split(',').map(s => s.trim()).filter(s => s)
              })}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

    </div>
  );
};