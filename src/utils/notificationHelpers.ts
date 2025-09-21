import { 
  ActionButton, 
  NotificationPriority, 
  NotificationType,
  pushEnhancedAlert 
} from '@/services/enhancedNotificationsService';

// Notification helper functions for different app modules
export class NotificationHelper {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  // Content workflow notifications
  async notifyContentSubmitted(contentTitle: string, contentId: string) {
    await pushEnhancedAlert({
      userId: this.userId,
      title: 'Content Submitted for Review',
      message: `"${contentTitle}" has been submitted for approval`,
      module: 'content_workflow',
      priority: 'medium',
      notificationType: 'info',
      actionButtons: [
        {
          id: 'view_content',
          label: 'Review',
          action: 'navigate',
          variant: 'primary',
          url: `/content-approval?id=${contentId}`
        }
      ],
      previewData: { contentId, contentTitle },
      linkUrl: `/content-approval?id=${contentId}`
    });
  }

  async notifyContentApproved(contentTitle: string, contentId: string, reviewerName?: string) {
    await pushEnhancedAlert({
      userId: this.userId,
      title: 'Content Approved',
      message: `"${contentTitle}" has been approved${reviewerName ? ` by ${reviewerName}` : ''}`,
      module: 'content_workflow',
      priority: 'high',
      notificationType: 'success',
      actionButtons: [
        {
          id: 'publish_content',
          label: 'Publish',
          action: 'publish',
          variant: 'primary'
        },
        {
          id: 'view_content',
          label: 'View',
          action: 'navigate',
          variant: 'secondary',
          url: `/content-builder?id=${contentId}`
        }
      ],
      previewData: { contentId, contentTitle, reviewerName },
      expiresIn: 168 // 7 days
    });
  }

  async notifyContentRejected(contentTitle: string, contentId: string, reason?: string) {
    await pushEnhancedAlert({
      userId: this.userId,
      title: 'Content Needs Changes',
      message: `"${contentTitle}" requires revisions${reason ? `: ${reason}` : ''}`,
      module: 'content_workflow',
      priority: 'high',
      notificationType: 'warning',
      actionButtons: [
        {
          id: 'edit_content',
          label: 'Edit Content',
          action: 'navigate',
          variant: 'primary',
          url: `/content-builder?id=${contentId}`
        }
      ],
      previewData: { contentId, contentTitle, reason },
      linkUrl: `/content-builder?id=${contentId}`
    });
  }

  // AI & Automation notifications
  async notifyAIAnalysisComplete(contentTitle: string, contentId: string, analysisType: string) {
    await pushEnhancedAlert({
      userId: this.userId,
      title: 'AI Analysis Complete',
      message: `${analysisType} analysis finished for "${contentTitle}"`,
      module: 'ai_automation',
      priority: 'medium',
      notificationType: 'success',
      actionButtons: [
        {
          id: 'view_analysis',
          label: 'View Results',
          action: 'navigate',
          variant: 'primary',
          url: `/content-builder?id=${contentId}&tab=analysis`
        }
      ],
      previewData: { contentId, contentTitle, analysisType },
      expiresIn: 72 // 3 days
    });
  }

  async notifyContentGenerated(contentTitle: string, contentId: string, generationType: string) {
    await pushEnhancedAlert({
      userId: this.userId,
      title: 'Content Generated',
      message: `${generationType} content generated for "${contentTitle}"`,
      module: 'ai_automation',
      priority: 'medium',
      notificationType: 'achievement',
      actionButtons: [
        {
          id: 'review_generated',
          label: 'Review',
          action: 'navigate',
          variant: 'primary',
          url: `/content-builder?id=${contentId}`
        },
        {
          id: 'regenerate',
          label: 'Regenerate',
          action: 'regenerate',
          variant: 'secondary'
        }
      ],
      previewData: { contentId, contentTitle, generationType }
    });
  }

  // Research & Analysis notifications
  async notifyKeywordResearchComplete(keyword: string, resultCount: number) {
    await pushEnhancedAlert({
      userId: this.userId,
      title: 'Keyword Research Complete',
      message: `Found ${resultCount} related keywords for "${keyword}"`,
      module: 'research_analysis',
      priority: 'medium',
      notificationType: 'info',
      actionButtons: [
        {
          id: 'view_keywords',
          label: 'View Results',
          action: 'navigate',
          variant: 'primary',
          url: '/research/keyword-research'
        }
      ],
      previewData: { keyword, resultCount },
      expiresIn: 48 // 2 days
    });
  }

