import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';
interface SelectedKeywordsProps {
  keywords: string[];
  onRemoveKeyword: (keyword: string) => void;
}
export const SelectedKeywords: React.FC<SelectedKeywordsProps> = ({
  keywords,
  onRemoveKeyword
}) => {
  return <Card>
      
      
    </Card>;
};