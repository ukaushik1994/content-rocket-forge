
import React from 'react';
import { FileText, Filter } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

interface ApprovalEmptyStateProps {
  loading: boolean;
}

export const ApprovalEmptyState: React.FC<ApprovalEmptyStateProps> = ({ loading }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 border border-white/10 rounded-xl bg-gray-800/20 backdrop-blur-sm shadow-xl">
        <Skeleton className="h-20 w-20 rounded-full mb-6 bg-white/10" />
        <Skeleton className="h-8 w-64 mb-3 bg-white/10" />
        <Skeleton className="h-4 w-48 mb-8 bg-white/10" />
        <Skeleton className="h-10 w-48 bg-white/10" />
      </div>
    );
  }

  return (
    <motion.div 
      className="flex flex-col items-center justify-center py-20 border border-white/10 rounded-xl bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm shadow-xl"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="h-24 w-24 rounded-full bg-gradient-to-br from-neon-purple/20 to-neon-blue/20 flex items-center justify-center mb-6 relative"
        initial={{ y: 10 }}
        animate={{ y: 0 }}
        transition={{ duration: 1, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
      >
        <FileText className="h-10 w-10 text-neon-purple" />
        <motion.div 
          className="absolute -top-1 -right-1 h-8 w-8 rounded-full bg-neon-blue/20 flex items-center justify-center"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 0.2 }}
        >
          <Filter className="h-4 w-4 text-neon-blue" />
        </motion.div>
      </motion.div>
      
      <h3 className="text-2xl font-medium mb-3 text-white/90">No content matching filter</h3>
      <p className="text-white/60 mb-4 text-center max-w-md">
        Try selecting a different filter to view available content for review and approval.
      </p>
    </motion.div>
  );
};
