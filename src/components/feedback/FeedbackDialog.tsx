
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ThumbsUp, ThumbsDown, Lightbulb, Bug, MessageCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeedbackDialog({ open, onOpenChange }: FeedbackDialogProps) {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [sentiment, setSentiment] = useState<'positive' | 'negative'>('positive');
  const [type, setType] = useState<'suggestion' | 'bug' | 'other'>('suggestion');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('feedback')
        .insert({
          message,
          sentiment,
          type,
          user_id: user?.id || null,
          status: 'unread'
        });
      
      if (error) throw error;
      
      toast.success('Thank you for your feedback!');
      onOpenChange(false);
      setMessage('');
      setSentiment('positive');
      setType('suggestion');
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      toast.error(error.message || 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md glass-panel">
        <DialogHeader>
          <DialogTitle className="text-gradient">Share Your Feedback</DialogTitle>
          <DialogDescription>
            Help us improve Cr3ate. Your insights make a difference!
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <div className="text-sm font-medium mb-2">How was your experience?</div>
              <div className="flex space-x-4">
                <Button 
                  type="button" 
                  variant={sentiment === 'positive' ? 'default' : 'outline'}
                  className={`flex-1 space-x-2 ${sentiment === 'positive' ? 'bg-green-500 hover:bg-green-600' : 'hover:border-neon-purple hover:text-neon-purple'}`}
                  onClick={() => setSentiment('positive')}
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span>Positive</span>
                </Button>
                <Button 
                  type="button" 
                  variant={sentiment === 'negative' ? 'default' : 'outline'}
                  className={`flex-1 space-x-2 ${sentiment === 'negative' ? 'bg-orange-500 hover:bg-orange-600' : 'hover:border-neon-orange hover:text-neon-orange'}`}
                  onClick={() => setSentiment('negative')}
                >
                  <ThumbsDown className="h-4 w-4" />
                  <span>Negative</span>
                </Button>
              </div>
            </div>
            
            <div>
              <div className="text-sm font-medium mb-2">Feedback type</div>
              <RadioGroup value={type} onValueChange={(value) => setType(value as 'suggestion' | 'bug' | 'other')} className="grid grid-cols-3 gap-2">
                <div>
                  <RadioGroupItem 
                    value="suggestion" 
                    id="suggestion" 
                    className="peer sr-only" 
                  />
                  <Label
                    htmlFor="suggestion"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-glass p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <Lightbulb className="mb-1 h-4 w-4" />
                    <span className="text-xs">Suggestion</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem 
                    value="bug" 
                    id="bug" 
                    className="peer sr-only" 
                  />
                  <Label
                    htmlFor="bug"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-glass p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <Bug className="mb-1 h-4 w-4" />
                    <span className="text-xs">Bug Report</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem 
                    value="other" 
                    id="other" 
                    className="peer sr-only" 
                  />
                  <Label
                    htmlFor="other"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-glass p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <MessageCircle className="mb-1 h-4 w-4" />
                    <span className="text-xs">Other</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="feedback-message">Your message</Label>
              <Textarea 
                id="feedback-message" 
                placeholder="Tell us what you think..." 
                className="min-h-[120px] bg-glass border-white/10"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Feedback'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
