
/**
 * Types for API credential components
 */

import { SerpProvider } from "@/contexts/content-builder/types/serp-types";
import { ApiProviderConfig } from "@/components/settings/api/types";

export interface ApiCredentialProps {
  provider: ApiProviderConfig;
  onSave?: (apiKey: string) => Promise<boolean>;
  onTest?: (apiKey: string) => Promise<boolean>;
  onDelete?: () => Promise<boolean>;
  className?: string;
}

export interface ApiKeyState {
  key: string;
  isLoading: boolean;
  isTesting: boolean;
  isSaving: boolean;
  isDeleteConfirmOpen: boolean;
  hasError: boolean;
  errorMessage?: string;
  isValid: boolean;
}

export interface ApiCredentialInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  loading?: boolean;
  testable?: boolean;
  onTest?: () => void;
  isTesting?: boolean;
  isValid?: boolean;
}

export interface ApiCredentialActionsProps {
  onSave: () => void;
  onDelete: () => void;
  onTest?: () => void;
  isSaving: boolean;
  isTesting?: boolean;
  isTestable?: boolean;
  isValid?: boolean;
  hasKey: boolean;
}
