
import React, { useState, useEffect } from 'react';
import { SerpApiSettings } from './SerpApiSettings';
import { DataForSeoSettings } from './DataForSeoSettings';

export const SerpApiSettingsContainer: React.FC = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Handle API key changes
  const handleApiKeyChange = () => {
    setIsRefreshing(true);
    
    // Give components time to update
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };
  
  return (
    <div className="space-y-4">
      <SerpApiSettings onApiKeyChange={handleApiKeyChange} />
      <DataForSeoSettings onApiKeyChange={handleApiKeyChange} />
    </div>
  );
};
