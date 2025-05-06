
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle } from 'lucide-react';

interface SaveActionsProps {
  alreadySaved: boolean;
  isSubmitting: boolean;
  handleSaveContent: () => Promise<void>;
  content: string;
  mainKeyword: string;
  title: string;
}

export const SaveActions: React.FC<SaveActionsProps> = ({
  alreadySaved,
  isSubmitting,
  handleSaveContent,
  content,
  mainKeyword,
  title
}) => {
  return (
    <div className="flex justify-center pt-4">
      <Button
        className={`gap-1 ${
          alreadySaved 
          ? 'bg-secondary hover:bg-secondary/90' 
          : 'bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple'
        } min-w-[150px]`}
        onClick={handleSaveContent}
        disabled={isSubmitting || !content || !mainKeyword || !title.trim()}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : alreadySaved ? (
          <>
            <CheckCircle className="h-4 w-4" />
            View in Content Library
          </>
        ) : (
          <>
            <CheckCircle className="h-4 w-4" />
            Finish
          </>
        )}
      </Button>
    </div>
  );
};
