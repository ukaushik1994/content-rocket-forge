
import React from 'react';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SaveAlreadyExistsAlertProps {
  onViewExisting: () => void;
}

export const SaveAlreadyExistsAlert: React.FC<SaveAlreadyExistsAlertProps> = ({ onViewExisting }) => {
  return (
    <div className="flex items-center gap-2 p-4 rounded-md bg-amber-50 border border-amber-200 text-amber-700">
      <Info className="h-5 w-5 flex-shrink-0" />
      <div className="flex-1">
        <p className="font-medium">Similar content already exists in your library</p>
        <p className="text-sm">You may already have saved content with this title or keyword.</p>
      </div>
      <Button variant="outline" size="sm" onClick={onViewExisting}>
        View in Library
      </Button>
    </div>
  );
};
