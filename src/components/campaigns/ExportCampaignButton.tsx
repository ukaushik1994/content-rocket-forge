import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { exportCampaignContent } from '@/utils/contentExporter';

interface ExportCampaignButtonProps {
  campaignId: string;
  campaignName: string;
}

export const ExportCampaignButton = ({ 
  campaignId, 
  campaignName 
}: ExportCampaignButtonProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [formats, setFormats] = useState({
    md: true,
    html: true,
    txt: false
  });
  const [includeMetadata, setIncludeMetadata] = useState(true);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // Fetch all content for this campaign
      const { data: contentItems, error } = await supabase
        .from('content_items')
        .select('*')
        .eq('campaign_id', campaignId)
        .eq('approval_status', 'published'); // Only export published content

      if (error) throw error;

      if (!contentItems || contentItems.length === 0) {
        toast.error('No content available to export');
        return;
      }

      toast.info(`Exporting ${contentItems.length} items...`);

      // Get selected formats
      const selectedFormats = Object.entries(formats)
        .filter(([_, enabled]) => enabled)
        .map(([format]) => format as 'md' | 'html' | 'txt');

      if (selectedFormats.length === 0) {
        toast.error('Please select at least one export format');
        return;
      }

      // Export content
      const blob = await exportCampaignContent(
        campaignName,
        contentItems as any[],
        {
          formats: selectedFormats,
          includeMetadata
        }
      );

      // Download ZIP file
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${campaignName.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-export.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`Campaign exported successfully (${contentItems.length} items)`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export campaign');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          disabled={isExporting}
          className="gap-2"
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {isExporting ? 'Exporting...' : 'Export Campaign'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Export Formats</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={formats.md}
          onCheckedChange={(checked) => setFormats(prev => ({ ...prev, md: checked }))}
        >
          Markdown (.md)
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={formats.html}
          onCheckedChange={(checked) => setFormats(prev => ({ ...prev, html: checked }))}
        >
          HTML (.html)
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={formats.txt}
          onCheckedChange={(checked) => setFormats(prev => ({ ...prev, txt: checked }))}
        >
          Plain Text (.txt)
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={includeMetadata}
          onCheckedChange={setIncludeMetadata}
        >
          Include Metadata
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <Button 
          className="w-full mt-2" 
          onClick={handleExport}
          disabled={isExporting}
        >
          Export as ZIP
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
