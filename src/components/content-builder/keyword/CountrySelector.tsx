
import React from 'react';
import { GlobeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface SearchCountry {
  value: string;
  label: string;
}

export const AVAILABLE_COUNTRIES: SearchCountry[] = [
  { value: 'us', label: '🇺🇸 US' },
  { value: 'uk', label: '🇬🇧 UK' },
  { value: 'mea', label: '🌍 MEA' },
  { value: 'global', label: '🌐 Global' }
];

interface CountrySelectorProps {
  selectedCountry: string;
  onCountryChange: (country: string) => void;
  // For backward compatibility
  selectedCountries?: string[];
  onCountriesChange?: (countries: string[]) => void;
  className?: string;
}

export const CountrySelector: React.FC<CountrySelectorProps> = ({
  selectedCountry,
  onCountryChange,
  selectedCountries,
  onCountriesChange,
  className = ""
}) => {
  const countries = AVAILABLE_COUNTRIES;
  
  // Handle both old and new API
  const handleCountryChange = (value: string) => {
    onCountryChange(value);
    // Support legacy API if provided
    if (onCountriesChange) {
      onCountriesChange([value]);
    }
  };
  
  // Use selectedCountries for backward compatibility if provided
  const effectiveSelectedCountry = selectedCountry || 
    (selectedCountries && selectedCountries.length > 0 ? selectedCountries[0] : 'us');
  
  const getSelectedCountryLabel = () => {
    const country = countries.find(c => c.value === effectiveSelectedCountry);
    return country?.label || 'Select Region';
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={`bg-background/50 text-xs border-white/10 ${className}`}>
          <GlobeIcon className="h-4 w-4 mr-1" />
          {getSelectedCountryLabel()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuRadioGroup value={effectiveSelectedCountry} onValueChange={handleCountryChange}>
          {countries.map(country => (
            <DropdownMenuRadioItem
              key={country.value}
              value={country.value}
            >
              {country.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
