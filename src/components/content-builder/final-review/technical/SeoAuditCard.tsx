import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, ExternalLink, Target } from 'lucide-react';
import { motion } from 'framer-motion';

interface SeoIssue {
  type: 'meta' | 'heading' | 'links' | 'images';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  solution: string;
}

interface SeoAuditCardProps {
  score: number;
  metaTitle?: string;
  metaDescription?: string;
  headingStructure?: any;
  issues?: SeoIssue[];
  onFixIssue?: (issueType: string) => void;
}

export const SeoAuditCard: React.FC<SeoAuditCardProps> = ({
  score,
  metaTitle,
  metaDescription,
  headingStructure,
  issues = [],
  onFixIssue
}) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const mockIssues: SeoIssue[] = [
    {
      type: 'meta',
      severity: 'high',
      title: 'Meta Description Missing',
      description: 'Page is missing a meta description tag',
      solution: 'Add a compelling meta description (150-160 characters)'
    },
    {
      type: 'heading',
      severity: 'medium',
      title: 'Multiple H1 Tags',
      description: 'Page contains multiple H1 tags',
      solution: 'Use only one H1 tag per page for better SEO'
    },
    {
      type: 'images',
      severity: 'low',
      title: 'Alt Text Missing',
      description: 'Some images lack alt text',
      solution: 'Add descriptive alt text to all images'
    }
  ];

  const allIssues = issues.length > 0 ? issues : mockIssues;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            SEO Technical Audit
            <Badge variant={score >= 80 ? "default" : score >= 60 ? "secondary" : "destructive"} className="ml-auto">
              {score}/100
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Meta Tags Status */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Meta Tags Analysis</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Title Tag</span>
                <div className="flex items-center gap-2">
                  {metaTitle ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-xs">
                    {metaTitle ? `${metaTitle.length} chars` : 'Missing'}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Meta Description</span>
                <div className="flex items-center gap-2">
                  {metaDescription ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-xs">
                    {metaDescription ? `${metaDescription.length} chars` : 'Missing'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Issues List */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Issues & Recommendations</h4>
            <div className="space-y-2">
              {allIssues.map((issue, index) => (
                <div key={index} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={getSeverityColor(issue.severity)} className="text-xs">
                        {issue.severity.toUpperCase()}
                      </Badge>
                      <span className="font-medium text-sm">{issue.title}</span>
                    </div>
                    {onFixIssue && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onFixIssue(issue.type)}
                        className="text-xs"
                      >
                        Fix
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{issue.description}</p>
                  <p className="text-xs text-primary">{issue.solution}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="pt-4 border-t">
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="text-xs">
                <ExternalLink className="h-3 w-3 mr-1" />
                Run Full SEO Audit
              </Button>
              <Button size="sm" variant="outline" className="text-xs">
                Export Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};