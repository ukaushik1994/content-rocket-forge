
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, Globe, MapPin } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface RegionSelectorProps {
  selectedRegions: string[];
  onRegionSelect: (regions: string[]) => void;
}

export const RegionSelector: React.FC<RegionSelectorProps> = ({ 
  selectedRegions, 
  onRegionSelect 
}) => {
  // Available regions
  const availableRegions = [
    { id: 'us', name: 'United States', flag: '🇺🇸' },
    { id: 'uk', name: 'United Kingdom', flag: '🇬🇧' },
    { id: 'mea', name: 'Middle East', flag: '🌍' },
    { id: 'global', name: 'Global', flag: '🌐' }
  ];
  
  // Toggle a single region
  const toggleRegion = (regionId: string) => {
    if (selectedRegions.includes(regionId)) {
      // Don't allow deselecting if it's the last selected region
      if (selectedRegions.length === 1) return;
      onRegionSelect(selectedRegions.filter(id => id !== regionId));
    } else {
      onRegionSelect([...selectedRegions, regionId]);
    }
  };
  
  // Get the display text for the selected regions
  const getSelectedRegionsText = () => {
    if (selectedRegions.length === availableRegions.length) {
      return 'All Regions';
    } else if (selectedRegions.length === 1) {
      const region = availableRegions.find(r => r.id === selectedRegions[0]);
      return region ? region.name : 'One Region';
    } else {
      return `${selectedRegions.length} Regions`;
    }
  };
  
  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="bg-glass border border-white/10">
            <Globe className="h-4 w-4 mr-2" />
            {getSelectedRegionsText()}
            <div className="ml-2 flex -space-x-1">
              {selectedRegions.slice(0, 3).map((regionId) => {
                const region = availableRegions.find(r => r.id === regionId);
                return region ? (
                  <div key={regionId} className="w-5 h-5 flex items-center justify-center text-xs">
                    {region.flag}
                  </div>
                ) : null;
              })}
              {selectedRegions.length > 3 && (
                <Badge variant="secondary" className="ml-2 bg-white/10 text-xs">
                  +{selectedRegions.length - 3}
                </Badge>
              )}
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-card/90 backdrop-blur-lg border border-white/10">
          <DropdownMenuLabel>Select Search Regions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {availableRegions.map((region) => (
            <DropdownMenuItem 
              key={region.id}
              className="cursor-pointer flex items-center justify-between"
              onClick={() => toggleRegion(region.id)}
            >
              <div className="flex items-center gap-2">
                <div className="text-base">{region.flag}</div>
                <span>{region.name}</span>
              </div>
              {selectedRegions.includes(region.id) && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
