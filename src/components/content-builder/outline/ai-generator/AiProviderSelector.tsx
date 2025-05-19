
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
import { AiProvider, AiProviderSelectorProps } from './types';

export const AiProviderSelector = ({
  selectedProvider,
  onProviderChange,
  size = "sm",
  variant = "outline",
  className,
  providers = ['openai', 'anthropic', 'gemini'],
  
  // Support for new props pattern
  aiProvider,
  setAiProvider,
  availableProviders
}: AiProviderSelectorProps) => {
  const [open, setOpen] = React.useState(false);
  
  // Use the most appropriate provider value (for backward compatibility)
  const effectiveProvider = selectedProvider || aiProvider || 'openai';
  const effectiveProviders = availableProviders || providers;
  
  const handleSelect = (currentValue: string) => {
    // Call the appropriate handler based on what was provided
    if (setAiProvider) {
      setAiProvider(currentValue as AiProvider);
    } else if (onProviderChange) {
      onProviderChange(currentValue as AiProvider);
    }
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
      case 'mistral':
        return 'Mistral';
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
            <ProviderStatusIndicator selectedProvider={effectiveProvider} />
            <span>{getProviderLabel(effectiveProvider)}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[200px]">
        <Command>
          <CommandInput placeholder="Search AI provider..." />
          <CommandEmpty>No provider found.</CommandEmpty>
          <CommandGroup>
            {effectiveProviders.map((provider) => (
              <CommandItem
                key={provider}
                value={provider}
                onSelect={handleSelect}
              >
                <div className="flex items-center gap-2">
                  <ProviderStatusIndicator selectedProvider={provider as AiProvider} />
                  <span>{getProviderLabel(provider)}</span>
                </div>
                <Check
                  className={cn(
                    "ml-auto h-4 w-4",
                    effectiveProvider === provider ? "opacity-100" : "opacity-0"
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
