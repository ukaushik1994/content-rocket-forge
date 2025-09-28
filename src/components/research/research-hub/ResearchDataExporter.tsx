import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  FileText, 
  Zap, 
  Share2, 
  ChevronRight,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SerpAnalysisResult } from '@/types/serp';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface ResearchDataExporterProps {
  searchTerm: string;
  serpData?: SerpAnalysisResult | null;
  contentGaps?: any[];
  peopleQuestions?: any[];
  className?: string;
}

interface ExportOption {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  action: () => void;
  badge?: string;
}

export const ResearchDataExporter: React.FC<ResearchDataExporterProps> = ({
  searchTerm,
  serpData,
  contentGaps = [],
  peopleQuestions = [],
  className
}) => {
  const navigate = useNavigate();
  const [exporting, setExporting] = useState<string | null>(null);

  const handleExportToContentBuilder = async () => {
    setExporting('content-builder');
    try {
      // Prepare comprehensive research data
      const researchData = {
        keyword: searchTerm,
        serpData,
        contentGaps,
        peopleQuestions,
        exportedAt: new Date().toISOString()
      };

      // Store in sessionStorage for Content Builder to pick up
      sessionStorage.setItem('research_export_data', JSON.stringify(researchData));
      
      toast.success('Research data prepared for Content Builder');
      
      // Navigate to Content Builder with pre-populated data
      navigate(`/content-builder?keyword=${encodeURIComponent(searchTerm)}&source=research`);
    } catch (error) {
      toast.error('Failed to export to Content Builder');
    } finally {
      setExporting(null);
    }
  };

  const handleExportToKeywords = async () => {
    setExporting('keywords');
    try {
      const keywordData = {
        keyword: searchTerm,
        serpMetrics: serpData ? {
          searchVolume: serpData.searchVolume,
          difficulty: serpData.keywordDifficulty,
          competition: serpData.competitionScore,
          intent: serpData.commercialSignals?.commercialIntent
        } : null,
        relatedKeywords: serpData?.relatedSearches || [],
        exportedAt: new Date().toISOString()
      };

      // Store for Keywords page to pick up
      sessionStorage.setItem('keyword_research_data', JSON.stringify(keywordData));
      
      toast.success('Keyword data saved to library');
      
      // Navigate to Keywords page
      navigate('/keywords');
    } catch (error) {
      toast.error('Failed to save to keyword library');
    } finally {
      setExporting(null);
    }
  };

  const handleExportReport = async () => {
    setExporting('report');
    try {
      // Generate comprehensive research report
      const reportData = {
        title: `Keyword Research Report: ${searchTerm}`,
        generatedAt: new Date().toLocaleString(),
        keyword: searchTerm,
        metrics: serpData ? {
          'Search Volume': serpData.searchVolume?.toLocaleString() || 'N/A',
          'Keyword Difficulty': serpData.keywordDifficulty || 'N/A',
          'Competition Score': serpData.competitionScore || 'N/A',
          'Commercial Intent': serpData.commercialSignals?.commercialIntent || 'Unknown'
        } : {},
        topResults: serpData?.topResults?.slice(0, 10) || [],
        relatedKeywords: serpData?.relatedSearches || [],
        peopleAlsoAsk: serpData?.peopleAlsoAsk || [],
        contentGaps: contentGaps,
        peopleQuestions: peopleQuestions
      };

      // Convert to downloadable format
      const reportText = generateReportText(reportData);
      downloadTextFile(`${searchTerm}_research_report.txt`, reportText);
      
      toast.success('Research report downloaded');
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setExporting(null);
    }
  };

  const generateReportText = (data: any): string => {
    let report = `# ${data.title}\n\n`;
    report += `Generated: ${data.generatedAt}\n\n`;
    
    report += `## Keyword Metrics\n`;
    Object.entries(data.metrics).forEach(([key, value]) => {
      report += `- ${key}: ${value}\n`;
    });
    report += '\n';

    report += `## Top SERP Results\n`;
    data.topResults.forEach((result: any, index: number) => {
      report += `${index + 1}. ${result.title}\n`;
      report += `   URL: ${result.link}\n`;
      report += `   Snippet: ${result.snippet}\n\n`;
    });

    report += `## Related Keywords\n`;
    data.relatedKeywords.forEach((kw: any) => {
      report += `- ${kw.query || kw}\n`;
    });
    report += '\n';

    if (data.peopleAlsoAsk.length > 0) {
      report += `## People Also Ask\n`;
      data.peopleAlsoAsk.forEach((q: any) => {
        report += `- ${q.question}\n`;
      });
      report += '\n';
    }

    if (data.contentGaps.length > 0) {
      report += `## Content Opportunities\n`;
      data.contentGaps.forEach((gap: any) => {
        report += `- ${gap.topic}: ${gap.description}\n`;
      });
      report += '\n';
    }

    return report;
  };

  const downloadTextFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportOptions: ExportOption[] = [
    {
      id: 'content-builder',
      title: 'Export to Content Builder',
      description: 'Create content using this research data',
      icon: Zap,
      action: handleExportToContentBuilder,
      badge: 'Recommended'
    },
    {
      id: 'keywords',
      title: 'Save to Keyword Library',
      description: 'Add keyword metrics to your library',
      icon: FileText,
      action: handleExportToKeywords
    },
    {
      id: 'report',
      title: 'Download Research Report',
      description: 'Export comprehensive research as text file',
      icon: Download,
      action: handleExportReport
    }
  ];

  const hasData = serpData || contentGaps.length > 0 || peopleQuestions.length > 0;

  if (!hasData) {
    return null;
  }

  return (
    <Card className={`glass-panel border-white/10 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Share2 className="h-5 w-5 text-neon-blue" />
          Export Research Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-white/70 mb-4">
          Transform your research into actionable content and insights
        </p>
        
        <div className="space-y-3">
          {exportOptions.map((option, index) => (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Button
                variant="ghost"
                className="w-full justify-start p-4 h-auto bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all"
                onClick={option.action}
                disabled={exporting === option.id}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-neon-blue to-neon-purple flex items-center justify-center">
                    {exporting === option.id ? (
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <option.icon className="h-5 w-5 text-white" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white">{option.title}</span>
                      {option.badge && (
                        <Badge className="text-xs bg-neon-blue/20 text-neon-blue border-neon-blue/30">
                          {option.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-white/60">{option.description}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-white/40" />
                </div>
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Data Summary */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <h4 className="text-sm font-medium text-white mb-3">Research Summary</h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-white/60">SERP Results:</span>
              <span className="text-white font-medium">
                {serpData?.topResults?.length || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60">Related Keywords:</span>
              <span className="text-white font-medium">
                {serpData?.relatedSearches?.length || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60">Content Gaps:</span>
              <span className="text-white font-medium">{contentGaps.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/60">People Questions:</span>
              <span className="text-white font-medium">{peopleQuestions.length}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};