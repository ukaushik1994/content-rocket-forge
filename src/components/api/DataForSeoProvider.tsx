
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ProviderCard } from './ProviderCard';
import { ProviderHeader } from './ProviderHeader';
import { ProviderStatus } from './ProviderStatus';
import { ProviderTestPanel } from './ProviderTestPanel';
import { ProviderConfigPanel } from './ProviderConfigPanel';
import { useDataForSeoProvider } from './hooks/useDataForSeoProvider';
import { DataForSeoCredentialsTab } from './components/DataForSeoCredentialsTab';
import { dataForSeoConfigOptions } from './config/dataForSeoConfig';
import { ApiProviderConfig } from '../settings/api/types';

export interface DataForSeoCredentials {
  login: string;
  password: string;
}

export interface DataForSeoProviderProps {
  provider: ApiProviderConfig;
  className?: string;
}

export const DataForSeoProvider: React.FC<DataForSeoProviderProps> = ({ 
  provider,
  className
}) => {
  const {
    credentials,
    setCredentials,
    showPassword,
    setShowPassword,
    encodedCredentials,
    isLoading,
    isSaving,
    isTesting,
    isDeleting,
    keyExists,
    isActive,
    setIsActive,
    testSuccessful,
    error,
    activeTab,
    setActiveTab,
    status,
    handleSaveCredentials,
    handleTestCredentials,
    handleDeleteCredentials,
    handleAdvancedTest,
    handleSaveConfig
  } = useDataForSeoProvider(provider);

  return (
    <ProviderCard 
      provider={provider} 
      status={status as any}
      className={className}
    >
      <ProviderHeader 
        provider={provider} 
        status={status as any}
        isActive={isActive}
        setIsActive={setIsActive}
      />
      
      {error && <ProviderStatus provider={provider} status="error" message={error} />}
      
      {!error && status !== 'none' && (
        <ProviderStatus 
          provider={provider} 
          status={status as any}
        />
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
        <TabsList className="mb-4">
          <TabsTrigger value="credentials">Credentials</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
        </TabsList>
        
        <TabsContent value="credentials" className="space-y-4">
          <DataForSeoCredentialsTab
            provider={provider}
            credentials={credentials}
            setCredentials={setCredentials}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            encodedCredentials={encodedCredentials}
            keyExists={keyExists}
            isTesting={isTesting}
            testSuccessful={testSuccessful}
            isSaving={isSaving}
            handleSaveCredentials={handleSaveCredentials}
            handleTestCredentials={handleTestCredentials}
            handleDeleteCredentials={handleDeleteCredentials}
          />
        </TabsContent>
        
        <TabsContent value="testing">
          <ProviderTestPanel
            provider={provider}
            apiKey={encodedCredentials}
            onTest={handleAdvancedTest}
            isTesting={isTesting}
          />
        </TabsContent>
        
        <TabsContent value="configuration">
          <ProviderConfigPanel
            provider={provider}
            configOptions={dataForSeoConfigOptions}
            onSaveConfig={handleSaveConfig}
          />
        </TabsContent>
      </Tabs>
      
      {provider.docsUrl && (
        <>
          <Separator className="my-4" />
          <div className="flex justify-between text-xs text-white/60">
            <a 
              href={provider.docsUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-400 hover:text-blue-300"
            >
              Documentation
            </a>
            {provider.signupUrl && (
              <a 
                href={provider.signupUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-400 hover:text-blue-300"
              >
                Sign Up
              </a>
            )}
            <a 
              href="https://dataforseo.com/contact-us" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-400 hover:text-blue-300"
            >
              Support
            </a>
          </div>
        </>
      )}
    </ProviderCard>
  );
};
