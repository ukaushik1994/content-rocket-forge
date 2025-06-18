
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, FileText, Tag, HelpCircle, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SelectionPreviewPanelProps {
  selections: Array<{
    content: string;
    type: string;
    source: string;
  }>;
  isOpen: boolean;
  onClose: () => void;
  onRemoveItem: (content: string, type: string) => void;
  onGenerateOutline: () => void;
}

export function SelectionPreviewPanel({
  selections,
  isOpen,
  onClose,
  onRemoveItem,
  onGenerateOutline
}: SelectionPreviewPanelProps) {
  const groupedSelections = selections.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = [];
    }
    acc[item.type].push(item);
    return acc;
  }, {} as Record<string, typeof selections>);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'keyword': return <Tag className="h-4 w-4" />;
      case 'question': return <HelpCircle className="h-4 w-4" />;
      case 'heading': return <FileText className="h-4 w-4" />;
      case 'entity': return <Brain className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    const colors = {
      keyword: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      question: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      heading: 'bg-green-500/20 text-green-300 border-green-500/30',
      entity: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          className="fixed right-0 top-0 h-full w-80 bg-black/95 backdrop-blur-xl border-l border-white/20 z-40"
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div>
                <h3 className="text-lg font-semibold text-white">Selected Items</h3>
                <p className="text-sm text-white/60">{selections.length} items selected</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-6">
                {Object.entries(groupedSelections).map(([type, items]) => (
                  <div key={type} className="space-y-3">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(type)}
                      <h4 className="text-sm font-medium text-white capitalize">
                        {type}s ({items.length})
                      </h4>
                    </div>
                    
                    <div className="space-y-2">
                      {items.map((item, idx) => (
                        <motion.div
                          key={`${type}-${idx}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="group p-3 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white/90 break-words mb-2">
                                {item.content}
                              </p>
                              <div className="flex items-center gap-2">
                                <Badge className={`text-xs ${getTypeColor(type)} border`}>
                                  {item.source}
                                </Badge>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onRemoveItem(item.content, item.type)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20 hover:text-red-300 p-1"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Footer Actions */}
            <div className="p-4 border-t border-white/10 space-y-3">
              <Button
                onClick={onGenerateOutline}
                disabled={selections.length === 0}
                className="w-full bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-purple/80 hover:to-neon-blue/80"
              >
                Generate Content Outline
              </Button>
              
              <div className="text-xs text-white/50 text-center">
                Selected items will be used to create your content structure
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
