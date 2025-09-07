import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { 
  Bell, 
  X, 
  CheckCheck, 
  Filter, 
  Search, 
  Archive, 
  Clock,
  ChevronDown,
  AlertCircle,
  CheckCircle,
  Info,
  XCircle,
  Trophy,
  Settings,
  Eye,
  MoreHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  EnhancedDashboardAlert,
  NotificationPriority,
  NotificationType,
  fetchEnhancedAlerts,
  executeNotificationAction,
  markMultipleRead,
  archiveMultiple,
  subscribeToEnhancedAlerts
} from '@/services/enhancedNotificationsService';
import { markAlertRead } from '@/services/notificationsService';
import { toast } from 'sonner';

interface EnhancedNotificationsCenterProps {
  open: boolean;
  onClose: () => void;
}

const priorityColors: Record<NotificationPriority, string> = {
  low: '#10b981',
  medium: '#f59e0b', 
  high: '#ef4444',
  urgent: '#dc2626'
};

const typeIcons: Record<NotificationType, React.ReactNode> = {
  success: <CheckCircle className="h-4 w-4 text-success" />,
  info: <Info className="h-4 w-4 text-info" />,
  warning: <AlertCircle className="h-4 w-4 text-warning" />,
  error: <XCircle className="h-4 w-4 text-destructive" />,
  achievement: <Trophy className="h-4 w-4 text-primary" />
};

