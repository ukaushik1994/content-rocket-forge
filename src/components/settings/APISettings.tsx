
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Search, Info, Zap } from 'lucide-react';
import { getUserPreference, saveUserPreference } from '@/services/userPreferencesService';
import { ApiProviderSettings } from './api/ApiProviderSettings';
import { DefaultAiProviderSelector } from './api/DefaultAiProviderSelector';
import { API_PROVIDERS } from './api/types';
import { getApiKey } from '@/services/apiKeyService';
import { toast } from 'sonner';

export function APISettings() {
  const [searchQuery, setSearchQuery] = useState('');
  const [defaultAiProvider, setDefaultAiProvider] = useState<'openai' | 'anthropic' | 'gemini'>('openai');
  const [enableFallback, setEnableFallback] = useState(false);
  const [activeTab, setActiveTab] = useState('ai');
  const [configuredProviders, setConfiguredProviders] = useState<{[key: string]: boolean}>({});
  const [isLoading, setIsLoading] = useState(true);

  console.log("APISettings rendering, isLoading:", isLoading);

  // Load user preferences and check which providers are configured
  useEffect(() => {
    const loadPreferences = async () => {
      console.log("Loading user preferences...");
      setIsLoading(true);
      
      try {
        // Load default AI provider preference
        const savedProvider = getUserPreference('defaultAiProvider');
        if (savedProvider) {
          console.log("Default AI provider loaded:", savedProvider);
          setDefaultAiProvider(savedProvider);
        }
        
        // Load fallback preference
        const fallbackEnabled = getUserPreference('enableAiFallback');
        console.log("Fallback enabled:", fallbackEnabled);
        setEnableFallback(fallbackEnabled === true);
        
        // Check which providers have API keys configured
        const providerStatus: {[key: string]: boolean} = {};
        for (const provider of API_PROVIDERS) {
          try {
            const key = await getApiKey(provider.serviceKey);
            console.log(`API key for ${provider.name}:`, !!key);
            providerStatus[provider.id] = !!key;
          } catch (error) {
            console.error(`Error checking API key for ${provider.name}:`, error);
            providerStatus[provider.id] = false;
          }
        }
        
        console.log("Provider status loaded:", providerStatus);
        setConfiguredProviders(providerStatus);
      } catch (error) {
        console.error("Error loading preferences:", error);
        toast.error("Failed to load preferences");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPreferences();
  }, []);

  const handleDefaultAiProviderChange = async (provider: 'openai' | 'anthropic' | 'gemini') => {
    console.log("Changing default AI provider to:", provider);
    setDefaultAiProvider(provider);
    const success = await saveUserPreference('defaultAiProvider', provider);
    if (success) {
      toast.success(`Default AI provider set to ${provider}`);
    } else {
      toast.error('Failed to save default AI provider');
    }
  };

  const handleFallbackToggle = async (enabled: boolean) => {
    console.log("Toggling fallback to:", enabled);
    setEnableFallback(enabled);
    const success = await saveUserPreference('enableAiFallback', enabled);
    if (success) {
      toast.success(`AI Provider fallback ${enabled ? 'enabled' : 'disabled'}`);
    } else {
      toast.error('Failed to save fallback preference');
    }
  };

  const handleProviderConfigured = (providerId: string, configured: boolean) => {
    console.log(`Provider ${providerId} configured:`, configured);
    setConfiguredProviders(prev => ({
      ...prev,
      [providerId]: configured
    }));
  };

  // Filter providers based on search query
  const filteredProviders = API_PROVIDERS.filter(provider => 
    provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    provider.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group providers by category
  const aiProviders = filteredProviders.filter(p => ['openai', 'anthropic', 'gemini'].includes(p.serviceKey));
  const dataProviders = filteredProviders.filter(p => !['openai', 'anthropic', 'gemini'].includes(p.serviceKey));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">API Integration</h2>
        <p className="text-muted-foreground">
          Connect third-party APIs to enhance content generation and analysis capabilities.
        </p>
      </div>
      
      <Alert className="bg-indigo-900/20 border-indigo-500/30">
        <Info className="h-4 w-4" />
        <AlertDescription>
          Configure AI providers and other APIs to enable advanced features. Your API keys are securely encrypted.
        </AlertDescription>
      </Alert>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search providers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <Tabs defaultValue="ai" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-2 mb-4">
          <TabsTrigger value="ai" className="text-center">
            AI Providers
          </TabsTrigger>
          <TabsTrigger value="data" className="text-center">
            Data & Analytics
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="ai" className="space-y-6">
          {/* Default AI Provider Settings */}
          <DefaultAiProviderSelector 
            defaultAiProvider={defaultAiProvider} 
            onDefaultAiProviderChange={handleDefaultAiProviderChange}
            enableFallback={enableFallback}
            setEnableFallback={handleFallbackToggle}
            configuredProviders={configuredProviders}
          />
          
          {/* AI Providers */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">AI Provider Keys</h3>
            <ApiProviderSettings 
              providers={aiProviders}
              configuredProviders={configuredProviders}
              onProviderConfigured={handleProviderConfigured}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="data" className="space-y-6">
          {/* Data & Analytics Providers */}
          <Card className="border-white/10 bg-glass">
            <CardHeader>
              <CardTitle className="text-lg">Data & Analytics APIs</CardTitle>
              <CardDescription>
                Configure API keys for search data, analytics, and content research
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2].map(n => (
                    <Card key={n} className="p-6 animate-pulse">
                      <div className="h-6 bg-gray-700/40 rounded w-1/3 mb-4"></div>
                      <div className="h-4 bg-gray-700/40 rounded w-full mb-3"></div>
                      <div className="h-10 bg-gray-700/40 rounded w-full mb-4"></div>
                      <div className="h-8 bg-gray-700/40 rounded w-1/4"></div>
                    </Card>
                  ))}
                </div>
              ) : dataProviders.length > 0 ? (
                <ApiProviderSettings
                  providers={dataProviders}
                  configuredProviders={configuredProviders}
                  onProviderConfigured={handleProviderConfigured}
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No data providers match your search.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
