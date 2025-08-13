import React, { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AlertTriangle, 
  Merge, 
  Trash2, 
  Eye,
  Users
} from 'lucide-react';
import { keywordLibraryService, UnifiedKeyword } from '@/services/keywordLibraryService';
import { toast } from 'sonner';

interface DuplicateKeyword {
  keyword: string;
  instances: UnifiedKeyword[];
  totalUsage: number;
  sources: string[];
}

interface DuplicateManagerProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const DuplicateManager: React.FC<DuplicateManagerProps> = ({
  open,
  onClose,
  onSuccess
}) => {
  const [duplicates, setDuplicates] = useState<DuplicateKeyword[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDuplicate, setSelectedDuplicate] = useState<DuplicateKeyword | null>(null);
  const [showMergeDialog, setShowMergeDialog] = useState(false);

  useEffect(() => {
    if (open) {
      loadDuplicates();
    }
  }, [open]);

  const loadDuplicates = async () => {
    try {
      setLoading(true);
      const duplicateKeywords = await keywordLibraryService.findDuplicates();
      setDuplicates(duplicateKeywords);
    } catch (error) {
      console.error('Error loading duplicates:', error);
      toast.error('Failed to load duplicates');
    } finally {
      setLoading(false);
    }
  };

  const handleMerge = async (duplicateKeyword: DuplicateKeyword, keepInstance: UnifiedKeyword) => {
    try {
      await keywordLibraryService.mergeDuplicates(duplicateKeyword, keepInstance);
      await loadDuplicates();
      onSuccess();
      setShowMergeDialog(false);
      setSelectedDuplicate(null);
    } catch (error) {
      console.error('Error merging duplicates:', error);
    }
  };

  const getSourceBadgeColor = (sourceType: string) => {
    switch (sourceType) {
      case 'manual': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'serp': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'glossary': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'strategy': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Duplicate Keywords Manager
            </DialogTitle>
            <DialogDescription>
              {duplicates.length > 0 
                ? `Found ${duplicates.length} keyword(s) with duplicates. Review and merge them to clean up your library.`
                : 'No duplicate keywords found.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Scanning for duplicates...</p>
              </div>
            ) : duplicates.length > 0 ? (
              duplicates.map((duplicate) => (
                <Card key={duplicate.keyword} className="border-yellow-500/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>"{duplicate.keyword}"</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-yellow-600 border-yellow-500/30">
                          {duplicate.instances.length} instances
                        </Badge>
                        <Badge variant="outline" className="text-blue-600 border-blue-500/30">
                          {duplicate.totalUsage} total usage
                        </Badge>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {duplicate.instances.map((instance) => (
                        <div 
                          key={instance.id}
                          className="flex items-center justify-between p-3 border border-white/10 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getSourceBadgeColor(instance.source_type)}`}
                            >
                              {instance.source_type}
                            </Badge>
                            <div className="text-sm">
                              <div className="flex items-center gap-2">
                                <span>Volume: {instance.search_volume || 'N/A'}</span>
                                <span>•</span>
                                <span>Difficulty: {instance.difficulty || 'N/A'}%</span>
                                <span>•</span>
                                <span>Usage: {instance.usage_count}</span>
                              </div>
                              {instance.notes && (
                                <p className="text-muted-foreground text-xs mt-1">
                                  {instance.notes}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedDuplicate(duplicate);
                                setShowMergeDialog(true);
                              }}
                            >
                              <Merge className="h-3 w-3 mr-1" />
                              Merge All Into This
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-green-500 mx-auto mb-2" />
                <h3 className="text-lg font-semibold text-green-600">No Duplicates Found</h3>
                <p className="text-muted-foreground">Your keyword library is clean!</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Merge Confirmation Dialog */}
      <Dialog open={showMergeDialog} onOpenChange={setShowMergeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Merge Duplicate Keywords</DialogTitle>
            <DialogDescription>
              Select which instance to keep. All usage data will be combined into the selected instance.
            </DialogDescription>
          </DialogHeader>
          
          {selectedDuplicate && (
            <div className="space-y-3">
              {selectedDuplicate.instances.map((instance) => (
                <Card 
                  key={instance.id}
                  className="cursor-pointer border-2 border-transparent hover:border-primary/50"
                  onClick={() => handleMerge(selectedDuplicate, instance)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getSourceBadgeColor(instance.source_type)}`}
                        >
                          {instance.source_type}
                        </Badge>
                        <div className="text-sm">
                          Volume: {instance.search_volume || 'N/A'} • 
                          Difficulty: {instance.difficulty || 'N/A'}% • 
                          Usage: {instance.usage_count}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        Keep This
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMergeDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};