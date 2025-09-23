import React, { useState, useEffect } from 'react';
import { Bell, X, TrendingUp, TrendingDown, Eye, AlertTriangle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContext';
import { serpMonitoringService, SerpAlert } from '@/services/serpMonitoringService';
import { toast } from 'sonner';

interface SerpAlertNotificationsProps {
  onAlertCount?: (count: number) => void;
}

export const SerpAlertNotifications: React.FC<SerpAlertNotificationsProps> = ({ onAlertCount }) => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<SerpAlert[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadAlerts();
      // Poll for new alerts every 5 minutes
      const interval = setInterval(loadAlerts, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const unreadCount = alerts.filter(alert => !alert.is_read).length;
    onAlertCount?.(unreadCount);
  }, [alerts, onAlertCount]);

  const loadAlerts = async () => {
    if (!user) return;
    
    try {
      const alertsData = await serpMonitoringService.getUserAlerts(user.id, true);
      setAlerts(alertsData);
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
  };

  const handleMarkAsRead = async (alertId: string) => {
    try {
      await serpMonitoringService.markAlertsAsRead([alertId]);
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, is_read: true } : alert
      ));
      toast.success('Alert marked as read');
    } catch (error) {
      toast.error('Failed to mark alert as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setLoading(true);
      const unreadIds = alerts.filter(a => !a.is_read).map(a => a.id);
      if (unreadIds.length > 0) {
        await serpMonitoringService.markAlertsAsRead(unreadIds);
        setAlerts(prev => prev.map(alert => ({ ...alert, is_read: true })));
        toast.success('All alerts marked as read');
      }
    } catch (error) {
      toast.error('Failed to mark alerts as read');
    } finally {
      setLoading(false);
    }
  };

  const getAlertIcon = (alertType: string, severity: string) => {
    const iconClass = severity === 'critical' || severity === 'high' ? 'text-destructive' : 'text-primary';
    
    switch (alertType) {
      case 'position_change':
        return <TrendingUp className={`w-4 h-4 ${iconClass}`} />;
      case 'new_competitor':
        return <Eye className={`w-4 h-4 ${iconClass}`} />;
      case 'featured_snippet_loss':
        return <AlertTriangle className={`w-4 h-4 ${iconClass}`} />;
      default:
        return <Bell className={`w-4 h-4 ${iconClass}`} />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const unreadAlerts = alerts.filter(alert => !alert.is_read);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="relative"
        onClick={() => setShowNotifications(!showNotifications)}
      >
        <Bell className="w-4 h-4" />
        {unreadAlerts.length > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs flex items-center justify-center"
          >
            {unreadAlerts.length}
          </Badge>
        )}
      </Button>

      {showNotifications && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-hidden z-50">
          <Card className="border shadow-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-foreground">SERP Alerts</h3>
              <div className="flex items-center gap-2">
                {unreadAlerts.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    disabled={loading}
                  >
                    Mark All Read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotifications(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {alerts.length > 0 ? (
                <div className="space-y-1">
                  {alerts.slice(0, 10).map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-3 border-b hover:bg-muted/50 transition-colors ${
                        alert.is_read ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          {getAlertIcon(alert.alert_type, alert.severity)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm text-foreground truncate">
                              {alert.title}
                            </p>
                            <Badge variant={getSeverityColor(alert.severity)}>
                              {alert.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {alert.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">
                              {new Date(alert.created_at).toLocaleString()}
                            </p>
                            {!alert.is_read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkAsRead(alert.id)}
                                className="text-xs h-6 px-2"
                              >
                                Mark Read
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No alerts yet</p>
                  <p className="text-sm text-muted-foreground">
                    Set up SERP monitoring to receive alerts
                  </p>
                </div>
              )}
            </div>

            {alerts.length > 10 && (
              <div className="p-3 border-t text-center">
                <Button variant="ghost" size="sm">
                  View All Alerts ({alerts.length})
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};