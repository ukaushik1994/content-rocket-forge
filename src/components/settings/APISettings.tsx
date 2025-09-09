import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Settings, 
  Zap, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Plus,
  RefreshCw,
  Filter,
  X,
  Grid,
  List,
  Star,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

import { API_PROVIDERS, ApiProvider } from './api/types';
import { ApiKeyInput } from './api/ApiKeyInput';
import { QuickSetupWizard } from './api/QuickSetupWizard';
import { DefaultAiProviderSelector } from './api/DefaultAiProviderSelector';
import { getUserPreference, saveUserPreference } from '@/services/userPreferencesService';

// New interactive provider card component
const InteractiveProviderCard = ({ 
  provider, 
  isConfigured, 
  isEnabled, 
  onToggle, 
  onConfigure,
  status = 'unknown'
}: {
  provider: ApiProvider;
  isConfigured: boolean;
  isEnabled: boolean;
  onToggle: () => void;
  onConfigure: () => void;
  status?: 'connected' | 'warning' | 'error' | 'unknown';
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'connected': return 'border-green-500/40 bg-green-500/5';
      case 'warning': return 'border-yellow-500/40 bg-yellow-500/5';
      case 'error': return 'border-red-500/40 bg-red-500/5';
      default: return 'border-border/50 bg-background/50';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'connected': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Settings className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <Card className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${getStatusColor()}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-background/50 border border-border/30">
                <provider.icon className="h-5 w-5 text-foreground/80" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm">{provider.name}</h4>
                  {provider.required && (
                    <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                      Required
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {provider.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <Switch 
                checked={isEnabled} 
                onCheckedChange={onToggle}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-xs">
              {provider.category}
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={onConfigure}
              className="h-7 text-xs"
            >
              {isConfigured ? 'Configure' : 'Setup'}
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Status overview widget
const StatusOverview = ({ 
  providers, 
  selectedProviders,
  onRefresh,
  onQuickSetup 
}: {
  providers: ApiProvider[];
  selectedProviders: string[];
  onRefresh: () => void;
  onQuickSetup: () => void;
}) => {
  const visibleProviders = providers.filter(p => p.required || selectedProviders.includes(p.id));
  
  // Mock status calculation - in real app this would come from actual API testing
  const statusCounts = visibleProviders.reduce((acc, provider) => {
    const random = Math.random();
    const status = provider.required 
      ? (random > 0.3 ? 'connected' : random > 0.1 ? 'warning' : 'error')
      : (random > 0.5 ? 'connected' : random > 0.2 ? 'warning' : 'error');
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, { connected: 0, warning: 0, error: 0 });

  const totalCount = visibleProviders.length;
  const healthScore = Math.round((statusCounts.connected / totalCount) * 100) || 0;

  return (
    <Card className="border-0 bg-gradient-to-r from-primary/10 via-background/50 to-secondary/10 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold text-primary">{healthScore}%</div>
              <div>
                <p className="font-semibold">API Health Score</p>
                <p className="text-sm text-muted-foreground">
                  {statusCounts.connected} of {totalCount} APIs connected
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>{statusCounts.connected} Connected</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span>{statusCounts.warning} Warning</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span>{statusCounts.error} Error</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <Button size="sm" onClick={onQuickSetup} className="whitespace-nowrap">
              <Settings className="h-4 w-4 mr-2" />
              Quick Setup
            </Button>
            <Button size="sm" variant="outline" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export function APISettings() {
  const [selectedProviders, setSelectedProviders] = useState<string[]>(
    API_PROVIDERS.filter(p => p.required).map(p => p.id)
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showQuickSetup, setShowQuickSetup] = useState(false);
  const [showOnlyConfigured, setShowOnlyConfigured] = useState(false);
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

  const handleRefreshAll = () => {
    toast.info('Refreshing all API connections...');
  };

  const handleQuickSetup = () => {
    setShowQuickSetup(true);
  };

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(API_PROVIDERS.map(p => p.category)))];

  // Filter providers
  const filteredProviders = API_PROVIDERS.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         provider.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || provider.category === activeCategory;
    const isVisible = provider.required || selectedProviders.includes(provider.id);
    const configuredFilter = showOnlyConfigured ? selectedProviders.includes(provider.id) : true;
    
    return matchesSearch && matchesCategory && isVisible && configuredFilter;
  });

  const availableProviders = API_PROVIDERS.filter(p => 
    !p.required && !selectedProviders.includes(p.id)
  );

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

      {/* Status Overview */}
      <StatusOverview
        providers={API_PROVIDERS}
        selectedProviders={selectedProviders}
        onRefresh={handleRefreshAll}
        onQuickSetup={handleQuickSetup}
      />

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search APIs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <Switch 
                id="configured-only"
                checked={showOnlyConfigured}
                onCheckedChange={setShowOnlyConfigured}
              />
              <label htmlFor="configured-only" className="text-sm">
                Show configured only
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="grid grid-cols-2 lg:grid-cols-5 w-full">
          {categories.map(category => (
            <TabsTrigger key={category} value={category} className="capitalize">
              {category === 'all' ? 'All APIs' : category}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map(category => (
          <TabsContent key={category} value={category} className="space-y-6">
            {/* Default AI Provider Section */}
            {(category === 'all' || category === 'AI Services') && (
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
            )}

            {/* Provider Grid/List */}
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' 
                : 'space-y-4'
            }>
              <AnimatePresence>
                {filteredProviders.map((provider) => (
                  <InteractiveProviderCard
                    key={provider.id}
                    provider={provider}
                    isConfigured={selectedProviders.includes(provider.id)}
                    isEnabled={selectedProviders.includes(provider.id)}
                    onToggle={() => handleProviderToggle(provider.id)}
                    onConfigure={() => {
                      // This would open a configuration modal or expand inline
                      console.log('Configure', provider.id);
                    }}
                    status={Math.random() > 0.5 ? 'connected' : Math.random() > 0.3 ? 'warning' : 'error'}
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* No results */}
            {filteredProviders.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center">
                  <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-lg font-medium">No APIs found</p>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your search or category filters
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Available Providers to Add */}
            {category === 'all' && availableProviders.length > 0 && (
              <Card className="border-dashed border-muted-foreground/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Available to Add
                  </CardTitle>
                  <CardDescription>
                    Additional APIs you can enable for enhanced functionality
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {availableProviders.map(provider => (
                      <Button
                        key={provider.id}
                        variant="outline"
                        className="h-auto p-3 justify-start"
                        onClick={() => handleProviderToggle(provider.id)}
                      >
                        <provider.icon className="h-4 w-4 mr-2" />
                        <div className="text-left">
                          <div className="font-medium text-sm">{provider.name}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {provider.description}
                          </div>
                        </div>
                        <Plus className="h-4 w-4 ml-auto" />
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>

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