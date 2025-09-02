import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Plus, X, User, Target, AlertCircle, MessageSquare, Hash } from 'lucide-react';
import { SolutionPersona, PersonaType } from '@/contexts/content-builder/types/solution-types';

interface PersonaCardProps {
  persona: Partial<SolutionPersona>;
  personaType: PersonaType;
  isRequired?: boolean;
  onChange: (persona: Partial<SolutionPersona>) => void;
  onRemove?: () => void;
}

const personaTypeLabels: Record<PersonaType, string> = {
  end_user: 'End User',
  decision_maker: 'Decision Maker',
  influencer: 'Technical Influencer'
};

const personaTypeIcons: Record<PersonaType, React.ReactNode> = {
  end_user: <User className="h-4 w-4" />,
  decision_maker: <Target className="h-4 w-4" />,
  influencer: <Hash className="h-4 w-4" />
};

export const PersonaCard: React.FC<PersonaCardProps> = ({
  persona,
  personaType,
  isRequired = true,
  onChange,
  onRemove
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Array field handlers
  const handleArrayFieldChange = (
    field: 'typicalGoals' | 'painPoints' | 'keyTopics',
    index: number,
    value: string
  ) => {
    const currentArray = persona[field] || [];
    const newArray = [...currentArray];
    newArray[index] = value;
    onChange({ ...persona, [field]: newArray });
  };

  const handleAddArrayItem = (field: 'typicalGoals' | 'painPoints' | 'keyTopics') => {
    const currentArray = persona[field] || [];
    onChange({ ...persona, [field]: [...currentArray, ''] });
  };

  const handleRemoveArrayItem = (
    field: 'typicalGoals' | 'painPoints' | 'keyTopics',
    index: number
  ) => {
    const currentArray = persona[field] || [];
    const newArray = currentArray.filter((_, i) => i !== index);
    onChange({ ...persona, [field]: newArray });
  };

  // Check if persona is complete
  const isComplete = persona.personaName && 
                    persona.roleTitle && 
                    persona.preferredTone &&
                    (persona.typicalGoals?.length || 0) > 0 &&
                    (persona.painPoints?.length || 0) > 0 &&
                    (persona.keyTopics?.length || 0) > 0;

  return (
    <Card className="glass-panel">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {personaTypeIcons[personaType]}
                <span>{personaTypeLabels[personaType]}</span>
                {isRequired && <Badge variant="secondary">Required</Badge>}
                {isComplete && <Badge variant="default" className="bg-neon-green/20 text-neon-green">Complete</Badge>}
              </div>
              <div className="flex items-center gap-2">
                {!isRequired && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove?.();
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </div>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`persona-name-${personaType}`}>Persona Name *</Label>
                <Input
                  id={`persona-name-${personaType}`}
                  value={persona.personaName || ''}
                  onChange={(e) => onChange({ ...persona, personaName: e.target.value })}
                  placeholder="e.g., End User"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`role-title-${personaType}`}>Role/Title *</Label>
                <Input
                  id={`role-title-${personaType}`}
                  value={persona.roleTitle || ''}
                  onChange={(e) => onChange({ ...persona, roleTitle: e.target.value })}
                  placeholder="e.g., Software Developer"
                />
              </div>
            </div>

            {/* Preferred Tone */}
            <div className="space-y-2">
              <Label htmlFor={`preferred-tone-${personaType}`}>Preferred Tone *</Label>
              <Input
                id={`preferred-tone-${personaType}`}
                value={persona.preferredTone || ''}
                onChange={(e) => onChange({ ...persona, preferredTone: e.target.value })}
                placeholder="e.g., Professional and direct"
              />
            </div>

            {/* Typical Goals */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Typical Goals *
              </Label>
              {(persona.typicalGoals || []).map((goal, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={goal}
                    onChange={(e) => handleArrayFieldChange('typicalGoals', index, e.target.value)}
                    placeholder="Enter a typical goal"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveArrayItem('typicalGoals', index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddArrayItem('typicalGoals')}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Goal
              </Button>
            </div>

            {/* Pain Points */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Pain Points *
              </Label>
              {(persona.painPoints || []).map((painPoint, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={painPoint}
                    onChange={(e) => handleArrayFieldChange('painPoints', index, e.target.value)}
                    placeholder="Enter a pain point"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveArrayItem('painPoints', index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddArrayItem('painPoints')}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Pain Point
              </Button>
            </div>

            {/* Key Topics */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Key Topics *
              </Label>
              {(persona.keyTopics || []).map((topic, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={topic}
                    onChange={(e) => handleArrayFieldChange('keyTopics', index, e.target.value)}
                    placeholder="Enter a key topic"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveArrayItem('keyTopics', index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddArrayItem('keyTopics')}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Topic
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};