
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Solution } from '@/contexts/content-builder/types';

interface DeleteSolutionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: () => void;
  solution: Solution | null;
  isSubmitting: boolean;
}

export const DeleteSolutionDialog: React.FC<DeleteSolutionDialogProps> = ({
  open,
  onOpenChange,
  onConfirmDelete,
  solution,
  isSubmitting
}) => {
  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      // Prevent closing while submitting
      if (isSubmitting && !newOpen) {
        return;
      }
      onOpenChange(newOpen);
    }}>
      <DialogContent className="glass-panel sm:max-w-md">
        <DialogHeader>
          <AlertTriangle className="h-6 w-6 text-red-500 mb-2" />
          <DialogTitle className="text-red-500">Delete Solution</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this solution? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        {solution && (
          <div className="py-4">
            <p className="font-medium">{solution.name}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {solution.features.slice(0, 3).map((feature, i) => (
                <Badge key={i} variant="outline">{feature}</Badge>
              ))}
              {solution.features.length > 3 && (
                <Badge variant="outline">+{solution.features.length - 3} more</Badge>
              )}
            </div>
          </div>
        )}
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={onConfirmDelete}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</>
            ) : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
