
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  HelpCircle, 
  Target, 
  Brain, 
  Users, 
  TrendingUp, 
  Search, 
  Zap,
  Clock
} from 'lucide-react';

interface OpportunityHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OpportunityHelpModal: React.FC<OpportunityHelpModalProps> = ({
  isOpen,
  onClose
}) => {
  const features = [
    {
      icon: Target,
      title: 'Smart Opportunity Detection',
      description: 'AI analyzes SERP data, competitor gaps, and search trends to identify high-value content opportunities automatically.',
      color: 'text-blue-500'
    },
    {
      icon: Brain,
      title: 'AIO-Friendly Analysis',
      description: 'Identifies opportunities optimized for AI Overview features, helping you capture featured snippet positions.',
      color: 'text-purple-500'
    },
    {
      icon: Users,
      title: 'Competitor Intelligence',
      description: 'Analyzes competitor content to identify gaps and weaknesses you can exploit with better content.',
      color: 'text-orange-500'
    },
    {
      icon: TrendingUp,
      title: 'Priority Scoring',
      description: 'Each opportunity gets a priority score based on search volume, difficulty, and competitive landscape.',
      color: 'text-green-500'
    }
  ];

  const workflows = [
    {
      step: 1,
      title: 'Discovery',
      description: 'AI scans for opportunities based on your seed keywords and competitor analysis',
      icon: Search
    },
    {
      step: 2,
      title: 'Analysis',
      description: 'Each opportunity is analyzed for priority, competitive advantage, and content format',
      icon: Brain
    },
    {
      step: 3,
      title: 'Brief Generation',
      description: 'Generate detailed content briefs with outlines, FAQs, and competitor insights',
      icon: Zap
    },
    {
      step: 4,
      title: 'Content Creation',
      description: 'Route opportunities directly to Content Builder for AI-assisted content creation',
      icon: TrendingUp
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-6 w-6" />
            Opportunity Hunter Guide
          </DialogTitle>
          <DialogDescription>
            Learn how to leverage AI-powered content opportunity discovery
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What is Opportunity Hunter?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Opportunity Hunter uses AI to automatically discover high-value content opportunities 
                by analyzing search trends, competitor gaps, and SERP features. It helps you identify 
                what content to create, when to create it, and how to optimize it for maximum impact.
              </p>
            </CardContent>
          </Card>

          {/* Key Features */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Key Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div key={feature.title} className="flex gap-3 p-3 border border-white/10 rounded-lg">
                      <div className="flex-shrink-0">
                        <Icon className={`h-5 w-5 ${feature.color}`} />
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">{feature.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Workflow */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workflows.map((workflow) => {
                  const Icon = workflow.icon;
                  return (
                    <div key={workflow.step} className="flex items-start gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-medium text-sm">
                        {workflow.step}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className="h-4 w-4 text-primary" />
                          <h4 className="font-medium">{workflow.title}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {workflow.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Priority Levels */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Understanding Priority Levels</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">High Priority</span>
                <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
                  Immediate action needed
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                High search volume, low competition, trending topics, or competitor weaknesses you can exploit quickly.
              </p>

              <div className="flex items-center justify-between">
                <span className="font-medium">Medium Priority</span>
                <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                  Plan for next sprint
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Good opportunities with moderate competition or search volume. Perfect for steady content pipeline.
              </p>

              <div className="flex items-center justify-between">
                <span className="font-medium">Low Priority</span>
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                  Long-term strategy
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Lower volume keywords or highly competitive topics. Good for comprehensive content coverage.
              </p>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pro Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Set up automated scanning</p>
                  <p className="text-xs text-muted-foreground">
                    Configure seed keywords and scan frequency in Settings to continuously discover new opportunities.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Brain className="h-4 w-4 text-purple-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Focus on AIO-friendly opportunities</p>
                  <p className="text-xs text-muted-foreground">
                    These are optimized for AI Overview features and can drive significant traffic gains.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="h-4 w-4 text-orange-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Leverage competitor intelligence</p>
                  <p className="text-xs text-muted-foreground">
                    Look for opportunities with detailed competitor analysis to find content gaps you can fill.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
