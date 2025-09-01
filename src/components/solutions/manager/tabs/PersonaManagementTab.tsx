import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  User, 
  Crown, 
  Users, 
  Plus, 
  Trash2, 
  ChevronDown,
  ChevronRight,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { EnhancedSolution, SolutionPersona, PersonaCategory, PERSONA_CATEGORIES } from '@/contexts/content-builder/types/enhanced-solution-types';
import { solutionService } from '@/services/solutionService';
import { toast } from 'sonner';

interface PersonaManagementTabProps {
  formData: Partial<EnhancedSolution>;
  updateFormData: (updates: Partial<EnhancedSolution>) => void;
}

interface PersonaFormData {
  personaName: string;
  roleTitle: string;
  typicalGoals: string[];
  painPoints: string[];
  preferredTone: string;
  keyTopics: string[];
}

const TONE_OPTIONS = [
  'Professional',
  'Casual',
  'Technical',
  'Executive',
  'Friendly',
  'Direct',
  'Analytical',
  'Creative'
];

export const PersonaManagementTab: React.FC<PersonaManagementTabProps> = ({
  formData,
  updateFormData,
}) => {
  const [personas, setPersonas] = useState<SolutionPersona[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<PersonaCategory>>(new Set());
  const [editingPersona, setEditingPersona] = useState<string | null>(null);
  const [personaForms, setPersonaForms] = useState<Record<string, PersonaFormData>>({});

  // Load personas when solution ID is available
  useEffect(() => {
    if (formData.id) {
      loadPersonas();
    }
  }, [formData.id]);

  const loadPersonas = async () => {
    if (!formData.id) return;
    
    setIsLoading(true);
    try {
      const loadedPersonas = await solutionService.getPersonasForSolution(formData.id);
      setPersonas(loadedPersonas);
      updateFormData({ personas: loadedPersonas });
    } catch (error) {
      console.error('Error loading personas:', error);
      toast.error('Failed to load personas');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCategory = (category: PersonaCategory) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const getPersonasForCategory = (category: PersonaCategory) => {
    return personas.filter(p => p.personaCategory === category);
  };

  const initializePersonaForm = (category: PersonaCategory): PersonaFormData => {
    const categoryInfo = PERSONA_CATEGORIES.find(c => c.value === category);
    return {
      personaName: '',
      roleTitle: '',
      typicalGoals: [],
      painPoints: [],
      preferredTone: 'Professional',
      keyTopics: []
    };
  };

  const handleAddPersona = (category: PersonaCategory) => {
    const formKey = `new-${category}`;
    setPersonaForms({
      ...personaForms,
      [formKey]: initializePersonaForm(category)
    });
    setEditingPersona(formKey);
  };

  const handleEditPersona = (persona: SolutionPersona) => {
    const formKey = persona.id;
    setPersonaForms({
      ...personaForms,
      [formKey]: {
        personaName: persona.personaName,
        roleTitle: persona.roleTitle,
        typicalGoals: [...persona.typicalGoals],
        painPoints: [...persona.painPoints],
        preferredTone: persona.preferredTone,
        keyTopics: [...persona.keyTopics]
      }
    });
    setEditingPersona(formKey);
  };

  const handleSavePersona = async (category: PersonaCategory, formKey: string) => {
    const formData = personaForms[formKey];
    if (!formData || !formData.personaName.trim() || !formData.roleTitle.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!formData.id) {
      toast.error('Solution must be saved before adding personas');
      return;
    }

    try {
      if (formKey.startsWith('new-')) {
        // Create new persona
        const newPersona = await solutionService.createPersona({
          solutionId: formData.id,
          personaCategory: category,
          personaName: formData.personaName,
          roleTitle: formData.roleTitle,
          typicalGoals: formData.typicalGoals,
          painPoints: formData.painPoints,
          preferredTone: formData.preferredTone,
          keyTopics: formData.keyTopics,
          userId: '', // Will be set by the service
        });

        if (newPersona) {
          const updatedPersonas = [...personas, newPersona];
          setPersonas(updatedPersonas);
          updateFormData({ personas: updatedPersonas });
          toast.success('Persona created successfully');
        }
      } else {
        // Update existing persona
        const updatedPersona = await solutionService.updatePersona(formKey, {
          personaName: formData.personaName,
          roleTitle: formData.roleTitle,
          typicalGoals: formData.typicalGoals,
          painPoints: formData.painPoints,
          preferredTone: formData.preferredTone,
          keyTopics: formData.keyTopics
        });

        if (updatedPersona) {
          const updatedPersonas = personas.map(p => p.id === formKey ? updatedPersona : p);
          setPersonas(updatedPersonas);
          updateFormData({ personas: updatedPersonas });
          toast.success('Persona updated successfully');
        }
      }

      // Clear form and exit edit mode
      const newForms = { ...personaForms };
      delete newForms[formKey];
      setPersonaForms(newForms);
      setEditingPersona(null);
    } catch (error) {
      console.error('Error saving persona:', error);
      toast.error('Failed to save persona');
    }
  };

  const handleDeletePersona = async (personaId: string) => {
    try {
      const success = await solutionService.deletePersona(personaId);
      if (success) {
        const updatedPersonas = personas.filter(p => p.id !== personaId);
        setPersonas(updatedPersonas);
        updateFormData({ personas: updatedPersonas });
        toast.success('Persona deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting persona:', error);
      toast.error('Failed to delete persona');
    }
  };

  const handleCancelEdit = (formKey: string) => {
    const newForms = { ...personaForms };
    delete newForms[formKey];
    setPersonaForms(newForms);
    setEditingPersona(null);
  };

  const updatePersonaForm = (formKey: string, field: string, value: any) => {
    setPersonaForms({
      ...personaForms,
      [formKey]: {
        ...personaForms[formKey],
        [field]: value
      }
    });
  };

  const addArrayField = (formKey: string, field: 'typicalGoals' | 'painPoints' | 'keyTopics', value: string) => {
    if (!value.trim()) return;
    
    const currentForm = personaForms[formKey];
    const currentArray = currentForm[field] as string[];
    
    if (!currentArray.includes(value.trim())) {
      updatePersonaForm(formKey, field, [...currentArray, value.trim()]);
    }
  };

  const removeArrayField = (formKey: string, field: 'typicalGoals' | 'painPoints' | 'keyTopics', index: number) => {
    const currentForm = personaForms[formKey];
    const currentArray = currentForm[field] as string[];
    updatePersonaForm(formKey, field, currentArray.filter((_, i) => i !== index));
  };

  const getCategoryIcon = (category: PersonaCategory) => {
    const categoryInfo = PERSONA_CATEGORIES.find(c => c.value === category);
    switch (categoryInfo?.icon) {
      case 'User': return <User className="h-4 w-4" />;
      case 'Crown': return <Crown className="h-4 w-4" />;
      case 'Users': return <Users className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getCompletionStatus = () => {
    const requiredCategories: PersonaCategory[] = ['end_user', 'decision_maker', 'influencer'];
    const existingCategories = new Set(personas.map(p => p.personaCategory));
    const completedCategories = requiredCategories.filter(cat => existingCategories.has(cat));
    
    return {
      completed: completedCategories.length,
      total: requiredCategories.length,
      isComplete: completedCategories.length === requiredCategories.length
    };
  };

  const completionStatus = getCompletionStatus();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading personas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with completion status */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">User Personas</CardTitle>
            <div className="flex items-center gap-2">
              {completionStatus.isComplete ? (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Complete</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-amber-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {completionStatus.completed}/{completionStatus.total} categories
                  </span>
                </div>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Define personas for each category to enable targeted content repurposing. Each persona will guide AI generation for specific audiences.
          </p>
        </CardHeader>
      </Card>

      {/* Persona Categories */}
      <div className="space-y-4">
        {PERSONA_CATEGORIES.map((category) => {
          const categoryPersonas = getPersonasForCategory(category.value);
          const isExpanded = expandedCategories.has(category.value);
          const hasPersonas = categoryPersonas.length > 0;
          
          return (
            <Card key={category.value} className="overflow-hidden">
              <Collapsible open={isExpanded} onOpenChange={() => toggleCategory(category.value)}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getCategoryIcon(category.value)}
                        <div>
                          <h3 className="font-medium">{category.label}</h3>
                          <p className="text-sm text-muted-foreground">{category.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {hasPersonas && (
                          <Badge variant="secondary" className="text-xs">
                            {categoryPersonas.length}
                          </Badge>
                        )}
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    {/* Examples */}
                    <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm font-medium text-muted-foreground mb-2">Examples:</p>
                      <div className="flex flex-wrap gap-1">
                        {category.examples.map((example, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {example}
                          </Badge>
                        ))
                      </div>
                    </div>

                    {/* Existing Personas */}
                    {categoryPersonas.map((persona) => (
                      <div key={persona.id} className="mb-4 p-4 border border-border rounded-lg">
                        {editingPersona === persona.id ? (
                          <PersonaForm
                            formKey={persona.id}
                            formData={personaForms[persona.id]}
                            category={category.value}
                            onSave={() => handleSavePersona(category.value, persona.id)}
                            onCancel={() => handleCancelEdit(persona.id)}
                            onUpdate={(field, value) => updatePersonaForm(persona.id, field, value)}
                            onAddArrayField={(field, value) => addArrayField(persona.id, field, value)}
                            onRemoveArrayField={(field, index) => removeArrayField(persona.id, field, index)}
                          />
                        ) : (
                          <PersonaDisplay
                            persona={persona}
                            onEdit={() => handleEditPersona(persona)}
                            onDelete={() => handleDeletePersona(persona.id)}
                          />
                        )}
                      </div>
                    ))}

                    {/* Add New Persona Form */}
                    {editingPersona === `new-${category.value}` ? (
                      <div className="p-4 border border-dashed border-border rounded-lg">
                        <PersonaForm
                          formKey={`new-${category.value}`}
                          formData={personaForms[`new-${category.value}`]}
                          category={category.value}
                          onSave={() => handleSavePersona(category.value, `new-${category.value}`)}
                          onCancel={() => handleCancelEdit(`new-${category.value}`)}
                          onUpdate={(field, value) => updatePersonaForm(`new-${category.value}`, field, value)}
                          onAddArrayField={(field, value) => addArrayField(`new-${category.value}`, field, value)}
                          onRemoveArrayField={(field, index) => removeArrayField(`new-${category.value}`, field, value)}
                        />
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => handleAddPersona(category.value)}
                        className="w-full border-dashed"
                        disabled={!formData.id}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add {category.label} Persona
                      </Button>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>

      {!formData.id && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-amber-800">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm">Save the solution first to manage personas.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// PersonaForm Component
interface PersonaFormProps {
  formKey: string;
  formData: PersonaFormData;
  category: PersonaCategory;
  onSave: () => void;
  onCancel: () => void;
  onUpdate: (field: string, value: any) => void;
  onAddArrayField: (field: 'typicalGoals' | 'painPoints' | 'keyTopics', value: string) => void;
  onRemoveArrayField: (field: 'typicalGoals' | 'painPoints' | 'keyTopics', index: number) => void;
}

const PersonaForm: React.FC<PersonaFormProps> = ({
  formData,
  onSave,
  onCancel,
  onUpdate,
  onAddArrayField,
  onRemoveArrayField
}) => {
  const [newGoal, setNewGoal] = useState('');
  const [newPainPoint, setNewPainPoint] = useState('');
  const [newTopic, setNewTopic] = useState('');

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="personaName">Persona Name *</Label>
          <Input
            id="personaName"
            value={formData?.personaName || ''}
            onChange={(e) => onUpdate('personaName', e.target.value)}
            placeholder="e.g., Sarah the Marketing Manager"
          />
        </div>
        <div>
          <Label htmlFor="roleTitle">Role/Title *</Label>
          <Input
            id="roleTitle"
            value={formData?.roleTitle || ''}
            onChange={(e) => onUpdate('roleTitle', e.target.value)}
            placeholder="e.g., Senior Marketing Manager"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="preferredTone">Preferred Communication Tone</Label>
        <Select value={formData?.preferredTone} onValueChange={(value) => onUpdate('preferredTone', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select tone" />
          </SelectTrigger>
          <SelectContent>
            {TONE_OPTIONS.map((tone) => (
              <SelectItem key={tone} value={tone}>{tone}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Typical Goals */}
      <div>
        <Label>Typical Goals</Label>
        <div className="flex gap-2 mt-1">
          <Input
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            placeholder="Add a goal"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                onAddArrayField('typicalGoals', newGoal);
                setNewGoal('');
              }
            }}
          />
          <Button 
            type="button" 
            size="sm" 
            onClick={() => {
              onAddArrayField('typicalGoals', newGoal);
              setNewGoal('');
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {formData?.typicalGoals?.map((goal, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {goal}
              <button
                type="button"
                onClick={() => onRemoveArrayField('typicalGoals', index)}
                className="ml-1 hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Pain Points */}
      <div>
        <Label>Pain Points</Label>
        <div className="flex gap-2 mt-1">
          <Input
            value={newPainPoint}
            onChange={(e) => setNewPainPoint(e.target.value)}
            placeholder="Add a pain point"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                onAddArrayField('painPoints', newPainPoint);
                setNewPainPoint('');
              }
            }}
          />
          <Button 
            type="button" 
            size="sm" 
            onClick={() => {
              onAddArrayField('painPoints', newPainPoint);
              setNewPainPoint('');
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {formData?.painPoints?.map((painPoint, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {painPoint}
              <button
                type="button"
                onClick={() => onRemoveArrayField('painPoints', index)}
                className="ml-1 hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Key Topics */}
      <div>
        <Label>Key Topics of Interest</Label>
        <div className="flex gap-2 mt-1">
          <Input
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            placeholder="Add a topic"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                onAddArrayField('keyTopics', newTopic);
                setNewTopic('');
              }
            }}
          />
          <Button 
            type="button" 
            size="sm" 
            onClick={() => {
              onAddArrayField('keyTopics', newTopic);
              setNewTopic('');
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {formData?.keyTopics?.map((topic, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {topic}
              <button
                type="button"
                onClick={() => onRemoveArrayField('keyTopics', index)}
                className="ml-1 hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button onClick={onSave} size="sm">Save Persona</Button>
        <Button variant="outline" onClick={onCancel} size="sm">Cancel</Button>
      </div>
    </div>
  );
};

// PersonaDisplay Component
interface PersonaDisplayProps {
  persona: SolutionPersona;
  onEdit: () => void;
  onDelete: () => void;
}

const PersonaDisplay: React.FC<PersonaDisplayProps> = ({ persona, onEdit, onDelete }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="font-medium">{persona.personaName}</h4>
          <p className="text-sm text-muted-foreground">{persona.roleTitle}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}>Edit</Button>
          <Button variant="outline" size="sm" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-3 text-sm">
        <div>
          <span className="font-medium text-muted-foreground">Tone: </span>
          <Badge variant="outline">{persona.preferredTone}</Badge>
        </div>

        {persona.typicalGoals.length > 0 && (
          <div>
            <span className="font-medium text-muted-foreground">Goals: </span>
            <div className="flex flex-wrap gap-1 mt-1">
              {persona.typicalGoals.map((goal, index) => (
                <Badge key={index} variant="secondary" className="text-xs">{goal}</Badge>
              ))}
            </div>
          </div>
        )}

        {persona.painPoints.length > 0 && (
          <div>
            <span className="font-medium text-muted-foreground">Pain Points: </span>
            <div className="flex flex-wrap gap-1 mt-1">
              {persona.painPoints.map((pain, index) => (
                <Badge key={index} variant="secondary" className="text-xs">{pain}</Badge>
              ))}
            </div>
          </div>
        )}

        {persona.keyTopics.length > 0 && (
          <div>
            <span className="font-medium text-muted-foreground">Key Topics: </span>
            <div className="flex flex-wrap gap-1 mt-1">
              {persona.keyTopics.map((topic, index) => (
                <Badge key={index} variant="secondary" className="text-xs">{topic}</Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
