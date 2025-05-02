
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SolutionCard } from '@/components/solutions/SolutionCard';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Plus, Trash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Solution type
interface Solution {
  id: string;
  name: string;
  features: string[];
  useCases: string[];
  painPoints: string[];
  targetAudience: string[];
}

export const SolutionManager: React.FC = () => {
  const [solutions, setSolutions] = useState<Solution[]>([
    {
      id: '1',
      name: 'TaskMaster Pro',
      features: ["Gantt charts", "Team collaboration", "AI analytics"],
      useCases: ["Remote teams", "Agile workflows"],
      painPoints: ["Missed deadlines", "Poor task visibility"],
      targetAudience: ["Project managers", "IT teams"],
    },
    {
      id: '2',
      name: 'EmailPro Marketing',
      features: ["Drip campaigns", "A/B testing", "Audience segmentation"],
      useCases: ["Newsletter management", "Customer retention"],
      painPoints: ["Low open rates", "Poor deliverability"],
      targetAudience: ["Marketers", "Small businesses"],
    },
    {
      id: '3',
      name: 'SalesForce CRM+',
      features: ["Pipeline management", "Lead scoring", "Analytics dashboard"],
      useCases: ["Sales teams", "Account management"],
      painPoints: ["Lost leads", "Disorganized contacts"],
      targetAudience: ["Sales representatives", "Account managers"],
    }
  ]);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSolution, setSelectedSolution] = useState<Solution | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    features: '',
    useCases: '',
    painPoints: '',
    targetAudience: '',
  });
  
  const handleAddNew = () => {
    setSelectedSolution(null);
    setFormData({
      name: '',
      features: '',
      useCases: '',
      painPoints: '',
      targetAudience: '',
    });
    setIsDialogOpen(true);
  };
  
  const handleEdit = (solution: Solution) => {
    setSelectedSolution(solution);
    setFormData({
      name: solution.name,
      features: solution.features.join(', '),
      useCases: solution.useCases.join(', '),
      painPoints: solution.painPoints.join(', '),
      targetAudience: solution.targetAudience.join(', '),
    });
    setIsDialogOpen(true);
  };
  
  const handleDelete = (solution: Solution) => {
    setSelectedSolution(solution);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    if (selectedSolution) {
      setSolutions(solutions.filter(s => s.id !== selectedSolution.id));
      toast.success(`${selectedSolution.name} deleted successfully!`);
      setIsDeleteDialogOpen(false);
      setSelectedSolution(null);
    }
  };
  
  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error('Solution name is required');
      return;
    }
    
    setIsSubmitting(true);
    
    setTimeout(() => {
      const splitStrings = (str: string) => str.split(',').map(s => s.trim()).filter(s => s);
      
      const newSolution = {
        id: selectedSolution?.id || `${Date.now()}`,
        name: formData.name,
        features: splitStrings(formData.features),
        useCases: splitStrings(formData.useCases),
        painPoints: splitStrings(formData.painPoints),
        targetAudience: splitStrings(formData.targetAudience),
      };
      
      if (selectedSolution) {
        // Update existing
        setSolutions(solutions.map(s => s.id === selectedSolution.id ? newSolution : s));
        toast.success(`${newSolution.name} updated successfully!`);
      } else {
        // Add new
        setSolutions([...solutions, newSolution]);
        toast.success(`${newSolution.name} added successfully!`);
      }
      
      setIsSubmitting(false);
      setIsDialogOpen(false);
    }, 1000);
  };
  
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Business Solutions ({solutions.length})</h2>
        <Button 
          onClick={handleAddNew}
          className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Solution
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {solutions.map(solution => (
          <div key={solution.id} className="relative group">
            <SolutionCard 
              name={solution.name}
              features={solution.features}
              useCases={solution.useCases}
              painPoints={solution.painPoints}
              targetAudience={solution.targetAudience}
              cta="Use in Content"
            />
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 bg-black/50 backdrop-blur-sm"
                onClick={() => handleEdit(solution)}
              >
                Edit
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                className="h-7 bg-red-500/80 backdrop-blur-sm"
                onClick={() => handleDelete(solution)}
              >
                <Trash className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="glass-panel sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-gradient">{selectedSolution ? 'Edit Solution' : 'Add New Solution'}</DialogTitle>
            <DialogDescription>
              {selectedSolution 
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
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
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
                  {selectedSolution ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                selectedSolution ? 'Update Solution' : 'Add Solution'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="glass-panel sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-500">Delete Solution</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this solution? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedSolution && (
            <div className="py-4">
              <p className="font-medium">{selectedSolution.name}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {selectedSolution.features.slice(0, 3).map((feature, i) => (
                  <Badge key={i} variant="outline">{feature}</Badge>
                ))}
                {selectedSolution.features.length > 3 && (
                  <Badge variant="outline">+{selectedSolution.features.length - 3} more</Badge>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
