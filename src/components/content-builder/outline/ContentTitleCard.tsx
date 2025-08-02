import React from 'react';
import { useContentBuilder } from '@/contexts/content-builder/ContentBuilderContext';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import { TitleGenerationButton } from '../steps/writing/TitleGenerationButton';

export function ContentTitleCard() {
  const { state } = useContentBuilder();
  const { contentTitle } = state;

  return (
    <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/10 border border-white/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between gap-2">
          <div>Content Title</div>
          <TitleGenerationButton />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {contentTitle ? (
          <p className="bg-clip-text text-transparent bg-gradient-to-r from-neon-purple to-neon-blue font-medium text-lg">
            {contentTitle}
          </p>
        ) : (
          <p className="text-muted-foreground text-base">
            No title set. Generate one with the button above.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
