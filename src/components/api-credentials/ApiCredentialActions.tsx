
/**
 * Reusable component for API credential actions
 */

import React from 'react';
import { Button } from "@/components/ui/button";
import { ApiCredentialActionsProps } from './types';
import { Save, Trash, TestTube, Loader2, Check } from "lucide-react";

export const ApiCredentialActions: React.FC<ApiCredentialActionsProps> = ({
  onSave,
  onDelete,
  onTest,
  isSaving = false,
  isTesting = false,
  isTestable = false,
  isValid = false,
  hasKey = false
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2 mt-4">
      <Button
        onClick={onSave}
        disabled={isSaving || isTesting}
        className="flex-1"
      >
        {isSaving ? (
          <span className="flex items-center">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Saving...
          </span>
        ) : (
          <span className="flex items-center">
            <Save className="h-4 w-4 mr-2" />
            {hasKey ? 'Update' : 'Save'}
          </span>
        )}
      </Button>
      
      {isTestable && onTest && (
        <Button
          onClick={onTest}
          variant="secondary"
          disabled={isSaving || isTesting || isValid}
          className="flex-1"
        >
          {isTesting ? (
            <span className="flex items-center">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Testing...
            </span>
          ) : isValid ? (
            <span className="flex items-center">
              <Check className="h-4 w-4 mr-2" />
              Verified
            </span>
          ) : (
            <span className="flex items-center">
              <TestTube className="h-4 w-4 mr-2" />
              Test
            </span>
          )}
        </Button>
      )}
      
      {hasKey && (
        <Button
          onClick={onDelete}
          variant="destructive"
          disabled={isSaving || isTesting}
        >
          <Trash className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
