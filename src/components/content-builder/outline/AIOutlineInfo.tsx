
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Info } from 'lucide-react';

export function AIOutlineInfo() {
  return (
    <Card className="border-white/10 bg-white/5">
      <CardContent className="pt-4 pb-3">
        <div className="flex items-center gap-2 text-sm">
          <Info className="h-4 w-4 text-blue-400" />
          <p className="text-xs text-muted-foreground">
            After generating your outline, use the <strong>Next</strong> button at the bottom of the page to proceed to the Content Writing step.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
