import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Smartphone, Monitor, Tablet, Wifi, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

interface ResponsiveCheck {
  device: 'mobile' | 'tablet' | 'desktop';
  score: number;
  issues: string[];
}

interface TechnicalStandard {
  name: string;
  status: 'compliant' | 'partial' | 'non_compliant';
  description: string;
}

interface MobileTechnicalStandardsCardProps {
  score: number;
  responsiveChecks?: ResponsiveCheck[];
  technicalStandards?: TechnicalStandard[];
}

export const MobileTechnicalStandardsCard: React.FC<MobileTechnicalStandardsCardProps> = ({
  score,
  responsiveChecks = [],
  technicalStandards = []
}) => {
  // Mock responsive data
  const defaultResponsiveChecks: ResponsiveCheck[] = [
    {
      device: 'mobile',
      score: 85,
      issues: ['Touch targets too small', 'Horizontal scrolling detected']
    },
    {
      device: 'tablet',
      score: 92,
      issues: ['Image sizing on landscape']
    },
    {
      device: 'desktop',
      score: 96,
      issues: []
    }
  ];

  // Mock technical standards
  const defaultTechnicalStandards: TechnicalStandard[] = [
    {
      name: 'HTML5 Semantic Elements',
      status: 'compliant',
      description: 'Proper use of semantic HTML5 elements'
    },
    {
      name: 'Mobile Viewport Meta Tag',
      status: 'compliant',
      description: 'Responsive viewport configuration'
    },
    {
      name: 'Progressive Web App',
      status: 'partial',
      description: 'Missing service worker and manifest'
    },
    {
      name: 'HTTPS Protocol',
      status: 'compliant',
      description: 'Secure connection established'
    },
    {
      name: 'AMP Compatibility',
      status: 'non_compliant',
      description: 'Not optimized for Accelerated Mobile Pages'
    }
  ];

  const allResponsiveChecks = responsiveChecks.length > 0 ? responsiveChecks : defaultResponsiveChecks;
  const allTechnicalStandards = technicalStandards.length > 0 ? technicalStandards : defaultTechnicalStandards;

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      case 'tablet': return <Tablet className="h-4 w-4" />;
      case 'desktop': return <Monitor className="h-4 w-4" />;
      default: return <Smartphone className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-green-500';
      case 'partial': return 'text-yellow-500';
      case 'non_compliant': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'compliant': return 'default';
      case 'partial': return 'secondary';
      case 'non_compliant': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.5 }}
    >
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Mobile & Technical Standards
            <Badge variant={score >= 80 ? "default" : score >= 60 ? "secondary" : "destructive"} className="ml-auto">
              {score}/100
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Responsive Design Scores */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Responsive Design
            </h4>
            <div className="space-y-3">
              {allResponsiveChecks.map((check, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getDeviceIcon(check.device)}
                      <span className="text-sm capitalize">{check.device}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{check.score}/100</span>
                      <Badge 
                        variant={check.score >= 80 ? "default" : check.score >= 60 ? "secondary" : "destructive"}
                        className="text-xs"
                      >
                        {check.score >= 80 ? 'Good' : check.score >= 60 ? 'Fair' : 'Poor'}
                      </Badge>
                    </div>
                  </div>
                  <Progress value={check.score} className="h-2" />
                  {check.issues.length > 0 && (
                    <div className="ml-6 space-y-1">
                      {check.issues.map((issue, issueIndex) => (
                        <div key={issueIndex} className="text-xs text-muted-foreground flex items-start gap-2">
                          <div className="w-1 h-1 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                          {issue}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Technical Standards Compliance */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Web Standards Compliance
            </h4>
            <div className="space-y-2">
              {allTechnicalStandards.map((standard, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium text-sm">{standard.name}</div>
                    <div className="text-xs text-muted-foreground">{standard.description}</div>
                  </div>
                  <Badge variant={getStatusBadge(standard.status)} className="text-xs">
                    {standard.status.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile-First Insights */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Wifi className="h-4 w-4" />
              Mobile Performance
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-2 border rounded">
                <div className="text-lg font-bold text-green-500">3G</div>
                <div className="text-xs text-muted-foreground">Load Time: 2.1s</div>
              </div>
              <div className="text-center p-2 border rounded">
                <div className="text-lg font-bold text-blue-500">4G</div>
                <div className="text-xs text-muted-foreground">Load Time: 0.8s</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t">
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="text-xs">
                Test Mobile UX
              </Button>
              <Button size="sm" variant="outline" className="text-xs">
                PWA Audit
              </Button>
              <Button size="sm" variant="outline" className="text-xs">
                Standards Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};