import React, { useState, useCallback, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Server, Smartphone, Code, Shield, Zap, Clock } from 'lucide-react';
import { EnhancedSolution } from '@/contexts/content-builder/types/enhanced-solution-types';
import { DropdownWithOther } from '../shared/DropdownWithOther';

interface TechnicalSpecsTabProps {
  formData: Partial<EnhancedSolution>;
  updateFormData: (updates: Partial<EnhancedSolution>) => void;
}

interface TechnicalSectionProps {
  title: string;
  icon: React.ElementType;
  items: string[];
  field: 'systemRequirements' | 'supportedPlatforms' | 'apiCapabilities' | 'securityFeatures' | 'performanceMetrics';
  newValue: string;
  setNewValue: (value: string) => void;
  placeholder: string;
  onAddItem: (field: 'systemRequirements' | 'supportedPlatforms' | 'apiCapabilities' | 'securityFeatures' | 'performanceMetrics', value: string, setter: (value: string) => void) => void;
  onRemoveItem: (field: 'systemRequirements' | 'supportedPlatforms' | 'apiCapabilities' | 'securityFeatures' | 'performanceMetrics', index: number) => void;
}

const TechnicalSection = memo<TechnicalSectionProps>(({ 
  title, 
  icon: Icon, 
  items, 
  field, 
  newValue, 
  setNewValue, 
  placeholder,
  onAddItem,
  onRemoveItem
}) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Icon className="h-5 w-5" />
        {title}
      </CardTitle>
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
              onAddItem(field, newValue, setNewValue);
            }
          }}
        />
        <Button 
          type="button" 
          onClick={() => onAddItem(field, newValue, setNewValue)}
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
                onClick={() => onRemoveItem(field, index)}
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
        </div>
      )}
    </CardContent>
  </Card>
));

