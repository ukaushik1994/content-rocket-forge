
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { RefreshCw, Save } from 'lucide-react';
import { ApiProviderConfig } from '@/components/settings/api/types';

export interface ProviderConfigOption {
  id: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'slider';
  value: any;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  description?: string;
  placeholder?: string;
}

export interface ProviderConfigPanelProps {
  provider: ApiProviderConfig;
  configOptions: ProviderConfigOption[];
  onSaveConfig: (providerId: string, config: Record<string, any>) => Promise<boolean>;
  className?: string;
}

export const ProviderConfigPanel = ({
  provider,
  configOptions,
  onSaveConfig,
  className
}: ProviderConfigPanelProps) => {
  const [config, setConfig] = useState<Record<string, any>>(
    configOptions.reduce((acc, option) => {
      acc[option.id] = option.value;
      return acc;
    }, {} as Record<string, any>)
  );
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSaveConfig = async () => {
    setIsSaving(true);
    try {
      const success = await onSaveConfig(provider.id, config);
      if (success) {
        toast.success(`${provider.name} configuration saved successfully`);
      } else {
        toast.error(`Failed to save ${provider.name} configuration`);
      }
    } catch (error: any) {
      toast.error(error.message || `Failed to save ${provider.name} configuration`);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleConfigChange = (optionId: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [optionId]: value
    }));
  };
  
  // Render different input types based on option type
  const renderConfigInput = (option: ProviderConfigOption) => {
    switch (option.type) {
      case 'text':
        return (
          <Input
            value={config[option.id] || ''}
            onChange={(e) => handleConfigChange(option.id, e.target.value)}
            placeholder={option.placeholder}
          />
        );
      
      case 'number':
        return (
          <Input
            type="number"
            value={config[option.id] || 0}
            onChange={(e) => handleConfigChange(option.id, parseFloat(e.target.value))}
            min={option.min}
            max={option.max}
            step={option.step || 1}
          />
        );
      
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={!!config[option.id]}
              onCheckedChange={(checked) => handleConfigChange(option.id, checked)}
            />
            <span className="text-sm text-muted-foreground">
              {config[option.id] ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        );
      
      case 'select':
        return (
          <Select
            value={String(config[option.id])}
            onValueChange={(value) => handleConfigChange(option.id, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select option" />
            </SelectTrigger>
            <SelectContent>
              {option.options?.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'slider':
        return (
          <div className="space-y-2">
            <Slider
              value={[config[option.id] || option.min || 0]}
              min={option.min}
              max={option.max}
              step={option.step}
              onValueChange={([value]) => handleConfigChange(option.id, value)}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{option.min}</span>
              <span>{config[option.id]}</span>
              <span>{option.max}</span>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <Card className={`border border-white/10 shadow-lg ${className}`}>
      <CardHeader>
        <CardTitle className="text-lg">
          {provider.name} Configuration
        </CardTitle>
        <CardDescription>
          Customize how this provider works with your application
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {configOptions.map((option) => (
          <div key={option.id} className="space-y-2">
            <Label htmlFor={option.id}>{option.label}</Label>
            {renderConfigInput(option)}
            {option.description && (
              <p className="text-xs text-muted-foreground">{option.description}</p>
            )}
          </div>
        ))}
      </CardContent>
      
      <CardFooter className="flex justify-end">
        <Button
          onClick={handleSaveConfig}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Configuration
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
