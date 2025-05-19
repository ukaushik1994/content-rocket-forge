
// Define the AiProvider type for use across components
export type AiProvider = 'openai' | 'anthropic' | 'gemini' | 'mistral' | 'other' | string;

// Define props for the AiProviderSelector component
export interface AiProviderSelectorProps {
  selectedProvider?: AiProvider;
  onProviderChange?: (provider: AiProvider) => void;
  size?: string;
  variant?: string;
  className?: string;
  providers?: AiProvider[];
  
  // Additional props for compatibility with OutlineGenerator
  aiProvider?: AiProvider;
  setAiProvider?: React.Dispatch<React.SetStateAction<AiProvider>>;
  availableProviders?: AiProvider[];
}

// Define props for the ProviderStatusIndicator component
export interface ProviderStatusIndicatorProps {
  selectedProvider?: AiProvider;
  provider?: AiProvider; // For backward compatibility
  size?: 'sm' | 'md';
  showFallbackIndicator?: boolean;
}
