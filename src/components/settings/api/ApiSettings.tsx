import React, { useState, useEffect } from 'react';
import { SimpleProviderCard } from './SimpleProviderCard';
import { CategorySection } from './CategorySection';
import { API_PROVIDERS } from './types';
import { getApiKey, type ApiProvider } from "@/services/apiKeyService";
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export const ApiSettings = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [providerStatuses, setProviderStatuses] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load all provider statuses
  useEffect(() => {
    const loadStatuses = async () => {
      const statuses: Record<string, boolean> = {};
      
      await Promise.all(
        API_PROVIDERS.map(async (provider) => {
          try {
            const key = await getApiKey(provider.serviceKey as ApiProvider);
            statuses[provider.serviceKey] = !!(key && key.length > 0);
          } catch {
            statuses[provider.serviceKey] = false;
          }
        })
      );
      
      setProviderStatuses(statuses);
      setIsLoading(false);
    };

    loadStatuses();
  }, []);

  // Group providers by category
  const categories = API_PROVIDERS.reduce((acc, provider) => {
    const category = provider.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(provider);
    return acc;
  }, {} as Record<string, typeof API_PROVIDERS>);

  // Filter providers based on search
  const filteredCategories = Object.entries(categories).reduce((acc, [category, providers]) => {
    const filteredProviders = providers.filter(provider =>
      provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    if (filteredProviders.length > 0) {
      acc[category] = filteredProviders;
    }
    
    return acc;
  }, {} as Record<string, typeof API_PROVIDERS>);

  // Calculate category stats
  const getCategoryStats = (providers: typeof API_PROVIDERS) => {
    const connected = providers.filter(p => providerStatuses[p.serviceKey]).length;
    return { connected, total: providers.length };
  };

  // Category order for better UX
  const categoryOrder = ['AI Services', 'SEO & Analytics', 'Communication', 'Payments'];
  const sortedCategories = Object.entries(filteredCategories).sort(([a], [b]) => {
    const aIndex = categoryOrder.indexOf(a);
    const bIndex = categoryOrder.indexOf(b);
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-medium mb-2">API Configuration</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Configure your service providers. Add API keys to enable different features and integrations.
        </p>
        
        {/* Progress indicator */}
        {!isLoading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>
              {Object.values(providerStatuses).filter(Boolean).length} of {API_PROVIDERS.length} configured
            </span>
            <div className="flex gap-1">
              {API_PROVIDERS.map((provider, index) => (
                <div
                  key={provider.serviceKey}
                  className={`w-1.5 h-1.5 rounded-full ${
                    providerStatuses[provider.serviceKey] ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search providers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Categories */}
      <div className="space-y-6">
        {sortedCategories.map(([category, providers]) => {
          const stats = getCategoryStats(providers);
          const isAICategory = category === 'AI Services';
          
          return (
            <CategorySection
              key={category}
              title={category}
              providers={providers}
              connectedCount={stats.connected}
              totalCount={stats.total}
              defaultExpanded={isAICategory}
            >
              <div className="space-y-2">
                {/* Providers without subcategory */}
                {providers.filter(p => !p.subcategory).map((provider) => (
                  <SimpleProviderCard key={provider.serviceKey} provider={provider} />
                ))}
                
                {/* Group providers by subcategory */}
                {Object.entries(
                  providers
                    .filter(p => p.subcategory)
                    .reduce((acc, p) => {
                      const sub = p.subcategory!;
                      if (!acc[sub]) acc[sub] = [];
                      acc[sub].push(p);
                      return acc;
                    }, {} as Record<string, typeof providers>)
                ).map(([subcategory, subProviders]) => (
                  <div key={subcategory} className="mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-px flex-1 bg-border" />
                      <span className="text-xs font-medium text-muted-foreground">{subcategory}</span>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                    <div className="space-y-2">
                      {subProviders.map((provider) => (
                        <SimpleProviderCard key={provider.serviceKey} provider={provider} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CategorySection>
          );
        })}
      </div>

      {/* Empty state */}
      {sortedCategories.length === 0 && searchQuery && (
        <div className="text-center py-8 text-muted-foreground">
          <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No providers found matching "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
};