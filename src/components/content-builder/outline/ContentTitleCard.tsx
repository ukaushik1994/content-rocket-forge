
import React from 'react';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import { TitleGenerationButton } from '../steps/writing/TitleGenerationButton';

export function ContentTitleCard() {
  const { state } = useContentBuilder();
  const { contentTitle } = state;

  // We're moving this functionality to the OutlineStep, so this component is no longer needed
  // This is now just a placeholder to maintain compatibility
  return null;
}
