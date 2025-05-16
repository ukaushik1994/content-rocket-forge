
import React from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { KeywordSearch } from './KeywordSearch';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
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
  
  React.useEffect(() => {
    const checkApiKey = async () => {
      setIsChecking(true);
      try {
        // Use the apiKeyService to check if the key exists
        // This is more reliable as it leverages shared logic for API key management
        const apiKey = await getApiKey('serp');
        
        // If we get a key back, it exists
        setHasApiKey(!!apiKey);
        
        if (apiKey) {
          console.log('SERP API key found in settings');
        } else {
          console.log('No SERP API key found in settings');
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
    
    await onKeywordSearch(keyword, suggestions);
  };
  
  const handleCountriesChange = (countries: string[]) => {
    setSelectedRegions(countries);
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
            selectedCountries={selectedRegions} 
            onCountriesChange={handleCountriesChange}
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
