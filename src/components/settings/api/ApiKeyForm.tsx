
import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Info } from 'lucide-react';
import { ApiProvider } from './types';

interface ApiKeyFormProps {
  provider: ApiProvider;
  apiKey: string;
  setApiKey: (key: string) => void;
  keyExists: boolean;
  testSuccessful: boolean;
}

export const ApiKeyForm = ({ 
  provider, 
  apiKey, 
  setApiKey, 
  keyExists, 
  testSuccessful 
}: ApiKeyFormProps) => {
  const [showApiKey, setShowApiKey] = useState(false);

  return (
    <div className="space-y-2">
      <Label htmlFor={`${provider.serviceKey}-api-key`} className="flex justify-between">
        <span>API Key</span>
        <a 
          href={provider.link} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
        >
          <Info className="h-3 w-3" />
          Get API key
        </a>
      </Label>
      <div className="relative">
        <Input
          id={`${provider.serviceKey}-api-key`}
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          type={showApiKey ? "text" : "password"}
          placeholder={`Enter your ${provider.name} API key`}
          className={`pr-10 ${
            provider.required && !keyExists 
              ? 'border-red-500/50 focus:border-red-500' 
              : testSuccessful 
                ? 'border-green-500/50 focus:border-green-500' 
                : ''
          }`}
        />
        <button
          className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
          onClick={() => setShowApiKey(!showApiKey)}
          type="button"
        >
          {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
};
