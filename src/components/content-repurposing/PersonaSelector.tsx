import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { SolutionPersona } from '@/contexts/content-builder/types/enhanced-solution-types';
import { solutionService } from '@/services/solutionService';
import { toast } from 'sonner';
import { Users, Target, Briefcase, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PersonaSelectorProps {
  solutionId?: string;
  selectedPersonas: string[];
  onPersonaChange: (personaIds: string[]) => void;
  className?: string;
}

export const PersonaSelector: React.FC<PersonaSelectorProps> = ({
  solutionId,
  selectedPersonas,
  onPersonaChange,
  className
}) => {
  const [personas, setPersonas] = useState<SolutionPersona[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const fetchPersonas = useCallback(async () => {
    if (!solutionId) return;
    
    setLoading(true);
    try {
      const fetchedPersonas = await solutionService.getPersonasForSolution(solutionId);
      setPersonas(fetchedPersonas);
    } catch (error) {
      console.error('Error fetching personas:', error);
      toast.error('Failed to load personas');
    } finally {
      setLoading(false);
    }
  }, [solutionId]);

  useEffect(() => {
    fetchPersonas();
  }, [fetchPersonas]);

  const handlePersonaToggle = (personaId: string, checked: boolean) => {
    if (checked) {
      onPersonaChange([...selectedPersonas, personaId]);
    } else {
      onPersonaChange(selectedPersonas.filter(id => id !== personaId));
    }
  };

  const handleSelectAll = () => {
    const filtered = getFilteredPersonas();
    const allIds = filtered.map(p => p.id);
    const newSelection = [...new Set([...selectedPersonas, ...allIds])];
    onPersonaChange(newSelection);
  };

  const handleDeselectAll = () => {
    const filtered = getFilteredPersonas();
    const filteredIds = new Set(filtered.map(p => p.id));
    const newSelection = selectedPersonas.filter(id => !filteredIds.has(id));
    onPersonaChange(newSelection);
  };

  const getFilteredPersonas = () => {
    if (selectedCategory === 'all') return personas;
    return personas.filter(p => p.personaCategory === selectedCategory);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'buyer': return <Target className="h-4 w-4" />;
      case 'influencer': return <Users className="h-4 w-4" />;
      case 'user': return <Briefcase className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'buyer': return 'from-green-500/20 to-emerald-500/20 border-green-500/30';
      case 'influencer': return 'from-blue-500/20 to-cyan-500/20 border-blue-500/30';
      case 'user': return 'from-purple-500/20 to-violet-500/20 border-purple-500/30';
      default: return 'from-gray-500/20 to-slate-500/20 border-gray-500/30';
    }
  };

  if (!solutionId) {
    return (
      <Card className={`bg-black/50 border-white/10 ${className}`}>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="h-4 w-4" />
            Target Personas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No solution associated with this content. Personas are not available.
          </p>
        </CardContent>
      </Card>
    );
  }

  const filteredPersonas = getFilteredPersonas();
  const categories = [...new Set(personas.map(p => p.personaCategory))];

  return (
    <Card className={`bg-black/50 border-white/10 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="h-4 w-4" />
            Target Personas
            {selectedPersonas.length > 0 && (
              <Badge variant="outline" className="ml-2">
                {selectedPersonas.length} selected
              </Badge>
            )}
          </CardTitle>
          
          {personas.length > 0 && (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                className="text-xs h-7 px-2"
              >
                All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeselectAll}
                className="text-xs h-7 px-2"
              >
                None
              </Button>
            </div>
          )}
        </div>
        
        {categories.length > 1 && (
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="h-8 bg-black/30 border-white/10">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category} className="capitalize">
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </CardHeader>
      
      <CardContent className="pt-0">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : personas.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            No personas defined for this solution. Create personas in the Solution Manager to target specific audiences.
          </p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            <AnimatePresence mode="popLayout">
              {filteredPersonas.map((persona) => (
                <motion.div
                  key={persona.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`p-3 rounded-lg bg-gradient-to-r ${getCategoryColor(persona.personaCategory)} border`}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id={persona.id}
                      checked={selectedPersonas.includes(persona.id)}
                      onCheckedChange={(checked) => 
                        handlePersonaToggle(persona.id, checked as boolean)
                      }
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getCategoryIcon(persona.personaCategory)}
                        <label 
                          htmlFor={persona.id}
                          className="font-medium text-sm cursor-pointer"
                        >
                          {persona.personaName}
                        </label>
                        <Badge variant="outline" className="text-xs capitalize">
                          {persona.personaCategory}
                        </Badge>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mb-2">
                        {persona.roleTitle}
                      </p>
                      
                      {persona.keyTopics && persona.keyTopics.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {persona.keyTopics.slice(0, 3).map((topic, index) => (
                            <Badge 
                              key={index} 
                              variant="secondary" 
                              className="text-xs py-0 px-1.5 h-4"
                            >
                              {topic}
                            </Badge>
                          ))}
                          {persona.keyTopics.length > 3 && (
                            <Badge 
                              variant="secondary" 
                              className="text-xs py-0 px-1.5 h-4"
                            >
                              +{persona.keyTopics.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PersonaSelector;