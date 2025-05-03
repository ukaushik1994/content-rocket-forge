
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquarePlus } from 'lucide-react';
import { FeedbackDialog } from './FeedbackDialog';
import { toast } from 'sonner';

interface FeedbackButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
}

export function FeedbackButton({ className, variant = 'ghost' }: FeedbackButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const openFeedback = () => {
    setDialogOpen(true);
    toast.info('We appreciate your feedback!', {
      description: 'Help us improve ContentRocketForge'
    });
  };

  return (
    <>
      <Button 
        variant={variant} 
        size="sm" 
        onClick={openFeedback}
        className={`gap-1.5 ${className || ''}`}
      >
        <MessageSquarePlus className="h-4 w-4" />
        <span>Feedback</span>
      </Button>

      <FeedbackDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
      />
    </>
  );
}
