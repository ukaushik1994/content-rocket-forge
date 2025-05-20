
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useDataForSeoProvider } from '../api/hooks/useDataForSeoProvider';
import { useSerpApiProvider } from '../api/hooks/useSerpApiProvider';
import { useOpenAiProvider } from '../api/hooks/useOpenAiProvider';
import { useAnthropicProvider } from '../api/hooks/useAnthropicProvider';
import { useGeminiProvider } from '../api/hooks/useGeminiProvider';
import { ApiCredential, ApiProviderConfig, ApiKeyStatus } from '@/components/settings/api/types';

// Define available API providers
const API_PROVIDERS: ApiProviderConfig[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'AI model provider for ChatGPT and other AI models',
    serviceKey: 'openai',
    category: 'ai',
    docsUrl: 'https://platform.openai.com/docs/introduction',
    signupUrl: 'https://platform.openai.com/signup',
    isDefault: true,
    autoDetectable: true
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Provider of Claude AI models',
    serviceKey: 'anthropic',
    category: 'ai',
    docsUrl: 'https://docs.anthropic.com/claude/reference/getting-started-with-the-api',
    signupUrl: 'https://console.anthropic.com/login',
    autoDetectable: true
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Google\'s AI model suite',
    serviceKey: 'gemini',
    category: 'ai',
    docsUrl: 'https://ai.google.dev/docs',
    signupUrl: 'https://makersuite.google.com/app/apikey',
    autoDetectable: true
  },
  {
    id: 'serpapi',
    name: 'SERP API',
    description: 'Search engine results data provider',
    serviceKey: 'serp',
    category: 'serp',
    docsUrl: 'https://serpapi.com/docs',
    signupUrl: 'https://serpapi.com/users/sign_up',
    autoDetectable: false
  },
  {
    id: 'dataforseo',
    name: 'DataForSEO',
    description: 'SEO data and analytics provider',
    serviceKey: 'dataforseo',
    category: 'serp',
    docsUrl: 'https://docs.dataforseo.com/v3/',
    signupUrl: 'https://app.dataforseo.com/register',
    autoDetectable: false
  }
];

// Context type definitions
interface ApiCredentialsContextType {
  apiCredentials: ApiCredential[];
  providers: ApiProviderConfig[];
  isLoading: boolean;
  error: string | null;
  refreshCredentials: () => Promise<void>;
  getProviderById: (id: string) => ApiProviderConfig | undefined;
  getProviderStatus: (id: string) => ApiCredential | undefined;
}

// Create context
const ApiCredentialsContext = createContext<ApiCredentialsContextType | undefined>(undefined);

export const useApiCredentials = () => {
  const context = useContext(ApiCredentialsContext);
  if (!context) {
    throw new Error('useApiCredentials must be used within an ApiCredentialsProvider');
  }
  return context;
};

interface ApiCredentialsProviderProps {
  children: React.ReactNode;
}

export const ApiCredentialsProvider: React.FC<ApiCredentialsProviderProps> = ({ children }) => {
  const [apiCredentials, setApiCredentials] = useState<ApiCredential[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize provider hooks
  const dataForSeo = useDataForSeoProvider(API_PROVIDERS.find(p => p.id === 'dataforseo')!);
  const serpApi = useSerpApiProvider(API_PROVIDERS.find(p => p.id === 'serpapi')!);
  const openAi = useOpenAiProvider(API_PROVIDERS.find(p => p.id === 'openai')!);
  const anthropic = useAnthropicProvider(API_PROVIDERS.find(p => p.id === 'anthropic')!);
  const gemini = useGeminiProvider(API_PROVIDERS.find(p => p.id === 'gemini')!);

  // Load all credentials on mount
  useEffect(() => {
    loadCredentials();
  }, []);

  const loadCredentials = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const credentials: ApiCredential[] = [];

      // Check each provider and add credentials if they exist
      const providers = [
        { provider: dataForSeo, id: 'dataforseo' },
        { provider: serpApi, id: 'serpapi' },
        { provider: openAi, id: 'openai' },
        { provider: anthropic, id: 'anthropic' },
        { provider: gemini, id: 'gemini' }
      ];

      // Map providers to credentials
      providers.forEach(({ provider, id }) => {
        const config = API_PROVIDERS.find(p => p.id === id);
        if (!config) return;
        
        if (provider.status !== 'none') {
          credentials.push({
            provider: id,
            name: config.name,
            status: provider.status as ApiKeyStatus,
            isValid: provider.status === 'connected'
          });
        }
      });

      setApiCredentials(credentials);
    } catch (err: any) {
      console.error('Error loading API credentials:', err);
      setError(err.message || 'Failed to load API credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshCredentials = async () => {
    try {
      setIsLoading(true);
      await loadCredentials();
      toast.success('API credentials refreshed');
    } catch (error) {
      toast.error('Failed to refresh API credentials');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to get provider config by ID
  const getProviderById = (id: string) => {
    return API_PROVIDERS.find(provider => provider.id === id);
  };

  // Helper to get provider status
  const getProviderStatus = (id: string) => {
    return apiCredentials.find(cred => cred.provider === id);
  };

  return (
    <ApiCredentialsContext.Provider
      value={{
        apiCredentials,
        providers: API_PROVIDERS,
        isLoading,
        error,
        refreshCredentials,
        getProviderById,
        getProviderStatus
      }}
    >
      {children}
    </ApiCredentialsContext.Provider>
  );
};
