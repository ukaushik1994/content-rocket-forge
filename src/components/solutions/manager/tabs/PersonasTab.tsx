import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { PersonaCard } from '../../PersonaCard';
import { PersonaType, SolutionPersona } from '@/contexts/content-builder/types/solution-types';
import { solutionPersonaService } from '@/services/solutionPersonaService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface PersonasTabProps {
  formData: any;
  updateFormData: (updates: any) => void;
}

const requiredPersonaTypes: PersonaType[] = ['end_user', 'decision_maker', 'influencer'];

export const PersonasTab: React.FC<PersonasTabProps> = ({
  formData,
  updateFormData
}) => {
  const { user } = useAuth();
  const [personas, setPersonas] = useState<Partial<SolutionPersona>[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize personas from formData or create empty ones
  useEffect(() => {
    if (formData.personas && formData.personas.length > 0) {
      setPersonas(formData.personas);
    } else {
      // Create empty personas for all required types
      const emptyPersonas = requiredPersonaTypes.map(type => ({
        personaType: type,
        personaName: '',
        roleTitle: '',
        typicalGoals: [],
        painPoints: [],
        preferredTone: '',
        keyTopics: []
      }));
      setPersonas(emptyPersonas);
    }
  }, [formData.personas]);

  // Load existing personas if editing a solution
  useEffect(() => {
    const loadPersonas = async () => {
      if (!formData.id || !user) return;
      
      setIsLoading(true);
      try {
        const existingPersonas = await solutionPersonaService.getPersonasBySolution(formData.id);
        
        if (existingPersonas.length > 0) {
          setPersonas(existingPersonas);
          updateFormData({ personas: existingPersonas });
        } else {
          // No existing personas, initialize with defaults
          const defaultPersonas = await solutionPersonaService.createDefaultPersonas(formData.id, user.id);
          setPersonas(defaultPersonas);
          updateFormData({ personas: defaultPersonas });
        }
      } catch (error) {
        console.error('Error loading personas:', error);
        toast.error('Failed to load personas');
      } finally {
        setIsLoading(false);
      }
    };

    loadPersonas();
  }, [formData.id, user]);

  const handlePersonaChange = (index: number, updatedPersona: Partial<SolutionPersona>) => {
    const newPersonas = [...personas];
    newPersonas[index] = updatedPersona;
    setPersonas(newPersonas);
    updateFormData({ personas: newPersonas });
  };

  const handleSavePersonas = async () => {
    if (!user || !formData.id) {
      toast.error('Solution must be saved first');
      return;
    }

    setIsSaving(true);
    try {
      const savedPersonas: SolutionPersona[] = [];
      
      for (const persona of personas) {
        if (persona.id) {
          // Update existing persona
          const updated = await solutionPersonaService.updatePersona({
            id: persona.id,
            personaName: persona.personaName,
            roleTitle: persona.roleTitle,
            typicalGoals: persona.typicalGoals,
            painPoints: persona.painPoints,
            preferredTone: persona.preferredTone,
            keyTopics: persona.keyTopics
          });
          if (updated) savedPersonas.push(updated);
        } else if (persona.personaName && persona.roleTitle && persona.preferredTone) {
          // Create new persona
          const created = await solutionPersonaService.createPersona({
            solutionId: formData.id,
            personaType: persona.personaType!,
            personaName: persona.personaName,
            roleTitle: persona.roleTitle,
            typicalGoals: persona.typicalGoals || [],
            painPoints: persona.painPoints || [],
            preferredTone: persona.preferredTone,
            keyTopics: persona.keyTopics || [],
            userId: user.id
          });
          if (created) savedPersonas.push(created);
        }
      }

      setPersonas(savedPersonas);
      updateFormData({ personas: savedPersonas });
      toast.success('Personas saved successfully');
    } catch (error) {
      console.error('Error saving personas:', error);
      toast.error('Failed to save personas');
    } finally {
      setIsSaving(false);
    }
  };

  // Check completion status
  const getCompletionStatus = () => {
    const completed = personas.filter(p => 
      p.personaName && 
      p.roleTitle && 
      p.preferredTone &&
      (p.typicalGoals?.length || 0) > 0 &&
      (p.painPoints?.length || 0) > 0 &&
      (p.keyTopics?.length || 0) > 0
    );
    return {
      completed: completed.length,
      total: requiredPersonaTypes.length,
      isComplete: completed.length === requiredPersonaTypes.length
    };
  };

  const status = getCompletionStatus();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading personas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Personas
            {status.isComplete ? (
              <CheckCircle className="h-5 w-5 text-neon-green" />
            ) : (
              <AlertCircle className="h-5 w-5 text-amber-500" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Define the key personas for your solution to enable persona-specific content generation.
              All three persona types are required for complete solution profiling.
            </p>
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Completion Status:</strong> {status.completed} of {status.total} personas completed.
                {!status.isComplete && ' Complete all personas to unlock persona-based content generation.'}
              </AlertDescription>
            </Alert>

            {formData.id && (
              <div className="flex justify-end">
                <Button
                  onClick={handleSavePersonas}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-neon-purple to-neon-blue hover:from-neon-blue hover:to-neon-purple"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Personas'
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Persona Cards */}
      <div className="space-y-4">
        {personas.map((persona, index) => (
          <PersonaCard
            key={persona.personaType || index}
            persona={persona}
            personaType={persona.personaType!}
            isRequired={true}
            onChange={(updatedPersona) => handlePersonaChange(index, updatedPersona)}
          />
        ))}
      </div>

      {!formData.id && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Save the solution first to enable persona management. Personas will be automatically created with default values.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};