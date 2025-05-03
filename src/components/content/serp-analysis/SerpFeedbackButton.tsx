
import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { toast } from 'sonner';

interface SerpFeedbackButtonProps extends ButtonProps {
  type: 'positive' | 'negative';
  onFeedback?: (type: 'positive' | 'negative') => void;
}

export function SerpFeedbackButton({ 
  type, 
  onFeedback = () => {},
  ...props 
}: SerpFeedbackButtonProps) {
  const handleFeedback = () => {
    onFeedback(type);
    toast.success(`Thanks for your ${type === 'positive' ? 'positive' : 'negative'} feedback!`);
  };
  
  return (
    <Button
      variant="outline"
      size="sm"
      className={`h-8 px-3 border-white/10 
        ${type === 'positive' 
          ? 'hover:border-green-500/50 hover:bg-green-500/10' 
          : 'hover:border-red-500/50 hover:bg-red-500/10'
        }`}
      onClick={handleFeedback}
      {...props}
    >
      {type === 'positive' 
        ? <ThumbsUp className="h-4 w-4" /> 
        : <ThumbsDown className="h-4 w-4" />
      }
    </Button>
  );
}
