
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

export function ExportSettings() {
  const handleExport = (format: string, type: string) => {
    toast.success(`Exporting ${type} as ${format}`, {
      description: "Your export will begin shortly."
    });
  };
  
  return (
    <Card className="glass-panel bg-glass">
      <CardHeader>
        <CardTitle>Export Data</CardTitle>
        <CardDescription>
          Export your content and analytics data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-background/50">
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-2">Content Export</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Export all your content in various formats for backup or migration.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleExport('JSON', 'content')}>Export as JSON</Button>
                  <Button size="sm" variant="outline" onClick={() => handleExport('CSV', 'content')}>Export as CSV</Button>
                  <Button size="sm" variant="outline" onClick={() => handleExport('PDF', 'content')}>Export as PDF</Button>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-background/50">
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-2">Analytics Export</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Export your analytics data for further analysis.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleExport('Excel', 'analytics')}>Export as Excel</Button>
                  <Button size="sm" variant="outline" onClick={() => handleExport('CSV', 'analytics')}>Export as CSV</Button>
                  <Button size="sm" variant="outline" onClick={() => handleExport('JSON', 'analytics')}>Export as JSON</Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="rounded-lg border border-border p-4 bg-background/30">
            <h3 className="text-sm font-medium mb-2">Full Account Data</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Export all your account data including content, analytics, settings, and history.
            </p>
            <Button 
              variant="outline"
              onClick={() => toast.info("Preparing full data export", {
                description: "This may take a few minutes to prepare."
              })}
            >
              Request Full Data Export
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
