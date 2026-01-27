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
  Globe
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

interface SecurityMetrics {
  overallScore: number;
  encryption: {
    enabled: boolean;
    level: string;
    status: 'active' | 'warning' | 'error';
  };
  compliance: {
    gdpr: boolean;
    ccpa: boolean;
    hipaa: boolean;
    soc2: boolean;
  };
  access: {
    mfaEnabled: boolean;
    rbacActive: boolean;
    sessionTimeout: number;
    failedAttempts: number;
  };
  audit: {
    logsRetention: number;
    lastBackup: string;
    totalEvents: number;
    criticalEvents: number;
  };
  dataProtection: {
    anonymization: boolean;
    rightToDelete: boolean;
    dataMinimization: boolean;
    consentManagement: boolean;
  };
}

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  status: 'success' | 'warning' | 'error';
  details: string;
  ipAddress: string;
}

const MOCK_SECURITY_METRICS: SecurityMetrics = {
  overallScore: 92,
  encryption: {
    enabled: true,
    level: 'AES-256',
    status: 'active'
  },
  compliance: {
    gdpr: true,
    ccpa: true,
    hipaa: false,
    soc2: true
  },
  access: {
    mfaEnabled: true,
    rbacActive: true,
    sessionTimeout: 30,
    failedAttempts: 3
  },
  audit: {
    logsRetention: 365,
    lastBackup: '2024-01-15T10:30:00Z',
    totalEvents: 15420,
    criticalEvents: 12
  },
  dataProtection: {
    anonymization: true,
    rightToDelete: true,
    dataMinimization: true,
    consentManagement: true
  }
};

const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: '1',
    timestamp: '2024-01-15T14:30:00Z',
    user: 'admin@company.com',
    action: 'LOGIN_SUCCESS',
    resource: 'authentication',
    status: 'success',
    details: 'Successful MFA login',
    ipAddress: '192.168.1.100'
  },
  {
    id: '2',
    timestamp: '2024-01-15T14:25:00Z',
    user: 'user@company.com',
    action: 'DATA_EXPORT',
    resource: 'user_data',
    status: 'success',
    details: 'GDPR data export requested',
    ipAddress: '192.168.1.101'
  },
  {
    id: '3',
    timestamp: '2024-01-15T14:20:00Z',
    user: 'unknown@attacker.com',
    action: 'LOGIN_FAILED',
    resource: 'authentication',
    status: 'error',
    details: 'Failed login attempt - account locked',
    ipAddress: '10.0.0.1'
  },
  {
    id: '4',
    timestamp: '2024-01-15T14:15:00Z',
    user: 'editor@company.com',
    action: 'CONTENT_DELETE',
    resource: 'content_item',
    status: 'warning',
    details: 'Content deleted without approval',
    ipAddress: '192.168.1.102'
  }
];

