
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, FileText, ChevronRight } from 'lucide-react';
import { ContentItemType } from '@/contexts/content/types';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

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
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-sm border border-white/10 p-6 shadow-2xl">
      <div className="flex flex-col sm:flex-row justify-between gap-6 items-start sm:items-center">
        <div>
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-neon-purple/20 flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-neon-purple" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white/90 mb-1">
              Content Approval
            </h1>
          </div>
          
          <div className="mt-2 flex items-center gap-2 text-white/60">
            <Clock className="h-4 w-4" />
            <span>Pending approval:</span>
            <Badge 
              variant={pendingCount > 0 ? "default" : "outline"} 
              className={`text-xs ${pendingCount > 0 ? 'bg-neon-purple text-white' : ''}`}
            >
              {pendingCount} {pendingCount === 1 ? 'item' : 'items'}
            </Badge>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Button 
            variant="outline"
            size="sm"
            className="flex items-center gap-1 bg-white/5 border-white/10 hover:bg-white/10"
            onClick={() => navigate('/content')}
          >
            <FileText className="h-4 w-4" />
            Content Repository
          </Button>
          
          <Button 
            variant="default"
            size="sm"
            className="flex items-center gap-1 bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple"
            onClick={() => navigate('/content-builder')}
          >
            <CheckCircle className="h-4 w-4" />
            Create New Content
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
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
