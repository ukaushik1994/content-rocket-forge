import React from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

export function ContentTitleCard() {
  const { state } = useContentBuilder();
  const { contentTitle } = state;

  return (
    <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/10 border border-white/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Content Title
        </CardTitle>
      </CardHeader>
      <CardContent>
        {contentTitle ? (
          <p className="bg-clip-text text-transparent bg-gradient-to-r from-neon-purple to-neon-blue font-medium text-lg">
            {contentTitle}
          </p>
        ) : (
          <p className="text-muted-foreground text-base">
            No title set yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
