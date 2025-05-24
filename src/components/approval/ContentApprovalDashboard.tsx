import React, { useState } from 'react';
import { ContentItemType } from '@/contexts/content/types';
import { ApprovalHeader } from './dashboard/ApprovalHeader';
import { ApprovalSidebar } from './dashboard/ApprovalSidebar';
import { ApprovalTabs } from './dashboard/ApprovalTabs';
import { useContent } from '@/contexts/content';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { FileText } from 'lucide-react';

interface ContentApprovalDashboardProps {
  contentItems: ContentItemType[];
}

export const ContentApprovalDashboard: React.FC<ContentApprovalDashboardProps> = ({
  contentItems
}) => {
  const [selectedContent, setSelectedContent] = useState<ContentItemType | null>(
    contentItems.length > 0 ? contentItems[0] : null
  );
  const [statusFilter, setStatusFilter] = useState('all');
  
  const { updateContentItem } = useContent();

  const handleApprove = async () => {
    if (!selectedContent) return;
    
    try {
      await updateContentItem(selectedContent.id, { 
        approval_status: 'approved',
        updated_at: new Date().toISOString()
      });
      toast.success('Content approved successfully');
    } catch (error) {
      console.error('Error approving content:', error);
      toast.error('Failed to approve content');
    }
  };

  const handleReject = async () => {
    if (!selectedContent) return;
    
    try {
      await updateContentItem(selectedContent.id, { 
        approval_status: 'rejected',
        updated_at: new Date().toISOString()
      });
      toast.success('Content rejected');
    } catch (error) {
      console.error('Error rejecting content:', error);
      toast.error('Failed to reject content');
    }
  };

  const handleRequestChanges = async () => {
    if (!selectedContent) return;
    
    try {
      await updateContentItem(selectedContent.id, { 
        approval_status: 'needs_changes',
        updated_at: new Date().toISOString()
      });
      toast.success('Changes requested');
    } catch (error) {
      console.error('Error requesting changes:', error);
      toast.error('Failed to request changes');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
      {/* Sidebar */}
      <motion.div 
        className="lg:col-span-1"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <ApprovalSidebar
          contentItems={contentItems}
          selectedContent={selectedContent}
          onSelectContent={setSelectedContent}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />
      </motion.div>
      
      {/* Main Content Area */}
      <motion.div 
        className="lg:col-span-3 space-y-6"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {selectedContent ? (
          <>
            <ApprovalHeader
              selectedContent={selectedContent}
              onApprove={handleApprove}
              onReject={handleReject}
              onRequestChanges={handleRequestChanges}
            />
            
            <ApprovalTabs selectedContent={selectedContent} />
          </>
        ) : (
          <div className="border border-white/10 rounded-xl p-12 flex flex-col items-center justify-center text-white/50 bg-gray-800/20 backdrop-blur-sm shadow-xl">
            <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-white/30" />
            </div>
            <h3 className="text-xl font-medium mb-2">Select content to review</h3>
            <p>Choose an item from the sidebar to begin the approval process</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};
