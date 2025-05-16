
import React from 'react';
import { Card } from '@/components/ui/card';
import { Settings, Globe } from 'lucide-react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { CountrySelector } from '@/components/content-builder/keyword/CountrySelector';

export function EmptySelectionState() {
  const { state, setSelectedRegions } = useContentBuilder();
  const selectedRegion = state.selectedRegions.length > 0 ? state.selectedRegions[0] : 'us';
  
  const handleCountryChange = (country: string) => {
    setSelectedRegions([country]);
  };
  
  return (
    <Card className="h-full min-h-[200px] flex flex-col items-center justify-center p-6 bg-gradient-to-br from-black/20 to-blue-950/10 border border-white/10">
      <div className="text-center space-y-3">
        <div className="bg-blue-900/20 p-3 rounded-full inline-flex mx-auto mb-2">
          <Settings className="h-6 w-6 text-blue-400" />
        </div>
        <h3 className="text-lg font-medium">No items selected yet</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Select items from the search results to create your content outline.
        </p>
        
        <div className="pt-4">
          <div className="flex items-center justify-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Change region to refine search results:</p>
          </div>
          <div className="mt-2">
            <CountrySelector
              selectedCountry={selectedRegion}
              onCountryChange={handleCountryChange}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
