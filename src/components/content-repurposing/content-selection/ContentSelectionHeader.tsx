
import React from 'react';
import { CardTitle, CardDescription } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

const ContentSelectionHeader: React.FC = () => {
  return (
    <>
      <CardTitle className="text-xl flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-neon-purple animate-pulse" />
        Available Content
      </CardTitle>
      <CardDescription>Select content to transform into different formats</CardDescription>
    </>
  );
};

export default ContentSelectionHeader;
