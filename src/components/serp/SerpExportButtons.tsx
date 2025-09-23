import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, FileText, Table, Share2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SerpExportButtonsProps {
  serpData: any;
  onSave?: () => void;
  onShare?: () => void;
}

export const SerpExportButtons: React.FC<SerpExportButtonsProps> = ({ 
  serpData, 
  onSave, 
  onShare 
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      // Create comprehensive report content
      const reportContent = {
        title: `SERP Analysis Report - ${serpData.keyword}`,
        date: new Date().toLocaleDateString(),
        keyword: serpData.keyword,
        metrics: {
          searchVolume: serpData.searchVolume,
          difficulty: serpData.difficulty,
          cpc: serpData.cpc,
          competition: serpData.competition
        },
        competitors: serpData.competitors,
        opportunities: serpData.opportunities,
        relatedKeywords: serpData.relatedKeywords,
        contentGaps: serpData.contentGaps
      };

      // Generate PDF using browser's print functionality with custom styling
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>SERP Analysis Report</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; }
                .metrics { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; }
                .metric-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
                .section { margin: 20px 0; }
                .section h3 { color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
                .competitor { border-left: 3px solid #007bff; padding-left: 10px; margin: 10px 0; }
                .keywords { display: flex; flex-wrap: wrap; gap: 5px; }
                .keyword-tag { background: #f0f0f0; padding: 4px 8px; border-radius: 4px; font-size: 0.9em; }
                @media print { body { margin: 0; } }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>${reportContent.title}</h1>
                <p>Generated on ${reportContent.date}</p>
              </div>
              
              <div class="metrics">
                <div class="metric-card"><strong>Search Volume:</strong> ${reportContent.metrics.searchVolume.toLocaleString()}</div>
                <div class="metric-card"><strong>Difficulty:</strong> ${reportContent.metrics.difficulty}/100</div>
                <div class="metric-card"><strong>CPC:</strong> ${reportContent.metrics.cpc}</div>
                <div class="metric-card"><strong>Competition:</strong> ${reportContent.metrics.competition}</div>
              </div>

              <div class="section">
                <h3>Top Competitors</h3>
                ${reportContent.competitors.slice(0, 10).map(comp => `
                  <div class="competitor">
                    <strong>${comp.title}</strong><br>
                    <a href="${comp.url}">${comp.url}</a><br>
                    <em>Position: ${comp.position}</em>
                  </div>
                `).join('')}
              </div>

              <div class="section">
                <h3>Related Keywords</h3>
                <div class="keywords">
                  ${reportContent.relatedKeywords.map(kw => `<span class="keyword-tag">${kw}</span>`).join('')}
                </div>
              </div>

              <div class="section">
                <h3>Content Opportunities</h3>
                <ul>
                  ${reportContent.contentGaps.map(gap => `<li>${gap}</li>`).join('')}
                </ul>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      }

      toast({
        title: "PDF Export Started",
        description: "Your SERP analysis report is being generated.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to generate PDF report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportToCSV = () => {
    try {
      // Create CSV content
      const csvContent = [
        ['Metric', 'Value'],
        ['Keyword', serpData.keyword],
        ['Search Volume', serpData.searchVolume],
        ['Difficulty', serpData.difficulty],
        ['CPC', serpData.cpc],
        ['Competition', serpData.competition],
        [''],
        ['Competitors', 'URL', 'Position', 'Title'],
        ...serpData.competitors.slice(0, 20).map((comp: any) => [
          comp.title,
          comp.url,
          comp.position,
          comp.snippet || ''
        ]),
        [''],
        ['Related Keywords'],
        ...serpData.relatedKeywords.map((kw: string) => [kw]),
        [''],
        ['Content Gaps'],
        ...serpData.contentGaps.map((gap: string) => [gap])
      ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `serp-analysis-${serpData.keyword}-${new Date().toISOString().split('T')[0]}.csv`;
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
        text: `Check out this SERP analysis for "${serpData.keyword}" - ${serpData.searchVolume.toLocaleString()} monthly searches, ${serpData.difficulty}/100 difficulty`,
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
    <Card className="mt-4">
      <CardContent className="pt-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportToPDF}
            disabled={isExporting}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Export PDF
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
            Share
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
  );
};