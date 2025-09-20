import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNotificationIntegrations } from '@/hooks/use-notification-integrations';
import { toast } from 'sonner';
import { 
  FileText, 
  Search, 
  Brain, 
  BarChart3, 
  Settings,
  Sparkles
} from 'lucide-react';

export const NotificationDemo: React.FC = () => {
  const notifications = useNotificationIntegrations();

  const demoNotifications = [
    {
      category: 'Content Builder',
      icon: <FileText className="h-4 w-4" />,
      color: 'bg-blue-500/10 text-blue-600',
      actions: [
        {
          label: 'Generation Started',
          action: () => notifications.contentBuilder?.notifyContentGenerationStarted('Ultimate SEO Guide'),
        },
        {
          label: 'Generation Complete',
          action: () => notifications.contentBuilder?.notifyContentGenerationComplete('Ultimate SEO Guide', 'content-123'),
        },
        {
          label: 'SERP Analysis Done',
          action: () => notifications.contentBuilder?.notifySerpAnalysisComplete('SEO best practices', 25),
        },
        {
          label: 'Content Optimized',
          action: () => notifications.contentBuilder?.notifyOptimizationComplete('Ultimate SEO Guide'),
        },
      ],
    },
    {
      category: 'Research',
      icon: <Search className="h-4 w-4" />,
      color: 'bg-green-500/10 text-green-600',
      actions: [
        {
          label: 'Keyword Research Done',
          action: () => notifications.research?.notifyKeywordResearchComplete('content marketing', 150),
        },
        {
          label: 'Opportunity Found',
          action: () => notifications.research?.notifyOpportunityFound('High-value', 'AI tools', 'High'),
        },
        {
          label: 'Content Gaps Found',
          action: () => notifications.research?.notifyContentGapAnalysisComplete(12),
        },
        {
          label: 'Topic Clusters Created',
          action: () => notifications.research?.notifyTopicClustersGenerated(8),
        },
      ],
    },
    {
      category: 'Content Management',
      icon: <Brain className="h-4 w-4" />,
      color: 'bg-purple-500/10 text-purple-600',
      actions: [
        {
          label: 'Submitted for Review',
          action: () => notifications.contentManagement?.notifyContentSubmittedForApproval('Marketing Strategy Guide', 'content-456'),
        },
        {
          label: 'Content Approved',
          action: () => notifications.contentManagement?.notifyContentApproved('Marketing Strategy Guide', 'John Smith'),
        },
        {
          label: 'Content Rejected',
          action: () => notifications.contentManagement?.notifyContentRejected('Blog Post Draft', 'Needs more examples and better structure'),
        },
        {
          label: 'Content Published',
          action: () => notifications.contentManagement?.notifyContentPublished('Ultimate SEO Guide', 'https://example.com/seo-guide'),
        },
        {
          label: 'Export Complete',
          action: () => notifications.contentManagement?.notifyExportComplete('PDF', 'content-export-2024.pdf', 'https://example.com/download/content-export-2024.pdf'),
        },
      ],
    },
    {
      category: 'AI Analytics',
      icon: <BarChart3 className="h-4 w-4" />,
      color: 'bg-orange-500/10 text-orange-600',
      actions: [
        {
          label: 'Analysis Complete',
          action: () => notifications.aiAnalytics?.notifyAIAnalysisComplete('SEO Performance', 15),
        },
        {
          label: 'Smart Action Executed',
          action: () => notifications.aiAnalytics?.notifySmartActionTriggered('Smart keyword optimization', 'Updated 25 keywords with improved targeting'),
        },
        {
          label: 'Performance Alert (Up)',
          action: () => notifications.aiAnalytics?.notifyPerformanceAlert('Organic Traffic', '+25%', 'up'),
        },
        {
          label: 'Performance Alert (Down)',
          action: () => notifications.aiAnalytics?.notifyPerformanceAlert('Click-through Rate', '-15%', 'down'),
        },
      ],
    },
    {
      category: 'System',
      icon: <Settings className="h-4 w-4" />,
      color: 'bg-gray-500/10 text-gray-600',
      actions: [
        {
          label: 'System Update',
          action: () => notifications.system?.notifySystemUpdate('v2.1.0', ['New AI features', 'Performance improvements', 'Bug fixes']),
        },
        {
          label: 'Maintenance Scheduled',
          action: () => notifications.system?.notifyMaintenanceScheduled('Tomorrow at 2 AM EST', '2 hours'),
        },
        {
          label: 'Settings Saved',
          action: () => notifications.system?.notifySettingsSaved('Notification Preferences'),
        },
      ],
    },
  ];

  const handleDemoAction = async (action: () => Promise<void> | void) => {
    try {
      await action();
      toast.success('Notification sent! Check the notification bell.');
    } catch (error) {
      toast.error('Failed to send notification');
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          Notification System Demo
        </h2>
        <p className="text-muted-foreground">
          Try out different notification types to see how they appear in the notification center
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {demoNotifications.map((category) => (
          <Card key={category.category} className="h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className={`p-2 rounded-lg ${category.color}`}>
                  {category.icon}
                </div>
                {category.category}
                <Badge variant="outline" className="ml-auto text-xs">
                  {category.actions.length} demos
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {category.actions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs h-8"
                  onClick={() => handleDemoAction(action.action)}
                >
                  {action.label}
                </Button>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-lg">How to Use</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Click any demo button above to trigger a notification</p>
          <p>• Check the notification bell (top-right) to see new notifications</p>
          <p>• Each notification includes relevant actions and context</p>
          <p>• Notifications are grouped by module and priority</p>
          <p>• Use the search and filters in the notification center</p>
        </CardContent>
      </Card>
    </div>
  );
};