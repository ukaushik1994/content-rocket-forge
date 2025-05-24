
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, AlertCircle, Clock, UserPlus } from 'lucide-react';
import { ContentItemType } from '@/contexts/content/types';
import { toast } from 'sonner';

interface AssignmentManagerProps {
  contentItems: ContentItemType[];
  selectedContent?: ContentItemType;
  onAssign: (contentId: string, assignmentData: AssignmentData) => Promise<void>;
  className?: string;
}

interface AssignmentData {
  reviewerId: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
}

const mockReviewers = [
  { id: 'reviewer-1', name: 'John Doe', role: 'Senior Editor', workload: 3 },
  { id: 'reviewer-2', name: 'Jane Smith', role: 'Content Manager', workload: 5 },
  { id: 'reviewer-3', name: 'Mike Johnson', role: 'SEO Specialist', workload: 2 },
  { id: 'reviewer-4', name: 'Sarah Wilson', role: 'Brand Manager', workload: 4 },
];

export const AssignmentManager: React.FC<AssignmentManagerProps> = ({
  contentItems,
  selectedContent,
  onAssign,
  className
}) => {
  const [selectedReviewer, setSelectedReviewer] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [notes, setNotes] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);

  const handleAssignment = async () => {
    if (!selectedContent) {
      toast.error('Please select content to assign');
      return;
    }

    if (!selectedReviewer) {
      toast.error('Please select a reviewer');
      return;
    }

    setIsAssigning(true);
    try {
      const assignmentData: AssignmentData = {
        reviewerId: selectedReviewer,
        dueDate: dueDate || undefined,
        priority,
        notes: notes || undefined
      };

      await onAssign(selectedContent.id, assignmentData);
      
      // Reset form
      setSelectedReviewer('');
      setDueDate('');
      setPriority('medium');
      setNotes('');
      
      toast.success('Content assigned successfully');
    } catch (error) {
      console.error('Assignment failed:', error);
      toast.error('Failed to assign content');
    } finally {
      setIsAssigning(false);
    }
  };

  const getWorkloadColor = (workload: number) => {
    if (workload <= 2) return 'bg-green-500';
    if (workload <= 4) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-700';
      case 'medium': return 'bg-yellow-500/20 text-yellow-700';
      case 'low': return 'bg-green-500/20 text-green-700';
      default: return 'bg-gray-500/20 text-gray-700';
    }
  };

  const getUnassignedCount = () => {
    return contentItems.filter(item => !item.reviewer_id && item.approval_status === 'pending_review').length;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Assignment Manager
          {getUnassignedCount() > 0 && (
            <Badge variant="destructive" className="ml-auto">
              {getUnassignedCount()} unassigned
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Selection */}
        {selectedContent && (
          <div className="p-3 border rounded-lg bg-muted/50">
            <h4 className="font-medium mb-2">Selected Content</h4>
            <p className="text-sm text-muted-foreground truncate">{selectedContent.title}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">{selectedContent.approval_status}</Badge>
              {selectedContent.reviewer_id && (
                <Badge className="bg-blue-500/20 text-blue-700">
                  Already Assigned
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Reviewer Selection */}
        <div className="space-y-3">
          <Label>Select Reviewer</Label>
          <Select value={selectedReviewer} onValueChange={setSelectedReviewer}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a reviewer" />
            </SelectTrigger>
            <SelectContent>
              {mockReviewers.map((reviewer) => (
                <SelectItem key={reviewer.id} value={reviewer.id}>
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <div className="font-medium">{reviewer.name}</div>
                      <div className="text-xs text-muted-foreground">{reviewer.role}</div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <div className={`w-2 h-2 rounded-full ${getWorkloadColor(reviewer.workload)}`} />
                      <span className="text-xs">{reviewer.workload} active</span>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Priority & Due Date */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    Low
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    Medium
                  </div>
                </SelectItem>
                <SelectItem value="high">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    High
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Due Date</Label>
            <Input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        {/* Assignment Notes */}
        <div className="space-y-2">
          <Label>Assignment Notes</Label>
          <Textarea
            placeholder="Add specific instructions or context for the reviewer..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        {/* Assign Button */}
        <Button
          onClick={handleAssignment}
          disabled={!selectedContent || !selectedReviewer || isAssigning}
          className="w-full"
        >
          {isAssigning ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Assigning...
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4 mr-2" />
              Assign to Reviewer
            </>
          )}
        </Button>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {contentItems.filter(item => item.approval_status === 'in_review').length}
            </div>
            <div className="text-xs text-muted-foreground">In Review</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {getUnassignedCount()}
            </div>
            <div className="text-xs text-muted-foreground">Unassigned</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
