
// Types for API key management

export type ApiKeyType = {
  id: string;
  service: string;
  encrypted_key: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
};

export type ApiKeyLastVerified = {
  service: string;
  verified_at: string;
  is_valid: boolean;
};
