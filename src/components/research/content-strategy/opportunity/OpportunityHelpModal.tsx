import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HelpCircle, Search, Brain, TrendingUp, Calendar, FileText, Settings } from 'lucide-react';

interface OpportunityHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OpportunityHelpModal: React.FC<OpportunityHelpModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <HelpCircle className="h-5 w-5 mr-2 text-neon-purple" />
            OpportunityHunter Guide
          </DialogTitle>
          <DialogDescription>
            Learn how to use OpportunityHunter to discover and capitalize on content opportunities
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overview */}
          <Card className="border-white/10 bg-glass">
            <CardHeader>
              <CardTitle className="text-lg">What is OpportunityHunter?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground">
                OpportunityHunter is an AI-powered content opportunity discovery system that automatically identifies 
                high-potential keywords and content gaps in your market. It analyzes SERP data, competition, and trends 
                to help you create content that ranks well and drives traffic.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-neon-purple" />
                  <span className="text-sm">SERP Analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-green-400" />
                  <span className="text-sm">AI Optimization</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-orange-400" />
                  <span className="text-sm">Trend Detection</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-white/10 bg-glass">
              <CardHeader>
                <CardTitle className="text-base flex items-center">
                  <Search className="h-4 w-4 mr-2 text-neon-purple" />
                  Opportunity Discovery
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Automatically scans for content opportunities based on:
                </p>
                <ul className="text-sm space-y-1">
                  <li>• Search volume and keyword difficulty</li>
                  <li>• Content gaps in existing articles</li>
                  <li>• SERP feature opportunities</li>
                  <li>• Rising trend detection</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-glass">
              <CardHeader>
                <CardTitle className="text-base flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-blue-400" />
                  AI Brief Generation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Generate comprehensive content briefs with:
                </p>
                <ul className="text-sm space-y-1">
                  <li>• Suggested article outlines</li>
                  <li>• Internal linking opportunities</li>
                  <li>• FAQ sections from PAA data</li>
                  <li>• SEO optimization recommendations</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-glass">
              <CardHeader>
                <CardTitle className="text-base flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-green-400" />
                  Smart Scheduling
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Automatically prioritize and schedule content:
                </p>
                <ul className="text-sm space-y-1">
                  <li>• Opportunity scoring algorithm</li>
                  <li>• Calendar integration</li>
                  <li>• Deadline management</li>
                  <li>• Team assignment</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-glass">
              <CardHeader>
                <CardTitle className="text-base flex items-center">
                  <Settings className="h-4 w-4 mr-2 text-orange-400" />
                  Advanced Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Customize the discovery process:
                </p>
                <ul className="text-sm space-y-1">
                  <li>• Scan frequency preferences</li>
                  <li>• Keyword filters and exclusions</li>
                  <li>• Content format preferences</li>
                  <li>• Notification settings</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Priority Levels */}
          <Card className="border-white/10 bg-glass">
            <CardHeader>
              <CardTitle className="text-lg">Understanding Priority Levels</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Badge className="bg-red-500/20 text-red-300 border-red-500/30">High Priority</Badge>
                  <p className="text-sm text-muted-foreground">
                    Low competition, high search volume, trending upward. These opportunities should be addressed first.
                  </p>
                </div>
                <div className="space-y-2">
                  <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">Medium Priority</Badge>
                  <p className="text-sm text-muted-foreground">
                    Balanced opportunity score with moderate competition. Good for building topical authority.
                  </p>
                </div>
                <div className="space-y-2">
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Low Priority</Badge>
                  <p className="text-sm text-muted-foreground">
                    Higher competition or lower search volume. Consider for long-term content strategy.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Getting Started */}
          <Card className="border-white/10 bg-glass">
            <CardHeader>
              <CardTitle className="text-lg">Getting Started</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ol className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="bg-neon-purple text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">1</span>
                  <div>
                    <strong>Configure Settings:</strong> Set your scan frequency, content preferences, and exclusion keywords in the Settings tab.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-neon-purple text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">2</span>
                  <div>
                    <strong>Run Initial Scan:</strong> Click "Scan for Opportunities" to discover your first batch of content opportunities.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-neon-purple text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">3</span>
                  <div>
                    <strong>Review Opportunities:</strong> Use filters to find the most relevant opportunities for your content strategy.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-neon-purple text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">4</span>
                  <div>
                    <strong>Generate Briefs:</strong> Click "Generate Brief" on high-priority opportunities to create detailed content plans.
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-neon-purple text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">5</span>
                  <div>
                    <strong>Schedule Content:</strong> Add approved opportunities to your content calendar for organized execution.
                  </div>
                </li>
              </ol>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={onClose} className="bg-neon-purple hover:bg-neon-blue">
              Got It!
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};