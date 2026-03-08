
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  selectedTab: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ selectedTab }) => {
  const navigate = useNavigate();
  
  return (
    <div className="glass-panel border border-white/10 rounded-lg p-12 text-center backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md mx-auto"
      >
        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Plus className="h-8 w-8 text-primary" />
        </div>
        <p className="text-xl font-medium mb-2">No {selectedTab === 'all' ? 'content items' : selectedTab} found</p>
        <p className="text-muted-foreground mb-6">
          Create content in the wizard to see it here.
        </p>
        <Button 
          onClick={() => navigate('/ai-chat')}
          className="bg-gradient-to-r from-neon-purple to-neon-blue"
        >
          Create Your First Draft
        </Button>
      </motion.div>
    </div>
  );
};
