
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
      {/* Glowing effects in the background */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-neon-purple/20 rounded-full blur-3xl opacity-70" />
      <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-neon-blue/10 rounded-full blur-3xl opacity-50" />
      
      <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 py-8 border-b border-white/5">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1"
        >
          <div className="flex items-center gap-4">
            <motion.div 
              whileHover={{ rotate: [0, 5, -5, 0], scale: 1.05 }}
              transition={{ duration: 0.5 }}
              className="p-4 rounded-xl bg-gradient-to-br from-neon-purple/20 to-neon-blue/20 backdrop-blur-sm border border-white/10 shadow-lg shadow-neon-purple/5"
            >
              <FileText className="h-7 w-7 text-white" />
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold mb-1 flex items-center gap-3 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                Content Library
                <motion.span 
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className={cn(
                    "inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs",
                    "bg-neon-purple/20 text-neon-purple border border-neon-purple/30"
                  )}
                >
                  {drafts.length}
                </motion.span>
              </h1>
              <p className="text-muted-foreground max-w-md text-lg">
                Manage your content drafts and published articles
              </p>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            onClick={handleCreateNew}
            className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple relative group overflow-hidden shadow-lg shadow-neon-purple/20"
            size="lg"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 w-full h-full bg-white/20 transform rotate-45 translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
            
            {/* Icon and text */}
            <div className="relative flex items-center gap-2 px-2">
              <Plus className="h-5 w-5" />
              Create New Content
              <Sparkles className="h-4 w-4 text-white/80 animate-pulse-glow" />
            </div>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
