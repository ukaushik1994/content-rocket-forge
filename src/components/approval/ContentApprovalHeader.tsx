
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, FileText } from 'lucide-react';
import { ContentItemType } from '@/contexts/content/types';
import { motion } from 'framer-motion';

interface ContentStats {
  all: number;
  draft: number;
  approved: number;
  published: number;
}

interface ContentApprovalHeaderProps {
  contentStats: ContentStats;
  statusFilter: string;
  onFilterChange: (status: 'all' | 'draft' | 'approved' | 'published') => void;
  selectedContent: ContentItemType | null;
}

export const ContentApprovalHeader: React.FC<ContentApprovalHeaderProps> = ({
  contentStats,
  statusFilter,
  onFilterChange,
  selectedContent
}) => {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-sm border border-white/10 p-6 shadow-2xl">
      <div className="flex flex-col sm:flex-row justify-between gap-6 items-start sm:items-center mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-neon-purple/20 flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-neon-purple" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white/90 mb-1">
              Content Approval
            </h1>
          </div>
          
          {selectedContent && (
            <div className="mt-2 text-white/60">
              <span>Selected: </span>
              <span className="font-medium text-white/80">{selectedContent.title}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div 
          className={`p-4 rounded-lg cursor-pointer ${
            statusFilter === 'all' ? 'bg-white/15 border border-white/20' : 'bg-white/5 hover:bg-white/10'
          }`}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
          onClick={() => onFilterChange('all')}
        >
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-white/70">All Content</p>
            <Badge variant={statusFilter === 'all' ? 'default' : 'outline'} className="bg-neon-blue/80">
              {contentStats.all}
            </Badge>
          </div>
        </motion.div>

        <motion.div 
          className={`p-4 rounded-lg cursor-pointer ${
            statusFilter === 'draft' ? 'bg-white/15 border border-white/20' : 'bg-white/5 hover:bg-white/10'
          }`}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
          onClick={() => onFilterChange('draft')}
        >
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-white/70">Draft</p>
            <Badge variant={statusFilter === 'draft' ? 'default' : 'outline'} className="bg-white/30">
              {contentStats.draft}
            </Badge>
          </div>
        </motion.div>

        <motion.div 
          className={`p-4 rounded-lg cursor-pointer ${
            statusFilter === 'approved' ? 'bg-white/15 border border-white/20' : 'bg-white/5 hover:bg-white/10'
          }`}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
          onClick={() => onFilterChange('approved')}
        >
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-white/70">Approved</p>
            <Badge variant={statusFilter === 'approved' ? 'default' : 'outline'} className="bg-purple-500/80">
              {contentStats.approved}
            </Badge>
          </div>
        </motion.div>

        <motion.div 
          className={`p-4 rounded-lg cursor-pointer ${
            statusFilter === 'published' ? 'bg-white/15 border border-white/20' : 'bg-white/5 hover:bg-white/10'
          }`}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
          onClick={() => onFilterChange('published')}
        >
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-white/70">Published</p>
            <Badge variant={statusFilter === 'published' ? 'default' : 'outline'} className="bg-green-500/80">
              {contentStats.published}
            </Badge>
          </div>
        </motion.div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 h-full w-1/3">
        <svg className="h-full w-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="url(#header-gradient)" />
        </svg>
        <defs>
          <linearGradient id="header-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9b87f5" />
            <stop offset="100%" stopColor="#33C3F0" />
          </linearGradient>
        </defs>
      </div>
    </div>
  );
};
