
import React from 'react';
import { ContentItemType } from '@/contexts/content/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, FileText } from 'lucide-react';

interface ApprovalHeaderProps {
  selectedContent: ContentItemType | null;
  onApprove: () => void;
  onReject: () => void;
  onRequestChanges: () => void;
}

export const ApprovalHeader: React.FC<ApprovalHeaderProps> = ({
  selectedContent,
  onApprove,
  onReject,
  onRequestChanges
}) => {
  if (!selectedContent) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-500';
      case 'pending_review': return 'bg-yellow-500';
      case 'in_review': return 'bg-blue-500';
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      case 'needs_changes': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const author = selectedContent.metadata?.author || 'Unknown Author';

  return (
    <div className="border-b pb-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">{selectedContent.title}</h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-white/70">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{author}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Created {formatDate(selectedContent.created_at)}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Updated {formatDate(selectedContent.updated_at)}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>{selectedContent.content?.split(' ').length || 0} words</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge 
              variant="secondary" 
              className={`${getStatusColor(selectedContent.approval_status)} text-white`}
            >
              {selectedContent.approval_status.replace('_', ' ').toUpperCase()}
            </Badge>
            
            {selectedContent.seo_score && (
              <Badge variant="outline">
                SEO Score: {selectedContent.seo_score}
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          {selectedContent.approval_status === 'pending_review' && (
            <>
              <Button onClick={onApprove} className="bg-green-600 hover:bg-green-700">
                Approve
              </Button>
              <Button onClick={onRequestChanges} variant="outline">
                Request Changes
              </Button>
              <Button onClick={onReject} variant="destructive">
                Reject
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
