import { 
  NotificationHelper,
  createNotificationHelper 
} from '@/utils/notificationHelpers';
import {
  pushEnhancedAlert,
  NotificationPriority,
  NotificationType,
  ActionButton
} from '@/services/enhancedNotificationsService';

// Content Builder Notifications
export class ContentBuilderNotifications {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async notifyContentGenerationStarted(title: string) {
    await pushEnhancedAlert({
      userId: this.userId,
      title: 'Content Generation Started',
      message: `Started generating content for "${title}"`,
      module: 'content_builder',
      priority: 'medium',
      notificationType: 'info',
      actionButtons: [
        {
          id: 'view_progress',
          label: 'View Progress',
          action: 'navigate',
          url: '/content-builder',
          variant: 'primary'
        }
      ]
    });
  }

  async notifyContentGenerationComplete(title: string, contentId: string) {
    await pushEnhancedAlert({
      userId: this.userId,
      title: 'Content Ready for Review',
      message: `"${title}" has been generated and is ready for your review`,
      module: 'content_builder',
      priority: 'high',
      notificationType: 'success',
      actionButtons: [
        {
          id: 'review_content',
          label: 'Review Content',
          action: 'navigate',
          url: `/content-builder?id=${contentId}`,
          variant: 'primary'
        },
        {
          id: 'save_draft',
          label: 'Save Draft',
          action: 'save_draft',
          variant: 'secondary'
        }
      ]
    });
  }

  async notifyOptimizationComplete(title: string) {
    await pushEnhancedAlert({
      userId: this.userId,
      title: 'Content Optimized',
      message: `"${title}" has been optimized for better performance`,
      module: 'content_builder',
      priority: 'medium',
      notificationType: 'success'
    });
  }

  async notifySerpAnalysisComplete(keyword: string, resultsCount: number) {
    await pushEnhancedAlert({
      userId: this.userId,
      title: 'SERP Analysis Complete',
      message: `Found ${resultsCount} insights for "${keyword}"`,
      module: 'content_builder',
      priority: 'medium',
      notificationType: 'success',
      actionButtons: [
        {
          id: 'view_results',
          label: 'View Results',
          action: 'navigate',
          url: '/content-builder',
          variant: 'primary'
        }
      ]
    });
  }
}

// Research Module Notifications
export class ResearchNotifications {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async notifyKeywordResearchComplete(keyword: string, resultsCount: number) {
    await pushEnhancedAlert({
      userId: this.userId,
      title: 'Keyword Research Complete',
      message: `Found ${resultsCount} keyword opportunities for "${keyword}"`,
      module: 'research',
      priority: 'medium',
      notificationType: 'success',
      actionButtons: [
        {
          id: 'view_keywords',
          label: 'View Keywords',
          action: 'navigate',
          url: '/research/content-strategy',
          variant: 'primary'
        },
        {
          id: 'export_data',
          label: 'Export',
          action: 'export',
          variant: 'secondary'
        }
      ]
    });
  }

  async notifyOpportunityFound(type: string, keyword: string, potential: string) {
    await pushEnhancedAlert({
      userId: this.userId,
      title: 'New Opportunity Discovered',
      message: `${type} opportunity for "${keyword}" - ${potential} potential`,
      module: 'research',
      priority: 'high',
      notificationType: 'achievement',
      actionButtons: [
        {
          id: 'view_opportunity',
          label: 'View Details',
          action: 'navigate',
          url: '/research/content-gaps',
          variant: 'primary'
        },
        {
          id: 'create_content',
          label: 'Create Content',
          action: 'navigate',
          url: '/content-builder',
          variant: 'success'
        }
      ]
    });
  }

  async notifyContentGapAnalysisComplete(gapsFound: number) {
    await pushEnhancedAlert({
      userId: this.userId,
      title: 'Content Gap Analysis Complete',
      message: `Identified ${gapsFound} content gaps for your strategy`,
      module: 'research',
      priority: 'medium',
      notificationType: 'info',
      actionButtons: [
        {
          id: 'view_gaps',
          label: 'View Gaps',
          action: 'navigate',
          url: '/research/content-gaps',
          variant: 'primary'
        }
      ]
    });
  }

  async notifyTopicClustersGenerated(clustersCount: number) {
    await pushEnhancedAlert({
      userId: this.userId,
      title: 'Topic Clusters Generated',
      message: `Created ${clustersCount} topic clusters for your content strategy`,
      module: 'research',
      priority: 'medium',
      notificationType: 'success',
      actionButtons: [
        {
          id: 'view_clusters',
          label: 'View Clusters',
          action: 'navigate',
          url: '/research/topic-clusters',
          variant: 'primary'
        }
      ]
    });
  }
}

// Content Management Notifications
export class ContentManagementNotifications {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async notifyContentSubmittedForApproval(title: string, contentId: string) {
    await pushEnhancedAlert({
      userId: this.userId,
      title: 'Content Submitted for Approval',
      message: `"${title}" has been submitted for review`,
      module: 'content_approval',
      priority: 'medium',
      notificationType: 'info',
      actionButtons: [
        {
          id: 'view_content',
          label: 'View Content',
          action: 'navigate',
          url: `/content-approval?id=${contentId}`,
          variant: 'primary'
        }
      ]
    });
  }

