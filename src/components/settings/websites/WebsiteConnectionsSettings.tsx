import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Search } from 'lucide-react';
import { CategorySection } from '../api/CategorySection';
import { WebsiteProviderCard } from './WebsiteProviderCard';
import { WEBSITE_PROVIDERS } from './types';
import { getConnection } from '@/services/websiteConnection';

export const WebsiteConnectionsSettings = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [providerStatuses, setProviderStatuses] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProviderStatuses();
  }, []);

  const loadProviderStatuses = async () => {
    setLoading(true);
    const statuses: Record<string, boolean> = {};
    
    for (const provider of WEBSITE_PROVIDERS) {
      const connection = await getConnection(provider.provider as 'wordpress' | 'wix');
      statuses[provider.id] = connection?.is_active || false;
    }
    
    setProviderStatuses(statuses);
    setLoading(false);
  };

  const categories = WEBSITE_PROVIDERS.reduce((acc, provider) => {
    const category = provider.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(provider);
    return acc;
  }, {} as Record<string, typeof WEBSITE_PROVIDERS>);

  const filteredCategories = Object.entries(categories).reduce((acc, [category, providers]) => {
    const filtered = providers.filter(provider =>
      provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[category] = filtered;
    }
    return acc;
  }, {} as Record<string, typeof WEBSITE_PROVIDERS>);

  const getCategoryStats = (providers: typeof WEBSITE_PROVIDERS) => {
    const connected = providers.filter(p => providerStatuses[p.id]).length;
    return { connected, total: providers.length };
  };

  const totalConfigured = Object.values(providerStatuses).filter(Boolean).length;
  const totalProviders = WEBSITE_PROVIDERS.length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Website Connections</h2>
        <p className="text-muted-foreground">
          Connect your websites to publish content automatically
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {totalConfigured} of {totalProviders} configured
          </span>
          <span className="font-medium">{Math.round((totalConfigured / totalProviders) * 100)}%</span>
        </div>
        <Progress value={(totalConfigured / totalProviders) * 100} className="h-2" />
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search website connections..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading connections...</div>
      ) : (
        <div className="space-y-6">
          {Object.entries(filteredCategories).map(([category, providers]) => {
            const stats = getCategoryStats(providers);
            return (
              <CategorySection
                key={category}
                title={category}
                providers={providers as any}
                connectedCount={stats.connected}
                totalCount={stats.total}
                defaultExpanded={true}
              >
                {providers.map((provider) => (
                  <WebsiteProviderCard
                    key={provider.id}
                    provider={provider}
                    isConnected={providerStatuses[provider.id] || false}
                    onConnectionChange={loadProviderStatuses}
                  />
                ))}
              </CategorySection>
            );
          })}

          {Object.keys(filteredCategories).length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No website connections found matching your search.
            </div>
          )}
        </div>
      )}
    </div>
  );
};