
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { OutlineGenerator } from './ai-generator/OutlineGenerator';

export function AIOutlineGenerator() {
  return (
    <OutlineGenerator />
  );
}
