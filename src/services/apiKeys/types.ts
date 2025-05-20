
// Types for API key management

export type ApiKeyType = {
  id: string;
  service: string;
  encrypted_key: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};