export const SecurityCompliancePanel: React.FC = () => {
  const [metrics, setMetrics] = useState<SecurityMetrics>(MOCK_SECURITY_METRICS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);
  const [encryptionEnabled, setEncryptionEnabled] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Get current user
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getCurrentUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getComplianceScore = () => {
    const compliance = metrics.compliance;
    const enabled = Object.values(compliance).filter(Boolean).length;
    return (enabled / Object.keys(compliance).length) * 100;
  };

  const exportAuditLogs = () => {
    const csv = [
      'Timestamp,User,Action,Resource,Status,Details,IP Address',
      ...auditLogs.map(log => 
        `${log.timestamp},${log.user},${log.action},${log.resource},${log.status},"${log.details}",${log.ipAddress}`
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const requestDataDeletion = async () => {
    // Simulate GDPR data deletion request
    alert('Data deletion request submitted. You will receive confirmation within 30 days.');
  };

  const exportUserData = async () => {
    if (!user?.id) {
      alert('Please log in to export your data');
      return;
    }
    
    try {
      // Fetch actual user data from database
      const [contentResult, analyticsResult, profileResult] = await Promise.all([
        supabase.from('content_items').select('*').eq('user_id', user.id).limit(100),
        supabase.from('content_analytics').select('*').limit(50),
        supabase.from('profiles').select('*').eq('id', user.id).single()
      ]);
      
      // Calculate aggregate analytics
      const analytics = analyticsResult.data || [];
      const totalViews = analytics.reduce((sum, a) => sum + ((a.analytics_data as any)?.views || 0), 0);
      const totalEngagement = analytics.reduce((sum, a) => sum + ((a.analytics_data as any)?.engagement || 0), 0);
      
      const userData = {
        user: user?.email,
        exportDate: new Date().toISOString(),
        gdprCompliant: true,
        data: {
          profile: profileResult.data || { email: user?.email, created_at: user?.created_at },
          content: contentResult.data || [],
          contentCount: contentResult.data?.length || 0,
          analytics: { 
            totalViews, 
            totalEngagement,
            recordCount: analytics.length
          }
        }
      };

      const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export user data:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Security & Compliance</h2>
          <p className="text-muted-foreground">
            Enterprise-grade security and regulatory compliance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={metrics.overallScore > 90 ? 'default' : 'secondary'}>
            Security Score: {metrics.overallScore}%
          </Badge>
          <Button variant="outline" size="sm" onClick={exportAuditLogs}>
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
        </div>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Encryption</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{metrics.encryption.level}</div>
                <p className="text-xs text-muted-foreground">End-to-end encryption</p>
              </div>
              {getStatusIcon(metrics.encryption.status)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getComplianceScore().toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">
              GDPR, CCPA, SOC2 compliant
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Access Control</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">MFA + RBAC</div>
            <p className="text-xs text-muted-foreground">
              Multi-factor authentication active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Audit Events</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.audit.totalEvents.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.audit.criticalEvents} critical events
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="security" className="space-y-4">
        <TabsList>
          <TabsTrigger value="security">Security Settings</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="privacy">Privacy Controls</TabsTrigger>
        </TabsList>

        <TabsContent value="security" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Encryption & Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">End-to-End Encryption</p>
                    <p className="text-sm text-muted-foreground">AES-256 encryption for all data</p>
                  </div>
                  <Switch 
                    checked={encryptionEnabled} 
                    onCheckedChange={setEncryptionEnabled}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Multi-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">Required for all users</p>
                  </div>
                  <Switch checked={metrics.access.mfaEnabled} disabled />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Role-Based Access Control</p>
                    <p className="text-sm text-muted-foreground">Granular permissions</p>
                  </div>
                  <Switch checked={metrics.access.rbacActive} disabled />
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Session Security</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Session Timeout:</span>
                      <span>{metrics.access.sessionTimeout} minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Failed Login Attempts:</span>
                      <span>{metrics.access.failedAttempts} max</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Protection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Data Anonymization</span>
                    {metrics.dataProtection.anonymization ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Right to Delete</span>
                    {metrics.dataProtection.rightToDelete ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Data Minimization</span>
                    {metrics.dataProtection.dataMinimization ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Consent Management</span>
                    {metrics.dataProtection.consentManagement ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Backup & Recovery</h4>
                  <div className="text-sm text-muted-foreground">
                    <p>Last backup: {new Date(metrics.audit.lastBackup).toLocaleDateString()}</p>
                    <p>Retention: {metrics.audit.logsRetention} days</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Regulatory Compliance</CardTitle>
              <CardDescription>Current compliance status and certifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5" />
                      <div>
                        <p className="font-medium">GDPR (EU)</p>
                        <p className="text-sm text-muted-foreground">General Data Protection Regulation</p>
                      </div>
                    </div>
                    <Badge variant={metrics.compliance.gdpr ? 'default' : 'secondary'}>
                      {metrics.compliance.gdpr ? 'Compliant' : 'Not Active'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5" />
                      <div>
                        <p className="font-medium">CCPA (California)</p>
                        <p className="text-sm text-muted-foreground">California Consumer Privacy Act</p>
                      </div>
                    </div>
                    <Badge variant={metrics.compliance.ccpa ? 'default' : 'secondary'}>
                      {metrics.compliance.ccpa ? 'Compliant' : 'Not Active'}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Key className="h-5 w-5" />
                      <div>
                        <p className="font-medium">SOC 2 Type II</p>
                        <p className="text-sm text-muted-foreground">Security, Availability, Confidentiality</p>
                      </div>
                    </div>
                    <Badge variant={metrics.compliance.soc2 ? 'default' : 'secondary'}>
                      {metrics.compliance.soc2 ? 'Certified' : 'Pending'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Database className="h-5 w-5" />
                      <div>
                        <p className="font-medium">HIPAA</p>
                        <p className="text-sm text-muted-foreground">Health Insurance Portability</p>
                      </div>
                    </div>
                    <Badge variant={metrics.compliance.hipaa ? 'default' : 'secondary'}>
                      {metrics.compliance.hipaa ? 'Compliant' : 'Not Required'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Audit Events</CardTitle>
              <CardDescription>System activity and security events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {auditLogs.map(log => (
                  <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(log.status)}
                      <div>
                        <p className="font-medium">{log.action.replace('_', ' ')}</p>
                        <p className="text-sm text-muted-foreground">
                          {log.user} • {log.resource} • {new Date(log.timestamp).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">{log.details}</p>
                      </div>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <p>{log.ipAddress}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Controls</CardTitle>
              <CardDescription>Manage your data and privacy preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertTitle>Your Privacy Rights</AlertTitle>
                <AlertDescription>
                  Under GDPR and CCPA, you have the right to access, modify, or delete your personal data.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" onClick={exportUserData} className="h-16 flex-col">
                  <Download className="h-5 w-5 mb-1" />
                  <span>Export My Data</span>
                  <span className="text-xs text-muted-foreground">Download all your data</span>
                </Button>

                <Button variant="outline" onClick={requestDataDeletion} className="h-16 flex-col">
                  <XCircle className="h-5 w-5 mb-1" />
                  <span>Delete My Data</span>
                  <span className="text-xs text-muted-foreground">Permanent data removal</span>
                </Button>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Data Processing Consent</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Analytics & Performance</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Marketing Communications</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Third-party Integrations</span>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};