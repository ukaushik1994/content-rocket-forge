import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Shield,
  Key,
  Lock,
  Eye,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Download,
  UserCheck,
  Database,
  Globe,
  Smartphone,
  Activity
} from 'lucide-react';
import { useEnterpriseRBAC } from '@/contexts/EnterpriseRBACContext';
import { toast } from 'sonner';

interface SecurityEvent {
  id: string;
  type: 'login' | 'failed_login' | 'permission_change' | 'data_access' | 'export' | 'api_call';
  severity: 'low' | 'medium' | 'high' | 'critical';
  user: string;
  resource: string;
  timestamp: string;
  location: string;
  device: string;
  status: 'resolved' | 'investigating' | 'open';
}

interface ComplianceReport {
  id: string;
  type: 'gdpr' | 'ccpa' | 'hipaa' | 'soc2';
  status: 'compliant' | 'non-compliant' | 'pending';
  lastAudit: string;
  expiryDate: string;
  score: number;
  issues: string[];
}

export const EnhancedSecurityDashboard: React.FC = () => {
  const { hasPermission, auditLog } = useEnterpriseRBAC();
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [complianceReports, setComplianceReports] = useState<ComplianceReport[]>([]);
  const [securitySettings, setSecuritySettings] = useState({
    mfaRequired: true,
    sessionTimeout: 30,
    passwordComplexity: true,
    ipWhitelist: false,
    auditLogging: true,
    dataEncryption: true,
    anonymousAnalytics: false
  });

  useEffect(() => {
    if (hasPermission('security', 'read')) {
      loadSecurityData();
    }
  }, [hasPermission]);

  const loadSecurityData = async () => {
    // Mock security events
    const mockEvents: SecurityEvent[] = [
      {
        id: 'event-1',
        type: 'failed_login',
        severity: 'medium',
        user: 'unknown@example.com',
        resource: 'auth',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        location: 'San Francisco, CA',
        device: 'Chrome/Windows',
        status: 'open'
      },
      {
        id: 'event-2',
        type: 'data_access',
        severity: 'low',
        user: 'admin@company.com',
        resource: 'user_profiles',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        location: 'New York, NY',
        device: 'Safari/macOS',
        status: 'resolved'
      },
      {
        id: 'event-3',
        type: 'permission_change',
        severity: 'high',
        user: 'admin@company.com',
        resource: 'user_roles',
        timestamp: new Date(Date.now() - 900000).toISOString(),
        location: 'New York, NY',
        device: 'Firefox/Linux',
        status: 'resolved'
      }
    ];

    // Mock compliance reports
    const mockCompliance: ComplianceReport[] = [
      {
        id: 'gdpr-2024',
        type: 'gdpr',
        status: 'compliant',
        lastAudit: new Date(Date.now() - 2592000000).toISOString(),
        expiryDate: new Date(Date.now() + 10368000000).toISOString(),
        score: 95,
        issues: []
      },
      {
        id: 'soc2-2024',
        type: 'soc2',
        status: 'pending',
        lastAudit: new Date(Date.now() - 1296000000).toISOString(),
        expiryDate: new Date(Date.now() + 15552000000).toISOString(),
        score: 88,
        issues: ['Incomplete access logs', 'Missing incident response documentation']
      }
    ];

    setSecurityEvents(mockEvents);
    setComplianceReports(mockCompliance);
    
    await auditLog('security_dashboard_accessed', 'security', { timestamp: new Date().toISOString() });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-green-600';
      case 'non-compliant': return 'text-red-600';
      case 'pending': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const exportSecurityReport = async () => {
    if (!hasPermission('security', 'export')) {
      toast.error('You do not have permission to export security reports');
      return;
    }

    try {
      const report = {
        generatedAt: new Date().toISOString(),
        events: securityEvents,
        compliance: complianceReports,
        settings: securitySettings
      };

      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `security-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      await auditLog('security_report_exported', 'security', { timestamp: new Date().toISOString() });
      toast.success('Security report exported successfully');
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export security report');
    }
  };

  const updateSecuritySetting = async (setting: string, value: boolean) => {
    if (!hasPermission('security', 'write')) {
      toast.error('You do not have permission to modify security settings');
      return;
    }

    setSecuritySettings(prev => ({ ...prev, [setting]: value }));
    await auditLog('security_setting_changed', 'security', { setting, value, timestamp: new Date().toISOString() });
    toast.success(`Security setting updated: ${setting}`);
  };

  const resolveSecurityEvent = async (eventId: string) => {
    if (!hasPermission('security', 'write')) {
      toast.error('You do not have permission to resolve security events');
      return;
    }

    setSecurityEvents(prev => prev.map(event => 
      event.id === eventId ? { ...event, status: 'resolved' as const } : event
    ));
    
    await auditLog('security_event_resolved', 'security', { eventId, timestamp: new Date().toISOString() });
    toast.success('Security event resolved');
  };

  if (!hasPermission('security', 'read')) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You do not have permission to view security dashboard.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Enhanced Security Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor security events, compliance status, and system health
          </p>
        </div>
        <Button onClick={exportSecurityReport} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">98%</p>
                <p className="text-xs text-muted-foreground">Security Score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold text-yellow-600">{securityEvents.filter(e => e.status === 'open').length}</p>
                <p className="text-xs text-muted-foreground">Active Alerts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-600">{complianceReports.filter(r => r.status === 'compliant').length}</p>
                <p className="text-xs text-muted-foreground">Compliant</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Activity className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-purple-600">{securityEvents.length}</p>
                <p className="text-xs text-muted-foreground">Events (24h)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">Security Events</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Security Events</CardTitle>
              <CardDescription>Monitor and respond to security incidents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${getSeverityColor(event.severity)}`} />
                      <div>
                        <p className="font-medium">{event.type.replace('_', ' ').toUpperCase()}</p>
                        <p className="text-sm text-muted-foreground">
                          {event.user} • {event.resource} • {new Date(event.timestamp).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {event.location} • {event.device}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={event.status === 'resolved' ? 'secondary' : 'destructive'}>
                        {event.status}
                      </Badge>
                      {event.status === 'open' && (
                        <Button size="sm" onClick={() => resolveSecurityEvent(event.id)}>
                          Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Status</CardTitle>
              <CardDescription>Track regulatory compliance and audit results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {complianceReports.map((report) => (
                  <div key={report.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{report.type.toUpperCase()}</h4>
                      <Badge className={getComplianceColor(report.status)}>
                        {report.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Compliance Score</span>
                        <span>{report.score}%</span>
                      </div>
                      <Progress value={report.score} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Last Audit: {new Date(report.lastAudit).toLocaleDateString()}</span>
                        <span>Expires: {new Date(report.expiryDate).toLocaleDateString()}</span>
                      </div>
                      {report.issues.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-medium text-red-600">Outstanding Issues:</p>
                          <ul className="text-xs text-muted-foreground mt-1">
                            {report.issues.map((issue, index) => (
                              <li key={index}>• {issue}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security policies and controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(securitySettings).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {key === 'mfaRequired' && 'Require multi-factor authentication for all users'}
                      {key === 'sessionTimeout' && 'Automatic session timeout in minutes'}
                      {key === 'passwordComplexity' && 'Enforce strong password requirements'}
                      {key === 'ipWhitelist' && 'Restrict access to whitelisted IP addresses'}
                      {key === 'auditLogging' && 'Log all user actions and system events'}
                      {key === 'dataEncryption' && 'Encrypt sensitive data at rest and in transit'}
                      {key === 'anonymousAnalytics' && 'Allow anonymous usage analytics'}
                    </div>
                  </div>
                  <Switch
                    checked={typeof value === 'boolean' ? value : false}
                    onCheckedChange={(checked) => updateSecuritySetting(key, checked)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};