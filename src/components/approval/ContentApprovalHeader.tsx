
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, FileText } from 'lucide-react';
import { ContentItemType } from '@/contexts/content/types';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ContentApprovalHeaderProps {
  pendingCount: number;
  selectedContent: ContentItemType | null;
  onSelectContent: (content: ContentItemType | null) => void;
}

export const ContentApprovalHeader: React.FC<ContentApprovalHeaderProps> = ({
  pendingCount,
  selectedContent,
  onSelectContent
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">
          Content Approval Workflow
        </h1>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Pending approval:</span>
          <Badge variant={pendingCount > 0 ? "secondary" : "outline"} className="text-xs">
            {pendingCount} {pendingCount === 1 ? 'item' : 'items'}
          </Badge>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Button 
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={() => navigate('/content')}
        >
          <FileText className="h-4 w-4" />
          Repository
        </Button>
        
        <Button 
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={() => navigate('/content-builder')}
        >
          <CheckCircle className="h-4 w-4" />
          Create Content
        </Button>
      </div>
    </div>
  );
};
