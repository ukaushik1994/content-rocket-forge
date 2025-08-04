import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Search, 
  Settings, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Star,
  ArrowRight,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

import { API_PROVIDERS, ApiProvider } from './api/types';
import { ApiKeyInput } from './api/ApiKeyInput';
import { QuickSetupWizard } from './api/QuickSetupWizard';
import { DefaultAiProviderSelector } from './api/DefaultAiProviderSelector';
import { getUserPreference, saveUserPreference } from '@/services/userPreferencesService';

// Compact provider card for the new simplified design
const CompactProviderCard = ({ 
  provider, 
  isConfigured, 
  isEnabled, 
  onToggle, 
  onConfigure,
  status = 'unknown',
  isRecommended = false
}: {
  provider: ApiProvider;
  isConfigured: boolean;
  isEnabled: boolean;
  onToggle: () => void;
  onConfigure: () => void;
  status?: 'connected' | 'warning' | 'error' | 'unknown';
  isRecommended?: boolean;
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'connected': return <div className="w-2 h-2 rounded-full bg-green-500" />;
      case 'warning': return <div className="w-2 h-2 rounded-full bg-yellow-500" />;
      case 'error': return <div className="w-2 h-2 rounded-full bg-red-500" />;
      default: return <div className="w-2 h-2 rounded-full bg-muted-foreground/50" />;
    }
  };

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <provider.icon className="h-5 w-5 text-foreground/80 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-sm truncate">{provider.name}</h4>
              {isRecommended && (
                <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                  Recommended
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {provider.description}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {getStatusIcon()}
            <Button
              size="sm"
              variant={isConfigured ? "outline" : "default"}
              onClick={onConfigure}
              className="h-7 text-xs px-2"
            >
              {isConfigured ? 'Configure' : 'Setup'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Provider section component for collapsible sections
const ProviderSection = ({ 
  title, 
  providers, 
  selectedProviders,
  onToggle,
  onConfigure,
  defaultOpen = false,
  showRecommended = false
}: {
  title: string;
  providers: ApiProvider[];
  selectedProviders: string[];
  onToggle: (providerId: string) => void;
  onConfigure: (providerId: string) => void;
  defaultOpen?: boolean;
  showRecommended?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{title}</h3>
                <Badge variant="outline" className="text-xs">
                  {providers.length}
                </Badge>
              </div>
              {isOpen ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </CardHeader>
        </Card>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2">
        <div className="space-y-2">
          {providers.map((provider) => (
            <CompactProviderCard
              key={provider.id}
              provider={provider}
              isConfigured={selectedProviders.includes(provider.id)}
              isEnabled={selectedProviders.includes(provider.id)}
              onToggle={() => onToggle(provider.id)}
              onConfigure={() => onConfigure(provider.id)}
              status={Math.random() > 0.5 ? 'connected' : Math.random() > 0.3 ? 'warning' : 'error'}
              isRecommended={showRecommended && provider.id === 'openrouter'}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export function APISettings() {
  const [selectedProviders, setSelectedProviders] = useState<string[]>(
    API_PROVIDERS.filter(p => p.required).map(p => p.id)
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [showQuickSetup, setShowQuickSetup] = useState(false);
  const [defaultAiProvider, setDefaultAiProvider] = useState<'openrouter' | 'anthropic' | 'openai' | 'gemini' | 'mistral' | 'lmstudio' | undefined>(
    undefined
  );
  
  // Load preferences
  useEffect(() => {
    const savedProvider = getUserPreference('defaultAiProvider');
    if (savedProvider) {
      setDefaultAiProvider(savedProvider);
    } else {
      setDefaultAiProvider('openrouter');
    }
  }, []);

  const handleProviderToggle = (providerId: string) => {
    setSelectedProviders(prev => 
      prev.includes(providerId) 
        ? prev.filter(id => id !== providerId) 
        : [...prev, providerId]
    );
  };

  const handleDefaultAiProviderChange = async (provider: 'openrouter' | 'anthropic' | 'openai' | 'gemini' | 'mistral' | 'lmstudio') => {
    setDefaultAiProvider(provider);
    const success = await saveUserPreference('defaultAiProvider', provider);
    if (success) {
      toast.success(`Default AI provider set to ${provider}`);
    } else {
      toast.error('Failed to save default AI provider');
    }
  };

  const handleQuickSetup = () => {
    setShowQuickSetup(true);
  };

  const handleConfigure = (providerId: string) => {
    console.log('Configure', providerId);
    // This would open a configuration modal or expand inline
  };

  // Group providers by category
  const coreAiProviders = API_PROVIDERS.filter(p => 
    p.category === 'AI Services' && ['openrouter', 'anthropic', 'openai', 'gemini'].includes(p.id)
  );
  
  const additionalAiProviders = API_PROVIDERS.filter(p => 
    p.category === 'AI Services' && !['openrouter', 'anthropic', 'openai', 'gemini'].includes(p.id)
  );
  
  const seoProviders = API_PROVIDERS.filter(p => p.category === 'SEO & Analytics');
  const communicationProviders = API_PROVIDERS.filter(p => p.category === 'Communication');
  const paymentProviders = API_PROVIDERS.filter(p => p.category === 'Payments');

  // Filter providers based on search
  const filterProviders = (providers: ApiProvider[]) => {
    if (!searchQuery) return providers;
    return providers.filter(provider => 
      provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  return (
    <div className="w-full space-y-6">
      {/* Quick Setup Wizard */}
      <QuickSetupWizard
        isOpen={showQuickSetup}
        onClose={() => setShowQuickSetup(false)}
        providers={API_PROVIDERS}
        onProviderSelect={handleProviderToggle}
      />

      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-3">
          <div className="p-3 rounded-full bg-primary/10 border border-primary/20">
            <Settings className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-foreground to-secondary bg-clip-text text-transparent">
              API Integration Hub
            </h1>
            <p className="text-muted-foreground">
              Connect and manage your third-party integrations
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      {searchQuery || coreAiProviders.length > 0 ? (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search APIs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      ) : null}

      {/* Default AI Provider Section */}
      <Card className="border border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Default AI Provider
          </CardTitle>
          <CardDescription>
            Choose your preferred AI provider for content generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DefaultAiProviderSelector 
            defaultAiProvider={defaultAiProvider} 
            onDefaultAiProviderChange={handleDefaultAiProviderChange} 
          />
        </CardContent>
      </Card>

      {/* Core AI Providers */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Essential AI Services</h2>
          <Button size="sm" onClick={handleQuickSetup} variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Quick Setup
          </Button>
        </div>
        <div className="space-y-2">
          {filterProviders(coreAiProviders).map((provider) => (
            <CompactProviderCard
              key={provider.id}
              provider={provider}
              isConfigured={selectedProviders.includes(provider.id)}
              isEnabled={selectedProviders.includes(provider.id)}
              onToggle={() => handleProviderToggle(provider.id)}
              onConfigure={() => handleConfigure(provider.id)}
              status={Math.random() > 0.5 ? 'connected' : Math.random() > 0.3 ? 'warning' : 'error'}
              isRecommended={provider.id === 'openrouter'}
            />
          ))}
        </div>
      </div>

      {/* Additional Services - Collapsible Sections */}
      <div className="space-y-4">
        {additionalAiProviders.length > 0 && (
          <ProviderSection
            title="Additional AI Options"
            providers={filterProviders(additionalAiProviders)}
            selectedProviders={selectedProviders}
            onToggle={handleProviderToggle}
            onConfigure={handleConfigure}
          />
        )}

        {seoProviders.length > 0 && (
          <ProviderSection
            title="SEO & Analytics Tools"
            providers={filterProviders(seoProviders)}
            selectedProviders={selectedProviders}
            onToggle={handleProviderToggle}
            onConfigure={handleConfigure}
          />
        )}

        {communicationProviders.length > 0 && (
          <ProviderSection
            title="Communication Services"
            providers={filterProviders(communicationProviders)}
            selectedProviders={selectedProviders}
            onToggle={handleProviderToggle}
            onConfigure={handleConfigure}
          />
        )}

        {paymentProviders.length > 0 && (
          <ProviderSection
            title="Payment Services"
            providers={filterProviders(paymentProviders)}
            selectedProviders={selectedProviders}
            onToggle={handleProviderToggle}
            onConfigure={handleConfigure}
          />
        )}
      </div>

      {/* No search results */}
      {searchQuery && [
        ...filterProviders(coreAiProviders),
        ...filterProviders(additionalAiProviders),
        ...filterProviders(seoProviders),
        ...filterProviders(communicationProviders),
        ...filterProviders(paymentProviders)
      ].length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-lg font-medium">No APIs found</p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search query
            </p>
          </CardContent>
        </Card>
      )}

      {/* Configuration Panels - These would be modals or expandable sections */}
      <div className="space-y-4">
        {selectedProviders.map(providerId => {
          const provider = API_PROVIDERS.find(p => p.id === providerId);
          if (!provider) return null;
          
          return (
            <motion.div
              key={providerId}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <ApiKeyInput provider={provider} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}