
import React from 'react';
import { ContentItemType } from '@/contexts/content/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '../StatusBadge';
import { 
  Clock, User, Calendar, CheckCircle, 
  AlertTriangle, XCircle, FileText 
} from 'lucide-react';

interface ApprovalHeaderProps {
  selectedContent: ContentItemType | null;
  stats: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    needsChanges: number;
  };
}

export const ApprovalHeader: React.FC<ApprovalHeaderProps> = ({
  selectedContent,
  stats
}) => {
  return (
    <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm border-b border-white/10 p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white/90 mb-2">
            Content Approval Center
          </h1>
          
          {selectedContent ? (
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-medium text-white/80 truncate max-w-md">
                {selectedContent.title}
              </h2>
              <StatusBadge status={selectedContent.approval_status} showIcon={true} />
              
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Calendar className="h-4 w-4" />
                {new Date(selectedContent.created_at).toLocaleDateString()}
              </div>
              
              {selectedContent.author && (
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <User className="h-4 w-4" />
                  {selectedContent.author}
                </div>
              )}
            </div>
          ) : (
            <p className="text-white/60">Select content to begin review process</p>
          )}
        </div>
        
        {/* Quick Stats */}
        <div className="flex gap-3">
          <Badge 
            variant="outline" 
            className="bg-blue-500/20 text-blue-400 border-blue-500/30 flex items-center gap-1"
          >
            <FileText className="h-3 w-3" />
            Total: {stats.total}
          </Badge>
          
          <Badge 
            variant="outline" 
            className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 flex items-center gap-1"
          >
            <Clock className="h-3 w-3" />
            Pending: {stats.pending}
          </Badge>
          
          <Badge 
            variant="outline" 
            className="bg-green-500/20 text-green-400 border-green-500/30 flex items-center gap-1"
          >
            <CheckCircle className="h-3 w-3" />
            Approved: {stats.approved}
          </Badge>
          
          <Badge 
            variant="outline" 
            className="bg-red-500/20 text-red-400 border-red-500/30 flex items-center gap-1"
          >
            <XCircle className="h-3 w-3" />
            Rejected: {stats.rejected}
          </Badge>
          
          {stats.needsChanges > 0 && (
            <Badge 
              variant="outline" 
              className="bg-orange-500/20 text-orange-400 border-orange-500/30 flex items-center gap-1"
            >
              <AlertTriangle className="h-3 w-3" />
              Changes: {stats.needsChanges}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};
