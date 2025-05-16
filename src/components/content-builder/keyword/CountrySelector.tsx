
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
  className?: string;
}

export const CountrySelector: React.FC<CountrySelectorProps> = ({
  selectedCountry,
  onCountryChange,
  className = ""
}) => {
  const countries = AVAILABLE_COUNTRIES;
  
  const getSelectedCountryLabel = () => {
    const country = countries.find(c => c.value === selectedCountry);
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
        <DropdownMenuRadioGroup value={selectedCountry} onValueChange={onCountryChange}>
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
