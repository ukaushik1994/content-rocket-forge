
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  PenLine, 
  ListTree, 
  BookText, 
  ClipboardList, 
  Wand2,
  Loader2,
  GlobeIcon
} from 'lucide-react';
import { AiProvider } from '@/services/aiService/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ContentGenerationHeaderProps {
  isGenerating: boolean;
  handleGenerateContent: () => Promise<void>;
  handleToggleOutline: () => void;
  handleToggleGenerator: () => void;
  showOutline: boolean;
  outlineLength: number;
  aiProvider: AiProvider;
  onAiProviderChange: (provider: AiProvider) => void;
  selectedCountries: string[];
  onCountriesChange: (countries: string[]) => void;
}

export const ContentGenerationHeader: React.FC<ContentGenerationHeaderProps> = ({
  isGenerating,
  handleGenerateContent,
  handleToggleOutline,
  handleToggleGenerator,
  showOutline,
  outlineLength,
  aiProvider,
  onAiProviderChange,
  selectedCountries,
  onCountriesChange
}) => {
  const countries = [
    { value: 'us', label: '🇺🇸 US' },
    { value: 'uk', label: '🇬🇧 UK' },
    { value: 'mea', label: '🌍 MEA' },
    { value: 'global', label: '🌐 Global' }
  ];
  
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
    <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center">
      <div className="flex items-center space-x-2">
        <Button
          onClick={handleGenerateContent}
          disabled={isGenerating || outlineLength === 0}
          className={`bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg`}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" />
              Generate Content
            </>
          )}
        </Button>

        <Select
          value={aiProvider}
          onValueChange={(value: string) => onAiProviderChange(value as AiProvider)}
        >
          <SelectTrigger className="w-36 bg-background/50 text-xs border-white/10">
            <SelectValue placeholder="AI Provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="openai">OpenAI</SelectItem>
            <SelectItem value="anthropic">Anthropic</SelectItem>
            <SelectItem value="gemini">Google Gemini</SelectItem>
          </SelectContent>
        </Select>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="bg-background/50 text-xs border-white/10">
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
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleToggleOutline}
          className={`flex gap-1 ${showOutline ? 'bg-muted/70 text-white' : 'bg-background/50'} text-xs border-white/10`}
        >
          <ListTree className="h-3.5 w-3.5" /> Outline
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleToggleGenerator}
          className="flex gap-1 bg-background/50 text-xs border-white/10"
        >
          <ClipboardList className="h-3.5 w-3.5" /> Templates
        </Button>
      </div>
    </div>
  );
};
