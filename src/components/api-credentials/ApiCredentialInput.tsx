
/**
 * Reusable component for API credential input
 */

import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ApiCredentialInputProps } from './types';
import { Loader2, TestTube, Check, AlertCircle } from "lucide-react";

export const ApiCredentialInput: React.FC<ApiCredentialInputProps> = ({
  value,
  onChange,
  placeholder = 'Enter API key',
  label = 'API Key',
  error,
  loading = false,
  testable = false,
  onTest,
  isTesting = false,
  isValid = false,
}) => {
  return (
    <div className="space-y-2 w-full">
      <div className="flex justify-between items-center">
        <Label htmlFor="api-key-input" className="text-sm text-white/70">
          {label}
        </Label>
        {error && (
          <span className="text-red-400 flex items-center text-xs">
            <AlertCircle className="h-3 w-3 mr-1" />
            {error}
          </span>
        )}
        {isValid && !error && (
          <span className="text-green-400 flex items-center text-xs">
            <Check className="h-3 w-3 mr-1" />
            Valid
          </span>
        )}
      </div>
      
      <div className="flex gap-2">
        <Input
          id="api-key-input"
          type="password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={loading}
          placeholder={placeholder}
          className={`flex-1 bg-white/5 border-white/10 ${error ? 'border-red-500' : ''} ${isValid ? 'border-green-500' : ''}`}
        />
        
        {testable && onTest && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onTest}
            disabled={isTesting || !value || loading}
            className="whitespace-nowrap"
          >
            {isTesting ? (
              <span className="flex items-center">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testing
              </span>
            ) : (
              <span className="flex items-center">
                <TestTube className="h-4 w-4 mr-2" />
                Test
              </span>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};
