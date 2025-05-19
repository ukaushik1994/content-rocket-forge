
import { useState, useEffect } from 'react';
import { DataForSeoCredentials } from '@/types/serp';

/**
 * Hook for managing DataForSEO provider state
 */
export const useDataForSeoState = (serviceKey: string) => {
  const [credentials, setCredentials] = useState<DataForSeoCredentials>({
    login: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [encodedCredentials, setEncodedCredentials] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [keyExists, setKeyExists] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [testSuccessful, setTestSuccessful] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('credentials');

  return {
    // State
    credentials,
    setCredentials,
    showPassword,
    setShowPassword,
    encodedCredentials,
    setEncodedCredentials,
    isLoading,
    setIsLoading,
    isSaving,
    setIsSaving,
    isTesting,
    setIsTesting,
    isDeleting,
    setIsDeleting,
    keyExists,
    setKeyExists,
    isActive,
    setIsActive,
    testSuccessful,
    setTestSuccessful,
    error,
    setError,
    activeTab,
    setActiveTab
  };
};
