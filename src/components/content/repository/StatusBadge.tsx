
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'published':
      return <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30">Published</Badge>;
    case 'draft':
      return <Badge variant="outline">Draft</Badge>;
    case 'archived':
      return <Badge className="bg-muted/50 text-muted-foreground">Archived</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};
