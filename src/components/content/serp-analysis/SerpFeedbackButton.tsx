
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useFeedback } from '@/contexts/FeedbackContext';

interface SerpFeedbackButtonProps {
  itemType: string;
  itemContent: string;
}

export function SerpFeedbackButton({ itemType, itemContent }: SerpFeedbackButtonProps) {
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);
  const { openFeedback } = useFeedback();
  
  const handleFeedback = (type: 'positive' | 'negative') => {
    setFeedback(type);
    
    if (type === 'positive') {
      toast.success('Thanks for your feedback!', {
        description: 'We\'ll use this to improve our recommendations'
      });
    } else {
      // Open feedback form for negative feedback
      openFeedback();
      toast('Help us improve', {
        description: 'Please tell us how we can make this better',
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Button 
          size="sm" 
          variant="ghost" 
          className={`rounded-full p-1 h-7 w-7 ${feedback === 'positive' ? 'bg-green-500/20 text-green-400' : ''}`}
          onClick={() => handleFeedback('positive')}
        >
          <ThumbsUp className="h-3.5 w-3.5" />
        </Button>
      </motion.div>
      
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Button 
          size="sm" 
          variant="ghost" 
          className={`rounded-full p-1 h-7 w-7 ${feedback === 'negative' ? 'bg-red-500/20 text-red-400' : ''}`}
          onClick={() => handleFeedback('negative')}
        >
          <ThumbsDown className="h-3.5 w-3.5" />
        </Button>
      </motion.div>
    </div>
  );
}