  async notifyOpportunityFound(opportunityType: string, keyword: string, potential: string) {
    await pushEnhancedAlert({
      userId: this.userId,
      title: 'New Content Opportunity',
      message: `${opportunityType} opportunity found for "${keyword}" - ${potential} potential`,
      module: 'research_analysis',
      priority: 'high',
      notificationType: 'achievement',
      actionButtons: [
        {
          id: 'create_content',
          label: 'Create Content',
          action: 'navigate',
          variant: 'primary',
          url: `/content-builder?keyword=${encodeURIComponent(keyword)}`
        },
        {
          id: 'view_opportunity',
          label: 'View Details',
          action: 'navigate',
          variant: 'secondary',
          url: '/research/content-strategy'
        }
      ],
      previewData: { opportunityType, keyword, potential },
      expiresIn: 168 // 7 days
    });
  }

  // System notifications
  async notifyExportComplete(exportType: string, fileName: string, downloadUrl?: string) {
    await pushEnhancedAlert({
      userId: this.userId,
      title: 'Export Complete',
      message: `Your ${exportType} export "${fileName}" is ready`,
      module: 'system_performance',
      priority: 'low',
      notificationType: 'success',
      actionButtons: downloadUrl ? [
        {
          id: 'download',
          label: 'Download',
          action: 'download',
          variant: 'primary',
          url: downloadUrl
        }
      ] : [],
      previewData: { exportType, fileName, downloadUrl },
      expiresIn: 24 // 1 day
    });
  }

  async notifySystemMaintenance(scheduledTime: string, duration: string) {
    await pushEnhancedAlert({
      userId: this.userId,
      title: 'Scheduled Maintenance',
      message: `System maintenance scheduled for ${scheduledTime} (${duration})`,
      module: 'system_performance',
      priority: 'medium',
      notificationType: 'warning',
      previewData: { scheduledTime, duration },
      expiresIn: 2 // 2 hours after maintenance
    });
  }

  // Calendar & Scheduling notifications
  async notifyContentScheduled(contentTitle: string, scheduledDate: string, contentType: string = 'content') {
    await pushEnhancedAlert({
      userId: this.userId,
      title: 'Content Scheduled',
      message: `"${contentTitle}" has been added to your calendar for ${scheduledDate}`,
      module: 'research_analysis',
      priority: 'medium',
      notificationType: 'success',
      actionButtons: [
        {
          id: 'view_calendar',
          label: 'View Calendar',
          action: 'navigate',
          variant: 'primary',
          url: '/research/calendar'
        }
      ],
      previewData: { contentTitle, scheduledDate, contentType },
      expiresIn: 168 // 7 days
    });
  }

  async notifyBulkContentScheduled(itemCount: number, startDate: string, endDate: string) {
    await pushEnhancedAlert({
      userId: this.userId,
      title: 'Content Schedule Updated',
      message: `${itemCount} content pieces have been scheduled from ${startDate} to ${endDate}`,
      module: 'research_analysis',
      priority: 'high',
      notificationType: 'achievement',
      actionButtons: [
        {
          id: 'view_calendar',
          label: 'View Schedule',
          action: 'navigate',
          variant: 'primary',
          url: '/research/calendar'
        },
        {
          id: 'view_strategy',
          label: 'Back to Strategy',
          action: 'navigate',
          variant: 'secondary',
          url: '/research/content-strategy'
        }
      ],
      previewData: { itemCount, startDate, endDate },
      expiresIn: 168 // 7 days
    });
  }

  // Proposal and calendar lifecycle notifications
  async notifyProposalsRestored(restoredProposals: any[]) {
    const count = restoredProposals.length;
    const title = count === 1 ? restoredProposals[0].title : `${count} proposals`;
    
    await pushEnhancedAlert({
      userId: this.userId,
      title: 'Overdue Proposals Restored',
      message: `${title} ${count === 1 ? 'was' : 'were'} automatically restored from overdue calendar items`,
      module: 'research_analysis',
      priority: 'high',
      notificationType: 'warning',
      actionButtons: [
        {
          id: 'view_proposals',
          label: 'Review Proposals',
          action: 'navigate',
          variant: 'primary',
          url: '/research/content-strategy'
        }
      ],
      previewData: { restoredProposals, count },
      expiresIn: 168 // 7 days
    });
  }

