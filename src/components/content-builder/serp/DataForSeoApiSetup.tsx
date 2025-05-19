
import React from 'react';
import { toast } from "sonner";
import { DataForSeoCredentialCard } from '@/components/api-credentials/DataForSeoCredentialCard';

interface DataForSeoApiSetupProps {
  onConfigured?: () => void;
}

export const DataForSeoApiSetup: React.FC<DataForSeoApiSetupProps> = ({ onConfigured }) => {
  // Handle when credentials are saved
  const handleSaveSuccess = () => {
    // Notify parent component
    onConfigured?.();
  };

  return (
    <DataForSeoCredentialCard 
      provider={{
        id: 'dataforseo',
        name: 'DataForSEO',
        description: 'Enterprise SEO data platform for search engine data',
        type: 'credentials',
        docsUrl: 'https://dataforseo.com/apis',
        signupUrl: 'https://app.dataforseo.com/register'
      }}
      onSave={async (encodedCredentials) => {
        try {
          localStorage.setItem('dataforseo_api_key', encodedCredentials);
          handleSaveSuccess();
          return true;
        } catch (error) {
          console.error('Error saving DataForSEO credentials:', error);
          toast.error("Failed to save credentials");
          return false;
        }
      }}
    />
  );
};
