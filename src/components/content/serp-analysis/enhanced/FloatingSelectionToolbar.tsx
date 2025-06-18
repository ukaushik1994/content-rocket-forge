
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Download, Eye, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FloatingSelectionToolbarProps {
  selectedCount: number;
  onAddAllSelected: () => void;
  onClearSelected: () => void;
  onPreviewSelected: () => void;
  onExportSelected: () => void;
  onClose: () => void;
  isVisible: boolean;
}

export function FloatingSelectionToolbar({
  selectedCount,
  onAddAllSelected,
  onClearSelected,
  onPreviewSelected,
  onExportSelected,
  onClose,
  isVisible
}: FloatingSelectionToolbarProps) {
  return (
    <AnimatePresence>
      {isVisible && selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl p-4 shadow-2xl">
            <div className="flex items-center gap-4">
              {/* Selection Count */}
              <div className="flex items-center gap-2">
                <Badge className="bg-neon-purple text-white font-medium">
                  {selectedCount} selected
                </Badge>
              </div>
              
              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={onAddAllSelected}
                  className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-purple/80 hover:to-neon-blue/80 gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add All
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onPreviewSelected}
                  className="border-white/20 hover:bg-white/10 gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onExportSelected}
                  className="border-white/20 hover:bg-white/10 gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearSelected}
                  className="hover:bg-red-500/20 hover:text-red-300 gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="hover:bg-white/10 p-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
