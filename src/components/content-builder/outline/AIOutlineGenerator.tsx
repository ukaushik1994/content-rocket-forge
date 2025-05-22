
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Wand } from 'lucide-react';
import { toast } from 'sonner';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { OutlineGenerator } from './ai-generator/OutlineGenerator';

export function AIOutlineGenerator() {
  const { state } = useContentBuilder();
  const { mainKeyword, serpSelections } = state;
  
  // Check if we have SERP selections
  const hasSerpSelections = serpSelections.some(item => item.selected);
  
  return (
    <Card className={`border border-neon-border bg-black/20 backdrop-blur-lg overflow-hidden ${!hasSerpSelections ? 'opacity-90' : ''}`}>
      <CardContent className="p-0">
        <OutlineGenerator />
      </CardContent>
    </Card>
  );
}
