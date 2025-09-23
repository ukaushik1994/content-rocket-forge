import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, FileText, Table, Share2, Save, Calendar, Users, Settings, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SerpExportButtonsProps {
  serpData: any;
  onSave?: () => void;
  onShare?: () => void;
  userId?: string;
  brandSettings?: {
    companyName?: string;
    logo?: string;
    colors?: {
      primary: string;
      secondary: string;
    };
  };
}

export const SerpExportButtons: React.FC<SerpExportButtonsProps> = ({ 
  serpData, 
  onSave, 
  onShare,
  userId,
  brandSettings = {
    companyName: 'Your Company',
    colors: { primary: '#007bff', secondary: '#6c757d' }
  }
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [reportTemplate, setReportTemplate] = useState('professional');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [scheduledReport, setScheduledReport] = useState(false);
  const [shareWithTeam, setShareWithTeam] = useState(false);
  const { toast } = useToast();

  const generateBrandedPDF = async (template: string = 'professional') => {
    setIsExporting(true);
    try {
      const reportContent = {
        title: `SERP Intelligence Report - ${serpData.keyword}`,
        company: brandSettings.companyName,
        keyword: serpData.keyword,
        metrics: {
          searchVolume: serpData.searchVolume,
          difficulty: serpData.difficulty,
          cpc: serpData.cpc,
          competition: serpData.competition
        }
      };

      // Generate and print report (simplified)
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html><head><title>${reportContent.title}</title></head>
          <body style="font-family: Arial;">
            <h1>${reportContent.title}</h1>
            <p>Company: ${reportContent.company}</p>
            <p>Keyword: ${reportContent.keyword}</p>
            <p>Search Volume: ${reportContent.metrics.searchVolume}</p>
            <p>Difficulty: ${reportContent.metrics.difficulty}</p>
          </body></html>
        `);
        printWindow.document.close();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      }

      toast({
        title: "Professional Report Generated",
        description: "SERP report created successfully.",
      });
    } catch (error) {
      toast({
        title: "Report Generation Failed",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportToCSV = () => {
    try {
      const csvContent = [
        ['Metric', 'Value'],
        ['Keyword', serpData.keyword],
        ['Search Volume', serpData.searchVolume],
        ['Difficulty', serpData.difficulty]
      ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `serp-analysis-${serpData.keyword}.csv`;
      link.click();

      toast({
        title: "CSV Exported",
        description: "SERP data has been exported to CSV format.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export CSV. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `SERP Analysis - ${serpData.keyword}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Analysis link copied to clipboard.",
      });
    }
    onShare?.();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Professional Reports & Export</CardTitle>
          <p className="text-sm text-muted-foreground">
            Generate branded reports and schedule automated analysis
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => generateBrandedPDF('professional')}
              disabled={isExporting}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Professional PDF
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={exportToCSV}
              className="flex items-center gap-2"
            >
              <Table className="h-4 w-4" />
              Export CSV
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              Share Analysis
            </Button>

            {onSave && (
              <Button
                variant="outline"
                size="sm"
                onClick={onSave}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save Analysis
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      
      {isExporting && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              Generating report for "{serpData.keyword}"...
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};