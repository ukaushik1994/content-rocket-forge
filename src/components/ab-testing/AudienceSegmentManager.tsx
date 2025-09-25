import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Users, Target } from 'lucide-react';
import { AudienceSegment, SegmentCriteria } from '@/types/ab-testing-advanced';
import { audienceSegmentService } from '@/services/audienceSegmentService';

interface AudienceSegmentManagerProps {
  onSegmentCreated?: (segment: AudienceSegment) => void;
  selectedSegments?: string[];
  onSegmentSelection?: (segmentIds: string[]) => void;
}

export const AudienceSegmentManager: React.FC<AudienceSegmentManagerProps> = ({
  onSegmentCreated,
  selectedSegments = [],
  onSegmentSelection
}) => {
  const [segments, setSegments] = useState<AudienceSegment[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newSegmentName, setNewSegmentName] = useState('');
  const [criteria, setCriteria] = useState<SegmentCriteria[]>([]);
  const [estimatedSize, setEstimatedSize] = useState<number>(0);

  useEffect(() => {
    loadSegments();
  }, []);

  useEffect(() => {
    if (criteria.length > 0) {
      estimateSegmentSize();
    }
  }, [criteria]);

  const loadSegments = async () => {
    const loadedSegments = await audienceSegmentService.getSegments();
    setSegments(loadedSegments);
  };

  const estimateSegmentSize = async () => {
    const size = await audienceSegmentService.estimateSegmentSize(criteria);
    setEstimatedSize(size);
  };

  const addCriterion = () => {
    const newCriterion: SegmentCriteria = {
      type: 'device',
      field: '',
      operator: 'equals',
      value: ''
    };
    setCriteria([...criteria, newCriterion]);
  };

  const updateCriterion = (index: number, updates: Partial<SegmentCriteria>) => {
    setCriteria(criteria.map((criterion, i) => 
      i === index ? { ...criterion, ...updates } : criterion
    ));
  };

  const removeCriterion = (index: number) => {
    setCriteria(criteria.filter((_, i) => i !== index));
  };

  const createSegment = async () => {
    if (!newSegmentName.trim() || criteria.length === 0) return;

    const newSegment = await audienceSegmentService.createSegment({
      name: newSegmentName,
      criteria,
      size_estimate: estimatedSize
    });

    if (newSegment) {
      setSegments([newSegment, ...segments]);
      onSegmentCreated?.(newSegment);
      setIsCreating(false);
      setNewSegmentName('');
      setCriteria([]);
      setEstimatedSize(0);
    }
  };

  const toggleSegmentSelection = (segmentId: string) => {
    if (!onSegmentSelection) return;
    
    const newSelection = selectedSegments.includes(segmentId)
      ? selectedSegments.filter(id => id !== segmentId)
      : [...selectedSegments, segmentId];
    
    onSegmentSelection(newSelection);
  };

  const deleteSegment = async (segmentId: string) => {
    const success = await audienceSegmentService.deleteSegment(segmentId);
    if (success) {
      setSegments(segments.filter(segment => segment.id !== segmentId));
    }
  };

  const getCriteriaFieldOptions = (type: SegmentCriteria['type']) => {
    switch (type) {
      case 'device':
        return ['device_type', 'browser', 'os', 'screen_size'];
      case 'location':
        return ['country', 'region', 'city', 'timezone'];
      case 'behavior':
        return ['page_views', 'session_duration', 'bounce_rate', 'referrer'];
      case 'demographic':
        return ['age', 'gender', 'language', 'interest'];
      case 'custom':
        return ['custom_attribute_1', 'custom_attribute_2', 'user_property'];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Users className="h-5 w-5" />
          Audience Segments
        </h3>
        <Button onClick={() => setIsCreating(true)} disabled={isCreating}>
          <Plus className="h-4 w-4 mr-2" />
          Create Segment
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Audience Segment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="segmentName">Segment Name</Label>
              <Input
                id="segmentName"
                value={newSegmentName}
                onChange={(e) => setNewSegmentName(e.target.value)}
                placeholder="Enter segment name"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Targeting Criteria</Label>
                <Button onClick={addCriterion} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Criterion
                </Button>
              </div>

              {criteria.map((criterion, index) => (
                <div key={index} className="grid grid-cols-4 gap-2 items-end">
                  <div>
                    <Label>Type</Label>
                    <Select
                      value={criterion.type}
                      onValueChange={(value: any) => updateCriterion(index, { type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="device">Device</SelectItem>
                        <SelectItem value="location">Location</SelectItem>
                        <SelectItem value="behavior">Behavior</SelectItem>
                        <SelectItem value="demographic">Demographic</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Field</Label>
                    <Select
                      value={criterion.field}
                      onValueChange={(value) => updateCriterion(index, { field: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {getCriteriaFieldOptions(criterion.type).map(field => (
                          <SelectItem key={field} value={field}>
                            {field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Operator</Label>
                    <Select
                      value={criterion.operator}
                      onValueChange={(value: any) => updateCriterion(index, { operator: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equals">Equals</SelectItem>
                        <SelectItem value="contains">Contains</SelectItem>
                        <SelectItem value="greater_than">Greater Than</SelectItem>
                        <SelectItem value="less_than">Less Than</SelectItem>
                        <SelectItem value="in">In</SelectItem>
                        <SelectItem value="not_in">Not In</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2">
                    <Input
                      value={criterion.value}
                      onChange={(e) => updateCriterion(index, { value: e.target.value })}
                      placeholder="Value"
                    />
                    <Button
                      onClick={() => removeCriterion(index)}
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {estimatedSize > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Target className="h-4 w-4" />
                Estimated audience size: {estimatedSize.toLocaleString()} users
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button onClick={() => setIsCreating(false)} variant="outline">
                Cancel
              </Button>
              <Button onClick={createSegment} disabled={!newSegmentName.trim() || criteria.length === 0}>
                Create Segment
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {segments.map((segment) => (
          <Card key={segment.id} className={`cursor-pointer transition-colors ${
            selectedSegments.includes(segment.id) ? 'ring-2 ring-primary' : ''
          }`}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div 
                  className="flex-1"
                  onClick={() => toggleSegmentSelection(segment.id)}
                >
                  <h4 className="font-medium">{segment.name}</h4>
                  <div className="flex items-center gap-2 mt-2">
                    {segment.size_estimate && (
                      <Badge variant="secondary">
                        {segment.size_estimate.toLocaleString()} users
                      </Badge>
                    )}
                    <Badge variant="outline">
                      {segment.criteria.length} criteria
                    </Badge>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    {segment.criteria.map((criterion, index) => (
                      <span key={index}>
                        {criterion.field} {criterion.operator} {criterion.value}
                        {index < segment.criteria.length - 1 && ', '}
                      </span>
                    ))}
                  </div>
                </div>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSegment(segment.id);
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};