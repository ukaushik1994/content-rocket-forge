import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { History, Clock, TrendingUp, Star, ChevronRight, Zap, Target } from 'lucide-react';
import { getOptimizationHistory, OptimizationLog } from '@/services/contentOptimizationService';
import { formatDistanceToNow } from 'date-fns';

export function OptimizationHistory() {
  const [history, setHistory] = useState<OptimizationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<OptimizationLog | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const logs = await getOptimizationHistory(20);
      setHistory(logs);
    } catch (error) {
      console.error('Failed to load optimization history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSuccessRate = () => {
    if (history.length === 0) return 0;
    const successful = history.filter(log => log.success).length;
    return Math.round((successful / history.length) * 100);
  };

  const getTotalOptimizations = () => {
    return history.reduce((total, log) => total + log.suggestionsApplied.length, 0);
  };

  const getAverageRating = () => {
    const ratedLogs = history.filter(log => log.feedbackScore);
    if (ratedLogs.length === 0) return 0;
    const total = ratedLogs.reduce((sum, log) => sum + (log.feedbackScore || 0), 0);
    return (total / ratedLogs.length).toFixed(1);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Loading optimization history...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-500">{history.length}</div>
            <div className="text-xs text-muted-foreground">Sessions</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-500">{getSuccessRate()}%</div>
            <div className="text-xs text-muted-foreground">Success Rate</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-500">{getTotalOptimizations()}</div>
            <div className="text-xs text-muted-foreground">Optimizations</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-500">{getAverageRating()}</div>
            <div className="text-xs text-muted-foreground">Avg Rating</div>
          </CardContent>
        </Card>
      </div>

      {/* History List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Recent Optimization Sessions
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-0">
          {history.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No optimization history yet.</p>
              <p className="text-sm">Start optimizing content to see your history here.</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-1 p-4">
                {history.map((log, index) => (
                  <div key={log.id}>
                    <div
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => setSelectedLog(selectedLog?.id === log.id ? null : log)}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`p-2 rounded-lg ${
                          log.success 
                            ? 'bg-green-500/20 text-green-500' 
                            : 'bg-red-500/20 text-red-500'
                        }`}>
                          {log.success ? (
                            <Zap className="h-4 w-4" />
                          ) : (
                            <Target className="h-4 w-4" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              Session {index + 1}
                            </span>
                            <Badge variant={log.success ? "default" : "secondary"} className="text-xs">
                              {log.suggestionsApplied.length} applied
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                            {log.feedbackScore && (
                              <div className="flex items-center gap-1 ml-2">
                                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                                <span>{log.feedbackScore}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${
                        selectedLog?.id === log.id ? 'rotate-90' : ''
                      }`} />
                    </div>
                    
                    {selectedLog?.id === log.id && (
                      <div className="ml-6 p-4 bg-muted/30 rounded-lg border border-border/50 mb-2">
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Content Length:</span>
                              <span className="ml-2 font-medium">
                                {log.originalContentLength} → {log.optimizedContentLength || 'N/A'}
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Settings:</span>
                              <span className="ml-2 font-medium">
                                {log.optimizationSettings.tone} / {log.optimizationSettings.audience}
                              </span>
                            </div>
                          </div>
                          
                          {log.userFeedback && (
                            <div>
                              <span className="text-sm text-muted-foreground">Feedback:</span>
                              <p className="text-sm mt-1 text-foreground/80">{log.userFeedback}</p>
                            </div>
                          )}
                          
                          <div>
                            <span className="text-sm text-muted-foreground">Applied Suggestions:</span>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {log.suggestionsApplied.map((suggestion, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {suggestion.title}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {index < history.length - 1 && <Separator className="my-2" />}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}