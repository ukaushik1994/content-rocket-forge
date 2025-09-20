import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MessageSquare, TrendingUp, User } from 'lucide-react';
import { FeedbackData } from '@/services/promptEnhancementService';

interface FeedbackStatsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feedback: FeedbackData[];
  formatType?: string;
}

export function FeedbackStatsDialog({ open, onOpenChange, feedback, formatType }: FeedbackStatsDialogProps) {
  // Group feedback by action type
  const feedbackByAction = feedback.reduce((acc, item) => {
    const action = item.action || 'unknown';
    if (!acc[action]) acc[action] = [];
    acc[action].push(item);
    return acc;
  }, {} as Record<string, FeedbackData[]>);

  // Get most recent feedback
  const recentFeedback = feedback.slice(0, 5);

  // Get feedback frequency over time
  const feedbackByDay = feedback.reduce((acc, item) => {
    const date = new Date(item.created_at).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const actionColors: Record<string, string> = {
    'reject': 'destructive',
    'request_changes': 'secondary',
    'approve': 'default',
    'submit': 'outline'
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Feedback Analytics {formatType && `- ${formatType}`}
          </DialogTitle>
          <DialogDescription>
            Overview of approval feedback from the last 30 days
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{feedback.length}</div>
                <p className="text-xs text-muted-foreground">
                  Last 30 days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unique Days</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Object.keys(feedbackByDay).length}</div>
                <p className="text-xs text-muted-foreground">
                  Active days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Per Day</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Object.keys(feedbackByDay).length > 0 
                    ? (feedback.length / Object.keys(feedbackByDay).length).toFixed(1)
                    : '0'
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Feedback per day
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Most Common</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-sm font-bold">
                  {Object.entries(feedbackByAction).sort(([,a], [,b]) => b.length - a.length)[0]?.[0] || 'None'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Action type
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Feedback by Action Type */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Feedback by Action Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {Object.entries(feedbackByAction).map(([action, items]) => (
                  <Badge 
                    key={action} 
                    variant={actionColors[action] as any || 'outline'}
                    className="text-xs"
                  >
                    {action}: {items.length}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Feedback */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentFeedback.length > 0 ? (
                  recentFeedback.map((item, index) => (
                    <div key={item.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                      <Badge variant={actionColors[item.action] as any || 'outline'} className="text-xs">
                        {item.action}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-muted-foreground truncate">
                          {item.notes || 'No additional notes'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(item.created_at).toLocaleDateString()} at {new Date(item.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No recent feedback available</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Feedback Timeline */}
          {Object.keys(feedbackByDay).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Daily Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1">
                  {Object.entries(feedbackByDay)
                    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
                    .slice(-14) // Show last 14 days
                    .map(([date, count]) => (
                      <div 
                        key={date} 
                        className="flex flex-col items-center p-2 bg-muted/30 rounded text-center"
                      >
                        <div className="text-xs font-medium">{count}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}