export const EnhancedNotificationsCenter: React.FC<EnhancedNotificationsCenterProps> = ({
  open,
  onClose
}) => {
  const { user } = useAuth();
  const userId = user?.id;
  
  const [alerts, setAlerts] = useState<EnhancedDashboardAlert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<EnhancedDashboardAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<NotificationPriority | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'unread' | 'read'>('all');
  const [selectedAlerts, setSelectedAlerts] = useState<Set<string>>(new Set());

  // Fetch alerts
  const fetchAlerts = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await fetchEnhancedAlerts(userId, {
        limit: 50,
        priority: selectedPriority === 'all' ? undefined : selectedPriority,
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        status: selectedStatus === 'all' ? undefined : selectedStatus,
      });
      setAlerts(data);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [userId, selectedPriority, selectedCategory, selectedStatus]);

  // Real-time subscription
  useEffect(() => {
    if (!userId) return;
    
    fetchAlerts();
    
    const unsubscribe = subscribeToEnhancedAlerts(
      userId,
      (newAlert) => {
        setAlerts(prev => [newAlert, ...prev]);
        toast.success('New notification received');
      },
      (updatedAlert) => {
        setAlerts(prev => prev.map(alert => 
          alert.id === updatedAlert.id ? updatedAlert : alert
        ));
      }
    );

    return () => unsubscribe();
  }, [userId, fetchAlerts]);

  // Filter alerts based on search and filters
  useEffect(() => {
    let filtered = alerts;

    if (searchQuery) {
      filtered = filtered.filter(alert =>
        alert.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.module?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredAlerts(filtered);
  }, [alerts, searchQuery]);

  const unreadCount = useMemo(() => 
    alerts.filter(a => a.status === 'unread' || a.is_read === false).length, 
    [alerts]
  );

  const categories = useMemo(() => {
    const cats = new Set(alerts.map(a => a.module).filter(Boolean));
    return Array.from(cats);
  }, [alerts]);

  // Handle individual notification actions
  const handleMarkRead = async (id: string) => {
    try {
      await markAlertRead(id);
      setAlerts(prev => prev.map(a => 
        a.id === id ? { ...a, status: 'read', is_read: true } : a
      ));
      toast.success('Marked as read');
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleAction = async (notificationId: string, actionId: string, actionData?: Record<string, any>) => {
    try {
      await executeNotificationAction(notificationId, actionId, actionData);
      toast.success('Action completed');
    } catch (error) {
      toast.error('Failed to execute action');
    }
  };

  // Bulk operations
  const handleSelectAll = () => {
    if (selectedAlerts.size === filteredAlerts.length) {
      setSelectedAlerts(new Set());
    } else {
      setSelectedAlerts(new Set(filteredAlerts.map(a => a.id)));
    }
  };

  const handleBulkMarkRead = async () => {
    if (selectedAlerts.size === 0) return;
    try {
      await markMultipleRead(userId!, Array.from(selectedAlerts));
      setAlerts(prev => prev.map(a => 
        selectedAlerts.has(a.id) ? { ...a, status: 'read', is_read: true } : a
      ));
      setSelectedAlerts(new Set());
      toast.success(`Marked ${selectedAlerts.size} notifications as read`);
    } catch (error) {
      toast.error('Failed to mark notifications as read');
    }
  };

  const handleBulkArchive = async () => {
    if (selectedAlerts.size === 0) return;
    try {
      await archiveMultiple(userId!, Array.from(selectedAlerts));
      setAlerts(prev => prev.filter(a => !selectedAlerts.has(a.id)));
      setSelectedAlerts(new Set());
      toast.success(`Archived ${selectedAlerts.size} notifications`);
    } catch (error) {
      toast.error('Failed to archive notifications');
    }
  };

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ duration: 0.2 }}
      className="absolute right-2 top-14 z-50 w-[420px] max-h-[80vh] overflow-hidden rounded-xl border border-border bg-background backdrop-blur-xl shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gradient-to-r from-background to-muted/20">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bell className="h-5 w-5 text-primary" />
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary"
              />
            )}
          </div>
          <h3 className="font-semibold text-foreground">Notifications</h3>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {unreadCount} new
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open('/settings/notifications', '_blank')}
            className="h-8 w-8 p-0"
            title="Notification Settings"
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-3 space-y-3 border-b border-border bg-muted/5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-8 bg-background/50"
          />
        </div>
        
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 text-xs">
                <Filter className="h-3 w-3 mr-1" />
                Category
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-40">
              <DropdownMenuItem onClick={() => setSelectedCategory('all')}>
                All Categories
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {categories.map(category => (
                <DropdownMenuItem
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 text-xs">
                Priority
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-32">
              <DropdownMenuItem onClick={() => setSelectedPriority('all')}>
                All
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {(['urgent', 'high', 'medium', 'low'] as NotificationPriority[]).map(priority => (
                <DropdownMenuItem
                  key={priority}
                  onClick={() => setSelectedPriority(priority)}
                >
                  <div 
                    className="h-2 w-2 rounded-full mr-2"
                    style={{ backgroundColor: priorityColors[priority] }}
                  />
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Bulk Actions */}
        {selectedAlerts.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between p-2 bg-primary/10 rounded-lg"
          >
            <span className="text-sm text-primary font-medium">
              {selectedAlerts.size} selected
            </span>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={handleBulkMarkRead} className="h-7 text-xs">
                <CheckCheck className="h-3 w-3 mr-1" />
                Mark Read
              </Button>
              <Button size="sm" variant="ghost" onClick={handleBulkArchive} className="h-7 text-xs">
                <Archive className="h-3 w-3 mr-1" />
                Archive
              </Button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Notifications List */}
      <ScrollArea className="max-h-[50vh]">
        <AnimatePresence mode="popLayout">
          {loading ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Loading notifications...
            </div>
          ) : filteredAlerts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-6 text-center text-sm text-muted-foreground"
            >
              {searchQuery ? 'No notifications match your search.' : 'No notifications yet.'}
            </motion.div>
          ) : (
            <div className="divide-y divide-border/40">
              {filteredAlerts.map((alert, index) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 hover:bg-accent/40 transition-colors relative ${
                    alert.status === 'unread' || alert.is_read === false
                      ? 'bg-primary/5 border-l-2 border-l-primary'
                      : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Selection checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedAlerts.has(alert.id)}
                      onChange={(e) => {
                        const newSelected = new Set(selectedAlerts);
                        if (e.target.checked) {
                          newSelected.add(alert.id);
                        } else {
                          newSelected.delete(alert.id);
                        }
                        setSelectedAlerts(newSelected);
                      }}
                      className="mt-1 h-3 w-3 rounded border-border"
                    />

                    {/* Notification Icon */}
                    <div className="mt-0.5">
                      {typeIcons[alert.notification_type as NotificationType] || typeIcons.info}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
                              {alert.module || 'general'}
                            </span>
                            <div
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: priorityColors[alert.priority as NotificationPriority] }}
                            />
                            <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                              {alert.notification_type}
                            </Badge>
                          </div>
                          
                          {alert.title && (
                            <h4 className="font-medium text-sm text-foreground mb-1 line-clamp-1">
                              {alert.title}
                            </h4>
                          )}
                          
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {alert.message}
                          </p>

                          {/* Action Buttons */}
                          {alert.action_buttons && alert.action_buttons.length > 0 && (
                            <div className="flex gap-1 mb-2">
                              {alert.action_buttons.slice(0, 2).map((action) => (
                                <Button
                                  key={action.id}
                                  size="sm"
                                  variant={action.variant === 'primary' ? 'default' : 'ghost'}
                                  onClick={() => handleAction(alert.id, action.id)}
                                  className="h-6 text-xs px-2"
                                >
                                  {action.label}
                                </Button>
                              ))}
                              {alert.action_buttons.length > 2 && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                      <MoreHorizontal className="h-3 w-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    {alert.action_buttons.slice(2).map((action) => (
                                      <DropdownMenuItem
                                        key={action.id}
                                        onClick={() => handleAction(alert.id, action.id)}
                                      >
                                        {action.label}
                                      </DropdownMenuItem>
                                    ))}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                          )}

                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3" />
                              <span>{new Date(alert.created_at).toLocaleString()}</span>
                            </div>
                            
                            {alert.link_url && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => window.open(alert.link_url!, '_blank')}
                                className="h-5 text-xs px-1 text-primary hover:text-primary-foreground"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Mark as read button */}
                        {(alert.status === 'unread' || alert.is_read === false) && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMarkRead(alert.id)}
                            className="h-6 text-xs px-2 opacity-60 hover:opacity-100"
                          >
                            Mark read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </ScrollArea>

      {/* Footer Actions */}
      {filteredAlerts.length > 0 && (
        <div className="p-3 border-t border-border/40 bg-muted/10">
          <div className="flex items-center justify-between">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleSelectAll}
              className="text-xs"
            >
              {selectedAlerts.size === filteredAlerts.length ? 'Deselect All' : 'Select All'}
            </Button>
            
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => fetchAlerts()}
                disabled={loading}
                className="text-xs"
              >
                Refresh
              </Button>
              {unreadCount > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    const unreadIds = alerts
                      .filter(a => a.status === 'unread' || a.is_read === false)
                      .map(a => a.id);
                    if (unreadIds.length > 0) {
                      markMultipleRead(userId!, unreadIds).then(() => {
                        setAlerts(prev => prev.map(a => ({ ...a, status: 'read', is_read: true })));
                        toast.success('All notifications marked as read');
                      });
                    }
                  }}
                  className="text-xs"
                >
                  <CheckCheck className="h-3 w-3 mr-1" />
                  Mark All Read
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};