
import React from 'react';
import { ApiCredentialsProvider } from '@/components/api-credentials/ApiCredentialsProvider';
import { ApiSettingsContent } from '@/components/settings/api/ApiSettingsContent';

export const APISettings: React.FC = () => {
  return (
    <ApiCredentialsProvider>
      <ApiSettingsContent />
    </ApiCredentialsProvider>
  );
};

export default APISettings;
