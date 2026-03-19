import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function ContentSettingsTab() {
  const [isRescoring, setIsRescoring] = useState(false);
  const [result, setResult] = useState<{ updated: number; total: number } | null>(null);

  const handleRescore = async () => {
    setIsRescoring(true);
    setResult(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in first');
        return;
      }

      const response = await supabase.functions.invoke('rescore-all-content', {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      if (response.error) throw response.error;

      const data = response.data;
      setResult({ updated: data.updated, total: data.total });
      toast.success(data.message);
    } catch (err: any) {
      toast.error(`Rescoring failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsRescoring(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">SEO Score Recalculation</CardTitle>
          <CardDescription>
            Recalculate SEO scores for all your existing content using the latest scoring algorithm. 
            This updates scores without changing any content.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleRescore}
              disabled={isRescoring}
              variant="outline"
              className="gap-2"
            >
              {isRescoring ? (
                <><Loader2 className="h-4 w-4 animate-spin" />Rescoring...</>
              ) : (
                <><RefreshCw className="h-4 w-4" />Rescore All Content</>
              )}
            </Button>
            {result && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Updated {result.updated} of {result.total} items
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
