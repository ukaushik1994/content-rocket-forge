import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  Search, 
  TrendingUp, 
  Target, 
  FileCheck,
  AlertCircle,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { ComplianceAnalysisResult, ComplianceCategory } from '@/types/contentCompliance';

interface ComplianceDashboardProps {
  complianceResult: ComplianceAnalysisResult;
  onCategoryClick?: (category: ComplianceCategory) => void;
}

export const ComplianceDashboard: React.FC<ComplianceDashboardProps> = ({
  complianceResult,
  onCategoryClick
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getStatusIcon = (violations: number) => {
    if (violations === 0) return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    if (violations <= 2) return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  const categoryIcons = {
    keyword: Search,
    serp: TrendingUp,
    solution: Target,
    structure: FileCheck
  };

  const categories = [
    {
      key: 'keyword' as ComplianceCategory,
      title: 'Keyword Usage',
      result: complianceResult.keyword,
      icon: categoryIcons.keyword
    },
    {
      key: 'serp' as ComplianceCategory,
      title: 'SERP Integration',
      result: complianceResult.serp,
      icon: categoryIcons.serp
    },
    {
      key: 'solution' as ComplianceCategory,
      title: 'Solution Integration',
      result: complianceResult.solution,
      icon: categoryIcons.solution
    },
    {
      key: 'structure' as ComplianceCategory,
      title: 'Content Structure',
      result: complianceResult.structure,
      icon: categoryIcons.structure
    }
  ];

  return (
    <div className="space-y-6">
      {/* Overall Compliance Score */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Overall Compliance</CardTitle>
            </div>
            <Badge 
              variant={complianceResult.overall.compliant ? "default" : "destructive"}
              className="text-sm"
            >
              {complianceResult.overall.compliant ? 'Compliant' : 'Issues Found'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className={`text-3xl font-bold ${getScoreColor(complianceResult.overall.score)}`}>
              {Math.round(complianceResult.overall.score)}%
            </div>
            <p className="text-sm text-muted-foreground">Compliance Score</p>
          </div>
          
          <Progress 
            value={complianceResult.overall.score} 
            className="h-3"
          />
          
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {complianceResult.overall.criticalViolations} critical issues
            </span>
            <span className="text-muted-foreground">
              {complianceResult.overall.totalViolations} total issues
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map(({ key, title, result, icon: Icon }) => (
          <Card 
            key={key}
            className={`border-l-4 transition-colors cursor-pointer hover:bg-accent/50 ${
              result.violations.length === 0 
                ? 'border-l-green-500' 
                : result.violations.some(v => v.severity === 'critical')
                  ? 'border-l-red-500'
                  : 'border-l-yellow-500'
            }`}
            onClick={() => onCategoryClick?.(key)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <CardTitle className="text-sm">{title}</CardTitle>
                </div>
                {getStatusIcon(result.violations.length)}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center">
                <span className={`text-lg font-semibold ${getScoreColor(result.score)}`}>
                  {Math.round(result.score)}%
                </span>
                <Badge variant="outline" className="text-xs">
                  {result.violations.length} issues
                </Badge>
              </div>
              
              {result.violations.length > 0 && (
                <div className="space-y-1">
                  {result.violations.slice(0, 2).map((violation, index) => (
                    <div key={index} className="text-xs text-muted-foreground truncate">
                      • {violation.message}
                    </div>
                  ))}
                  {result.violations.length > 2 && (
                    <div className="text-xs text-muted-foreground">
                      +{result.violations.length - 2} more issues
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};