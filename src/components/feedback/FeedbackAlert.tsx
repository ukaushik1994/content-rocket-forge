
import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { MessageSquarePlus, X } from 'lucide-react';
import { useFeedback } from '@/contexts/FeedbackContext';
import { motion } from 'framer-motion';

interface FeedbackAlertProps {
  className?: string;
}

export function FeedbackAlert({ className }: FeedbackAlertProps) {
  const [dismissed, setDismissed] = useState(false);
  const { openFeedback } = useFeedback();
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    // Show the feedback alert after a delay
    const timer = setTimeout(() => {
      const hasSeenFeedbackAlert = localStorage.getItem('hasSeenFeedbackAlert');
      if (!hasSeenFeedbackAlert) {
        setShowAlert(true);
      }
    }, 60000); // Show after 1 minute

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('hasSeenFeedbackAlert', 'true');
    setTimeout(() => setShowAlert(false), 300);
  };

  const handleOpenFeedback = () => {
    openFeedback();
    handleDismiss();
  };

  if (!showAlert) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: dismissed ? 0 : 1, y: dismissed ? 20 : 0 }}
      transition={{ duration: 0.3 }}
      className={`${className}`}
    >
      <Alert className="glass-panel border border-primary/20 shadow-lg backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <AlertDescription className="flex-1">
            <div className="flex items-center gap-2">
              <MessageSquarePlus className="h-4 w-4 text-primary" />
              <span>We'd love to hear your thoughts! How has your experience been with Cr3ate?</span>
            </div>
          </AlertDescription>
          <div className="flex items-center gap-2 ml-4">
            <Button size="sm" variant="outline" onClick={handleDismiss} className="h-8">
              <X className="h-3 w-3" />
            </Button>
            <Button size="sm" onClick={handleOpenFeedback} className="h-8 bg-primary">
              Share Feedback
            </Button>
          </div>
        </div>
      </Alert>
    </motion.div>
  );
}
