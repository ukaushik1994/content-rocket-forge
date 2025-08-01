
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Target, Network } from 'lucide-react';

interface CreateClusterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateClusterModal({ isOpen, onClose, onSuccess }: CreateClusterModalProps) {
  const [clusterName, setClusterName] = useState('');
  const [mainKeyword, setMainKeyword] = useState('');
  const [description, setDescription] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [currentKeyword, setCurrentKeyword] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleAddKeyword = () => {
    if (currentKeyword.trim() && !keywords.includes(currentKeyword.trim())) {
      setKeywords([...keywords, currentKeyword.trim()]);
      setCurrentKeyword('');
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setKeywords(keywords.filter(k => k !== keyword));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  const handleCreate = async () => {
    if (!clusterName.trim() || !mainKeyword.trim()) return;

    setIsCreating(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsCreating(false);
    onSuccess();
    handleClose();
  };

  const handleClose = () => {
    setClusterName('');
    setMainKeyword('');
    setDescription('');
    setKeywords([]);
    setCurrentKeyword('');
    setIsCreating(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={handleClose}>
          <DialogContent className="bg-gray-900 border-white/10 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-white text-xl">
                <Network className="h-5 w-5 text-blue-400" />
                Create New Topic Cluster
              </DialogTitle>
            </DialogHeader>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6 py-4"
            >
              {/* Cluster Name */}
              <div className="space-y-2">
                <Label htmlFor="cluster-name" className="text-white">
                  Cluster Name *
                </Label>
                <Input
                  id="cluster-name"
                  value={clusterName}
                  onChange={(e) => setClusterName(e.target.value)}
                  placeholder="e.g., Content Marketing Strategy"
                  className="bg-white/5 border-white/20 text-white placeholder-gray-400"
                />
              </div>

              {/* Main Keyword */}
              <div className="space-y-2">
                <Label htmlFor="main-keyword" className="text-white">
                  Main Keyword *
                </Label>
                <div className="relative">
                  <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="main-keyword"
                    value={mainKeyword}
                    onChange={(e) => setMainKeyword(e.target.value)}
                    placeholder="e.g., content marketing"
                    className="pl-10 bg-white/5 border-white/20 text-white placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-white">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what this cluster will cover..."
                  className="bg-white/5 border-white/20 text-white placeholder-gray-400 resize-none h-20"
                />
              </div>

              {/* Related Keywords */}
              <div className="space-y-3">
                <Label className="text-white">Related Keywords</Label>
                
                {/* Add keyword input */}
                <div className="flex gap-2">
                  <Input
                    value={currentKeyword}
                    onChange={(e) => setCurrentKeyword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Add related keywords..."
                    className="flex-1 bg-white/5 border-white/20 text-white placeholder-gray-400"
                  />
                  <Button
                    type="button"
                    onClick={handleAddKeyword}
                    disabled={!currentKeyword.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Keywords list */}
                {keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <AnimatePresence>
                      {keywords.map((keyword, index) => (
                        <motion.div
                          key={keyword}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Badge
                            variant="secondary"
                            className="bg-white/10 text-white border-white/20 pr-1 group cursor-pointer"
                            onClick={() => handleRemoveKeyword(keyword)}
                          >
                            {keyword}
                            <X className="h-3 w-3 ml-1 opacity-50 group-hover:opacity-100 transition-opacity" />
                          </Badge>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isCreating}
                  className="border-white/20 text-white hover:bg-white/5"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={!clusterName.trim() || !mainKeyword.trim() || isCreating}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isCreating ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="mr-2"
                      >
                        <Network className="h-4 w-4" />
                      </motion.div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Cluster
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
