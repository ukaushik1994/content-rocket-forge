
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from 'lucide-react';
import { ProviderKeyManager } from '../ProviderKeyManager';
import { ApiProviderConfig } from '@/components/settings/api/types';
import { DataForSeoCredentials } from '@/types/serp';

interface DataForSeoCredentialsTabProps {
  provider: ApiProviderConfig;
  credentials: DataForSeoCredentials;
  setCredentials: (credentials: DataForSeoCredentials) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  encodedCredentials: string;
  keyExists: boolean;
  isTesting: boolean;
  testSuccessful: boolean;
  isSaving: boolean;
  handleSaveCredentials: () => Promise<boolean>;
  handleTestCredentials: () => Promise<any>;
  handleDeleteCredentials: (key?: string) => Promise<boolean>;
}

export const DataForSeoCredentialsTab: React.FC<DataForSeoCredentialsTabProps> = ({
  provider,
  credentials,
  setCredentials,
  showPassword,
  setShowPassword,
  encodedCredentials,
  keyExists,
  isTesting,
  testSuccessful,
  isSaving,
  handleSaveCredentials,
  handleTestCredentials,
  handleDeleteCredentials
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="login">Login</Label>
          <Input
            id="login"
            value={credentials.login}
            onChange={(e) => setCredentials({ ...credentials, login: e.target.value })}
            placeholder="DataForSEO login email"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password" className="flex justify-between">
            <span>Password</span>
            <button
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <span className="flex items-center">
                  <EyeOff size={12} className="mr-1" /> Hide
                </span>
              ) : (
                <span className="flex items-center">
                  <Eye size={12} className="mr-1" /> Show
                </span>
              )}
            </button>
          </Label>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            placeholder="DataForSEO API password"
          />
        </div>
        
        {provider.docsUrl && (
          <div className="text-xs text-white/60">
            <span>Don't have credentials? </span>
            <a 
              href={provider.docsUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-400 hover:text-blue-300"
            >
              Get API Documentation
            </a>
            {provider.signupUrl && (
              <>
                <span> or </span>
                <a 
                  href={provider.signupUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-400 hover:text-blue-300"
                >
                  Sign Up
                </a>
              </>
            )}
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between pt-4">
        <div className="flex items-center space-x-2">
          {keyExists && (
            <ProviderKeyManager
              provider={provider}
              apiKey={encodedCredentials}
              keyExists={keyExists}
              onSave={handleSaveCredentials}
              onDelete={handleDeleteCredentials}
            />
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {keyExists ? (
            <Button 
              variant={testSuccessful ? "outline" : "default"}
              onClick={handleTestCredentials}
              disabled={isTesting}
            >
              {isTesting ? 'Testing...' : (testSuccessful ? 'Verified' : 'Test Connection')}
            </Button>
          ) : (
            <Button 
              onClick={handleSaveCredentials} 
              disabled={isSaving || !credentials.login || !credentials.password}
            >
              {isSaving ? 'Saving...' : 'Save Credentials'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