  async notifyContentPostponed(contentTitle: string, originalDate: string, newDate: string) {
    await pushEnhancedAlert({
      userId: this.userId,
      title: 'Content Postponed',
      message: `"${contentTitle}" has been moved from ${originalDate} to ${newDate}`,
      module: 'research_analysis',
      priority: 'medium',
      notificationType: 'info',
      actionButtons: [
        {
          id: 'view_calendar',
          label: 'View Calendar',
          action: 'navigate',
          variant: 'primary',
          url: '/research/calendar'
        }
      ],
      previewData: { contentTitle, originalDate, newDate },
      expiresIn: 72 // 3 days
    });
  }

  async notifyContentRemovedAndRestored(contentTitle: string, scheduledDate: string, reason: string) {
    await pushEnhancedAlert({
      userId: this.userId,
      title: 'Content Removed & Proposal Restored',
      message: `"${contentTitle}" was removed from ${scheduledDate} calendar and proposal restored to available`,
      module: 'research_analysis',
      priority: 'medium',
      notificationType: 'info',
      actionButtons: [
        {
          id: 'view_proposals',
          label: 'View Proposals',
          action: 'navigate',
          variant: 'primary',
          url: '/research/content-strategy'
        }
      ],
      previewData: { contentTitle, scheduledDate, reason },
      expiresIn: 72 // 3 days
    });
  }
  async notifyMentioned(mentionedBy: string, contentTitle: string, contentId: string) {
    await pushEnhancedAlert({
      userId: this.userId,
      title: 'You were mentioned',
      message: `${mentionedBy} mentioned you in "${contentTitle}"`,
      module: 'collaboration',
      priority: 'high',
      notificationType: 'info',
      actionButtons: [
        {
          id: 'view_mention',
          label: 'View Comment',
          action: 'navigate',
          variant: 'primary',
          url: `/content-approval?id=${contentId}&tab=comments`
        }
      ],
      previewData: { mentionedBy, contentTitle, contentId },
      linkUrl: `/content-approval?id=${contentId}&tab=comments`
    });
  }

