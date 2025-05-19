
import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Info } from 'lucide-react';
import { ApiProviderConfig } from '../settings/api/types';

export interface ProviderFormProps {
  provider: ApiProviderConfig;
  value: string;
  setValue: (value: string) => void;
  status: 'connected' | 'not-verified' | 'error' | 'required' | 'loading' | 'none';
  type?: 'password' | 'text' | 'email';
  label?: string;
  placeholder?: string;
  helperText?: string;
  error?: string | null;
}

export const ProviderForm = ({ 
  provider, 
  value, 
  setValue, 
  status,
  type = 'password',
  label = 'API Key',
  placeholder,
  helperText,
  error
}: ProviderFormProps) => {
  const [showValue, setShowValue] = useState(false);
  
  const inputType = type === 'password' ? (showValue ? 'text' : 'password') : type;
  
  return (
    <div className="space-y-2">
      <Label htmlFor={`${provider.serviceKey}-input`} className="flex justify-between">
        <span>{label}</span>
        {provider.docsUrl && (
          <a 
            href={provider.docsUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            <Info className="h-3 w-3" />
            Get API key
          </a>
        )}
      </Label>
      
      <div className="relative">
        <Input
          id={`${provider.serviceKey}-input`}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          type={inputType}
          placeholder={placeholder || `Enter your ${provider.name} ${label.toLowerCase()}`}
          className={`pr-10 ${
            status === 'required' 
              ? 'border-red-500/50 focus:border-red-500' 
              : status === 'connected' 
                ? 'border-green-500/50 focus:border-green-500' 
                : ''
          }`}
        />
        {type === 'password' && (
          <button
            className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
            onClick={() => setShowValue(!showValue)}
            type="button"
          >
            {showValue ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      
      {helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}
      
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  );
};
