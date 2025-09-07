import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { User, Target, Hash } from 'lucide-react';
import { motion } from 'framer-motion';
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
      <Card className={`bg-gradient-to-br from-background via-muted/5 to-background border border-border backdrop-blur-sm rounded-xl shadow-lg ${className}`}>
        <CardHeader className="pb-3 bg-card/50">
          <CardTitle className="text-lg text-foreground">Target Personas</CardTitle>
          <p className="text-sm text-muted-foreground">
            No personas available for targeted content generation
          </p>
        </CardHeader>
        <CardContent className="py-6 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 rounded-full bg-muted/20">
              <User className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No personas found</p>
            <p className="text-xs text-muted-foreground">
              Content will be generated with general targeting
            </p>
          </div>
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
    <Card className={`bg-gradient-to-br from-background via-muted/5 to-background border border-border backdrop-blur-sm rounded-xl shadow-lg ${className}`}>
      <CardHeader className="pb-3 bg-card/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-foreground">Target Personas</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-border/60 bg-card/80">
              {selectedPersonas.length} of {personas.length} selected
            </Badge>
            <Checkbox
              checked={selectedPersonas.length === personas.length}
              onCheckedChange={handleSelectAll}
              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary border-2 border-border/60 bg-card/80 hover:border-primary/50"
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
          <motion.div
            key={persona.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-card/50 hover:bg-accent/30 transition-all duration-200 cursor-pointer hover:border-primary/30"
            onClick={() => handlePersonaToggle(persona.id, !selectedPersonas.includes(persona.id))}
          >
            <Checkbox
              checked={selectedPersonas.includes(persona.id)}
              onCheckedChange={(checked) => handlePersonaToggle(persona.id, Boolean(checked))}
              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary border-2 border-border/60 bg-card/80 hover:border-primary/50"
            />
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                {personaTypeIcons[persona.personaType]}
                <span className="font-medium text-foreground">{persona.personaName}</span>
                <Badge variant="secondary" className="text-xs border-border/50 bg-muted/50">
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
          </motion.div>
        ))}
        
        {selectedPersonas.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20"
          >
            <p className="text-sm text-foreground">
              <span className="font-medium">Content Strategy:</span>{' '}
              {selectedPersonas.length === 1 
                ? 'Generate focused content for the selected persona.'
                : `Generate ${selectedPersonas.length} separate versions, each tailored to the selected personas.`
              }
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};