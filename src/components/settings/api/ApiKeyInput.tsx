
import React from 'react';
import { ApiProvider } from './types';
import { ApiKeyCard } from './ApiKeyCard';
import { ApiKeyHeader } from './ApiKeyHeader';
import { ApiKeyStatus } from './ApiKeyStatus';
import { ApiKeyForm } from './ApiKeyForm';
import { ApiKeyActions } from './ApiKeyActions';
import { ApiKeyLoading } from './ApiKeyLoading';
import { ApiKeyError } from './ApiKeyError';
import { useApiKey } from './hooks/useApiKey';

interface ApiKeyInputProps {
  provider: ApiProvider;
}

export const ApiKeyInput = ({ provider }: ApiKeyInputProps) => {
  const {
    apiKey,
    setApiKey,
    isLoading,
    isSaving,
    isTesting,
    isDeleting,
    isDetecting,
    keyExists,
    isActive,
    setIsActive,
    testSuccessful,
    error,
    handleSaveKey,
    handleTestConnection,
    handleDeleteKey,
    handleDetectKeyType
  } = useApiKey(provider);

  if (isLoading) {
    return <ApiKeyLoading />;
  }

  return (
    <ApiKeyCard 
      provider={provider} 
      keyExists={keyExists} 
      testSuccessful={testSuccessful}
    >
      <ApiKeyHeader 
        provider={provider} 
        keyExists={keyExists} 
        testSuccessful={testSuccessful}
        isActive={isActive}
        setIsActive={setIsActive}
      />
      
      {error && (
        <ApiKeyError 
          error={error} 
          providerKey={provider.serviceKey} 
          testSuccessful={testSuccessful} 
        />
      )}
      
      <ApiKeyStatus 
        provider={provider} 
        keyExists={keyExists} 
        testSuccessful={testSuccessful} 
      />
      
      <ApiKeyForm 
        provider={provider} 
        apiKey={apiKey} 
        setApiKey={setApiKey} 
        keyExists={keyExists} 
        testSuccessful={testSuccessful} 
      />

      <ApiKeyActions 
        provider={provider}
        apiKey={apiKey}
        keyExists={keyExists}
        testSuccessful={testSuccessful}
        isSaving={isSaving}
        isTesting={isTesting}
        isDeleting={isDeleting}
        isDetecting={isDetecting}
        onSave={handleSaveKey}
        onTest={handleTestConnection}
        onDelete={handleDeleteKey}
        onDetect={handleDetectKeyType}
      />
    </ApiKeyCard>
  );
};
