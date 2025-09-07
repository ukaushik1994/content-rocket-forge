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

// Default personas available when no user personas exist
const defaultPersonas: SolutionPersona[] = [
  {
    id: 'default-end-user',
    personaName: 'End User',
    personaType: 'end_user' as PersonaType,
    roleTitle: 'Product User',
    preferredTone: 'Clear and practical',
    typicalGoals: ['Solve immediate problems', 'Easy to use solutions', 'Quick implementation'],
    painPoints: ['Complex interfaces', 'Time constraints', 'Learning curves'],
    keyTopics: ['Usability', 'Implementation', 'Practical benefits'],
    solutionId: '',
    userId: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'default-decision-maker',
    personaName: 'Decision Maker',
    personaType: 'decision_maker' as PersonaType,
    roleTitle: 'Executive/Manager',
    preferredTone: 'Professional and data-driven',
    typicalGoals: ['ROI and business impact', 'Risk mitigation', 'Strategic advantage'],
    painPoints: ['Budget constraints', 'Implementation risks', 'Stakeholder alignment'],
    keyTopics: ['ROI', 'Business value', 'Risk management'],
    solutionId: '',
    userId: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'default-technical-influencer',
    personaName: 'Technical Influencer',
    personaType: 'influencer' as PersonaType,
    roleTitle: 'Technical Lead/Architect',
    preferredTone: 'Technical and detailed',
    typicalGoals: ['Architecture excellence', 'Performance optimization', 'Technical feasibility'],
    painPoints: ['Technical debt', 'Scalability concerns', 'Integration complexity'],
    keyTopics: ['Architecture', 'Performance', 'Technical specs'],
    solutionId: '',
    userId: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

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
  // Use default personas when no user personas are available
  const availablePersonas = personas.length > 0 ? personas : defaultPersonas;
  const isUsingDefaults = personas.length === 0;

  const handlePersonaToggle = (personaId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedPersonas, personaId]);
    } else {
      onSelectionChange(selectedPersonas.filter(id => id !== personaId));
    }
  };

  const handleSelectAll = () => {
    if (selectedPersonas.length === availablePersonas.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(availablePersonas.map(p => p.id));
    }
  };

  return (
    <Card className={`bg-gradient-to-br from-background via-muted/5 to-background border border-border backdrop-blur-sm rounded-xl shadow-lg ${className}`}>
      <CardHeader className="pb-3 bg-card/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-foreground">Target Personas</CardTitle>
          <div className="flex items-center gap-2">
            {isUsingDefaults && (
              <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary text-xs">
                Default Personas
              </Badge>
            )}
            <Badge variant="outline" className="border-border/60 bg-card/80">
              {selectedPersonas.length} of {availablePersonas.length} selected
            </Badge>
            <Checkbox
              checked={selectedPersonas.length === availablePersonas.length}
              onCheckedChange={handleSelectAll}
              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary border-2 border-border/60 bg-card/80 hover:border-primary/50"
            />
            <span className="text-sm text-muted-foreground">All</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {isUsingDefaults 
            ? 'Using built-in personas for targeted content generation. Create custom personas for better targeting.'
            : 'Select personas to generate targeted content. Each persona will receive customized content.'
          }
        </p>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {availablePersonas.map((persona) => (
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