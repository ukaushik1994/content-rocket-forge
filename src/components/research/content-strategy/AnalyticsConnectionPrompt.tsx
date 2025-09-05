import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  ExternalLink, 
  Settings,
  AlertCircle,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface AnalyticsConnectionPromptProps {
  hasGoogleAnalytics: boolean;
  hasSearchConsole: boolean;
  hasPublishedContent: boolean;
  className?: string;
}

export const AnalyticsConnectionPrompt = ({
  hasGoogleAnalytics,
  hasSearchConsole,
  hasPublishedContent,
  className = ""
}: AnalyticsConnectionPromptProps) => {
  const missingAnalytics = !hasGoogleAnalytics;
  const missingSearchConsole = !hasSearchConsole;
  const needsContent = !hasPublishedContent;

  if (hasGoogleAnalytics && hasSearchConsole && hasPublishedContent) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card className="bg-gradient-to-br from-blue-950/30 to-purple-950/30 border-blue-500/30">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Zap className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-blue-100">Unlock Real Analytics Insights</CardTitle>
              <CardDescription className="text-blue-200/70">
                Connect your analytics to get accurate traffic data and performance insights
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            {missingAnalytics && (
              <div className="flex items-center justify-between p-3 bg-background/30 rounded-lg border border-border/30">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="font-medium text-blue-100">Google Analytics</p>
                    <p className="text-sm text-blue-200/70">Get real traffic and user behavior data</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-amber-500/20 text-amber-200 border-amber-500/30">
                  Required
                </Badge>
              </div>
            )}
            
            {missingSearchConsole && (
              <div className="flex items-center justify-between p-3 bg-background/30 rounded-lg border border-border/30">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                  <div>
                    <p className="font-medium text-green-100">Search Console</p>
                    <p className="text-sm text-green-200/70">Track search performance and keywords</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-200 border-blue-500/30">
                  Recommended
                </Badge>
              </div>
            )}

            {needsContent && (
              <div className="flex items-center justify-between p-3 bg-background/30 rounded-lg border border-border/30">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-400" />
                  <div>
                    <p className="font-medium text-amber-100">Published Content</p>
                    <p className="text-sm text-amber-200/70">Add published URLs to enable tracking</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-amber-500/20 text-amber-200 border-amber-500/30">
                  Needed
                </Badge>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button asChild className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-100 border-blue-500/30">
              <Link to="/settings?tab=api">
                <Settings className="h-4 w-4 mr-2" />
                Configure Analytics
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="border-blue-500/30 hover:bg-blue-500/10">
              <a 
                href="https://console.cloud.google.com/apis/credentials" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Get API Keys
              </a>
            </Button>
          </div>

          <div className="pt-2 border-t border-border/30">
            <p className="text-xs text-muted-foreground">
              <strong>Benefits:</strong> Real traffic data, accurate goal tracking, performance insights, and strategy optimization based on actual user behavior.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};