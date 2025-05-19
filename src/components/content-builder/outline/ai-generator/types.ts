
// Define the AiProvider type for use across components
export type AiProvider = 'openai' | 'anthropic' | 'gemini' | 'other' | string;

// Define props for the AiProviderSelector component
export interface AiProviderSelectorProps {
  selectedProvider?: AiProvider;
  onProviderChange: (provider: AiProvider) => void;
  size?: string;
  variant?: string;
  className?: string;
  providers?: AiProvider[];
  aiProvider?: AiProvider;
  setAiProvider?: React.Dispatch<React.SetStateAction<AiProvider>>;
  availableProviders?: AiProvider[];
}

// Define props for the ProviderStatusIndicator component
export interface ProviderStatusIndicatorProps {
  provider?: AiProvider;
}