export const TechnicalSpecsTab: React.FC<TechnicalSpecsTabProps> = ({
  formData,
  updateFormData
}) => {
  const [newRequirement, setNewRequirement] = useState('');
  const [newPlatform, setNewPlatform] = useState('');
  const [newApiCapability, setNewApiCapability] = useState('');
  const [newSecurityFeature, setNewSecurityFeature] = useState('');
  const [newPerformanceMetric, setNewPerformanceMetric] = useState('');

  // Platform options
  const platformOptions = [
    { value: 'web', label: 'Web Browser' },
    { value: 'ios', label: 'iOS' },
    { value: 'android', label: 'Android' },
    { value: 'windows', label: 'Windows' },
    { value: 'macos', label: 'macOS' },
    { value: 'linux', label: 'Linux' },
    { value: 'api', label: 'API Only' }
  ];

  // API capability options
  const apiOptions = [
    { value: 'rest', label: 'REST API' },
    { value: 'graphql', label: 'GraphQL' },
    { value: 'websocket', label: 'WebSocket' },
    { value: 'webhook', label: 'Webhooks' },
    { value: 'sdk', label: 'SDK Available' },
    { value: 'oauth', label: 'OAuth Integration' }
  ];

  // Security standards options
  const securityOptions = [
    { value: 'encryption', label: 'End-to-End Encryption' },
    { value: 'soc2', label: 'SOC 2 Certified' },
    { value: 'iso27001', label: 'ISO 27001' },
    { value: 'gdpr', label: 'GDPR Compliant' },
    { value: 'hipaa', label: 'HIPAA Compliant' },
    { value: 'pci', label: 'PCI DSS' }
  ];

  const addTechnicalItem = useCallback((
    field: 'systemRequirements' | 'supportedPlatforms' | 'apiCapabilities' | 'securityFeatures' | 'performanceMetrics',
    value: string,
    setter: (value: string) => void
  ) => {
    if (!value.trim()) return;
    
    const currentSpecs = formData.technicalSpecs || {};
    const currentItems = (currentSpecs as any)[field] || [];
    
    if (!currentItems.includes(value.trim())) {
      updateFormData({
        technicalSpecs: {
          ...currentSpecs,
          [field]: [...currentItems, value.trim()]
        }
      });
    }
    setter('');
  }, [formData.technicalSpecs, updateFormData]);

  const removeTechnicalItem = useCallback((
    field: 'systemRequirements' | 'supportedPlatforms' | 'apiCapabilities' | 'securityFeatures' | 'performanceMetrics',
    index: number
  ) => {
    const currentSpecs = formData.technicalSpecs || {};
    const currentItems = (currentSpecs as any)[field] || [];
    
    updateFormData({
      technicalSpecs: {
        ...currentSpecs,
        [field]: currentItems.filter((_: any, i: number) => i !== index)
      }
    });
  }, [formData.technicalSpecs, updateFormData]);

  return (
    <div className="space-y-6">
      {/* System Requirements */}
      <TechnicalSection
        title="System Requirements"
        icon={Server}
        items={formData.technicalSpecs?.systemRequirements || []}
        field="systemRequirements"
        newValue={newRequirement}
        setNewValue={setNewRequirement}
        placeholder="e.g., 4GB RAM minimum, Windows 10 or macOS 10.15"
        onAddItem={addTechnicalItem}
        onRemoveItem={removeTechnicalItem}
      />

      {/* Supported Platforms */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Supported Platforms
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <DropdownWithOther
              label="Add Platform"
              placeholder="Select platform"
              options={platformOptions}
              value={newPlatform}
              onValueChange={setNewPlatform}
              showCustomInput={false}
            />
            <Button 
              type="button" 
              onClick={() => {
                if (newPlatform && newPlatform !== 'Other') {
                  addTechnicalItem('supportedPlatforms', newPlatform, setNewPlatform);
                }
              }}
              disabled={!newPlatform.trim()}
              className="mt-8"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Or add custom platform"
              value=""
              onChange={(e) => setNewPlatform(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                  e.preventDefault();
                  addTechnicalItem('supportedPlatforms', e.currentTarget.value, () => {});
                  e.currentTarget.value = '';
                }
              }}
            />
            <Button 
              type="button" 
              onClick={(e) => {
                const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                if (input?.value.trim()) {
                  addTechnicalItem('supportedPlatforms', input.value, () => {});
                  input.value = '';
                }
              }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {formData.technicalSpecs?.supportedPlatforms && formData.technicalSpecs.supportedPlatforms.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.technicalSpecs.supportedPlatforms.map((platform, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1 pr-1">
                  {platform}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => removeTechnicalItem('supportedPlatforms', index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Capabilities */}
      <TechnicalSection
        title="API Capabilities"
        icon={Code}
        items={formData.technicalSpecs?.apiCapabilities || []}
        field="apiCapabilities"
        newValue={newApiCapability}
        setNewValue={setNewApiCapability}
        placeholder="e.g., REST API, GraphQL, Webhooks, SDKs available"
        onAddItem={addTechnicalItem}
        onRemoveItem={removeTechnicalItem}
      />

      {/* Security Features */}
      <TechnicalSection
        title="Security Features"
        icon={Shield}
        items={formData.technicalSpecs?.securityFeatures || []}
        field="securityFeatures"
        newValue={newSecurityFeature}
        setNewValue={setNewSecurityFeature}
        placeholder="e.g., End-to-end encryption, SOC 2 certified, GDPR compliant"
        onAddItem={addTechnicalItem}
        onRemoveItem={removeTechnicalItem}
      />

      {/* Performance Metrics */}
      <TechnicalSection
        title="Performance Metrics"
        icon={Zap}
        items={formData.technicalSpecs?.performanceMetrics || []}
        field="performanceMetrics"
        newValue={newPerformanceMetric}
        setNewValue={setNewPerformanceMetric}
        placeholder="e.g., 99.9% uptime, <200ms response time, handles 1M+ requests/day"
        onAddItem={addTechnicalItem}
        onRemoveItem={removeTechnicalItem}
      />

      {/* Uptime Guarantee */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Uptime Guarantee
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="uptime-guarantee">Service Level Agreement (SLA)</Label>
            <Input
              id="uptime-guarantee"
              placeholder="e.g., 99.9% uptime guarantee with 24/7 monitoring"
              value={formData.technicalSpecs?.uptimeGuarantee || ''}
              onChange={(e) => updateFormData({
                technicalSpecs: {
                  ...formData.technicalSpecs,
                  uptimeGuarantee: e.target.value
                }
              })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};