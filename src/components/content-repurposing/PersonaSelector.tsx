import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { User, Target, Hash } from 'lucide-react';
import { SolutionPersona, PersonaType } from '@/contexts/content-builder/types/solution-types';

interface PersonaSelectorProps {
  personas: SolutionPersona[];
  selectedPersonas: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  className?: string;
}

const personaTypeIcons: Record<PersonaType, React.ReactNode> = {
  end_user: <User className="h-4 w-4" />,
  decision_maker: <Target className="h-4 w-4" />,
  influencer: <Hash className="h-4 w-4" />
};

const personaTypeLabels: Record<PersonaType, string> = {
  end_user: 'End User',
  decision_maker: 'Decision Maker',
  influencer: 'Technical Influencer'
};

export const PersonaSelector: React.FC<PersonaSelectorProps> = ({
  personas,
  selectedPersonas,
  onSelectionChange,
  className = ''
}) => {
  if (personas.length === 0) {
    return (
      <Card className={`glass-panel ${className}`}>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">No personas available for this solution.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Add personas to the solution to generate persona-specific content.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handlePersonaToggle = (personaId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedPersonas, personaId]);
    } else {
      onSelectionChange(selectedPersonas.filter(id => id !== personaId));
    }
  };

  const handleSelectAll = () => {
    if (selectedPersonas.length === personas.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(personas.map(p => p.id));
    }
  };

  return (
    <Card className={`glass-panel ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Target Personas</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {selectedPersonas.length} of {personas.length} selected
            </Badge>
            <Checkbox
              checked={selectedPersonas.length === personas.length}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm text-muted-foreground">All</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Select personas to generate targeted content. Each persona will receive customized content.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {personas.map((persona) => (
          <div
            key={persona.id}
            className="flex items-start gap-3 p-3 rounded-lg border bg-card/50 hover:bg-accent/50 transition-colors"
          >
            <Checkbox
              checked={selectedPersonas.includes(persona.id)}
              onCheckedChange={(checked) => handlePersonaToggle(persona.id, Boolean(checked))}
            />
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                {personaTypeIcons[persona.personaType]}
                <span className="font-medium">{persona.personaName}</span>
                <Badge variant="secondary" className="text-xs">
                  {personaTypeLabels[persona.personaType]}
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Role:</span> {persona.roleTitle}
              </p>
              
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Tone:</span> {persona.preferredTone}
              </p>
              
              {persona.typicalGoals.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">Goals:</span> {persona.typicalGoals.slice(0, 2).join(', ')}
                  {persona.typicalGoals.length > 2 && ` (+${persona.typicalGoals.length - 2} more)`}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {selectedPersonas.length > 0 && (
          <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-sm">
              <span className="font-medium">Content Strategy:</span>{' '}
              {selectedPersonas.length === 1 
                ? 'Generate focused content for the selected persona.'
                : `Generate ${selectedPersonas.length} separate versions, each tailored to the selected personas.`
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};