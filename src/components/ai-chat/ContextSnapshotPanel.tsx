import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { 
  Save, 
  FolderOpen, 
  Merge, 
  Trash2, 
  Clock, 
  MessageSquare,
  Search,
  Plus,
  Archive,
  Download
} from 'lucide-react';
import { useContextSnapshots } from '@/hooks/useContextSnapshots';
import { useChatContextBridge } from '@/contexts/ChatContextBridge';
import { EnhancedChatMessage } from '@/types/enhancedChat';

interface ContextSnapshotPanelProps {
  messages: EnhancedChatMessage[];
  onLoadSnapshot: (snapshotData: any) => void;
  className?: string;
}

export const ContextSnapshotPanel: React.FC<ContextSnapshotPanelProps> = ({
  messages,
  onLoadSnapshot,
  className
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSnapshots, setSelectedSnapshots] = useState<string[]>([]);
  const [snapshotTitle, setSnapshotTitle] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  const { activeConversationId } = useChatContextBridge();
  const {
    snapshots,
    isLoading,
    createSnapshot,
    loadSnapshot,
    deleteSnapshot,
    mergeContexts,
    hasSnapshots
  } = useContextSnapshots();

  // Filter snapshots based on search
  const filteredSnapshots = snapshots.filter(snapshot =>
    snapshot.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle snapshot creation
  const handleCreateSnapshot = async () => {
    if (!activeConversationId) return;
    
    const title = snapshotTitle || `Snapshot ${new Date().toLocaleDateString()}`;
    await createSnapshot(activeConversationId, title, {
      messageCount: messages.length,
      conversationType: 'streaming_chat'
    });
    
    setSnapshotTitle('');
    setShowCreateDialog(false);
  };

  // Handle snapshot loading
  const handleLoadSnapshot = async (snapshotId: string) => {
    const snapshotData = await loadSnapshot(snapshotId);
    if (snapshotData) {
      onLoadSnapshot(snapshotData);
    }
  };

  // Handle snapshot merging
  const handleMergeSnapshots = async () => {
    if (selectedSnapshots.length === 2) {
      await mergeContexts(selectedSnapshots[0], selectedSnapshots[1], 'append');
      setSelectedSnapshots([]);
    }
  };

  // Toggle snapshot selection
  const toggleSnapshotSelection = (snapshotId: string) => {
    setSelectedSnapshots(prev => 
      prev.includes(snapshotId)
        ? prev.filter(id => id !== snapshotId)
        : prev.length < 2 
          ? [...prev, snapshotId]
          : [prev[1], snapshotId] // Replace first if already 2 selected
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Context Snapshots
          </div>
          <Badge variant="secondary">
            {filteredSnapshots.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Search and Create */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search snapshots..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <AnimatePresence>
            {showCreateDialog ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <Input
                  placeholder="Snapshot title (optional)"
                  value={snapshotTitle}
                  onChange={(e) => setSnapshotTitle(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleCreateSnapshot}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowCreateDialog(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </motion.div>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowCreateDialog(true)}
                disabled={!messages.length}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Snapshot
              </Button>
            )}
          </AnimatePresence>
        </div>

        {/* Merge Controls */}
        {selectedSnapshots.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-muted/50 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedSnapshots.length} selected
              </span>
              <div className="flex gap-2">
                {selectedSnapshots.length === 2 && (
                  <Button
                    size="sm"
                    onClick={handleMergeSnapshots}
                    disabled={isLoading}
                  >
                    <Merge className="h-4 w-4 mr-1" />
                    Merge
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedSnapshots([])}
                >
                  Clear
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Snapshots List */}
        <ScrollArea className="h-64">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : hasSnapshots ? (
            <div className="space-y-2">
              {filteredSnapshots.map((snapshot) => (
                <motion.div
                  key={snapshot.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedSnapshots.includes(snapshot.id)
                      ? 'bg-primary/10 border-primary'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => toggleSnapshotSelection(snapshot.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{snapshot.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Clock className="h-3 w-3" />
                        {new Date(snapshot.created_at).toLocaleDateString()}
                        <MessageSquare className="h-3 w-3 ml-2" />
                        {snapshot.messages?.length || 0} messages
                      </div>
                      <Badge variant="outline" className="mt-2 text-xs">
                        {snapshot.conversation_type}
                      </Badge>
                    </div>
                    
                    <div className="flex gap-1 ml-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLoadSnapshot(snapshot.id);
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <FolderOpen className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSnapshot(snapshot.id);
                        }}
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Archive className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No snapshots yet</p>
              <p className="text-xs">Create snapshots to save conversation context</p>
            </div>
          )}
        </ScrollArea>

        {/* Quick Actions */}
        {hasSnapshots && (
          <div className="flex gap-2 pt-2 border-t">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {/* Export snapshots */}}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};