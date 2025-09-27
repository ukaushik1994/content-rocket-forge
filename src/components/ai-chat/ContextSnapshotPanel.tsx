import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Save, FolderOpen, Merge, Trash2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useContextSnapshots } from '@/hooks/useContextSnapshots';
import { useToast } from '@/hooks/use-toast';

interface ContextSnapshotPanelProps {
  conversationId?: string;
  onSnapshotLoad?: (snapshot: any) => void;
}

export const ContextSnapshotPanel: React.FC<ContextSnapshotPanelProps> = ({
  conversationId,
  onSnapshotLoad
}) => {
  const [snapshotTitle, setSnapshotTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const {
    snapshots,
    isLoading,
    createSnapshot,
    loadSnapshot,
    listSnapshots,
    deleteSnapshot
  } = useContextSnapshots();

  const handleCreateSnapshot = async () => {
    if (!conversationId) {
      toast({
        title: "Error",
        description: "No active conversation to save",
        variant: "destructive"
      });
      return;
    }

    if (!snapshotTitle.trim()) {
      toast({
        title: "Error", 
        description: "Please enter a title for the snapshot",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      const snapshot = await createSnapshot(conversationId, snapshotTitle);
      if (snapshot) {
        setSnapshotTitle('');
        toast({
          title: "Snapshot Created",
          description: `Saved "${snapshotTitle}" successfully`,
        });
      }
    } catch (error) {
      console.error('Error creating snapshot:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleLoadSnapshot = async (snapshotId: string) => {
    try {
      const snapshot = await loadSnapshot(snapshotId);
      if (snapshot && onSnapshotLoad) {
        onSnapshotLoad(snapshot);
        toast({
          title: "Snapshot Loaded",
          description: "Context has been restored from snapshot",
        });
      }
    } catch (error) {
      console.error('Error loading snapshot:', error);
    }
  };

  const handleDeleteSnapshot = async (snapshotId: string, title: string) => {
    try {
      await deleteSnapshot(snapshotId);
      toast({
        title: "Snapshot Deleted",
        description: `"${title}" has been deleted`,
      });
    } catch (error) {
      console.error('Error deleting snapshot:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Save className="h-5 w-5" />
          Context Snapshots
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Create New Snapshot */}
        <div className="space-y-2">
          <Input
            placeholder="Snapshot title..."
            value={snapshotTitle}
            onChange={(e) => setSnapshotTitle(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCreateSnapshot()}
          />
          <Button 
            onClick={handleCreateSnapshot}
            disabled={isCreating || !snapshotTitle.trim() || !conversationId}
            size="sm"
            className="w-full"
          >
            <Save className="h-4 w-4 mr-2" />
            {isCreating ? 'Saving...' : 'Save Current Context'}
          </Button>
        </div>

        {/* Snapshots List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Saved Snapshots</h4>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => listSnapshots(conversationId)}
              disabled={isLoading}
            >
              Refresh
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-muted rounded-lg" />
                </div>
              ))}
            </div>
          ) : snapshots.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No snapshots saved yet</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {snapshots.map((snapshot, index) => (
                <motion.div
                  key={snapshot.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border rounded-lg p-3 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-sm truncate">{snapshot.title}</h5>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {snapshot.conversation_type || 'regular'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(snapshot.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleLoadSnapshot(snapshot.id)}
                      className="h-7 px-2 text-xs flex-1"
                    >
                      <FolderOpen className="h-3 w-3 mr-1" />
                      Load
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteSnapshot(snapshot.id, snapshot.title)}
                      className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};