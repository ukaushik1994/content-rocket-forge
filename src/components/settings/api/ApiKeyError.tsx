
import React from 'react';

interface ApiKeyErrorProps {
  error: string | null;
  providerKey?: string;
  testSuccessful?: boolean;
}

export const ApiKeyError = ({ error, providerKey, testSuccessful }: ApiKeyErrorProps) => {
  if (!error) return null;
  
  return (
    <div className="bg-red-900/20 border border-red-500/30 p-3 rounded-md text-sm text-red-300">
      {error}
      {providerKey === 'serp' && testSuccessful === false && (
        <div className="mt-2">
          <p className="font-semibold">SERP API troubleshooting:</p>
          <ul className="list-disc ml-5 mt-1 space-y-1">
            <li>Make sure you're using the correct API key from your SerpApi account</li>
            <li>Check that your SerpApi account has remaining credits</li>
            <li>Try using a different browser or network connection</li>
            <li>Visit <a href="https://serpapi.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">SerpApi website</a> to verify your account status</li>
            <li>Ensure no spaces or extra characters were copied with your key</li>
          </ul>
        </div>
      )}
    </div>
  );
};
