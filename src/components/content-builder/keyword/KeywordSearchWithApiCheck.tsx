
import React from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { KeywordSearch } from './KeywordSearch';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { SerpApiKeyMissing } from '@/components/content-builder/serp/SerpApiKeyMissing';
import { getApiKey } from '@/services/apiKeyService';
import { CountrySelector } from './CountrySelector';

export function KeywordSearchWithApiCheck({ initialKeyword, onKeywordSearch }) {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = React.useState(false);
  const [hasApiKey, setHasApiKey] = React.useState<boolean | null>(null);
  const { state, setSelectedRegions } = useContentBuilder();
  const { selectedRegions } = state;
  const selectedRegion = selectedRegions.length > 0 ? selectedRegions[0] : 'us';
  
  // Check for API key on mount
  React.useEffect(() => {
    const checkApiKey = async () => {
      setIsChecking(true);
      try {
        // Use the apiKeyService to check if the key exists
        const encryptedKey = await getApiKey('serp');
        
        // If we get a key back, it exists
        const keyExists = !!encryptedKey;
        setHasApiKey(keyExists);
        
        if (keyExists) {
          console.log('SERP API key found in settings');
        } else {
          console.log('No SERP API key found in settings');
          toast.warning('SERP API key is required for content analysis. Please add it in Settings → API.');
        }
      } catch (error) {
        console.error('Error checking API key:', error);
        setHasApiKey(false);
      } finally {
        setIsChecking(false);
      }
    };
    
    checkApiKey();
  }, []);
  
  const handleKeywordSearch = async (keyword, suggestions) => {
    if (!hasApiKey) {
      toast.error('SERP API key is required for keyword analysis. Please add it in Settings → API.');
      return;
    }
    
    // Only proceed with keyword search if API key exists
    await onKeywordSearch(keyword, suggestions);
  };
  
  const handleCountryChange = (country: string) => {
    setSelectedRegions([country]);
  };
  
  // Show the search bar first
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
        <div className="flex-1">
          <KeywordSearch initialKeyword={initialKeyword} onKeywordSearch={handleKeywordSearch} />
        </div>
        <div>
          <CountrySelector 
            selectedCountry={selectedRegion}
            onCountryChange={handleCountryChange}
          />
        </div>
      </div>
      
      {/* Show API key missing notice below the search bar if needed */}
      {hasApiKey === false && (
        <div className="mt-4">
          <SerpApiKeyMissing compact={true} />
        </div>
      )}
    </div>
  );
}
