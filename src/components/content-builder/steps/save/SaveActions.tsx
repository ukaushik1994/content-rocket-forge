
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

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
  const [isClicking, setIsClicking] = React.useState(false);

  const handleClick = async () => {
    if (isClicking) {
      console.warn('[SaveActions] Button click ignored - already processing');
      return;
    }
    
    setIsClicking(true);
    
    try {
      await handleSaveContent();
    } catch (error) {
      console.error('[SaveActions] Error during save:', error);
      toast.error('Failed to save content');
    } finally {
      // Reset after delay to prevent rapid clicking
      setTimeout(() => setIsClicking(false), 2000);
    }
  };

  return (
    <div className="flex justify-center pt-4">
      <Button
        className={`gap-1 ${
          alreadySaved 
          ? 'bg-secondary hover:bg-secondary/90' 
          : 'bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple'
        } min-w-[150px]`}
        onClick={handleClick}
        disabled={isSubmitting || isClicking || !content || !mainKeyword || !title.trim()}
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
