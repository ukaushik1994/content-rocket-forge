import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Shield, Eye, Users, Keyboard } from 'lucide-react';
import { motion } from 'framer-motion';

interface AccessibilityIssue {
  category: 'color' | 'heading' | 'alt_text' | 'keyboard' | 'aria';
  severity: 'critical' | 'serious' | 'moderate' | 'minor';
  title: string;
  description: string;
  wcagLevel: 'A' | 'AA' | 'AAA';
}

interface AccessibilityComplianceCardProps {
  score: number;
  issues?: AccessibilityIssue[];
  complianceLevel?: 'A' | 'AA' | 'AAA';
}

export const AccessibilityComplianceCard: React.FC<AccessibilityComplianceCardProps> = ({
  score,
  issues = [],
  complianceLevel = 'AA'
}) => {
  // Mock accessibility issues
  const defaultIssues: AccessibilityIssue[] = [
    {
      category: 'color',
      severity: 'serious',
      title: 'Insufficient Color Contrast',
      description: 'Text color contrast ratio is below WCAG AA standards',
      wcagLevel: 'AA'
    },
    {
      category: 'alt_text',
      severity: 'moderate',
      title: 'Missing Alt Text',
      description: '3 images are missing descriptive alt text',
      wcagLevel: 'A'
    },
    {
      category: 'heading',
      severity: 'minor',
      title: 'Heading Structure',
      description: 'Heading levels should not skip (h2 to h4)',
      wcagLevel: 'A'
    }
  ];

  const allIssues = issues.length > 0 ? issues : defaultIssues;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'serious': return 'destructive';
      case 'moderate': return 'secondary';
      case 'minor': return 'outline';
      default: return 'secondary';
    }
  };

  const getComplianceColor = (level: string) => {
    switch (level) {
      case 'AAA': return 'text-green-600';
      case 'AA': return 'text-blue-600';
      case 'A': return 'text-yellow-600';
      default: return 'text-muted-foreground';
    }
  };

  // Calculate compliance stats
  const criticalIssues = allIssues.filter(i => i.severity === 'critical' || i.severity === 'serious').length;
  const totalIssues = allIssues.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
    >
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Accessibility Compliance
            <Badge variant={score >= 80 ? "default" : score >= 60 ? "secondary" : "destructive"} className="ml-auto">
              {score}/100
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* WCAG Compliance Level */}
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="space-y-1">
              <div className="text-sm font-medium">WCAG Compliance Level</div>
              <div className={`text-lg font-bold ${getComplianceColor(complianceLevel)}`}>
                {complianceLevel}
              </div>
            </div>
            <div className="text-right space-y-1">
              <div className="text-xs text-muted-foreground">Issues Found</div>
              <div className="flex gap-2">
                {criticalIssues > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {criticalIssues} Critical
                  </Badge>
                )}
                <Badge variant="secondary" className="text-xs">
                  {totalIssues} Total
                </Badge>
              </div>
            </div>
          </div>

          {/* Accessibility Categories */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Users className="h-4 w-4" />
              Accessibility Checks
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Color Contrast</span>
                  <Badge variant="secondary" className="text-xs">Needs Work</Badge>
                </div>
                <Progress value={65} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Keyboard Navigation</span>
                  <Badge variant="default" className="text-xs">Good</Badge>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Screen Reader</span>
                  <Badge variant="secondary" className="text-xs">Fair</Badge>
                </div>
                <Progress value={72} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Focus Management</span>
                  <Badge variant="default" className="text-xs">Good</Badge>
                </div>
                <Progress value={88} className="h-2" />
              </div>
            </div>
          </div>

          {/* Issues List */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Priority Issues
            </h4>
            <div className="space-y-2">
              {allIssues.slice(0, 3).map((issue, index) => (
                <div key={index} className="border rounded-lg p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <Badge variant={getSeverityColor(issue.severity)} className="text-xs">
                      {issue.severity.toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      WCAG {issue.wcagLevel}
                    </Badge>
                  </div>
                  <div className="font-medium text-sm">{issue.title}</div>
                  <div className="text-xs text-muted-foreground">{issue.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t">
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="text-xs">
                <Keyboard className="h-3 w-3 mr-1" />
                Test Keyboard Nav
              </Button>
              <Button size="sm" variant="outline" className="text-xs">
                Full A11y Audit
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};