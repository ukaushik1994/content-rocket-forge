
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Sparkles, Clipboard, EyeOff, Eye, Globe, Check } from "lucide-react";
import { AiProviderSelector } from "@/components/content-builder/outline/ai-generator/AiProviderSelector";
import { AiProvider } from '@/services/aiService/types';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

// Define available search countries
export type SearchCountry = {
  code: string;
  name: string;
};

export const AVAILABLE_COUNTRIES: SearchCountry[] = [
  { code: 'us', name: 'United States' },
  { code: 'uk', name: 'United Kingdom' },
  { code: 'ca', name: 'Canada' },
  { code: 'au', name: 'Australia' },
  { code: 'de', name: 'Germany' },
  { code: 'fr', name: 'France' },
  { code: 'es', name: 'Spain' },
  { code: 'it', name: 'Italy' },
  { code: 'jp', name: 'Japan' },
  { code: 'in', name: 'India' },
  { code: 'br', name: 'Brazil' },
  { code: 'mx', name: 'Mexico' },
  { code: 'sg', name: 'Singapore' },
  { code: 'nl', name: 'Netherlands' },
  { code: 'se', name: 'Sweden' },
];

interface ContentGenerationHeaderProps {
  isGenerating: boolean;
  handleGenerateContent: () => void;
  handleToggleOutline: () => void;
  handleToggleGenerator: () => void;
  showOutline: boolean;
  outlineLength: number;
  aiProvider: AiProvider;
  onAiProviderChange: (provider: AiProvider) => void;
  selectedCountries?: string[];
  onCountriesChange?: (countries: string[]) => void;
}

export function ContentGenerationHeader({
  isGenerating,
  handleGenerateContent,
  handleToggleOutline,
  handleToggleGenerator,
  showOutline,
  outlineLength,
  aiProvider,
  onAiProviderChange,
  selectedCountries = ['us'],
  onCountriesChange = () => {}
}: ContentGenerationHeaderProps) {
  const [isCountryPopoverOpen, setIsCountryPopoverOpen] = useState(false);

  const toggleCountry = (countryCode: string) => {
    if (selectedCountries.includes(countryCode)) {
      if (selectedCountries.length > 1) { // Always keep at least one country selected
        onCountriesChange(selectedCountries.filter(code => code !== countryCode));
      }
    } else {
      onCountriesChange([...selectedCountries, countryCode]);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-2">
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple transition-all"
          onClick={handleGenerateContent}
          disabled={isGenerating}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          {isGenerating ? 'Generating...' : 'Generate Content'}
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          className="bg-glass border border-white/10 hover:border-white/20"
          onClick={handleToggleGenerator}
        >
          <Clipboard className="h-4 w-4 mr-2" />
          Templates
        </Button>
        
        <Popover open={isCountryPopoverOpen} onOpenChange={setIsCountryPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="bg-glass border border-white/10 hover:border-white/20"
            >
              <Globe className="h-4 w-4 mr-2" />
              {selectedCountries.length === 1 
                ? AVAILABLE_COUNTRIES.find(c => c.code === selectedCountries[0])?.name
                : `${selectedCountries.length} Countries`}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2" align="start">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Select Search Countries</h4>
              <p className="text-xs text-muted-foreground">
                Data will be fetched from selected countries
              </p>
              
              <ScrollArea className="h-60 pr-4 mt-2">
                <div className="space-y-2">
                  {AVAILABLE_COUNTRIES.map((country) => (
                    <div 
                      key={country.code} 
                      className="flex items-center space-x-2 py-1.5 px-1 rounded hover:bg-white/5"
                    >
                      <Checkbox 
                        id={`country-${country.code}`}
                        checked={selectedCountries.includes(country.code)}
                        onCheckedChange={() => toggleCountry(country.code)}
                        disabled={selectedCountries.length === 1 && selectedCountries.includes(country.code)}
                      />
                      <label 
                        htmlFor={`country-${country.code}`}
                        className="flex-1 text-sm cursor-pointer"
                      >
                        {country.name}
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedCountries.map(code => {
                  const country = AVAILABLE_COUNTRIES.find(c => c.code === code);
                  return (
                    <Badge key={code} variant="outline" className="bg-white/10 flex items-center gap-1">
                      {country?.name}
                      {selectedCountries.length > 1 && (
                        <button 
                          className="ml-1 text-white/70 hover:text-white" 
                          onClick={() => toggleCountry(code)}
                        >
                          <span className="sr-only">Remove</span>
                          ×
                        </button>
                      )}
                    </Badge>
                  );
                })}
              </div>
              
              <Button 
                size="sm" 
                className="w-full mt-2"
                onClick={() => setIsCountryPopoverOpen(false)}
              >
                <Check className="h-4 w-4 mr-1" /> Apply
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="flex flex-wrap items-center gap-4">
        <AiProviderSelector 
          aiProvider={aiProvider}
          setAiProvider={onAiProviderChange}
        />
        
        <Button
          size="sm"
          variant="outline"
          className="bg-glass border border-white/10 hover:border-white/20"
          onClick={handleToggleOutline}
        >
          {showOutline ? (
            <>
              <EyeOff className="h-4 w-4 mr-2" />
              Hide Outline
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 mr-2" />
              Show Outline ({outlineLength})
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
