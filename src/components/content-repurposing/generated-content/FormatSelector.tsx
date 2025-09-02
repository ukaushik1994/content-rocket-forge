
import React, { memo } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { getFormatIconComponent, getFormatByIdOrDefault } from '../formats';
import { Check, User, Target, Hash } from 'lucide-react';

interface FormatSelectorProps {
  generatedFormats: string[];
  activeFormat: string | null;
  setActiveFormat: React.Dispatch<React.SetStateAction<string | null>>;
  savedFormats?: string[];
  personasMap?: Record<string, string[]>; // Map of formatId to personas used
  availablePersonas?: any[]; // Array of persona objects for lookup
}

const FormatSelector: React.FC<FormatSelectorProps> = memo(({
  generatedFormats,
  activeFormat,
  setActiveFormat,
  savedFormats = [],
  personasMap = {},
  availablePersonas = []
}) => {
  // Helper to get persona icons
  const getPersonaIcon = (personaType: string) => {
    switch (personaType) {
      case 'end_user':
        return <User className="h-3 w-3" />;
      case 'decision_maker':
        return <Target className="h-3 w-3" />;
      case 'influencer':
        return <Hash className="h-3 w-3" />;
      default:
        return <User className="h-3 w-3" />;
    }
  };
  if (generatedFormats.length === 0) {
    return null;
  }

  // If no active format is selected, but we have formats, select the first one
  if (!activeFormat && generatedFormats.length > 0) {
    setActiveFormat(generatedFormats[0]);
  }
  
  return (
    <Select
      value={activeFormat || ''}
      onValueChange={(value) => setActiveFormat(value)}
    >
      <SelectTrigger className="w-[180px] bg-black border-white/10 text-white">
        <SelectValue placeholder="Select a format" />
      </SelectTrigger>
      <SelectContent className="bg-slate-900 border-white/10 text-white">
        {generatedFormats.map((formatId) => {
          if (!formatId) return null; // Skip empty formatIds
          
          const format = getFormatByIdOrDefault(formatId);
          const IconComponent = getFormatIconComponent(formatId);
          const isSaved = savedFormats.includes(formatId);
          const formatPersonas = personasMap[formatId] || [];
          const personaObjects = formatPersonas.map(personaId => 
            availablePersonas.find(p => p.id === personaId)
          ).filter(Boolean);
          
          return (
            <SelectItem 
              key={formatId} 
              value={formatId}
              className="flex items-center gap-2 cursor-pointer hover:bg-slate-800"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <IconComponent className="h-4 w-4" />
                  <span>{format.name}</span>
                  {isSaved && <Check className="h-3 w-3 text-green-400" />}
                </div>
                {personaObjects.length > 0 && (
                  <div className="flex items-center gap-1 ml-2">
                    {personaObjects.slice(0, 3).map((persona, idx) => (
                      <div key={idx} className="flex items-center">
                        {getPersonaIcon(persona.personaType)}
                      </div>
                    ))}
                    {personaObjects.length > 3 && (
                      <Badge variant="secondary" className="text-xs h-4 px-1">
                        +{personaObjects.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
});

FormatSelector.displayName = 'FormatSelector';

export default FormatSelector;
