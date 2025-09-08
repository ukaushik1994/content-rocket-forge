import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Star, ThumbsUp, ThumbsDown, MessageSquare, Send, Sparkles } from 'lucide-react';
import { updateOptimizationFeedback } from '@/services/contentOptimizationService';
import { toast } from 'sonner';

interface OptimizationFeedbackProps {
  logId: string;
  originalContent: string;
  optimizedContent: string;
  appliedSuggestions: number;
  onFeedbackSubmitted?: () => void;
}

export function OptimizationFeedback({
  logId,
  originalContent,
  optimizedContent,
  appliedSuggestions,
  onFeedbackSubmitted
}: OptimizationFeedbackProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleRatingClick = (selectedRating: number) => {
    setRating(selectedRating);
  };

  const handleSubmitFeedback = async () => {
    if (!rating) {
      toast.error('Please provide a rating before submitting.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const optimizationResults = {
        contentLengthChange: optimizedContent.length - originalContent.length,
        wordCountChange: optimizedContent.split(' ').length - originalContent.split(' ').length,
        appliedSuggestions,
        improvementAreas: rating >= 4 ? ['effective'] : rating >= 3 ? ['moderate'] : ['needs_improvement']
      };

      const success = await updateOptimizationFeedback(
        logId,
        rating,
        feedback,
        optimizationResults
      );

      if (success) {
        setSubmitted(true);
        toast.success('Thank you for your feedback! This helps us improve our optimization suggestions.');
        onFeedbackSubmitted?.();
      } else {
        toast.error('Failed to submit feedback. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingText = (stars: number) => {
    switch (stars) {
      case 5: return 'Excellent - Significantly improved my content';
      case 4: return 'Good - Made valuable improvements';
      case 3: return 'Average - Some helpful changes';
      case 2: return 'Poor - Limited improvements';
      case 1: return 'Very Poor - Did not help';
      default: return '';
    }
  };

  if (submitted) {
    return (
      <Card className="border-green-500/20 bg-green-500/5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center text-center">
            <div className="flex items-center gap-3 text-green-600">
              <div className="p-2 bg-green-100 rounded-full dark:bg-green-900/30">
                <ThumbsUp className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Feedback Submitted Successfully</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your input helps improve our AI optimization engine
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          How was the optimization?
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Your feedback helps us improve AI suggestions for everyone
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Optimization Summary */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-background/40 rounded-lg border border-white/10">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{appliedSuggestions}</div>
            <div className="text-xs text-muted-foreground">Suggestions Applied</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">
              {optimizedContent.length - originalContent.length > 0 ? '+' : ''}
              {optimizedContent.length - originalContent.length}
            </div>
            <div className="text-xs text-muted-foreground">Characters Changed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">
              {optimizedContent.split(' ').length - originalContent.split(' ').length > 0 ? '+' : ''}
              {optimizedContent.split(' ').length - originalContent.split(' ').length}
            </div>
            <div className="text-xs text-muted-foreground">Words Changed</div>
          </div>
        </div>

        <Separator />

        {/* Rating Section */}
        <div>
          <label className="text-sm font-medium mb-3 block">
            Rate the optimization quality:
          </label>
          <div className="flex items-center gap-2 mb-2">
            {[1, 2, 3, 4, 5].map((stars) => (
              <button
                key={stars}
                onClick={() => handleRatingClick(stars)}
                className={`p-2 rounded-lg transition-all ${
                  rating && rating >= stars
                    ? 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30'
                    : 'text-gray-400 hover:text-yellow-400 bg-background/60 border-white/10'
                } border`}
              >
                <Star className={`h-5 w-5 ${rating && rating >= stars ? 'fill-current' : ''}`} />
              </button>
            ))}
          </div>
          {rating && (
            <Badge variant="secondary" className="text-xs">
              {getRatingText(rating)}
            </Badge>
          )}
        </div>

        {/* Comment Section */}
        <div>
          <label htmlFor="feedback" className="text-sm font-medium mb-2 block">
            Additional comments (optional):
          </label>
          <Textarea
            id="feedback"
            placeholder="What worked well? What could be improved? Any specific suggestions that were particularly helpful or unhelpful?"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="min-h-[100px] bg-background/60 border-white/20"
          />
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmitFeedback}
          disabled={!rating || isSubmitting}
          className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Submit Feedback
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}