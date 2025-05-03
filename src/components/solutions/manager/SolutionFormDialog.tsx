
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { Solution } from '@/contexts/content-builder/types';

interface SolutionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (formData: {
    name: string;
    features: string;
    useCases: string;
    painPoints: string;
    targetAudience: string;
  }) => Promise<void>;
  solution: Solution | null;
}

export const SolutionFormDialog: React.FC<SolutionFormDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  solution
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    features: '',
    useCases: '',
    painPoints: '',
    targetAudience: '',
  });
  
  // Reset form data when solution changes
  useEffect(() => {
    if (solution) {
      setFormData({
        name: solution.name,
        features: solution.features.join(', '),
        useCases: solution.useCases.join(', '),
        painPoints: solution.painPoints.join(', '),
        targetAudience: solution.targetAudience.join(', '),
      });
    } else {
      setFormData({
        name: '',
        features: '',
        useCases: '',
        painPoints: '',
        targetAudience: '',
      });
    }
  }, [solution]);
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-panel sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-gradient">{solution ? 'Edit Solution' : 'Add New Solution'}</DialogTitle>
          <DialogDescription>
            {solution 
              ? 'Update the details of your business solution.' 
              : 'Add a new business solution to feature in your content.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="name">Solution Name</Label>
            <Input 
              id="name"
              placeholder="e.g., TaskMaster Pro"
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="features">Key Features</Label>
              <span className="text-xs text-muted-foreground">Comma separated</span>
            </div>
            <Textarea 
              id="features"
              placeholder="e.g., Gantt charts, Team collaboration, AI analytics"
              value={formData.features} 
              onChange={(e) => setFormData({...formData, features: e.target.value})}
              className="min-h-24"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="useCases">Use Cases</Label>
                <span className="text-xs text-muted-foreground">Comma separated</span>
              </div>
              <Textarea 
                id="useCases"
                placeholder="e.g., Remote teams, Agile workflows"
                value={formData.useCases} 
                onChange={(e) => setFormData({...formData, useCases: e.target.value})}
                className="min-h-20"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="painPoints">Pain Points</Label>
                <span className="text-xs text-muted-foreground">Comma separated</span>
              </div>
              <Textarea 
                id="painPoints"
                placeholder="e.g., Missed deadlines, Poor task visibility"
                value={formData.painPoints} 
                onChange={(e) => setFormData({...formData, painPoints: e.target.value})}
                className="min-h-20"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="targetAudience">Target Audience</Label>
              <span className="text-xs text-muted-foreground">Comma separated</span>
            </div>
            <Textarea 
              id="targetAudience"
              placeholder="e.g., Project managers, IT teams"
              value={formData.targetAudience} 
              onChange={(e) => setFormData({...formData, targetAudience: e.target.value})}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {solution ? 'Updating...' : 'Adding...'}
              </>
            ) : (
              solution ? 'Update Solution' : 'Add Solution'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