  async notifyContentApproved(title: string, reviewerName: string) {
    await pushEnhancedAlert({
      userId: this.userId,
      title: 'Content Approved',
      message: `"${title}" has been approved by ${reviewerName}`,
      module: 'content_approval',
      priority: 'high',
      notificationType: 'success',
      actionButtons: [
        {
          id: 'publish_content',
          label: 'Publish Now',
          action: 'publish',
          variant: 'primary'
        },
        {
          id: 'schedule_publish',
          label: 'Schedule',
          action: 'schedule',
          variant: 'secondary'
        }
      ]
    });
  }

  async notifyContentRejected(title: string, reason: string) {
    await pushEnhancedAlert({
      userId: this.userId,
      title: 'Content Needs Revision',
      message: `"${title}" requires changes: ${reason}`,
      module: 'content_approval',
      priority: 'high',
      notificationType: 'warning',
      actionButtons: [
        {
          id: 'edit_content',
          label: 'Edit Content',
          action: 'navigate',
          url: '/content-builder',
          variant: 'primary'
        },
        {
          id: 'view_feedback',
          label: 'View Feedback',
          action: 'view_feedback',
          variant: 'secondary'
        }
      ]
    });
  }

  async notifyContentPublished(title: string, url: string) {
    await pushEnhancedAlert({
      userId: this.userId,
      title: 'Content Published Successfully',
      message: `"${title}" is now live and available to your audience`,
      module: 'content_management',
      priority: 'medium',
      notificationType: 'success',
      actionButtons: [
        {
          id: 'view_live',
          label: 'View Live',
          action: 'navigate',
          url: url,
          variant: 'primary'
        },
        {
          id: 'share_content',
          label: 'Share',
          action: 'share',
          variant: 'secondary'
        }
      ]
    });
  }

  async notifyExportComplete(type: string, fileName: string, downloadUrl?: string) {
    await pushEnhancedAlert({
      userId: this.userId,
      title: 'Export Complete',
      message: `Your ${type} export "${fileName}" is ready for download`,
      module: 'content_management',
      priority: 'medium',
      notificationType: 'success',
      actionButtons: downloadUrl ? [
        {
          id: 'download_file',
          label: 'Download',
          action: 'download',
          url: downloadUrl,
          variant: 'primary'
        }
      ] : []
    });
  }
}

// AI & Analytics Notifications
export class AIAnalyticsNotifications {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async notifyAIAnalysisComplete(analysisType: string, insights: number) {
    await pushEnhancedAlert({
      userId: this.userId,
      title: 'AI Analysis Complete',
      message: `${analysisType} analysis finished with ${insights} new insights`,
      module: 'ai_analytics',
      priority: 'medium',
      notificationType: 'success',
      actionButtons: [
        {
          id: 'view_insights',
          label: 'View Insights',
          action: 'navigate',
          url: '/analytics',
          variant: 'primary'
        }
      ]
    });
  }

  async notifySmartActionTriggered(actionName: string, result: string) {
    await pushEnhancedAlert({
      userId: this.userId,
      title: 'Smart Action Executed',
      message: `${actionName} completed: ${result}`,
      module: 'ai_analytics',
      priority: 'medium',
      notificationType: 'info',
      actionButtons: [
        {
          id: 'view_analytics',
          label: 'View Analytics',
          action: 'navigate',
          url: '/smart-actions/analytics',
          variant: 'primary'
        }
      ]
    });
  }

  async notifyPerformanceAlert(metric: string, value: string, trend: 'up' | 'down') {
    const priority = trend === 'down' ? 'high' : 'medium';
    const type = trend === 'down' ? 'warning' : 'success';
    
    await pushEnhancedAlert({
      userId: this.userId,
      title: `Performance Alert: ${metric}`,
      message: `${metric} is ${trend === 'up' ? 'improving' : 'declining'}: ${value}`,
      module: 'ai_analytics',
      priority,
      notificationType: type,
      actionButtons: [
        {
          id: 'view_details',
          label: 'View Details',
          action: 'navigate',
          url: '/analytics',
          variant: 'primary'
        }
      ]
    });
  }
}

// System Notifications
export class SystemNotifications {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async notifySystemUpdate(version: string, features: string[]) {
    await pushEnhancedAlert({
      userId: this.userId,
      title: 'System Updated',
      message: `Version ${version} is now available with ${features.length} new features`,
      module: 'system',
      priority: 'low',
      notificationType: 'info',
      actionButtons: [
        {
          id: 'view_changelog',
          label: 'View Changes',
          action: 'view_changelog',
          variant: 'primary'
        }
      ]
    });
  }

  async notifyMaintenanceScheduled(startTime: string, duration: string) {
    await pushEnhancedAlert({
      userId: this.userId,
      title: 'Scheduled Maintenance',
      message: `System maintenance scheduled for ${startTime} (${duration})`,
      module: 'system',
      priority: 'medium',
      notificationType: 'warning',
      expiresIn: 48 // expires in 48 hours
    });
  }

  async notifySettingsSaved(section: string) {
    await pushEnhancedAlert({
      userId: this.userId,
      title: 'Settings Saved',
      message: `Your ${section} settings have been updated successfully`,
      module: 'system',
      priority: 'low',
      notificationType: 'success',
      expiresIn: 2 // expires in 2 hours
    });
  }
}

// Factory functions for easy instantiation
export const createContentBuilderNotifications = (userId: string) => 
  new ContentBuilderNotifications(userId);

export const createResearchNotifications = (userId: string) => 
  new ResearchNotifications(userId);

export const createContentManagementNotifications = (userId: string) => 
  new ContentManagementNotifications(userId);

export const createAIAnalyticsNotifications = (userId: string) => 
  new AIAnalyticsNotifications(userId);

export const createSystemNotifications = (userId: string) => 
  new SystemNotifications(userId);