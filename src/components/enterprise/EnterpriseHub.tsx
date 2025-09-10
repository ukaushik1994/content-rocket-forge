import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Zap, 
  BarChart3, 
  Shield, 
  Settings,
  ChevronRight,
  Users,
  Globe,
  Smartphone
} from 'lucide-react';
import { AIModelOrchestrator } from './AIModelOrchestrator';
import { ThirdPartyIntegrations } from './ThirdPartyIntegrations';
import { AdvancedAnalyticsDashboard } from './AdvancedAnalyticsDashboard';
import { SecurityCompliancePanel } from './SecurityCompliancePanel';
import { TeamWorkspaceManager } from './TeamWorkspaceManager';
import { MobileExperienceSettings } from './MobileExperienceSettings';
import { APIEcosystemManager } from './APIEcosystemManager';
import { AITrainingCustomization } from './AITrainingCustomization';

interface EnterpriseFeature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'active' | 'beta' | 'coming_soon';
  category: 'ai' | 'integrations' | 'analytics' | 'security' | 'collaboration' | 'mobile';
}

const ENTERPRISE_FEATURES: EnterpriseFeature[] = [
  {
    id: 'ai-orchestrator',
    title: 'AI Model Orchestrator',
    description: 'Intelligent model selection and cost optimization',
    icon: <Brain className="h-5 w-5" />,
    status: 'active',
    category: 'ai'
  },
  {
    id: 'integrations',
    title: 'Third-Party Integrations',
    description: 'Connect with CRM, email, and automation tools',
    icon: <Zap className="h-5 w-5" />,
    status: 'active',
    category: 'integrations'
  },
  {
    id: 'analytics',
    title: 'Advanced Analytics',
    description: 'ROI tracking and predictive insights',
    icon: <BarChart3 className="h-5 w-5" />,
    status: 'active',
    category: 'analytics'
  },
  {
    id: 'security',
    title: 'Security & Compliance',
    description: 'Enterprise-grade security and GDPR compliance',
    icon: <Shield className="h-5 w-5" />,
    status: 'active',
    category: 'security'
  },
  {
    id: 'team-workspace',
    title: 'Team Workspace',
    description: 'Collaborative AI workspace with role management',
    icon: <Users className="h-5 w-5" />,
    status: 'active',
    category: 'collaboration'
  },
  {
    id: 'mobile-app',
    title: 'Mobile Experience',
    description: 'Progressive web app with offline capabilities',
    icon: <Smartphone className="h-5 w-5" />,
    status: 'active',
    category: 'mobile'
  },
  {
    id: 'api-ecosystem',
    title: 'API Ecosystem',
    description: 'RESTful APIs and webhook integrations',
    icon: <Globe className="h-5 w-5" />,
    status: 'active',
    category: 'integrations'
  },
  {
    id: 'custom-training',
    title: 'AI Training & Customization',
    description: 'Custom AI models trained on your data',
    icon: <Settings className="h-5 w-5" />,
    status: 'active',
    category: 'ai'
  }
];

