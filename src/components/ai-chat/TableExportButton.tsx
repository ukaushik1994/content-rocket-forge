import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TableExportButtonProps {
  tableData: string;
  filename?: string;
  className?: string;
}

export const TableExportButton: React.FC<TableExportButtonProps> = ({
  tableData,
  filename = 'table-data',
  className
}) => {
  const { toast } = useToast();

  const exportAsCSV = () => {
    try {
      // Convert markdown table to CSV
      const lines = tableData.split('\n').filter(line => line.trim());
      const csvLines: string[] = [];
      
      for (const line of lines) {
        if (line.includes('|')) {
          // Extract data from markdown table format
          const cells = line.split('|')
            .map(cell => cell.trim())
            .filter(cell => cell && cell !== '---' && !cell.match(/^-+$/));
          
          if (cells.length > 0) {
            // Escape commas and quotes in CSV format
            const csvCells = cells.map(cell => {
              if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
                return `"${cell.replace(/"/g, '""')}"`;
              }
              return cell;
            });
            csvLines.push(csvCells.join(','));
          }
        }
      }
      
      if (csvLines.length === 0) {
        throw new Error('No table data found to export');
      }

      // Create and download CSV file
      const csvContent = csvLines.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast({
          title: "Export Successful",
          description: `Table exported as ${filename}.csv`,
        });
      }
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Unable to export table data. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={exportAsCSV}
      className={className}
      title="Export table as CSV"
    >
      <Download className="w-4 h-4 mr-2" />
      Export CSV
    </Button>
  );
};