
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, Copy, Download, Trash2, RefreshCw } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion } from 'framer-motion';

interface ActionButtonsProps {
  onCopy: () => void;
  onDownload: () => void;
  onSave: () => Promise<boolean>;
  onDelete?: () => Promise<boolean>;
  onRegenerate?: () => Promise<void>;
  isDeleting?: boolean;
  isRegenerating?: boolean;
  isSaving?: boolean;
  formatId?: string;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onCopy,
  onDownload,
  onSave,
  onDelete,
  onRegenerate,
  isDeleting = false,
  isRegenerating = false,
  isSaving = false,
  formatId
}) => {
  return (
    <div className="flex justify-between items-center mt-4 border-t border-white/10 pt-4">
      <div className="flex gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="secondary" 
                  size="sm" 
                  onClick={onCopy}
                  className="text-xs relative overflow-hidden group"
                >
                  <span className="absolute inset-0 w-full h-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  <Copy className="h-3.5 w-3.5 mr-1" />
                  Copy
                </Button>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Copy content to clipboard</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={onDownload}
                  className="text-xs relative overflow-hidden group"
                >
                  <span className="absolute inset-0 w-full h-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  <Download className="h-3.5 w-3.5 mr-1" />
                  Download
                </Button>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Download as text file</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {onRegenerate && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onRegenerate}
                    disabled={isRegenerating}
                    className="text-xs relative overflow-hidden group"
                  >
                    <span className="absolute inset-0 w-full h-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    <RefreshCw className={`h-3.5 w-3.5 mr-1 ${isRegenerating ? 'animate-spin' : ''}`} />
                    {isRegenerating ? 'Regenerating...' : 'Regenerate'}
                  </Button>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Generate new version</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      <div className="flex gap-2">
        {onDelete && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={onDelete}
                    disabled={isDeleting}
                    className="text-xs relative overflow-hidden group"
                  >
                    <span className="absolute inset-0 w-full h-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </Button>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete this content</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={onSave}
                  disabled={isSaving}
                  className="text-xs bg-gradient-to-r from-neon-purple to-neon-blue hover:opacity-90 transition-opacity"
                >
                  <Save className="h-3.5 w-3.5 mr-1" />
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Save to your content library</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default ActionButtons;