export const EnterpriseHub: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState<string>('overview');

  const activeFeatures = ENTERPRISE_FEATURES.filter(f => f.status === 'active');
  const betaFeatures = ENTERPRISE_FEATURES.filter(f => f.status === 'beta');
  const upcomingFeatures = ENTERPRISE_FEATURES.filter(f => f.status === 'coming_soon');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'beta':
        return <Badge variant="secondary">Beta</Badge>;
      case 'coming_soon':
        return <Badge variant="outline">Coming Soon</Badge>;
      default:
        return null;
    }
  };

  if (activeFeature === 'ai-orchestrator') {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => setActiveFeature('overview')}>
          ← Back to Enterprise Hub
        </Button>
        <AIModelOrchestrator />
      </div>
    );
  }

  if (activeFeature === 'integrations') {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => setActiveFeature('overview')}>
          ← Back to Enterprise Hub
        </Button>
        <ThirdPartyIntegrations />
      </div>
    );
  }

  if (activeFeature === 'analytics') {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => setActiveFeature('overview')}>
          ← Back to Enterprise Hub
        </Button>
        <AdvancedAnalyticsDashboard />
      </div>
    );
  }

  if (activeFeature === 'security') {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => setActiveFeature('overview')}>
          ← Back to Enterprise Hub
        </Button>
        <SecurityCompliancePanel />
      </div>
    );
  }

  if (activeFeature === 'team-workspace') {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => setActiveFeature('overview')}>
          ← Back to Enterprise Hub
        </Button>
        <TeamWorkspaceManager />
      </div>
    );
  }

  if (activeFeature === 'mobile-app') {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => setActiveFeature('overview')}>
          ← Back to Enterprise Hub
        </Button>
        <MobileExperienceSettings />
      </div>
    );
  }

  if (activeFeature === 'api-ecosystem') {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => setActiveFeature('overview')}>
          ← Back to Enterprise Hub
        </Button>
        <APIEcosystemManager />
      </div>
    );
  }

  if (activeFeature === 'custom-training') {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => setActiveFeature('overview')}>
          ← Back to Enterprise Hub
        </Button>
        <AITrainingCustomization />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Enterprise Hub</h1>
          <p className="text-muted-foreground">
            Advanced AI platform with enterprise-grade features and integrations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Phase 4</Badge>
          <Badge variant="default">{activeFeatures.length} Active Features</Badge>
        </div>
      </div>

      <Tabs value={activeFeature} onValueChange={setActiveFeature} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ai-orchestrator">AI Models</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="team-workspace">Team</TabsTrigger>
          <TabsTrigger value="mobile-app">Mobile</TabsTrigger>
          <TabsTrigger value="api-ecosystem">APIs</TabsTrigger>
          <TabsTrigger value="custom-training">Training</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Active Features */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Active Enterprise Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
              {activeFeatures.map(feature => (
                <Card 
                  key={feature.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setActiveFeature(feature.id)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          {feature.icon}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{feature.title}</CardTitle>
                          <CardDescription>{feature.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(feature.status)}
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>

          {/* Beta Features */}
          {betaFeatures.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Beta Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {betaFeatures.map(feature => (
                  <Card key={feature.id} className="opacity-80">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-secondary/20 rounded-lg">
                            {feature.icon}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{feature.title}</CardTitle>
                            <CardDescription>{feature.description}</CardDescription>
                          </div>
                        </div>
                        {getStatusBadge(feature.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" size="sm" disabled>
                        Available in Beta
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Features */}
          {upcomingFeatures.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Coming Soon</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingFeatures.map(feature => (
                  <Card key={feature.id} className="opacity-60">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-muted rounded-lg">
                            {feature.icon}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{feature.title}</CardTitle>
                            <CardDescription>{feature.description}</CardDescription>
                          </div>
                        </div>
                        {getStatusBadge(feature.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button variant="ghost" size="sm" disabled>
                        In Development
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Enterprise Benefits */}
          <Card>
            <CardHeader>
              <CardTitle>Enterprise Benefits</CardTitle>
              <CardDescription>
                Why choose our enterprise-grade AI platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Cost Optimization</h4>
                  <p className="text-sm text-muted-foreground">
                    Intelligent model selection reduces AI costs by up to 40%
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Security First</h4>
                  <p className="text-sm text-muted-foreground">
                    Enterprise-grade security with GDPR and SOC2 compliance
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Team Collaboration</h4>
                  <p className="text-sm text-muted-foreground">
                    Role-based access control and team workspace features
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Advanced Analytics</h4>
                  <p className="text-sm text-muted-foreground">
                    ROI tracking and predictive insights for better decisions
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Seamless Integrations</h4>
                  <p className="text-sm text-muted-foreground">
                    Connect with CRM, email, and 5000+ apps via Zapier
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">24/7 Support</h4>
                  <p className="text-sm text-muted-foreground">
                    Dedicated support team and comprehensive documentation
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};