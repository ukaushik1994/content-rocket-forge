
import React from 'react';
import { Button } from "@/components/ui/button";
import { Check, X, Loader2, Zap, RefreshCw } from 'lucide-react';
import { ApiProviderConfig } from '../settings/api/types';

export interface ProviderActionsProps {
  provider: ApiProviderConfig;
  hasValue: boolean;
  status: 'connected' | 'not-verified' | 'error' | 'required' | 'loading' | 'none';
  isSaving: boolean;
  isTesting: boolean;
  isDeleting: boolean;
  isDetecting?: boolean;
  onSave: () => void;
  onTest: () => void;
  onDelete: () => void;
  onDetect?: () => void;
}

export const ProviderActions = ({
  provider,
  hasValue,
  status,
  isSaving,
  isTesting,
  isDeleting,
  isDetecting,
  onSave,
  onTest,
  onDelete,
  onDetect
}: ProviderActionsProps) => {
  // If connected, show test and delete options
  if (status === 'connected' || status === 'not-verified') {
    return (
      <div className="flex flex-wrap gap-2">
        <Button 
          variant={status === 'connected' ? "outline" : "default"}
          onClick={onTest}
          disabled={isTesting}
          className={status === 'connected' ? "border-green-500/50 text-green-300" : ""}
        >
          {isTesting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing...
            </>
          ) : status === 'connected' ? (
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
              Delete
            </>
          )}
        </Button>
      </div>
    );
  }
  
  // If not connected, show save and detect options
  return (
    <div className="flex flex-wrap gap-2">
      <Button 
        onClick={onSave} 
        className={`bg-gradient-to-r ${
          status === 'required' 
            ? 'from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600' 
            : 'from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
        }`}
        disabled={isSaving || !hasValue}
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
      
      {provider.autoDetectable && onDetect && (
        <Button
          variant="outline"
          onClick={onDetect}
          disabled={isDetecting || !hasValue}
        >
          {isDetecting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Detecting...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Auto-Detect
            </>
          )}
        </Button>
      )}
    </div>
  );
};
