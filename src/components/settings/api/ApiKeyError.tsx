
import React from 'react';
import { AlertCircle, ExternalLink } from 'lucide-react';

interface ApiKeyErrorProps {
  error: string | null;
  providerKey?: string;
  testSuccessful?: boolean;
}

export const ApiKeyError = ({ error, providerKey, testSuccessful }: ApiKeyErrorProps) => {
  if (!error) return null;
  
  return (
    <div className="bg-destructive/10 border border-destructive/30 p-4 rounded-md text-sm space-y-2">
      <div className="flex items-start gap-2">
        <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
        <span className="text-destructive/90">{error}</span>
      </div>
      
      {providerKey === 'serp' && testSuccessful === false && (
        <div className="mt-3 pl-7">
          <p className="font-semibold text-destructive/90">SERP API troubleshooting:</p>
          <ul className="list-disc ml-5 mt-1 space-y-2 text-destructive/80">
            <li>Make sure you're using the correct API key from your SerpApi account</li>
            <li>Check that your SerpApi account has remaining credits</li>
            <li>Try using a different browser or network connection</li>
            <li className="flex items-center gap-1">
              Visit 
              <a 
                href="https://serpapi.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-400 hover:underline inline-flex items-center gap-1"
              >
                SerpApi website <ExternalLink className="h-3 w-3" />
              </a> 
              to verify your account status
            </li>
            <li>Ensure no spaces or extra characters were copied with your key</li>
            <li>Try clearing your browser cache and refreshing the page</li>
          </ul>
        </div>
      )}
    </div>
  );
};
