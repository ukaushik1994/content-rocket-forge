
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, Sparkles } from 'lucide-react';
import { useContent } from '@/contexts/content';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export function DraftsHeader() {
  const navigate = useNavigate();
  const { contentItems } = useContent();
  
  // Filter drafts from content items
  const drafts = contentItems.filter(item => item.status === 'draft');
  
  const handleCreateNew = () => {
    navigate('/content-builder');
  };
  
  return (
    <div className="relative">
      {/* Sparkle effect in the background */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-neon-purple/20 rounded-full blur-3xl" />
      
      <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 py-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-neon-purple/20 to-neon-blue/20 backdrop-blur-sm border border-white/10">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1 flex items-center gap-2">
                Content Drafts
                <span className={cn(
                  "inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs",
                  "bg-neon-purple/20 text-neon-purple border border-neon-purple/30"
                )}>
                  {drafts.length}
                </span>
              </h1>
              <p className="text-muted-foreground max-w-md">
                Manage your content drafts and published pieces
              </p>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Button 
            onClick={handleCreateNew}
            className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple relative group overflow-hidden"
            size="lg"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 w-full h-full bg-white/20 transform rotate-45 translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
            
            {/* Icon and text */}
            <div className="relative flex items-center gap-2">
              <Plus className="h-4 w-4 mr-1" />
              Create New Content
              <Sparkles className="h-3 w-3 text-white/80" />
            </div>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
