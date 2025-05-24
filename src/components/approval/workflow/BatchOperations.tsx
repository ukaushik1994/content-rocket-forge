
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ContentItemType } from '@/contexts/content/types';
import { CheckCircle2, XCircle, AlertTriangle, Users, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface BatchOperationsProps {
  contentItems: ContentItemType[];
  selectedItems: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  onBatchAction: (action: 'approve' | 'reject' | 'request_changes' | 'assign', data?: any) => Promise<void>;
  className?: string;
}

export const BatchOperations: React.FC<BatchOperationsProps> = ({
  contentItems,
  selectedItems,
  onSelectionChange,
  onBatchAction,
  className
}) => {
  const [batchAction, setBatchAction] = useState<string>('');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [batchComments, setBatchComments] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSelectAll = () => {
    if (selectedItems.length === contentItems.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(contentItems.map(item => item.id));
    }
  };

  const handleItemSelection = (itemId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedItems, itemId]);
    } else {
      onSelectionChange(selectedItems.filter(id => id !== itemId));
    }
  };

  const handleBatchOperation = async () => {
    if (!batchAction) {
      toast.error('Please select an action');
      return;
    }

    if (selectedItems.length === 0) {
      toast.error('Please select items to process');
      return;
    }

    setIsProcessing(true);
    try {
      const actionData = {
        items: selectedItems,
        comments: batchComments,
        assigneeId: batchAction === 'assign' ? assigneeId : undefined
      };

      await onBatchAction(batchAction as any, actionData);
      
      // Reset form
      setBatchAction('');
      setBatchComments('');
      setAssigneeId('');
      onSelectionChange([]);
      
      toast.success(`Batch ${batchAction} completed successfully`);
    } catch (error) {
      console.error('Batch operation failed:', error);
      toast.error('Batch operation failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'approve': return <CheckCircle2 className="h-4 w-4" />;
      case 'reject': return <XCircle className="h-4 w-4" />;
      case 'request_changes': return <AlertTriangle className="h-4 w-4" />;
      case 'assign': return <Users className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Batch Operations
          {selectedItems.length > 0 && (
            <span className="text-sm font-normal text-muted-foreground">
              ({selectedItems.length} selected)
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selection Controls */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={selectedItems.length === contentItems.length && contentItems.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm font-medium">
              Select All ({contentItems.length} items)
            </span>
          </div>
          
          {/* Individual Item Selection */}
          <div className="max-h-32 overflow-y-auto space-y-2">
            {contentItems.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={selectedItems.includes(item.id)}
                  onCheckedChange={(checked) => handleItemSelection(item.id, checked as boolean)}
                />
                <span className="truncate flex-1">{item.title}</span>
                <span className="text-xs text-muted-foreground">{item.approval_status}</span>
              </div>
            ))}
            {contentItems.length > 5 && (
              <p className="text-xs text-muted-foreground text-center">
                +{contentItems.length - 5} more items
              </p>
            )}
          </div>
        </div>

        {/* Batch Action Selection */}
        <div className="space-y-3">
          <Select value={batchAction} onValueChange={setBatchAction}>
            <SelectTrigger>
              <SelectValue placeholder="Select batch action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="approve">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Approve Selected
                </div>
              </SelectItem>
              <SelectItem value="request_changes">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  Request Changes
                </div>
              </SelectItem>
              <SelectItem value="reject">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  Reject Selected
                </div>
              </SelectItem>
              <SelectItem value="assign">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  Assign Reviewer
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Assignee Selection (for assign action) */}
          {batchAction === 'assign' && (
            <Select value={assigneeId} onValueChange={setAssigneeId}>
              <SelectTrigger>
                <SelectValue placeholder="Select reviewer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="reviewer-1">John Doe</SelectItem>
                <SelectItem value="reviewer-2">Jane Smith</SelectItem>
                <SelectItem value="reviewer-3">Mike Johnson</SelectItem>
              </SelectContent>
            </Select>
          )}

          {/* Comments */}
          {(batchAction === 'reject' || batchAction === 'request_changes') && (
            <Textarea
              placeholder="Enter comments for this batch action..."
              value={batchComments}
              onChange={(e) => setBatchComments(e.target.value)}
              rows={3}
            />
          )}
        </div>

        {/* Execute Button */}
        <Button
          onClick={handleBatchOperation}
          disabled={!batchAction || selectedItems.length === 0 || isProcessing}
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              {getActionIcon(batchAction)}
              <span className="ml-2">
                Execute {batchAction} ({selectedItems.length} items)
              </span>
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
