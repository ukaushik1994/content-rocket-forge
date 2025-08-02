import React, { useState, useEffect } from 'react';
import { toast } from "sonner";
import { 
  saveApiKey, 
  getApiKey, 
  testApiKey, 
  deleteApiKey,
  detectApiKeyType,
  type ApiProvider 
} from "@/services/apiKeyService";
import { testApiKeyWithDebug, analyzeApiKey } from "@/utils/apiKeyDebugUtils";
import { ApiProvider as ApiProviderType } from './types';
import { ApiKeyCard } from './ApiKeyCard';
import { ApiKeyHeader } from './ApiKeyHeader';
import { ApiKeyStatus } from './ApiKeyStatus';
import { ApiKeyForm } from './ApiKeyForm';
import { ApiKeyActions } from './ApiKeyActions';
import { ApiKeyLoading } from './ApiKeyLoading';

interface ApiKeyInputProps {
  provider: ApiProviderType;
}

export const ApiKeyInput = ({ provider }: ApiKeyInputProps) => {
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [keyExists, setKeyExists] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [testSuccessful, setTestSuccessful] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log(`🔍 Fetching ${provider.name} API key from database`);
        
        const key = await getApiKey(provider.serviceKey as ApiProvider);
        
        if (key) {
          console.log(`✅ ${provider.name} API key found in database`);
          setApiKey(key);
          setKeyExists(true);
          setIsActive(true);
          
          // Test the key immediately when loading
          console.log(`🧪 Testing ${provider.name} API key on load`);
          try {
            const success = await testApiKey(provider.serviceKey as ApiProvider, key);
            setTestSuccessful(success);
            if (success) {
              console.log(`✅ ${provider.name} API key verified successfully`);
            } else {
              console.warn(`⚠️ ${provider.name} API key test failed during initialization`);
              setError(`${provider.name} API key is configured but could not be verified. Please check the key in Settings.`);
            }
          } catch (testError) {
            console.error(`💥 Error testing ${provider.name} API key:`, testError);
            setError(`Failed to verify ${provider.name} API key`);
          }
        } else {
          console.log(`❌ No ${provider.name} API key found in database`);
        }
      } catch (error: any) {
        console.error(`💥 Error fetching ${provider.name} API key:`, error);
        setError(error.message || `Failed to load ${provider.name} API key`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApiKey();
  }, [provider]);

  const handleSaveKey = async () => {
    if (!apiKey || !apiKey.trim()) {
      toast.error('Please enter a valid API key');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      console.log(`💾 Saving ${provider.name} API key with enhanced validation`);

      // First analyze the key
      const analysis = analyzeApiKey(apiKey);
      console.log(`🔍 API key analysis:`, analysis);

      // Check if the key format matches the expected provider
      if (!analysis.validation[provider.serviceKey as ApiProvider]?.isValid) {
        const errorMsg = analysis.validation[provider.serviceKey as ApiProvider]?.errorMessage || 'Invalid format';
        toast.error(`${provider.name} API key format validation failed: ${errorMsg}`);
        setError(errorMsg);
        
        // Show recommendations
        if (analysis.recommendations.length > 0) {
          console.warn('💡 Recommendations:', analysis.recommendations);
          toast.info(`Suggestion: ${analysis.recommendations[0]}`);
        }
        
        return;
      }

      const success = await saveApiKey(provider.serviceKey as ApiProvider, apiKey);
      
      if (success) {
        setKeyExists(true);
        setIsActive(true);
        toast.success(`${provider.name} API key saved successfully`);
        
        // Test the key after saving with enhanced debugging
        console.log(`🧪 Testing ${provider.name} API key after save with debug info`);
        try {
          setIsTesting(true);
          const testResult = await testApiKeyWithDebug(provider.serviceKey as ApiProvider, apiKey);
          setDebugInfo(testResult.debugInfo);
          setTestSuccessful(testResult.success);
          
          if (testResult.success) {
            console.log(`✅ ${provider.name} API key verified after save`);
            toast.success(`${provider.name} API key verified successfully`);
          } else {
            console.warn(`⚠️ ${provider.name} API key saved but verification failed:`, testResult);
            setError(testResult.error || `${provider.name} API key could not be verified`);
            
            // Show debug recommendations
            if (testResult.debugInfo.recommendations.length > 0) {
              toast.info(`Tip: ${testResult.debugInfo.recommendations[0]}`);
            }
          }
        } catch (testError: any) {
          console.error(`💥 Error testing ${provider.name} API key after save:`, testError);
          setError(testError.message || `Failed to verify ${provider.name} API key after saving`);
        } finally {
          setIsTesting(false);
        }
      }
    } catch (error: any) {
      console.error(`💥 Error saving ${provider.name} API key:`, error);
      setError(error.message || `Failed to save ${provider.name} API key`);
      toast.error(error.message || `Failed to save ${provider.name} API key`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    if (!apiKey || !apiKey.trim()) {
      toast.error('Please enter an API key to test');
      return;
    }

    try {
      setIsTesting(true);
      setError(null);
      console.log(`🧪 Testing ${provider.name} API key connection with comprehensive debugging`);
      
      // Use enhanced testing with debug info
      const testResult = await testApiKeyWithDebug(provider.serviceKey as ApiProvider, apiKey);
      setDebugInfo(testResult.debugInfo);
      setTestSuccessful(testResult.success);
      
      if (testResult.success) {
        console.log(`✅ ${provider.name} API key test successful`);
        toast.success(`${provider.name} API key is working correctly`);
      } else {
        console.warn(`⚠️ ${provider.name} API key test failed:`, testResult);
        setError(testResult.error || `${provider.name} API key verification failed`);
        toast.error(testResult.error || `${provider.name} API key verification failed`);
        
        // Show helpful recommendations
        if (testResult.debugInfo.recommendations.length > 0) {
          console.log('💡 Debug recommendations:', testResult.debugInfo.recommendations);
          toast.info(testResult.debugInfo.recommendations[0], { duration: 5000 });
        }
      }
      
      // Log debug info for troubleshooting
      console.log(`🐛 Debug info for ${provider.name}:`, {
        keyAnalysis: testResult.debugInfo.key,
        detection: testResult.debugInfo.detection,
        testDetails: testResult.testDetails
      });
      
    } catch (error: any) {
      console.error(`💥 Error testing ${provider.name} API key:`, error);
      setError(error.message || `Failed to test ${provider.name} API key`);
      setTestSuccessful(false);
      toast.error(error.message || `Failed to test ${provider.name} API key`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleDeleteKey = async () => {
    try {
      setIsDeleting(true);
      setError(null);
      console.log(`🗑️ Deleting ${provider.name} API key`);
      
      const success = await deleteApiKey(provider.serviceKey as ApiProvider);
      
      if (success) {
        setApiKey("");
        setKeyExists(false);
        setIsActive(false);
        setTestSuccessful(false);
        toast.success(`${provider.name} API key deleted successfully`);
        console.log(`✅ ${provider.name} API key deleted successfully`);
      }
    } catch (error: any) {
      console.error(`💥 Error deleting ${provider.name} API key:`, error);
      setError(error.message || `Failed to delete ${provider.name} API key`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDetectKeyType = async () => {
    if (!apiKey || !apiKey.trim()) {
      toast.error('Please enter an API key to detect');
      return;
    }

    try {
      setIsDetecting(true);
      setError(null);
      console.log('🔍 Detecting API key type with enhanced analysis');
      
      // Use enhanced analysis
      const analysis = analyzeApiKey(apiKey);
      setDebugInfo(analysis);
      
      const detectedType = analysis.detection.detectedType;
      
      if (detectedType && detectedType !== provider.serviceKey) {
        toast.info(
          `This appears to be a ${detectedType.toUpperCase()} API key (confidence: ${analysis.detection.confidence}). Would you like to configure it there instead?`,
          { duration: 6000 }
        );
        console.log(`🔍 Detected ${detectedType} API key format (confidence: ${analysis.detection.confidence})`);
        
        // Show alternative providers if any
        if (analysis.detection.alternativeTypes.length > 0) {
          console.log('🔄 Alternative providers:', analysis.detection.alternativeTypes);
          toast.info(`Also matches: ${analysis.detection.alternativeTypes.join(', ')}`);
        }
      } else if (detectedType === provider.serviceKey) {
        toast.success(`Confirmed as a valid ${provider.name} API key format (confidence: ${analysis.detection.confidence})`);
        console.log(`✅ Confirmed ${provider.name} API key format`);
      } else {
        toast.error('Unable to detect API key type');
        console.warn('❓ Could not detect API key type');
        
        // Show debug recommendations
        if (analysis.recommendations.length > 0) {
          toast.info(analysis.recommendations[0], { duration: 5000 });
        }
      }
      
      // Log comprehensive analysis
      console.log('🐛 Complete key analysis:', analysis);
      
    } catch (error: any) {
      console.error('💥 Error detecting API key type:', error);
      setError(error.message || 'Failed to detect API key type');
    } finally {
      setIsDetecting(false);
    }
  };

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
        <div className="bg-red-900/20 border border-red-500/30 p-3 rounded-md text-sm text-red-300">
          <div className="font-medium mb-1">Error:</div>
          <div>{error}</div>
          {debugInfo && debugInfo.recommendations.length > 0 && (
            <div className="mt-2 pt-2 border-t border-red-500/20">
              <div className="font-medium mb-1">Suggestions:</div>
              <ul className="text-xs space-y-1">
                {debugInfo.recommendations.slice(0, 3).map((rec: string, index: number) => (
                  <li key={index} className="flex items-start gap-1">
                    <span className="text-red-400 mt-0.5">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      {debugInfo && debugInfo.detection.confidence === 'low' && (
        <div className="bg-yellow-900/20 border border-yellow-500/30 p-3 rounded-md text-sm text-yellow-300">
          <div className="font-medium mb-1">Detection Warning:</div>
          <div>Low confidence in API key type detection. Please verify you selected the correct provider.</div>
          {debugInfo.detection.alternativeTypes.length > 0 && (
            <div className="mt-1">
              <span className="font-medium">Possible alternatives:</span> {debugInfo.detection.alternativeTypes.join(', ')}
            </div>
          )}
        </div>
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
      
      {debugInfo && (
        <div className="mt-4 p-3 bg-gray-900/30 border border-gray-700/30 rounded-md">
          <details className="text-xs">
            <summary className="cursor-pointer font-medium text-gray-400 hover:text-white">
              Debug Information (Click to expand)
            </summary>
            <div className="mt-2 space-y-2 text-gray-300">
              <div>
                <span className="font-medium">Key Length:</span> {debugInfo.key.length} chars
              </div>
              <div>
                <span className="font-medium">Detected Type:</span> {debugInfo.detection.detectedType || 'Unknown'}
              </div>
              <div>
                <span className="font-medium">Confidence:</span> {debugInfo.detection.confidence}
              </div>
              {debugInfo.detection.alternativeTypes.length > 0 && (
                <div>
                  <span className="font-medium">Alternatives:</span> {debugInfo.detection.alternativeTypes.join(', ')}
                </div>
              )}
            </div>
          </details>
        </div>
      )}
    </ApiKeyCard>
  );
};
