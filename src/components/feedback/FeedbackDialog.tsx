
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ThumbsUp, ThumbsDown, Lightbulb, Bug, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeedbackDialog({ open, onOpenChange }: FeedbackDialogProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Thank you for your feedback!');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md glass-panel">
        <DialogHeader>
          <DialogTitle className="text-gradient">Share Your Feedback</DialogTitle>
          <DialogDescription>
            Help us improve ContentRocketForge. Your insights make a difference!
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <div className="text-sm font-medium mb-2">How was your experience?</div>
              <div className="flex space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1 space-x-2 hover:border-neon-purple hover:text-neon-purple"
                >
                  <ThumbsUp className="h-4 w-4" />
                  <span>Positive</span>
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1 space-x-2 hover:border-neon-orange hover:text-neon-orange"
                >
                  <ThumbsDown className="h-4 w-4" />
                  <span>Negative</span>
                </Button>
              </div>
            </div>
            
            <div>
              <div className="text-sm font-medium mb-2">Feedback type</div>
              <RadioGroup defaultValue="suggestion" className="grid grid-cols-3 gap-2">
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
              />
            </div>
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple"
            >
              Submit Feedback
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
