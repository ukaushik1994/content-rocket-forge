
import React from 'react';
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ProviderStatusIndicator } from './ProviderStatusIndicator';

// Export the type here for compatibility
export type AiProvider = 'openai' | 'anthropic' | 'gemini' | 'other' | string;

export interface AiProviderSelectorProps {
  selectedProvider?: AiProvider;
  providers?: AiProvider[];
  onProviderChange: (provider: AiProvider) => void;
  size?: string;
  variant?: string;
  className?: string;
}

export const AiProviderSelector = ({
  selectedProvider = 'openai',
  providers = ['openai', 'anthropic', 'gemini'],
  onProviderChange,
  size = "sm",
  variant = "outline",
  className
}: AiProviderSelectorProps) => {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (currentValue: string) => {
    onProviderChange(currentValue as AiProvider);
    setOpen(false);
  };

  const getProviderLabel = (provider: string): string => {
    switch (provider) {
      case 'openai':
        return 'OpenAI';
      case 'anthropic':
        return 'Claude';
      case 'gemini':
        return 'Gemini';
      case 'other':
        return 'Other Provider';
      default:
        return provider.charAt(0).toUpperCase() + provider.slice(1);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={variant as any}
          size={size as any}
          role="combobox"
          aria-expanded={open}
          className={cn(
            "flex items-center justify-between",
            className
          )}
        >
          <div className="flex items-center gap-2">
            <ProviderStatusIndicator provider={selectedProvider as AiProvider} />
            <span>{getProviderLabel(selectedProvider)}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[200px]">
        <Command>
          <CommandInput placeholder="Search AI provider..." />
          <CommandEmpty>No provider found.</CommandEmpty>
          <CommandGroup>
            {providers.map((provider) => (
              <CommandItem
                key={provider}
                value={provider}
                onSelect={handleSelect}
              >
                <div className="flex items-center gap-2">
                  <ProviderStatusIndicator provider={provider as AiProvider} />
                  <span>{getProviderLabel(provider)}</span>
                </div>
                <Check
                  className={cn(
                    "ml-auto h-4 w-4",
                    selectedProvider === provider ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
