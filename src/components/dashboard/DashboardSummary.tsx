import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  Target, 
  Lightbulb, 
  ArrowRight, 
  Calendar,
  FileText,
  Book,
  Zap,
  AlertCircle,
  CheckCircle,
  Info,
  ExternalLink
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

interface DashboardSummaryData {
  content_created: {
    glossary: number;
    blog: number;
    article: number;
    strategy: number;
  };
  top_performer?: {
    title: string;
    views: number;
    type: string;
    url: string;
    growth: number;
  };
  progress: {
    goal: {
      blog: number;
      glossary: number;
      article: number;
      strategy: number;
    };
    achieved: {
      blog: number;
      glossary: number;
      article: number;
      strategy: number;
    };
    percentage: number;
  };
  next_moves: Array<{
    cluster: string;
    type: string;
    volume: number;
    priority: string;
    cta: string;
  }>;
  encouragement: string;
  alerts: Array<{
    id: string;
    message: string;
    category: 'info' | 'warning' | 'success' | 'error';
    action_url?: string;
    action_label?: string;
  }>;
  month: string;
}

export const DashboardSummary = () => {
  const [data, setData] = useState<DashboardSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardSummary();
  }, []);

  const fetchDashboardSummary = async () => {
    try {
      const { data: response, error } = await supabase.functions.invoke('dashboard-summary');
      
      if (error) throw error;
      
      setData(response);
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      toast({
        title: "Error loading dashboard",
        description: "Failed to load dashboard data. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getAlertIcon = (category: string) => {
    switch (category) {
      case 'success': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertCircle className="w-4 h-4" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'blog': return <FileText className="w-4 h-4" />;
      case 'article': return <FileText className="w-4 h-4" />;
      case 'glossary': return <Book className="w-4 h-4" />;
      case 'strategy': return <Zap className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No dashboard data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alerts Section */}
      {data.alerts.length > 0 && (
        <div className="space-y-2">
          {data.alerts.map((alert) => (
            <Alert key={alert.id} variant={alert.category === 'error' ? 'destructive' : 'default'}>
              {getAlertIcon(alert.category)}
              <AlertDescription className="flex justify-between items-center">
                <span>{alert.message}</span>
                {alert.action_url && alert.action_label && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={alert.action_url}>
                      {alert.action_label}
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Progress Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Blog Posts</p>
                <p className="text-2xl font-bold">
                  {data.content_created.blog}/{data.progress.goal.blog}
                </p>
              </div>
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <Progress 
              value={(data.content_created.blog / Math.max(data.progress.goal.blog, 1)) * 100} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Articles</p>
                <p className="text-2xl font-bold">
                  {data.content_created.article}/{data.progress.goal.article}
                </p>
              </div>
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <Progress 
              value={(data.content_created.article / Math.max(data.progress.goal.article, 1)) * 100} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Glossary Terms</p>
                <p className="text-2xl font-bold">
                  {data.content_created.glossary}/{data.progress.goal.glossary}
                </p>
              </div>
              <Book className="w-8 h-8 text-muted-foreground" />
            </div>
            <Progress 
              value={(data.content_created.glossary / Math.max(data.progress.goal.glossary, 1)) * 100} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overall Progress</p>
                <p className="text-2xl font-bold">{data.progress.percentage}%</p>
              </div>
              <Target className="w-8 h-8 text-muted-foreground" />
            </div>
            <Progress value={data.progress.percentage} className="mt-2" />
          </CardContent>
        </Card>
      </motion.div>

      {/* Top Performer & Next Moves */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performer */}
        {data.top_performer && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Top Performing Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold truncate">{data.top_performer.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {getContentTypeIcon(data.top_performer.type)}
                    <span className="capitalize">{data.top_performer.type}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">{data.top_performer.views}</p>
                    <p className="text-xs text-muted-foreground">views last 7 days</p>
                  </div>
                  {data.top_performer.growth > 0 && (
                    <Badge variant="secondary" className="text-green-600">
                      +{data.top_performer.growth}%
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href={data.top_performer.url}>
                      View Content
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </Button>
                  <Button variant="outline" size="sm">
                    Repurpose
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Next Best Moves */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Next Best Moves
            </CardTitle>
            <CardDescription>
              AI-identified opportunities based on your content gaps
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.next_moves.length > 0 ? (
                data.next_moves.map((move, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm truncate">{move.cluster}</h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {getContentTypeIcon(move.type)}
                        <span className="capitalize">{move.type}</span>
                        <span>•</span>
                        <span>{move.volume.toLocaleString()} volume</span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      {move.cta}
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No new opportunities available. Great job staying on top of your content strategy!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Encouragement Message */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">{data.encouragement}</p>
              <p className="text-sm text-muted-foreground">
                Based on your {new Date(data.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} progress
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};