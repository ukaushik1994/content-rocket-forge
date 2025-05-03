import React, { useState, useEffect } from 'react';
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
import { useNavigate } from 'react-router-dom';
import { useContentBuilder } from '@/contexts/ContentBuilderContext';
import { supabase } from '@/integrations/supabase/client';
import { Solution } from '@/contexts/content-builder/types';
import { Json } from '@/integrations/supabase/types';

export const SolutionManager: React.FC = () => {
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSolution, setSelectedSolution] = useState<Solution | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Added for content builder integration
  const navigate = useNavigate();
  const { dispatch } = useContentBuilder();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    features: '',
    useCases: '',
    painPoints: '',
    targetAudience: '',
  });
  
  useEffect(() => {
    fetchSolutions();
  }, []);

  const fetchSolutions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('solutions')
        .select('*');
      
      if (error) throw error;
      
      if (data) {
        // Transform the data from jsonb columns to the expected format
        const formattedSolutions: Solution[] = data.map(solution => ({
          id: solution.id,
          name: solution.name,
          features: Array.isArray(solution.features) 
            ? solution.features.map(f => String(f)) 
            : [],
          useCases: Array.isArray(solution.use_cases) 
            ? solution.use_cases.map(u => String(u)) 
            : [],
          painPoints: Array.isArray(solution.pain_points) 
            ? solution.pain_points.map(p => String(p)) 
            : [],
          targetAudience: Array.isArray(solution.target_audience) 
            ? solution.target_audience.map(a => String(a)) 
            : [],
          description: `${solution.name} - Business Solution` // Default description
        }));
        setSolutions(formattedSolutions);
      }
    } catch (error) {
      console.error("Error fetching solutions:", error);
      // Fallback to some default data if there's an error
      setSolutions([{
        id: '1',
        name: 'Demo Solution',
        description: 'Demo solution for content creation',
        features: ["Feature 1", "Feature 2", "Feature 3"],
        useCases: ["Use case 1", "Use case 2"],
        painPoints: ["Pain point 1", "Pain point 2"],
        targetAudience: ["Audience 1", "Audience 2"]
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  
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
  
  const confirmDelete = async () => {
    if (selectedSolution) {
      setIsSubmitting(true);
      try {
        const { error } = await supabase
          .from('solutions')
          .delete()
          .eq('id', selectedSolution.id);
        
        if (error) throw error;
        
        setSolutions(solutions.filter(s => s.id !== selectedSolution.id));
        toast.success(`${selectedSolution.name} deleted successfully!`);
      } catch (error) {
        console.error("Error deleting solution:", error);
        toast.error("Failed to delete solution");
      } finally {
        setIsSubmitting(false);
        setIsDeleteDialogOpen(false);
        setSelectedSolution(null);
      }
    }
  };
  
  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Solution name is required');
      return;
    }
    
    setIsSubmitting(true);
    
    const splitStrings = (str: string) => str.split(',').map(s => s.trim()).filter(s => s);
    
    try {
      const solutionData = {
        name: formData.name,
        features: splitStrings(formData.features),
        use_cases: splitStrings(formData.useCases),
        pain_points: splitStrings(formData.painPoints),
        target_audience: splitStrings(formData.targetAudience),
        user_id: 'system' // Using a default user_id for demo purposes
      };
      
      if (selectedSolution) {
        // Update existing
        const { error } = await supabase
          .from('solutions')
          .update(solutionData)
          .eq('id', selectedSolution.id);
        
        if (error) throw error;
        
        // Update local state
        setSolutions(solutions.map(s => s.id === selectedSolution.id ? {
          ...selectedSolution,
          name: formData.name,
          features: splitStrings(formData.features),
          useCases: splitStrings(formData.useCases),
          painPoints: splitStrings(formData.painPoints),
          targetAudience: splitStrings(formData.targetAudience),
        } : s));
        
        toast.success(`${formData.name} updated successfully!`);
      } else {
        // Add new
        const { data, error } = await supabase
          .from('solutions')
          .insert(solutionData)
          .select();
        
        if (error) throw error;
        
        if (data && data[0]) {
          const newSolution: Solution = {
            id: data[0].id,
            name: data[0].name,
            features: Array.isArray(data[0].features) 
              ? data[0].features.map(String) 
              : [],
            useCases: Array.isArray(data[0].use_cases) 
              ? data[0].use_cases.map(String) 
              : [],
            painPoints: Array.isArray(data[0].pain_points) 
              ? data[0].pain_points.map(String) 
              : [],
            targetAudience: Array.isArray(data[0].target_audience) 
              ? data[0].target_audience.map(String) 
              : [],
            description: `${data[0].name} - Business Solution`
          };
          
          setSolutions([...solutions, newSolution]);
          toast.success(`${formData.name} added successfully!`);
        }
      }
    } catch (error) {
      console.error("Error saving solution:", error);
      toast.error("Failed to save solution");
    } finally {
      setIsSubmitting(false);
      setIsDialogOpen(false);
    }
  };

  // New function to handle using a solution in content
  const handleUseInContent = (solution: Solution) => {
    // Store the solution in the content builder context
    dispatch({ type: 'SELECT_SOLUTION', payload: solution });
    
    // Navigate to the content builder page
    toast.success(`${solution.name} selected for content creation`);
    navigate('/content');
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
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
              onUseInContent={() => handleUseInContent(solution)}
            />
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 bg-black/50 backdrop-blur-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(solution);
                }}
              >
                Edit
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                className="h-7 bg-red-500/80 backdrop-blur-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(solution);
                }}
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
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</>
              ) : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
