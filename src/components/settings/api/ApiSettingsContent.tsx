
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useApiCredentials } from '@/components/api-credentials/ApiCredentialsProvider';
import { DataForSeoCredentialCard } from '@/components/api-credentials/DataForSeoCredentialCard';

/**
 * Content component for the API Settings page
 */
export const ApiSettingsContent: React.FC = () => {
  // Use our API credentials context to access data
  const { apiCredentials, isLoading, error, refreshCredentials } = useApiCredentials();
  
  // Available API providers that we want to display
  const apiProviders = [
    {
      id: 'dataforseo',
      name: 'DataForSEO',
      description: 'API for SEO data, SERP analysis, and keyword research',
      serviceKey: 'dataforseo',
      docsUrl: 'https://docs.dataforseo.com/v3/',
      signupUrl: 'https://app.dataforseo.com/register',
      type: 'credentials' as 'credentials', // Type assertion to ensure it's the literal type
      apiKeyRequired: false,
    }
  ];
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>API Credentials</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="bg-red-500/20 text-red-400 p-4 rounded-md">
              <p>{error}</p>
            </div>
          ) : apiCredentials.length === 0 ? (
            <div className="bg-amber-500/10 text-amber-400 p-4 rounded-md">
              <p>No API credentials have been set up yet.</p>
              <p className="text-sm mt-2">Add your API keys below to enable additional features.</p>
            </div>
          ) : (
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-4">
                You have {apiCredentials.length} API key{apiCredentials.length !== 1 && 's'} configured.
              </p>
              <button 
                className="text-blue-400 hover:text-blue-300 text-sm"
                onClick={() => refreshCredentials()}
              >
                Refresh Credentials
              </button>
            </div>
          )}
          
          <div className="space-y-6 mt-6">
            {apiProviders.map((provider) => (
              <DataForSeoCredentialCard 
                key={provider.id} 
                provider={provider} 
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
