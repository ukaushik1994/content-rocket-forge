
import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { toast } from 'sonner';

interface SerpFeedbackButtonProps extends ButtonProps {
  feedbackType: 'positive' | 'negative'; // Renamed from 'type' to 'feedbackType'
  onFeedback?: (feedbackType: 'positive' | 'negative') => void;
}

export function SerpFeedbackButton({ 
  feedbackType, // Updated property name
  onFeedback = () => {},
  ...props 
}: SerpFeedbackButtonProps) {
  const handleFeedback = () => {
    onFeedback(feedbackType);
    toast.success(`Thanks for your ${feedbackType === 'positive' ? 'positive' : 'negative'} feedback!`);
  };
  
  return (
    <Button
      variant="outline"
      size="sm"
      className={`h-8 px-3 border-white/10 
        ${feedbackType === 'positive' 
          ? 'hover:border-green-500/50 hover:bg-green-500/10' 
          : 'hover:border-red-500/50 hover:bg-red-500/10'
        }`}
      onClick={handleFeedback}
      {...props}
    >
      {feedbackType === 'positive' 
        ? <ThumbsUp className="h-4 w-4" /> 
        : <ThumbsDown className="h-4 w-4" />
      }
    </Button>
  );
}
