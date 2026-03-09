import React, { useState } from 'react';
;
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { backfillMetaInformation } from '@/scripts/backfill-meta-information';
import { toast } from 'sonner';

/**
 * Admin page to backfill meta information for existing content
 */
export const RepositoryBackfill = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<{ updated: number; skipped: number; total?: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRunBackfill = async () => {
    setIsRunning(true);
    setError(null);
    setResult(null);

    try {
      const backfillResult = await backfillMetaInformation();
      setResult(backfillResult);
      toast.success('Backfill completed successfully', {
        description: `Updated ${backfillResult.updated} items, skipped ${backfillResult.skipped}`
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast.error('Backfill failed', { description: errorMessage });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Repository Meta Information Backfill</CardTitle>
            <CardDescription>
              This tool will populate missing meta_title and meta_description fields for existing content in your repository.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>What this does:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Finds all content items with missing meta information</li>
                  <li>Extracts titles from content headings</li>
                  <li>Generates meta descriptions from content</li>
                  <li>Updates the database with the new meta information</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="flex flex-col gap-4">
              <Button 
                onClick={handleRunBackfill} 
                disabled={isRunning}
                size="lg"
                className="w-full"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running Backfill...
                  </>
                ) : (
                  <>
                    Run Backfill
                  </>
                )}
              </Button>
            </div>

            {result && (
              <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  <strong>Success!</strong>
                  <div className="mt-2 space-y-1">
                    <p>Total items processed: {result.total || 0}</p>
                    <p>Items updated: {result.updated}</p>
                    <p>Items skipped: {result.skipped}</p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Error:</strong> {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="text-sm text-muted-foreground">
              <p><strong>Note:</strong> This operation is safe and will not overwrite existing meta information. 
              It only fills in missing data.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
