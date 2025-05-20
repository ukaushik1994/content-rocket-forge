
/**
 * API provider configuration types
 */

export type ApiProviderCategory = 'ai' | 'serp' | 'other';

export interface ApiProviderConfig {
  id: string;
  name: string;
  description: string;
  serviceKey: string;
  category: ApiProviderCategory;
  docsUrl?: string;
  signupUrl?: string;
  required?: boolean;
  isDefault?: boolean;
}

export interface ApiProviderWithCategory extends ApiProviderConfig {
  category: ApiProviderCategory;
}

export type ApiKeyStatus = 'connected' | 'not-verified' | 'error' | 'required' | 'loading' | 'none';

export interface ApiCredential {
  provider: string;
  name: string;
  status: ApiKeyStatus;
  isValid: boolean;
  lastVerified?: string;
}
