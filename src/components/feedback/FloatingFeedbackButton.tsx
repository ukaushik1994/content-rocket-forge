
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquarePlus } from 'lucide-react';
import { FeedbackDialog } from './FeedbackDialog';
import { useFeedback } from '@/contexts/FeedbackContext';
import { motion } from 'framer-motion';

export function FloatingFeedbackButton() {
  const { isOpen, openFeedback, closeFeedback } = useFeedback();

  return (
    <>
      <motion.div 
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
      >
        <Button 
          onClick={openFeedback}
          className="rounded-full w-12 h-12 p-0 shadow-lg bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple transition-all"
          aria-label="Open Feedback"
        >
          <MessageSquarePlus className="h-5 w-5" />
        </Button>
      </motion.div>

      <FeedbackDialog 
        open={isOpen} 
        onOpenChange={closeFeedback} 
      />
    </>
  );
}