  async notifyCommentAdded(commenterName: string, contentTitle: string, contentId: string) {
    await pushEnhancedAlert({
      userId: this.userId,
      title: 'New Comment',
      message: `${commenterName} commented on "${contentTitle}"`,
      module: 'collaboration',
      priority: 'medium',
      notificationType: 'info',
      actionButtons: [
        {
          id: 'view_comment',
          label: 'View',
          action: 'navigate',
          variant: 'primary',
          url: `/content-approval?id=${contentId}&tab=comments`
        }
      ],
      previewData: { commenterName, contentTitle, contentId },
      expiresIn: 72 // 3 days
  }

  // Calendar & Scheduling notifications
  async notifyContentScheduled(contentTitle: string, scheduledDate: string, contentType: string = 'content') {
    await pushEnhancedAlert({
      userId: this.userId,
      title: 'Content Scheduled',
      message: `"${contentTitle}" has been added to your calendar for ${scheduledDate}`,
      module: 'research_analysis',
      priority: 'medium',
      notificationType: 'success',
      actionButtons: [
        {
          id: 'view_calendar',
          label: 'View Calendar',
          action: 'navigate',
          variant: 'primary',
          url: '/research/calendar'
        }
      ],
      previewData: { contentTitle, scheduledDate, contentType },
      expiresIn: 168 // 7 days
    });
  }

  async notifyBulkContentScheduled(itemCount: number, startDate: string, endDate: string) {
    await pushEnhancedAlert({
      userId: this.userId,
      title: 'Content Schedule Updated',
      message: `${itemCount} content pieces have been scheduled from ${startDate} to ${endDate}`,
      module: 'research_analysis',
      priority: 'high',
      notificationType: 'achievement',
      actionButtons: [
        {
          id: 'view_calendar',
          label: 'View Schedule',
          action: 'navigate',
          variant: 'primary',
          url: '/research/calendar'
        },
        {
          id: 'view_strategy',
          label: 'Back to Strategy',
          action: 'navigate',
          variant: 'secondary',
          url: '/research/content-strategy'
        }
      ],
      previewData: { itemCount, startDate, endDate },
      expiresIn: 168 // 7 days
    });
  }

  // Proposal status change notifications
  async notifyProposalStatusChanged(proposalTitle: string, fromStatus: string, toStatus: string, reason?: string) {
    await pushEnhancedAlert({
      userId: this.userId,
      title: 'Proposal Status Updated',
      message: `"${proposalTitle}" status changed from ${fromStatus} to ${toStatus}`,
      module: 'research_analysis',
      priority: 'medium',
      notificationType: 'info',
      actionButtons: [
        {
          id: 'view_proposals',
          label: 'View Proposals',
          action: 'navigate',
          variant: 'primary',
          url: '/research/content-strategy'
        }
      ],
      previewData: { proposalTitle, fromStatus, toStatus, reason },
      expiresIn: 72 // 3 days
    });
  }

  async notifyProposalsRestored(restoredProposals: any[]) {
    const count = restoredProposals.length;
    const title = count === 1 ? restoredProposals[0].title : `${count} proposals`;
    
    await pushEnhancedAlert({
      userId: this.userId,
      title: 'Overdue Proposals Restored',
      message: `${title} ${count === 1 ? 'was' : 'were'} automatically restored from overdue calendar items`,
      module: 'research_analysis',
      priority: 'high',
      notificationType: 'warning',
      actionButtons: [
        {
          id: 'view_proposals',
          label: 'Review Proposals',
          action: 'navigate',
          variant: 'primary',
          url: '/research/content-strategy'
        },
        {
          id: 'view_calendar',
          label: 'Check Calendar',
          action: 'navigate',
          variant: 'secondary',
          url: '/research/calendar'
        }
      ],
      previewData: { restoredProposals, count },
      expiresIn: 168 // 7 days
    });
  }

  async notifyContentCreationDetected(proposalTitle: string, contentTitle: string) {
    await pushEnhancedAlert({
      userId: this.userId,
      title: 'Content Creation Detected',
      message: `Content "${contentTitle}" was created from proposal "${proposalTitle}" - proposal marked as completed`,
      module: 'research_analysis',
      priority: 'high',
      notificationType: 'achievement',
      actionButtons: [
        {
          id: 'view_content',
          label: 'View Content',
          action: 'navigate',
          variant: 'primary',
          url: '/content'
        },
        {
          id: 'view_proposals',
          label: 'View Proposals',
          action: 'navigate',
          variant: 'secondary',
          url: '/research/content-strategy'
        }
      ],
      previewData: { proposalTitle, contentTitle },
      expiresIn: 168 // 7 days
    });
  }

  async notifyContentPostponed(contentTitle: string, originalDate: string, newDate: string) {
    await pushEnhancedAlert({
      userId: this.userId,
      title: 'Content Postponed',
      message: `"${contentTitle}" has been moved from ${originalDate} to ${newDate}`,
      module: 'research_analysis',
      priority: 'medium',
      notificationType: 'info',
      actionButtons: [
        {
          id: 'view_calendar',
          label: 'View Calendar',
          action: 'navigate',
          variant: 'primary',
          url: '/research/calendar'
        }
      ],
      previewData: { contentTitle, originalDate, newDate },
      expiresIn: 72 // 3 days
    });
  }

  async notifyContentRemovedAndRestored(contentTitle: string, scheduledDate: string, reason: string) {
    await pushEnhancedAlert({
      userId: this.userId,
      title: 'Content Removed & Proposal Restored',
      message: `"${contentTitle}" was removed from ${scheduledDate} calendar and proposal restored to available`,
      module: 'research_analysis',
      priority: 'medium',
      notificationType: 'info',
      actionButtons: [
        {
          id: 'view_proposals',
          label: 'View Proposals',
          action: 'navigate',
          variant: 'primary',
          url: '/research/content-strategy'
        },
        {
          id: 'view_calendar',
          label: 'View Calendar',
          action: 'navigate',
          variant: 'secondary',
          url: '/research/calendar'
        }
      ],
      previewData: { contentTitle, scheduledDate, reason },
      expiresIn: 72 // 3 days
    });
  }
}

// Utility functions
export const createNotificationHelper = (userId: string) => new NotificationHelper(userId);

export const getNotificationIcon = (module: string) => {
  const iconMap: Record<string, string> = {
    content_workflow: 'FileText',
    research_analysis: 'Search',
    ai_automation: 'Zap',
    system_performance: 'Monitor',
    collaboration: 'Users',
    general: 'Bell'
  };
  return iconMap[module] || iconMap.general;
};

export const getNotificationColor = (priority: NotificationPriority, notificationType: NotificationType) => {
  // Priority takes precedence for color
  const priorityColors: Record<NotificationPriority, string> = {
    urgent: '#dc2626',
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#10b981'
  };

  // Fallback to type-based colors
  const typeColors: Record<NotificationType, string> = {
    error: '#ef4444',
    warning: '#f59e0b',
    success: '#10b981',
    info: '#3b82f6',
    achievement: '#8b5cf6'
  };

  return priorityColors[priority] || typeColors[notificationType] || '#6b7280';
};

export const formatNotificationTime = (timestamp: string) => {
  const now = new Date();
  const notificationTime = new Date(timestamp);
  const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return notificationTime.toLocaleDateString();
};