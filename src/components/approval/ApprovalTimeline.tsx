
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, User, MessageCircle, CheckCircle2, XCircle, Edit, Send } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useContent } from '@/contexts/content';
import { ApprovalHistoryType } from '@/contexts/content/types';
import { motion, AnimatePresence } from 'framer-motion';

interface ApprovalTimelineProps {
  contentId: string;
}

const actionConfig = {
  'submitted_for_review': { 
    label: 'Submitted for Review', 
    icon: Send, 
    color: 'text-blue-400 bg-blue-500/20' 
  },
  'approved': { 
    label: 'Approved', 
    icon: CheckCircle2, 
    color: 'text-green-400 bg-green-500/20' 
  },
  'rejected': { 
    label: 'Rejected', 
    icon: XCircle, 
    color: 'text-red-400 bg-red-500/20' 
  },
  'requested_changes': { 
    label: 'Changes Requested', 
    icon: Edit, 
    color: 'text-orange-400 bg-orange-500/20' 
  },
  'status_changed': { 
    label: 'Status Changed', 
    icon: Clock, 
    color: 'text-gray-400 bg-gray-500/20' 
  }
};

export const ApprovalTimeline: React.FC<ApprovalTimelineProps> = ({ contentId }) => {
  const [history, setHistory] = useState<ApprovalHistoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const { getApprovalHistory } = useContent();

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      try {
        const historyData = await getApprovalHistory(contentId);
        setHistory(historyData);
      } catch (error) {
        console.error('Error loading approval history:', error);
      } finally {
        setLoading(false);
      }
    };

    if (contentId) {
      loadHistory();
    }
  }, [contentId, getApprovalHistory]);

  if (loading) {
    return (
      <Card className="border-white/10 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white/90 text-lg">Approval Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-purple"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/10 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white/90 text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Approval Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-8 text-white/60">
            <Clock className="h-12 w-12 mx-auto mb-3 text-white/30" />
            <p>No approval history available</p>
          </div>
        ) : (
          <ScrollArea className="h-80">
            <div className="space-y-4">
              <AnimatePresence>
                {history.map((entry, index) => {
                  const config = actionConfig[entry.action as keyof typeof actionConfig] || actionConfig.status_changed;
                  const Icon = config.icon;
                  
                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-start gap-3 relative"
                    >
                      {/* Timeline line */}
                      {index < history.length - 1 && (
                        <div className="absolute left-4 top-8 w-px h-12 bg-white/10" />
                      )}
                      
                      {/* Icon */}
                      <div className={`rounded-full p-2 ${config.color} flex-shrink-0`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-white/90">{config.label}</span>
                          {entry.from_status && entry.to_status && (
                            <div className="flex items-center gap-1 text-xs">
                              <Badge variant="outline" className="bg-white/5 border-white/20 text-white/60">
                                {entry.from_status}
                              </Badge>
                              <span className="text-white/40">→</span>
                              <Badge variant="outline" className="bg-white/5 border-white/20 text-white/60">
                                {entry.to_status}
                              </Badge>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-white/60 mb-2">
                          <User className="h-3 w-3" />
                          <span>User ID: {entry.user_id.slice(0, 8)}...</span>
                          <span>•</span>
                          <span title={format(new Date(entry.created_at), 'PPpp')}>
                            {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        
                        {entry.notes && (
                          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                            <div className="flex items-start gap-2">
                              <MessageCircle className="h-4 w-4 text-white/40 mt-0.5 flex-shrink-0" />
                              <p className="text-white/80 text-sm">{entry.notes}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
