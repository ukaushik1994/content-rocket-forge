
import React from 'react';
import { GlobeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
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
  selectedCountries: string[];
  onCountriesChange: (countries: string[]) => void;
  className?: string;
}

export const CountrySelector: React.FC<CountrySelectorProps> = ({
  selectedCountries,
  onCountriesChange,
  className = ""
}) => {
  const countries = AVAILABLE_COUNTRIES;
  
  const toggleCountry = (country: string) => {
    if (selectedCountries.includes(country)) {
      // Don't remove if it's the last one
      if (selectedCountries.length > 1) {
        onCountriesChange(selectedCountries.filter(c => c !== country));
      }
    } else {
      onCountriesChange([...selectedCountries, country]);
    }
  };
  
  const getSelectedCountriesLabel = () => {
    if (selectedCountries.length === countries.length) {
      return 'All Regions';
    }
    if (selectedCountries.length === 1) {
      const country = countries.find(c => c.value === selectedCountries[0]);
      return country?.label || 'Select Regions';
    }
    return `${selectedCountries.length} Regions`;
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={`bg-background/50 text-xs border-white/10 ${className}`}>
          <GlobeIcon className="h-4 w-4 mr-1" />
          {getSelectedCountriesLabel()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {countries.map(country => (
          <DropdownMenuCheckboxItem
            key={country.value}
            checked={selectedCountries.includes(country.value)}
            onCheckedChange={() => toggleCountry(country.value)}
          >
            {country.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
