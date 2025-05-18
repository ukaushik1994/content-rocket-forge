
import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Download, Save, Trash } from 'lucide-react';

interface ActionButtonsProps {
  onCopy: () => void;
  onDownload: () => void;
  onSave: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onCopy,
  onDownload,
  onSave,
  onDelete,
  isDeleting = false
}) => {
  return (
    <div className="flex justify-end gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onCopy}
      >
        <Copy className="h-4 w-4 mr-1" />
        Copy
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onDownload}
      >
        <Download className="h-4 w-4 mr-1" />
        Download
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onSave}
      >
        <Save className="h-4 w-4 mr-1" />
        Save to Original
      </Button>
      {onDelete && (
        <Button
          variant="outline"
          size="sm"
          className="text-red-500 hover:text-red-600"
          onClick={onDelete}
          disabled={isDeleting}
        >
          <Trash className="h-4 w-4 mr-1" />
          {isDeleting ? 'Deleting...' : 'Delete'}
        </Button>
      )}
    </div>
  );
};

export default ActionButtons;
