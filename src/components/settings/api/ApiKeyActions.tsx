
import React from 'react';
import { Button } from "@/components/ui/button";
import { Check, X, Loader2, Zap } from 'lucide-react';
import { ApiProvider } from './types';

interface ApiKeyActionsProps {
  provider: ApiProvider;
  apiKey: string;
  keyExists: boolean;
  testSuccessful: boolean;
  isSaving: boolean;
  isTesting: boolean;
  isDeleting: boolean;
  isDetecting: boolean;
  onSave: () => void;
  onTest: () => void;
  onDelete: () => void;
  onDetect: () => void;
}

export const ApiKeyActions = ({
  provider,
  apiKey,
  keyExists,
  testSuccessful,
  isSaving,
  isTesting,
  isDeleting,
  isDetecting,
  onSave,
  onTest,
  onDelete,
  onDetect
}: ApiKeyActionsProps) => {
  if (keyExists) {
    return (
      <div className="flex flex-wrap gap-2">
        <Button 
          variant={testSuccessful ? "outline" : "default"}
          onClick={onTest}
          disabled={isTesting}
          className={testSuccessful ? "border-green-500/50 text-green-300" : ""}
        >
          {isTesting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing...
            </>
          ) : testSuccessful ? (
            <>
              <Check className="mr-2 h-4 w-4 text-green-500" />
              Connection Verified
            </>
          ) : (
            <>
              <Zap className="mr-2 h-4 w-4" />
              Test Connection
            </>
          )}
        </Button>
        
        <Button
          variant="destructive"
          onClick={onDelete}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Deleting...
            </>
          ) : (
            <>
              <X className="mr-2 h-4 w-4" />
              Delete Key
            </>
          )}
        </Button>
      </div>
    );
  }
  
  return (
    <div className="flex flex-wrap gap-2">
      <Button 
        onClick={onSave} 
        className={`bg-gradient-to-r ${
          provider.required 
            ? 'from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600' 
            : 'from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple'
        }`}
        disabled={isSaving || !apiKey}
      >
        {isSaving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          'Save API Key'
        )}
      </Button>
      
      {provider.autoDetectable && (
        <Button
          variant="outline"
          onClick={onDetect}
          disabled={isDetecting || !apiKey}
        >
          {isDetecting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Detecting...
            </>
          ) : (
            <>
              <Zap className="mr-2 h-4 w-4" />
              Auto-Detect
            </>
          )}
        </Button>
      )}
    </div>
  );
};
